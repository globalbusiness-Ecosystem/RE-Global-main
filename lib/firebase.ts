import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// A missing apiKey makes getAuth() throw "auth/invalid-api-key" during `next build`.
// Fall back to a placeholder so the build can't crash; real deployments set the real key.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'missing-firebase-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// The Pi login -> Firebase sign-in exchange runs in the background. User-scoped
// Firestore calls wait for it, otherwise the very first request after login would
// reach Firestore before the identity exists and be rejected by the rules.
let signInPending: Promise<void> | null = null;

export function trackFirebaseSignIn(p: Promise<void>): void {
  signInPending = p;
}

export function waitForFirebaseAuth(): Promise<void> {
  return signInPending ?? Promise.resolve();
}
