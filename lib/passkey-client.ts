'use client';
import { startRegistration, startAuthentication, browserSupportsWebAuthn, platformAuthenticatorIsAvailable, WebAuthnError } from '@simplewebauthn/browser';

/** True only when this browser can use the device's own fingerprint / face / screen lock. The Pi Browser on some phones cannot: then the option is simply not shown. */
export async function passkeysAvailable(): Promise<boolean> {
  try { return browserSupportsWebAuthn() && (await platformAuthenticatorIsAvailable()); } catch { return false; }
}

/** The person closed the device prompt or it timed out (not an error worth showing). */
export const wasCancelled = (e: unknown): boolean => e instanceof WebAuthnError && (e.name === 'NotAllowedError' || e.code === 'ERROR_CEREMONY_ABORTED');

export type RegisterResult = { ok: true } | { ok: false; reason: 'cancelled' | 'duplicate' | 'limit' | 'origin' | 'generic' };

/** Adds this device as a passkey for the signed-in account (two calls to the server around the device prompt). */
export async function registerPasskey(token: string | null, label: string, base = '/api/passkeys'): Promise<RegisterResult> {
  // The admin panel signs in with a cookie instead of a token (base '/api/admin/passkeys').
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  try {
    const o = await fetch(`${base}/register/options`, { method: 'POST', headers });
    const od = await o.json().catch(() => null);
    if (!o.ok || !od?.options) return { ok: false, reason: od?.error === 'limit' ? 'limit' : od?.error === 'origin' ? 'origin' : 'generic' };
    let response;
    try { response = await startRegistration({ optionsJSON: od.options }); }
    catch (e) {
      if (e instanceof WebAuthnError && e.code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED') return { ok: false, reason: 'duplicate' };
      return { ok: false, reason: wasCancelled(e) ? 'cancelled' : 'generic' };
    }
    const v = await fetch(`${base}/register/verify`, { method: 'POST', headers, body: JSON.stringify({ challengeId: od.challengeId, response, label }) });
    const vd = await v.json().catch(() => null);
    if (v.ok) return { ok: true };
    return { ok: false, reason: vd?.error === 'duplicate' ? 'duplicate' : vd?.error === 'limit' ? 'limit' : 'generic' };
  } catch { return { ok: false, reason: 'generic' }; }
}

/** Shows the device prompt for sign-in options the server produced; resolves to the signed answer, or null when cancelled. */
export async function answerChallenge(options: unknown): Promise<unknown | null> {
  try { return await startAuthentication({ optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'] }); }
  catch (e) { if (wasCancelled(e)) return null; throw e; }
}
