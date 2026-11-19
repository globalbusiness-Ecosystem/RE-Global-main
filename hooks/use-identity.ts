'use client';

import { useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { authHeaders } from '@/lib/api-token';
import { friendlyName } from '@/lib/display-identity';

// One place that says who the signed-in person is, so the header, the menu, the dashboard and Settings agree.
const CHANGED = 're-identity-changed';
const NAME_CHANGED = 're-name-changed';
export function announceName(name: string) {
  try { window.dispatchEvent(new CustomEvent(NAME_CHANGED, { detail: name })); } catch { /* ignore */ }
}
export function announceHandle(handle: string) {
  try { window.dispatchEvent(new CustomEvent(CHANGED, { detail: handle })); } catch { /* ignore */ }
}

export function useIdentity() {
  const { username, displayName, isWebAccount, accessToken, isInitialized } = usePiAuth();
  const [handle, setHandle] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);

  // The name chosen inside the platform (any account type).
  useEffect(() => {
    if (!isInitialized || !accessToken) { setCustomName(null); return; }
    let off = false;
    fetch('/api/display-name', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off && j && typeof j.name === 'string') setCustomName(j.name); })
      .catch(() => {});
    return () => { off = true; };
  }, [isInitialized, accessToken]);
  useEffect(() => {
    const on = (e: Event) => setCustomName(String((e as CustomEvent<string>).detail));
    window.addEventListener(NAME_CHANGED, on);
    return () => window.removeEventListener(NAME_CHANGED, on);
  }, []);

  useEffect(() => {
    if (!isInitialized || !accessToken || !isWebAccount) { setHandle(null); setKycStatus(null); return; }
    let off = false;
    fetch('/api/handle', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off && j && typeof j.handle === 'string') setHandle(j.handle); })
      .catch(() => {});
    fetch('/api/kyc/me', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off && j && typeof j.status === 'string') setKycStatus(j.status); })
      .catch(() => {});
    return () => { off = true; };
  }, [isInitialized, accessToken, isWebAccount]);

  useEffect(() => {
    const on = (e: Event) => setHandle(String((e as CustomEvent<string>).detail));
    window.addEventListener(CHANGED, on);
    return () => window.removeEventListener(CHANGED, on);
  }, []);

  const name = friendlyName({ username, displayName, handle, customName });
  return { name, handle, isWebAccount, kycStatus, kycApproved: kycStatus === 'approved' };
}
