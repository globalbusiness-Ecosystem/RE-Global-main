// Pi Testnet's Horizon-compatible endpoint (verified via Pi Laboratory: pi-laboratory.vercel.app)
const PI_HORIZON_TESTNET = 'https://api.testnet.minepi.com';

export interface StellarVerificationResult {
  found: boolean;
  successful?: boolean;
  ledger?: number;
  createdAt?: string;
  sourceAccount?: string;
  error?: string;
}

/**
 * Verifies a transaction hash directly against the Pi Testnet blockchain
 * (Horizon-compatible API), independent of whatever Firestore says.
 */
export async function verifyTransactionOnStellar(txid: string): Promise<StellarVerificationResult> {
  if (!txid) return { found: false, error: 'No txid provided' };

  try {
    const res = await fetch(`${PI_HORIZON_TESTNET}/transactions/${txid}`);
    if (!res.ok) {
      if (res.status === 404) return { found: false, error: 'Transaction not found on-chain' };
      return { found: false, error: `Horizon returned ${res.status}` };
    }
    const data = await res.json();
    return {
      found: true,
      successful: data.successful,
      ledger: data.ledger,
      createdAt: data.created_at,
      sourceAccount: data.source_account,
    };
  } catch (e) {
    console.error('[Stellar] Verification error:', e);
    return { found: false, error: 'Network error while contacting Pi Testnet' };
  }
}

/**
 * Fetches recent transactions for a given Stellar/Pi wallet address directly
 * from-chain. Useful for cross-checking Firestore records against ground truth.
 */
export async function getAccountTransactions(walletAddress: string, limit = 20) {
  try {
    const res = await fetch(
      `${PI_HORIZON_TESTNET}/accounts/${walletAddress}/transactions?order=desc&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?._embedded?.records || [];
  } catch (e) {
    console.error('[Stellar] Account transactions fetch error:', e);
    return [];
  }
}
