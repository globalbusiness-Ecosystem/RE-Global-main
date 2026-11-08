'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { authHeaders } from '@/lib/api-token';
import { COUNTRIES } from '@/lib/legal-profiles';
import { kl } from '@/lib/kyc-labels';
import { requiredKinds, type DocType, type FileKind } from '@/lib/kyc-files';
import { shrinkPhoto, uploadPhoto } from '@/lib/kyc-upload';

// Country names in the person's own language (the browser knows them); English name when it does not.
function countryName(code: string, language: string, fallback: string): string {
  try { return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? fallback; } catch { return fallback; }
}

type Me = { required: boolean; status: 'none' | 'pending' | 'approved' | 'rejected'; rejectReason?: string | null };

// Identity verification for people who sign in outside the Pi Browser. A person sends name, country and phone;
// the team reviews it. Card payments stay closed until the request is approved.
export default function KycPage() {
  const { language } = useLanguage();
  const { accessToken, isInitialized } = usePiAuth();
  const rtl = language === 'ar' || language === 'ur';
  const [me, setMe] = useState<Me | null>(null);
  const [legalName, setLegalName] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [docType, setDocType] = useState<DocType>('id');
  const [photos, setPhotos] = useState<Partial<Record<FileKind, File>>>({});
  const [msg, setMsg] = useState<'invalid' | 'failed' | 'photosMissing' | 'photoBad' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch('/api/kyc/me', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j && typeof j.status === 'string') setMe(j as Me); else setMsg('failed'); })
      .catch(() => setMsg('failed'));
  };
  useEffect(() => { if (accessToken) load(); }, [accessToken]);

  const submit = async () => {
    setMsg(null);
    const kinds = requiredKinds(docType);
    if (kinds.some((k) => !photos[k])) { setMsg('photosMissing'); return; }
    setBusy(true);
    try {
      // Photos first (shrunk in the browser), then the request that names them.
      setUploading(true);
      for (const k of kinds) {
        const small = await shrinkPhoto(photos[k] as File);
        if (!small || !(await uploadPhoto(k, small))) { setMsg('photoBad'); setUploading(false); return; }
      }
      setUploading(false);
      const r = await fetch('/api/kyc/request', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ legalName, country, phone, docType }) });
      if (r.status === 400) setMsg((await r.json().catch(() => null))?.code === 'photos_missing' ? 'photosMissing' : 'invalid');
      else if (!r.ok && r.status !== 409) setMsg('failed');
      else load();
    } catch { setMsg('failed'); } finally { setBusy(false); setUploading(false); }
  };

  const input = 'w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white outline-none focus:border-white/40';
  const note = 'rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-300';
  const canSend = me && me.required && (me.status === 'none' || me.status === 'rejected');

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10 text-white">
      <h1 className="text-2xl font-bold">{kl('title', language)}</h1>
      {!isInitialized ? null : !accessToken ? (
        <>
          <p className={note}>{kl('needLogin', language)}</p>
          <Link href="/login" className="w-full rounded-xl bg-white px-4 py-3 text-center text-base font-semibold text-black">{kl('login', language)}</Link>
        </>
      ) : !me ? (
        msg === 'failed' ? <p role="alert" className="text-sm text-red-400">{kl('failed', language)}</p> : null
      ) : !me.required ? (
        <p className={note}>{kl('notRequired', language)}</p>
      ) : (
        <>
          <p className="text-sm text-gray-300">{kl('intro', language)}</p>
          {me.status === 'pending' && <p className={note}>{kl('pending', language)}</p>}
          {me.status === 'approved' && <p className={note}>{kl('approved', language)}</p>}
          {me.status === 'rejected' && <p className={note}>{kl('rejected', language, { reason: me.rejectReason ?? '' })}</p>}
          {canSend && (
            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
              <label className="text-sm">{kl('legalName', language)}
                <input className={`${input} mt-1`} value={legalName} onChange={(e) => setLegalName(e.target.value)} maxLength={100} autoComplete="name" />
              </label>
              <label className="text-sm">{kl('country', language)}
                <select className={`${input} mt-1`} value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="" />
                  {Object.entries(COUNTRIES).map(([code, n]) => <option key={code} value={code} className="text-black">{countryName(code, language, n.en)}</option>)}
                </select>
              </label>
              <label className="text-sm">{kl('phone', language)}
                <input className={`${input} mt-1`} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} inputMode="tel" autoComplete="tel" />
              </label>
 <label className="text-sm">{kl('docType', language)}
                <select className={`${input} mt-1`} value={docType} onChange={(e) => { setDocType(e.target.value as DocType); setPhotos({}); }}>
                  <option value="id" className="text-black">{kl('docId', language)}</option>
                  <option value="passport" className="text-black">{kl('docPassport', language)}</option>
                </select>
              </label>
              <p className="text-xs text-gray-400">{kl('photoHint', language)}</p>
              {requiredKinds(docType).map((k) => (
                <label key={k} className="text-sm">
                  {k === 'front' ? kl(docType === 'passport' ? 'photoPassport' : 'photoFront', language) : k === 'back' ? kl('photoBack', language) : kl('photoSelfie', language)}
                  {k === 'selfie' && <span className="block text-xs text-gray-400">{kl('selfieHint', language)}</span>}
                  <input type="file" accept="image/*" {...(k === 'selfie' ? { capture: 'user' as const } : {})} className={`${input} mt-1 text-sm`}
                    onChange={(e) => { const f = e.target.files?.[0]; setPhotos((p) => ({ ...p, [k]: f })); }} />
                  {photos[k] && <span className="mt-1 block text-xs text-green-400">✓ {photos[k]?.name}</span>}
                </label>
              ))}
              <p className="text-xs text-gray-400">{kl('privacyNote', language)}</p>
              {uploading && <p className="text-sm text-gray-300">{kl('uploading', language)}</p>}
              {msg && <p role="alert" className="text-sm text-red-400">{kl(msg, language)}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 text-base font-semibold text-black disabled:opacity-50">{kl('submit', language)}</button>
            </form>
          )}
        </>
      )}
      <Link href="/" className="text-center text-sm text-gray-400 underline">{kl('home', language)}</Link>
    </main>
  );
}
