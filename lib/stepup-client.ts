'use client';
import { answerChallenge } from '@/lib/passkey-client';

export type StepUpResult = { ok: true; token: string } | { ok: false; reason: 'cancelled' | 'failed' };
export type Prefs = { requireStepUp: boolean; passkeys: number };

/** Does this account ask for its fingerprint before payments / erasing data? null when the answer could not be read. */
export async function fetchPrefs(accessToken: string): Promise<Prefs | null> {
  try {
    const r = await fetch('/api/passkeys/prefs', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    return { requireStepUp: !!d.requireStepUp, passkeys: Number(d.passkeys) || 0 };
  } catch { return null; }
}

/** One fingerprint check: the server's challenge, the device prompt, and a one-time token (valid two minutes) to send as X-Stepup-Token. */
export async function fetchStepUpToken(accessToken: string): Promise<StepUpResult> {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
  try {
    const o = await fetch('/api/passkeys/stepup/options', { method: 'POST', headers });
    const od = await o.json().catch(() => null);
    if (!o.ok || !od?.options) return { ok: false, reason: 'failed' };
    const response = await answerChallenge(od.options);
    if (!response) return { ok: false, reason: 'cancelled' };
    const v = await fetch('/api/passkeys/stepup/verify', { method: 'POST', headers, body: JSON.stringify({ challengeId: od.challengeId, response }) });
    const vd = await v.json().catch(() => null);
    return v.ok && typeof vd?.token === 'string' ? { ok: true, token: vd.token } : { ok: false, reason: 'failed' };
  } catch { return { ok: false, reason: 'failed' }; }
}

/** True when a response is the server asking for the fingerprint. */
export async function isStepUpRequired(res: Response): Promise<boolean> {
  if (res.status !== 403) return false;
  try { return (await res.clone().json())?.error === 'stepup_required'; } catch { return false; }
}
