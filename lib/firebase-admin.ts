import 'server-only';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

// Lazy initialisation: nothing here runs at import time, so `next build` (which
// imports every route to collect page data) no longer needs the FIREBASE_* secrets.
// The Admin app is created on first real use at request time.
function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Wraps a service in a Proxy that builds it on first property access, so every
// existing call site (`adminDb.collection(...)`, `adminAuth.createCustomToken(...)`)
// keeps working unchanged.
function lazy<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  const get = () => (instance ??= factory());
  return new Proxy({} as T, {
    get(_target, prop) {
      const svc = get() as any;
      const value = svc[prop];
      return typeof value === 'function' ? value.bind(svc) : value;
    },
    has(_target, prop) {
      return prop in (get() as any);
    },
  });
}

export const adminDb: Firestore = lazy(() => getFirestore(getAdminApp()));
export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
export const adminStorage: Storage = lazy(() => getStorage(getAdminApp()));
