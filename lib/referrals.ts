import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, waitForFirebaseAuth } from './firebase';
import { referralCodeOf } from './contract-identity';

const generateReferralCode = referralCodeOf;

export async function getOrCreateReferralCode(username: string): Promise<string> {
  await waitForFirebaseAuth();
  const ref = doc(db, 'referrals', username);
  const snap = await getDoc(ref);
  if (snap.exists() && (snap.data() as any).code) {
    return (snap.data() as any).code as string;
  }
  const code = generateReferralCode(username);
  await setDoc(ref, { username, code, createdAt: new Date() }, { merge: true });
  return code;
}

export async function getReferralCount(username: string): Promise<number> {
  await waitForFirebaseAuth();
  const q = query(collection(db, 'referrals'), where('referredBy', '==', username));
  const snap = await getDocs(q);
  return snap.size;
}
