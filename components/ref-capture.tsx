'use client';
import { useEffect } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { parseRefCode, REF_STORAGE_KEY } from '@/lib/ref-code';

// Invite links look like /?ref=CODE. The code is kept until the visitor is signed in, then used once (the server decides if it counts).
export function RefCapture() {
  const { accessToken } = usePiAuth();

  useEffect(() => {
    try {
      const code = parseRefCode(new URLSearchParams(window.location.search).get('ref'));
      if (code) localStorage.setItem(REF_STORAGE_KEY, code);
    } catch { /* storage blocked */ }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    let code: string | null = null;
    try { code = parseRefCode(localStorage.getItem(REF_STORAGE_KEY)); } catch { /* storage blocked */ }
    if (!code) return;
    fetch('/api/referrals/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ code }) })
      .then(() => { try { localStorage.removeItem(REF_STORAGE_KEY); } catch { /* ignore */ } })
      .catch(() => { /* network problem: keep the code and try on the next visit */ });
  }, [accessToken]);

  return null;
}
