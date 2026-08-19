import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { AuthenticatedPiUser } from './pi-auth';
import { readWalletInTx, writeWalletInTx } from './wallet-ledger';

export type AssetType = 're-token' | 'property-share';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'open' | 'partial' | 'filled' | 'cancelled';

export interface MarketOrder {
  id: string;
  username: string;
  assetType: AssetType;
  assetId: string;
  side: OrderSide;
  price: number;
  quantity: number;
  filledQuantity: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  assetType: AssetType;
  assetId: string;
  price: number;
  quantity: number;
  buyerUsername: string;
  sellerUsername: string;
  buyOrderId: string;
  sellOrderId: string;
  settlementStatus: 'pending' | 'settled';
  txid?: string;
  createdAt: Date;
}

export interface LiquidityPool {
  id: string;
  reReserve: number;
  piReserve: number;
  feeBps: number;
  updatedAt: Date;
}

const RE_PI_POOL_ID = 'RE-PI';

export async function getLiquidityPool(): Promise<LiquidityPool> {
  try {
    const ref = adminDb.collection('liquidityPools').doc(RE_PI_POOL_ID);
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data()!;
      return {
        id: RE_PI_POOL_ID,
        reReserve: data.reReserve,
        piReserve: data.piReserve,
        feeBps: data.feeBps,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    const seeded: LiquidityPool = {
      id: RE_PI_POOL_ID,
      reReserve: 1_000_000,
      piReserve: 10_000,
      feeBps: 30,
      updatedAt: new Date(),
    };
    await ref.set({ ...seeded, updatedAt: Timestamp.now() });
    return seeded;
  } catch (error) {
    console.error('[Market] getLiquidityPool error:', error);
    throw new Error('Failed to load liquidity pool');
  }
}

export function quoteSwap(
  pool: LiquidityPool,
  direction: 'buy' | 'sell',
  amountIn: number
): { amountOut: number; priceImpactPct: number; feePaid: number } {
  if (!Number.isFinite(amountIn) || amountIn <= 0) {
    throw new Error('amountIn must be a positive finite number');
  }
  if (!Number.isFinite(pool.piReserve) || !Number.isFinite(pool.reReserve) ||
      pool.piReserve <= 0 || pool.reReserve <= 0) {
    throw new Error('Pool has no liquidity');
  }

  const fee = (amountIn * pool.feeBps) / 10000;
  const amountInAfterFee = amountIn - fee;
  const [reserveIn, reserveOut] =
    direction === 'buy' ? [pool.piReserve, pool.reReserve] : [pool.reReserve, pool.piReserve];

  const amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee);
  const spotPrice = reserveOut / reserveIn;
  const executionPrice = amountOut / amountInAfterFee;
  const priceImpactPct = Math.abs((1 - executionPrice / spotPrice) * 100);

  return { amountOut, priceImpactPct, feePaid: fee };
}

export async function executeSwap(
  user: AuthenticatedPiUser,
  direction: 'buy' | 'sell',
  amountIn: number,
  minAmountOut = 0
): Promise<{ success: boolean; amountOut?: number; error?: string }> {
  const username = user.username;

  if (!Number.isFinite(amountIn) || amountIn <= 0) {
    return { success: false, error: 'amountIn must be a positive number' };
  }
  if (!Number.isFinite(minAmountOut) || minAmountOut < 0) {
    return { success: false, error: 'minAmountOut must be a non-negative number' };
  }

  try {
    const poolRef = adminDb.collection('liquidityPools').doc(RE_PI_POOL_ID);

    const amountOut = await adminDb.runTransaction(async (tx) => {
      const poolSnap = await tx.get(poolRef);
      if (!poolSnap.exists) {
        throw new Error('Liquidity pool not initialized');
      }
      const poolData = poolSnap.data()!;
      const pool: LiquidityPool = {
        id: RE_PI_POOL_ID,
        reReserve: poolData.reReserve,
        piReserve: poolData.piReserve,
        feeBps: poolData.feeBps,
        updatedAt: poolData.updatedAt?.toDate() || new Date(),
      };

      const wallet = await readWalletInTx(tx, adminDb, username);

      const { amountOut } = quoteSwap(pool, direction, amountIn);

      if (amountOut < minAmountOut) {
        throw new Error(`Slippage exceeded: expected at least ${minAmountOut}, got ${amountOut}`);
      }

      if (direction === 'buy' && wallet.piBalance < amountIn) {
        throw new Error(`Insufficient Pi balance: have ${wallet.piBalance}, need ${amountIn}`);
      }
      if (direction === 'sell' && wallet.reBalance < amountIn) {
        throw new Error(`Insufficient RE balance: have ${wallet.reBalance}, need ${amountIn}`);
      }

      const newPiReserve = direction === 'buy' ? pool.piReserve + amountIn : pool.piReserve - amountOut;
      const newReReserve = direction === 'buy' ? pool.reReserve - amountOut : pool.reReserve + amountIn;

      if (newPiReserve <= 0 || newReReserve <= 0) {
        throw new Error('Insufficient pool liquidity');
      }

      const newPiBalance = direction === 'buy' ? wallet.piBalance - amountIn : wallet.piBalance + amountOut;
      const newReBalance = direction === 'buy' ? wallet.reBalance + amountOut : wallet.reBalance - amountIn;

      tx.set(poolRef, {
        id: RE_PI_POOL_ID,
        piReserve: newPiReserve,
        reReserve: newReReserve,
        feeBps: pool.feeBps,
        updatedAt: Timestamp.now(),
      });

      writeWalletInTx(tx, adminDb, username, newPiBalance, newReBalance);

      const tradeRef = adminDb.collection('trades').doc();
      tx.set(tradeRef, {
        assetType: 're-token',
        assetId: 'RE',
        price: direction === 'buy' ? amountIn / amountOut : amountOut / amountIn,
        quantity: direction === 'buy' ? amountOut : amountIn,
        buyerUsername: direction === 'buy' ? username : 'pool',
        sellerUsername: direction === 'buy' ? 'pool' : username,
        buyOrderId: 'amm',
        sellOrderId: 'amm',
        settlementStatus: 'pending',
        createdAt: Timestamp.now(),
      });

      return amountOut;
    });

    return { success: true, amountOut };
  } catch (error: any) {
    console.error('[Market] executeSwap error:', error);
    return { success: false, error: error?.message || 'Swap failed' };
  }
}
