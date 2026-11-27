// One place that says how "real" the platform is. Pure: no server imports. The mode comes only from the environment
// (PLATFORM_MODE in Vercel + a redeploy), never from a button, so nobody can raise it by accident from the admin panel.
//
//  SANDBOX      test only. Nothing that pays real money may run. This is also what you get when PLATFORM_MODE is missing or misspelled.
//  SOFT_LAUNCH  a small, watched group of real users. Real-money steps are possible but each still needs its own switch.
//  LIVE         open to the public. Each real-money step still needs its own switch.
//
// The mode never switches a feature on by itself: it only allows a feature whose own switch is also on.

export const MODES = ['SANDBOX', 'SOFT_LAUNCH', 'LIVE'] as const;
export type PlatformMode = (typeof MODES)[number];

export const MODE_AR: Record<PlatformMode, string> = { SANDBOX: 'تجريبي (SANDBOX)', SOFT_LAUNCH: 'إطلاق محدود (SOFT_LAUNCH)', LIVE: 'مفتوح للجمهور (LIVE)' };

/** Anything that is not exactly one of the three modes (after trimming, upper-casing and treating - or space as _) is SANDBOX. */
export function parseMode(v: unknown): PlatformMode {
  const s = String(v ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return (MODES as readonly string[]).includes(s) ? (s as PlatformMode) : 'SANDBOX';
}

export const platformMode = (): PlatformMode => parseMode(process.env.PLATFORM_MODE);

/** Real-money steps are never allowed in SANDBOX. */
export const realMoneyAllowed = (mode: PlatformMode): boolean => mode !== 'SANDBOX';

/** Paying a distribution needs a mode that allows real money AND its own switch (DISTRIBUTIONS_ENABLED=1). */
export const distributionsAllowed = (mode: PlatformMode, flag: unknown): boolean => realMoneyAllowed(mode) && flag === '1';
