'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { useLanguage } from '@/contexts/language-context';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { ll } from '@/lib/login-labels';
import { finishLinkLogin, isLoginLink, isValidEmail, loginWithGoogle, logout, sendLoginLink } from '@/lib/web-login';

export default function LoginPage() {
  const { language } = useLanguage();
  const { user, isPiVerified } = usePiAuth();
  const rtl = language === 'ar' || language === 'ur';
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoginLink()) return;
    finishLinkLogin()
      .then((r) => { if (r === 'needs-email') setNeedsEmail(true); })
      .catch(() => setError(ll('failed', language)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try { await fn(); } catch { setError(ll('failed', language)); } finally { setBusy(false); }
  };

  const submitEmail = () => {
    if (!isValidEmail(email)) { setError(ll('invalidEmail', language)); return; }
    if (needsEmail) {
      run(async () => { if ((await finishLinkLogin(email)) === 'done') setNeedsEmail(false); });
    } else {
      run(async () => { await sendLoginLink(email); setSentTo(email.trim()); });
    }
  };

  const input = 'w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white outline-none focus:border-accent';
  const btn = 'w-full rounded-xl px-4 py-3 text-base font-semibold disabled:opacity-50';

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10 text-white">
      <BrandMark />
      <h1 className="text-center text-2xl font-bold">{ll('title', language)}</h1>
      {isPiVerified ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-300">{ll('inPi', language)}</p>
      ) : user ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-300">{ll('signedInAs', language, { email: user.username })}</p>
          <button type="button" className={`${btn} border border-accent/40 text-accent`} onClick={() => run(logout)} disabled={busy}>{ll('signOut', language)}</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-300">{ll('intro', language)}</p>
          <button type="button" className={`${btn} bg-white text-black`} onClick={() => run(loginWithGoogle)} disabled={busy}>{ll('google', language)}</button>
          <div className="text-center text-xs text-gray-400">{ll('or', language)}</div>
          {needsEmail && <p className="text-sm text-gray-300">{ll('confirmEmail', language)}</p>}
          <label className="flex flex-col gap-1 text-sm text-gray-300">
            {ll('emailLabel', language)}
            <input type="email" dir="ltr" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="button" className={`${btn} border border-white/20`} onClick={submitEmail} disabled={busy}>
            {needsEmail ? ll('confirm', language) : ll('sendLink', language)}
          </button>
          {sentTo && <p role="status" className="text-sm text-emerald-300"><bdi dir="ltr">{ll('linkSent', language, { email: sentTo })}</bdi></p>}
        </>
      )}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <Link href="/" className="text-sm text-gray-400 underline">{ll('home', language)}</Link>
    </main>
  );
}
