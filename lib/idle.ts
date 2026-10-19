// Admin auto sign-out after a period with no activity.
export const IDLE_MS = 20 * 60 * 1000;
export const WARN_MS = 60 * 1000;

export type IdleState = { phase: 'active' | 'warning' | 'expired'; secondsLeft: number };

/** What to show, given the time of the last activity. Pure, so it can be tested without a browser. */
export function idleState(now: number, lastActivity: number, idleMs: number = IDLE_MS, warnMs: number = WARN_MS): IdleState {
  const elapsed = Math.max(0, now - lastActivity);
  const left = idleMs - elapsed;
  if (!Number.isFinite(left) || left <= 0) return { phase: 'expired', secondsLeft: 0 };
  return { phase: left <= warnMs ? 'warning' : 'active', secondsLeft: Math.ceil(left / 1000) };
}
