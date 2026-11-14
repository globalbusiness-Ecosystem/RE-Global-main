'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { parseRefCode, REF_STORAGE_KEY, isFinalRedeemStatus } from '@/lib/ref-code';
import { pt } from '@/lib/partners-i18n';

// Invite links look like /?ref=CODE. The code is kept until the visitor is signed in, then used once (the server decides if it counts).
// The code is only forgotten when the server gave a final answer; a failed request (not signed in yet, busy, server error) keeps it for the next visit.
export function RefCapture() {
  const { accessToken } = usePiAuth();
  const { language } = useLanguage();

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
      .then((res) => {
        if (!isFinalRedeemStatus(res.status)) return;
        try { localStorage.removeItem(REF_STORAGE_KEY); } catch { /* ignore */ }
        if (res.ok) toast.success(pt('refOk', language));
        else if (res.status === 409) res.json().then((j: { error?: string }) => { if (j?.error === 'notNew') toast.message(pt('refNotNew', language)); }).catch(() => {});
        else if (res.status === 404) toast.message(pt('refNotFound', language));
      })
      .catch(() => { /* network problem: keep the code and try on the next visit */ });
  }, [accessToken, language]);

  return null;
}
