import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function generateReferralCode(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

export async function getOrCreateReferralCode(username: string): Promise<string> {
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
  const q = query(collection(db, 'referrals'), where('referredBy', '==', username));
  const snap = await getDocs(q);
  return snap.size;
}
