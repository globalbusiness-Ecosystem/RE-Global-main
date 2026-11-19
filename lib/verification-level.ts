// How verified a person is, counting all the accounts linked to them.
// pi: a linked Pi account signed in through Pi. kyc: a linked web account passed the identity check.
export type VerifyLevel = 'none' | 'pi' | 'full';
export type LinkedVerification = { pi: boolean; kyc: boolean };

const RANK: Record<VerifyLevel, number> = { none: 0, pi: 1, full: 2 };

export const maxLevel = (a: VerifyLevel, b: VerifyLevel): VerifyLevel => (RANK[a] >= RANK[b] ? a : b);

/** The level the linked accounts give together: an approved identity check is full, a Pi sign-in alone is the Pi level. */
export const linkedLevel = (v: LinkedVerification | null | undefined): VerifyLevel => (v?.kyc ? 'full' : v?.pi ? 'pi' : 'none');
