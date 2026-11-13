'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { useLanguage } from '@/contexts/language-context';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { authHeaders } from '@/lib/api-token';
import { COUNTRIES } from '@/lib/legal-profiles';
import { kl } from '@/lib/kyc-labels';
import { requiredKinds, type DocType, type FileKind } from '@/lib/kyc-files';
import { shrinkPhoto, uploadPhoto } from '@/lib/kyc-upload';
import { KycPhotoSlot, type SlotArt } from '@/components/kyc-photo-slot';

// Country names in the person's own language (the browser knows them); English name when it does not.
function countryName(code: string, language: string, fallback: string): string {
  try { return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? fallback; } catch { return fallback; }
}

type NameMode = 'real' | 'alias';
type Me = { required: boolean; contractName?: NameMode; hosted?: boolean; status: 'none' | 'pending' | 'approved' | 'rejected'; rejectReason?: string | null };

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
  const [nameMode, setNameMode] = useState<NameMode>('alias');
  const [nameSaved, setNameSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch('/api/kyc/me', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j && typeof j.status === 'string') { setMe(j as Me); if (j.contractName === 'real' || j.contractName === 'alias') setNameMode(j.contractName); } else setMsg('failed'); })
      .catch(() => setMsg('failed'));
  };
  useEffect(() => { if (accessToken) load(); }, [accessToken]);

  const submit = async () => {
    setMsg(null);
    const kinds = me?.hosted ? [] : requiredKinds(docType);
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
      const r = await fetch('/api/kyc/request', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ legalName, country, phone, docType, contractName: nameMode }) });
      if (r.status === 400) setMsg((await r.json().catch(() => null))?.code === 'photos_missing' ? 'photosMissing' : 'invalid');
      else if (!r.ok && r.status !== 409) setMsg('failed');
      else {
        const j = r.ok ? await r.json().catch(() => null) : null;
        // With an identity company the person finishes the photos on the company's page.
        if (j && typeof j.url === 'string' && j.url.startsWith('https://')) { window.location.href = j.url; return; }
        load();
      }
    } catch { setMsg('failed'); } finally { setBusy(false); setUploading(false); }
  };

  const saveName = async () => {
    setNameSaved(false);
    try {
      const r = await fetch('/api/kyc/contract-name', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ contractName: nameMode }) });
      if (r.ok) setNameSaved(true); else setMsg('failed');
    } catch { setMsg('failed'); }
  };
  const nameChoice = (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="sr-only">{kl('nameTitle', language)}</legend>
      {(['alias', 'real'] as const).map((m) => (
        <label key={m} className="flex items-start gap-2">
          <input type="radio" name="contractName" checked={nameMode === m} onChange={() => { setNameMode(m); setNameSaved(false); }} className="mt-1" />
          <span>{kl(m === 'alias' ? 'nameAlias' : 'nameReal', language)}</span>
        </label>
      ))}
      <p className="text-xs text-muted-foreground">{kl('nameHint', language)}</p>
    </fieldset>
  );
  const section = 'flex flex-col gap-3 rounded-2xl border border-border bg-card p-4';
  const stepHead = (n: number, key: 'stepData' | 'stepDocs' | 'stepName') => (
    <h2 className="flex items-center gap-2 text-base font-semibold">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{n}</span>
      {kl(key, language)}
    </h2>
  );
  const tips = (['tipLight', 'tipGlare', 'tipCorners', 'tipCovered'] as const).map((k) => (
    <li key={k} className="flex items-center gap-2 text-xs text-foreground/80"><span className="text-accent">✦</span>{kl(k, language)}</li>
  ));
  const input = 'w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-base text-foreground outline-none focus:border-accent';
  const note = 'rounded-xl border border-border bg-muted/60 p-3 text-sm text-foreground/80';
  const canSend = me && me.required && (me.status === 'none' || me.status === 'rejected');

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10 text-foreground">
      <BrandMark />
      <h1 className="text-center text-2xl font-bold">{kl('title', language)}</h1>
      {!isInitialized ? null : !accessToken ? (
        <>
          <p className={note}>{kl('needLogin', language)}</p>
          <Link href="/login" className="w-full rounded-xl bg-accent px-4 py-3 text-center text-base font-semibold text-accent-foreground">{kl('login', language)}</Link>
        </>
      ) : !me ? (
        msg === 'failed' ? <p role="alert" className="text-sm text-red-400">{kl('failed', language)}</p> : null
      ) : !me.required ? (
        <p className={note}>{kl('notRequired', language)}</p>
      ) : (
        <>
          <p className="text-sm text-foreground/80">{kl('intro', language)}</p>
          {me.status === 'pending' && <p className={note}>{kl('pending', language)}</p>}
          {me.status === 'approved' && <p className={note}>{kl('approved', language)}</p>}
          {me.status === 'rejected' && <p className={note}>{kl('rejected', language, { reason: me.rejectReason ?? '' })}</p>}
          {(me.status === 'pending' || me.status === 'approved') && (
            <div className="flex flex-col gap-2">
              {nameChoice}
              <button type="button" onClick={saveName} className="w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-accent-foreground">{kl('nameSave', language)}</button>
              {nameSaved && <p role="status" className="text-sm text-green-400">{kl('nameSaved', language)}</p>}
            </div>
          )}
          {canSend && (
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
              <div className={section}>
                {stepHead(1, 'stepData')}
                <label className="text-sm">{kl('legalName', language)}
                  <input className={`${input} mt-1`} value={legalName} onChange={(e) => setLegalName(e.target.value)} maxLength={100} autoComplete="name" />
                </label>
                <label className="text-sm">{kl('country', language)}
                  <select className={`${input} mt-1`} value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="">{kl('selectCountry', language)}</option>
                    {Object.entries(COUNTRIES).map(([code, n]) => <option key={code} value={code}>{countryName(code, language, n.en)}</option>)}
                  </select>
                </label>
                <label className="text-sm">{kl('phone', language)}
                  <input className={`${input} mt-1`} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} inputMode="tel" autoComplete="tel" />
                </label>
              </div>
              {!me.hosted && (
                <div className={section}>
                  {stepHead(2, 'stepDocs')}
                  <label className="text-sm">{kl('docType', language)}
                    <select className={`${input} mt-1`} value={docType} onChange={(e) => { setDocType(e.target.value as DocType); setPhotos({}); }}>
                      <option value="id">{kl('docId', language)}</option>
                      <option value="passport">{kl('docPassport', language)}</option>
                    </select>
                  </label>
                  <div className="rounded-xl border border-accent/30 bg-muted/50 p-3">
                    <p className="mb-2 text-xs font-semibold text-accent">{kl('guideTitle', language)}</p>
                    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">{tips}</ul>
                    <p className="mt-2 text-xs text-muted-foreground">{kl('photoHint', language)}</p>
                  </div>
                  {requiredKinds(docType).map((k) => {
                    const art: SlotArt = k === 'selfie' ? 'selfie' : k === 'back' ? 'back' : docType === 'passport' ? 'passport' : 'front';
                    return (
                      <KycPhotoSlot
                        key={k}
                        art={art}
                        selfie={k === 'selfie'}
                        title={k === 'front' ? kl(docType === 'passport' ? 'photoPassport' : 'photoFront', language) : k === 'back' ? kl('photoBack', language) : kl('photoSelfie', language)}
                        hint={k === 'selfie' ? kl('selfieHint', language) : undefined}
                        file={photos[k]}
                        onFile={(f) => setPhotos((p) => ({ ...p, [k]: f }))}
                        addLabel={kl('tapAdd', language)}
                        retakeLabel={kl('retake', language)}
                      />
                    );
                  })}
                  <p className="flex items-center gap-2 text-xs text-muted-foreground"><span aria-hidden="true">🔒</span><span><b className="text-foreground/80">{kl('secureNote', language)}.</b> {kl('privacyNote', language)}</span></p>
                </div>
              )}
              <div className={section}>
                {stepHead(me.hosted ? 2 : 3, 'stepName')}
                {nameChoice}
              </div>
              {uploading && <p className="text-sm text-foreground/80">{kl('uploading', language)}</p>}
              {msg && <p role="alert" className="text-sm text-red-400">{kl(msg, language)}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-accent-foreground shadow-[0_8px_28px_-10px_var(--accent)] disabled:opacity-50">{kl('submit', language)}</button>
            </form>
          )}
        </>
      )}
      <Link href="/" className="text-center text-sm text-muted-foreground underline">{kl('home', language)}</Link>
    </main>
  );
}
