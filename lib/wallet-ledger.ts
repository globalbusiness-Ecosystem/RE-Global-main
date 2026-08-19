import 'server-only';
import { Firestore, Transaction, DocumentReference, Timestamp } from 'firebase-admin/firestore';

export interface WalletBalance {
  username: string;
  piBalance: number;
  reBalance: number;
}

const WALLETS_COLLECTION = 'walletBalances';

export function walletRef(db: Firestore, username: string): DocumentReference {
  return db.collection(WALLETS_COLLECTION).doc(username);
}

export async function readWalletInTx(
  tx: Transaction,
  db: Firestore,
  username: string
): Promise<WalletBalance> {
  const ref = walletRef(db, username);
  const snap = await tx.get(ref);
  if (!snap.exists) {
    return { username, piBalance: 0, reBalance: 0 };
  }
  const data = snap.data() || {};
  return {
    username,
    piBalance: Number.isFinite(data.piBalance) ? data.piBalance : 0,
    reBalance: Number.isFinite(data.reBalance) ? data.reBalance : 0,
  };
}

export function writeWalletInTx(
  tx: Transaction,
  db: Firestore,
  username: string,
  newPiBalance: number,
  newReBalance: number
): void {
  if (!Number.isFinite(newPiBalance) || newPiBalance < 0) {
    throw new Error('Ledger error: resulting Pi balance would be invalid');
  }
  if (!Number.isFinite(newReBalance) || newReBalance < 0) {
    throw new Error('Ledger error: resulting RE balance would be invalid');
  }
  tx.set(
    walletRef(db, username),
    {
      username,
      piBalance: newPiBalance,
      reBalance: newReBalance,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
