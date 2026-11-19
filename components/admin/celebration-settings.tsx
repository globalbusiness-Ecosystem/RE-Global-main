'use client';

import { useEffect, useState } from 'react';
import { adminApi, UnauthorizedError, Btn, Card, Field, inputCls } from './admin-ui';
import { CelebrationOverlay } from '@/components/celebration-overlay';
import { DEFAULT_CELEBRATION, DEFAULT_GREETING, MAX_GREETING, greetingFor, parseCelebration, type Celebration, type CelebrationKind, type Frequency } from '@/lib/celebration';

const MAX_AUDIO_MB = 8;
const AUDIO_TYPES = /^audio\/(mpeg|mp3|mp4|x-m4a|aac|ogg|wav|x-wav|webm)$/;
const FREQ_LABEL: Record<Frequency, string> = { once: 'مرة واحدة بس لكل شخص', daily: 'مرة كل يوم', session: 'مرة في كل زيارة' };

// Admin: the verification celebration (flowers, confetti, soft music) and the founder's bigger one with a spoken greeting.
export default function CelebrationSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [c, setC] = useState<Celebration | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState<CelebrationKind | null>(null);

  const fail = (e: unknown) => { if (e instanceof UnauthorizedError) onUnauthorized(); else setMsg('❌ ' + (e instanceof Error ? e.message : 'حصل خطأ')); };
  useEffect(() => {
    adminApi<Celebration>('/api/admin/celebration').then((d) => setC(parseCelebration(d))).catch(fail);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) return <Card title="🎉 الاحتفالات">{msg || '...'}</Card>;
  const upd = (fn: (x: Celebration) => Celebration) => setC((cur) => (cur ? fn(cur) : cur));
  const setKind = (k: CelebrationKind, patch: Record<string, unknown>) => upd((x) => ({ ...x, [k]: { ...x[k], ...patch } }) as Celebration);

  const save = async () => {
    setBusy(true); setMsg('');
    try { const d = await adminApi<Celebration>('/api/admin/celebration', { method: 'PUT', body: JSON.stringify(c) }); setC(parseCelebration(d)); setMsg('✅ اتحفظ.'); } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const uploadAudio = async (apply: (url: string) => void, file: File) => {
    if (!AUDIO_TYPES.test(file.type)) { setMsg('❌ الملف لازم يكون MP3 أو M4A أو AAC أو OGG أو WAV'); return; }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) { setMsg(`❌ الملف أكبر من ${MAX_AUDIO_MB}MB`); return; }
    setBusy(true); setMsg('جاري تجهيز الرفع...');
    try {
      const d = await adminApi<{ uploadUrl: string; publicUrl: string }>('/api/admin/audio-upload-url', { method: 'POST', body: JSON.stringify({ type: file.type }) });
      const r = await fetch(d.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!r.ok) throw new Error('فشل رفع الصوت (' + r.status + ')');
      apply(d.publicUrl);
      setMsg('✅ الصوت اترفع. اضغط "حفظ".');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const Kind = ({ k, title }: { k: CelebrationKind; title: string }) => {
    const s = c[k];
    const fu = c.founder;
    return (
      <div className="mb-4 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-3">
        <p className="mb-2 text-sm font-semibold text-[#d4af37]">{title}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-gray-100"><input type="checkbox" checked={s.enabled} onChange={(e) => setKind(k, { enabled: e.target.checked })} /> تشغيل الاحتفال</label>
          <label className="flex items-center gap-2 text-sm text-gray-100"><input type="checkbox" checked={s.music} onChange={(e) => setKind(k, { music: e.target.checked })} /> موسيقى هادية</label>
          {k === 'founder' && <label className="flex items-center gap-2 text-sm text-gray-100"><input type="checkbox" checked={fu.voice} onChange={(e) => setKind(k, { voice: e.target.checked })} /> صوت الترحيب</label>}
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Field label={`مستوى الصوت: ${s.volume}%`}>
            <input type="range" min={0} max={100} value={s.volume} onChange={(e) => setKind(k, { volume: Number(e.target.value) })} className="w-full" aria-label="مستوى الصوت" />
          </Field>
          <Field label="كل قد إيه يظهر">
            <select className={inputCls} value={s.frequency} onChange={(e) => setKind(k, { frequency: e.target.value })}>
              {(Object.keys(FREQ_LABEL) as Frequency[]).map((f) => <option key={f} value={f}>{FREQ_LABEL[f]}</option>)}
            </select>
          </Field>
        </div>
        <Field label="موسيقى من عندك (اختياري، رابط https أو ارفع ملف). سيبه فاضي لموسيقى المنصة الهادية">
          <div className="flex flex-wrap items-center gap-2">
            <input className={inputCls + ' flex-1'} dir="ltr" placeholder="https://.../music.mp3" value={s.musicUrl ?? ''} onChange={(e) => setKind(k, { musicUrl: e.target.value })} />
            <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-1.5 text-xs text-gray-100">⬆️ رفع<input type="file" accept="audio/*" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAudio((u) => setKind(k, { musicUrl: u }), f); e.target.value = ''; }} /></label>
          </div>
        </Field>
        {k === 'founder' && (
          <>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label={`عبارة الترحيب بالعربي (فاضي = "${DEFAULT_GREETING.ar}")`}>
                <input className={inputCls} dir="rtl" maxLength={MAX_GREETING} value={fu.greeting?.ar ?? ''} onChange={(e) => upd((x) => ({ ...x, founder: { ...x.founder, greeting: { ...x.founder.greeting, ar: e.target.value } } }))} />
              </Field>
              <Field label={`عبارة الترحيب بالإنجليزي (فاضي = "${DEFAULT_GREETING.en}")`}>
                <input className={inputCls} dir="ltr" maxLength={MAX_GREETING} value={fu.greeting?.en ?? ''} onChange={(e) => upd((x) => ({ ...x, founder: { ...x.founder, greeting: { ...x.founder.greeting, en: e.target.value } } }))} />
              </Field>
            </div>
            <Field label="صوت ترحيب مسجّل بصوتك (اختياري، رابط https أو ارفع ملف). سيبه فاضي لصوت الجهاز التلقائي">
              <div className="flex flex-wrap items-center gap-2">
                <input className={inputCls + ' flex-1'} dir="ltr" placeholder="https://.../welcome.mp3" value={fu.voiceUrl ?? ''} onChange={(e) => setKind(k, { voiceUrl: e.target.value })} />
                <label className="cursor-pointer rounded-lg border border-[#3a3a3a] px-3 py-1.5 text-xs text-gray-100">⬆️ رفع<input type="file" accept="audio/*" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAudio((u) => setKind(k, { voiceUrl: u }), f); e.target.value = ''; }} /></label>
              </div>
            </Field>
          </>
        )}
        <div className="mt-2"><Btn small kind="ghost" onClick={() => setPreview(k)}>▶️ تجربة (بالإعدادات الحالية)</Btn></div>
      </div>
    );
  };

  return (
    <Card title="🎉 الاحتفالات: توثيق الهوية والمؤسس">
      <p className="mb-3 text-xs text-gray-400">لما حد يتوثق هويته بيظهرله احتفال بالورود والزينة مع موسيقى هادية. وللمؤسس احتفال أكبر مع صوت ترحيب. المتصفحات أوقات بتمنع الصوت لحد ما المستخدم يلمس الشاشة، فبيظهر زرار «اضغط لتشغيل الصوت» لو اتمنع. صوت الترحيب التلقائي بيستخدم صوت الجهاز، وبعض الأجهزة ما فيهاش صوت عربي، فالأضمن إنك ترفع تسجيل بصوتك.</p>
      <label className="mb-3 flex items-center gap-2 text-sm text-gray-100"><input type="checkbox" checked={c.enabled} onChange={(e) => upd((x) => ({ ...x, enabled: e.target.checked }))} /> تشغيل كل الاحتفالات</label>
      {Kind({ k: 'user', title: '✅ احتفال المستخدم عند توثيق هويته' })}
      {Kind({ k: 'founder', title: '👑 احتفال المؤسس' })}
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => void save()} disabled={busy}>{busy ? '...' : '💾 حفظ'}</Btn>
        <Btn kind="ghost" onClick={() => setC(DEFAULT_CELEBRATION)} disabled={busy}>الإعدادات الافتراضية</Btn>
      </div>
      {msg && <p className="mt-2 text-xs text-gray-200">{msg}</p>}
      {preview && <CelebrationOverlay kind={preview} language="ar" level={preview === 'founder' ? 7 : 3} name="Elsayed" settings={c[preview]} greeting={preview === 'founder' ? greetingFor(c, 'ar') : undefined} onClose={() => setPreview(null)} />}
    </Card>
  );
}
