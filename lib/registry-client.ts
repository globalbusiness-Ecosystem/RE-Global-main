import { Contract, Keypair, TransactionBuilder, nativeToScVal, rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import crypto from 'crypto';
import { PI_TESTNET_PASSPHRASE } from '@/lib/chain-anchor';

// Talks to the RE Global ownership registry smart contract (contracts/ownership-registry) on Pi Testnet.
// Every call is written by the platform account, which is the registry's admin.

export const PI_TESTNET_RPC = 'https://rpc.testnet.minepi.com';
export const NO_REPLACES = 4294967295; // u32::MAX: "replaces no entry"

/** What the registry calls a contract: only these four words are accepted by the contract. */
export type RegistryKind = 'buy' | 'rent' | 'invest' | 'tokenized';
export function registryKind(type: string): RegistryKind {
  if (type === 'rent' || type === 'hotel' || type === 'stay') return 'rent';
  if (type === 'invest' || type === 'tokenized') return type;
  return 'buy';
}

/** The buyer as the registry sees them: a SHA-256 of the account id. No name, no e-mail, nothing readable on the chain. */
export const buyerRef = (uid: string): string => crypto.createHash('sha256').update(`re-global:buyer:${uid}`, 'utf8').digest('hex');

const HASH_RE = /^[0-9a-f]{64}$/;
const bytes32 = (hex: string) => nativeToScVal(Buffer.from(hex, 'hex'), { type: 'bytes' });

export interface RegistryEntryInput { propertyId: string; buyerRef: string; contractHash: string; kind: RegistryKind; shares?: number; replaces?: number }

/** The `record` call as a contract operation. Pure; null when an input is not valid. */
export function buildRecordOp(contractId: string, e: RegistryEntryInput): xdr.Operation | null {
  if (!HASH_RE.test(e.buyerRef) || !HASH_RE.test(e.contractHash) || !e.propertyId || e.propertyId.length > 128) return null;
  return new Contract(contractId).call(
    'record',
    nativeToScVal(e.propertyId, { type: 'string' }),
    bytes32(e.buyerRef),
    bytes32(e.contractHash),
    nativeToScVal(e.kind, { type: 'symbol' }),
    nativeToScVal(e.shares ?? 0, { type: 'u32' }),
    nativeToScVal(e.replaces ?? NO_REPLACES, { type: 'u32' }),
  );
}

export type RegistryState = 'not_configured' | 'ok' | 'not_ready' | 'admin_mismatch' | 'unreachable';

/** Decides the registry's state from plain facts (pure). "not_ready" = not deployed yet or init was never called. */
export function registryVerdict(f: { configured: boolean; reach: 'ok' | 'error' | 'network'; admin?: string; expectedAdmin: string }): RegistryState {
  if (!f.configured) return 'not_configured';
  if (f.reach === 'network') return 'unreachable';
  if (f.reach === 'error' || !f.admin) return 'not_ready';
  return f.admin === f.expectedAdmin ? 'ok' : 'admin_mismatch';
}

/** Reads the registry's admin address (a read-only simulation, nothing is written and nothing is paid). */
export async function readRegistryAdmin(contractId: string, sourcePublic: string, opts: { rpcUrl?: string } = {}): Promise<{ reach: 'ok' | 'error' | 'network'; admin?: string }> {
  try {
    const server = new rpc.Server(opts.rpcUrl ?? PI_TESTNET_RPC);
    const account = await server.getAccount(sourcePublic);
    const tx = new TransactionBuilder(account, { fee: '100', networkPassphrase: PI_TESTNET_PASSPHRASE }).addOperation(new Contract(contractId).call('admin')).setTimeout(30).build();
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) return { reach: 'error' };
    const v = 'result' in sim ? sim.result?.retval : undefined;
    return v ? { reach: 'ok', admin: String(scValToNative(v)) } : { reach: 'error' };
  } catch {
    return { reach: 'network' };
  }
}

export type RegistryResult = { ok: true; entryId: number; txid: string } | { ok: false; error: 'bad_input' | 'network' | 'rejected' | 'timeout' };

/** Writes one entry. Never throws; the error is a short code. Waits up to ~20 s for the ledger to include it. */
export async function recordOnRegistry(secretKey: string, contractId: string, e: RegistryEntryInput, opts: { rpcUrl?: string } = {}): Promise<RegistryResult> {
  try {
    const op = buildRecordOp(contractId, e);
    if (!op) return { ok: false, error: 'bad_input' };
    const kp = Keypair.fromSecret(secretKey);
    const server = new rpc.Server(opts.rpcUrl ?? PI_TESTNET_RPC);
    const account = await server.getAccount(kp.publicKey());
    const built = new TransactionBuilder(account, { fee: '1000000', networkPassphrase: PI_TESTNET_PASSPHRASE }).addOperation(op).setTimeout(60).build();
    const prepared = await server.prepareTransaction(built); // runs it once to learn the resources and fees it needs
    prepared.sign(kp);
    const sent = await server.sendTransaction(prepared);
    if (sent.status === 'ERROR' || sent.status === 'TRY_AGAIN_LATER') return { ok: false, error: 'rejected' };
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const got = await server.getTransaction(sent.hash);
      if (got.status === 'SUCCESS') {
        const id = got.returnValue ? Number(scValToNative(got.returnValue)) : NaN;
        return Number.isFinite(id) ? { ok: true, entryId: id, txid: sent.hash } : { ok: false, error: 'rejected' };
      }
      if (got.status === 'FAILED') return { ok: false, error: 'rejected' };
    }
    return { ok: false, error: 'timeout' };
  } catch {
    return { ok: false, error: 'network' };
  }
}
