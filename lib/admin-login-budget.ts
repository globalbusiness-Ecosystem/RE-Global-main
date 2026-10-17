import 'server-only';
import { consumeRateLimit } from '@/lib/rate-limit';

// The per-IP lock stops one machine from guessing the admin PIN, but an attacker with many IPs gets a fresh
// allowance on each. This is a second, shared budget for ALL login attempts together, so the total number of
// guesses stays small no matter how many IPs are used. A real admin uses 1-2 attempts, so it never gets in the way.
export const LOGIN_BUDGET = 100;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Spends one attempt from the shared budget. ok=false means "too many attempts overall, try later". */
export async function spendLoginAttempt(): Promise<{ ok: boolean; retryAfter: number }> {
  return consumeRateLimit('admin-login-all', LOGIN_BUDGET, LOGIN_WINDOW_MS);
}
