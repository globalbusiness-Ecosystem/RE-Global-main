'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import { AVATAR_I18N, AVATAR_PRESETS, AVATAR_SIZE, centerSquare, encodeUnderLimit } from '@/lib/avatar';
import { UserAvatar, type AvatarState } from '@/components/user-avatar';
import type { NavLanguage } from '@/lib/nav-i18n';

interface Props {
  language: NavLanguage;
  username?: string | null;
  avatar: AvatarState | null;
  signedIn: boolean;
  onSave: (p: { preset: string } | { photo: string }) => Promise<'ok' | 'failed'>;
  onRemove: () => Promise<'ok' | 'failed'>;
  onClose: () => void;
}

// Shrinks the chosen picture in the browser to a small centred square before it is ever uploaded.
async function shrink(file: File): Promise<string | null> {
  const bmp = await createImageBitmap(file);
  const { sx, sy, side } = centerSquare(bmp.width, bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE; canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bmp.close?.();
  return encodeUnderLimit((q) => {
    const url = canvas.toDataURL('image/jpeg', q);
    return url.startsWith('data:image/jpeg') ? url : null;
  });
}

export function AvatarPicker({ language, username, avatar, signedIn, onSave, onRemove, onClose }: Props) {
  const s = AVATAR_I18N[language] ?? AVATAR_I18N.en;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async (fn: () => Promise<'ok' | 'failed'>) => {
    setBusy(true); setMsg(s.saving);
    const r = await fn();
    setBusy(false); setMsg(r === 'ok' ? null : s.failed);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMsg(s.badFile); return; }
    setBusy(true); setMsg(s.saving);
    try {
      const photo = await shrink(file);
      if (!photo) { setBusy(false); setMsg(s.tooBig); return; }
      await run(() => onSave({ photo }));
    } catch { setBusy(false); setMsg(s.badFile); }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={s.title} dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">{s.title}</h3>
          <button type="button" onClick={onClose} aria-label={s.done} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" aria-hidden /></button>
        </div>
        <div className="flex justify-center"><UserAvatar avatar={avatar} username={username} size={96} /></div>
        {!signedIn ? (
          <p className="text-sm text-muted-foreground text-center">{s.signIn}</p>
        ) : (
          <>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={s.upload} onChange={(e) => onFile(e.target.files?.[0])} />
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-2.5 rounded-lg font-semibold disabled:opacity-60">
              <Camera className="w-4 h-4" aria-hidden />{s.upload}
            </button>
            <p className="text-xs text-muted-foreground text-center">{s.choose}</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((p) => (
                <button key={p.id} type="button" disabled={busy} aria-label={p.id} aria-pressed={avatar?.preset === p.id} onClick={() => run(() => onSave({ preset: p.id }))} className={`rounded-full p-0.5 border-2 ${avatar?.preset === p.id ? 'border-accent' : 'border-transparent'}`}>
                  <UserAvatar avatar={{ preset: p.id }} size={40} />
                </button>
              ))}
            </div>
            {avatar && (
              <button type="button" disabled={busy} onClick={() => run(onRemove)} className="w-full flex items-center justify-center gap-2 text-sm text-destructive py-2">
                <Trash2 className="w-4 h-4" aria-hidden />{s.remove}
              </button>
            )}
            <p className="text-[11px] text-muted-foreground text-center">{s.privacy}</p>
            <p role="status" className="text-xs text-center text-muted-foreground min-h-4">{msg}</p>
          </>
        )}
      </div>
    </div>
  );
}
