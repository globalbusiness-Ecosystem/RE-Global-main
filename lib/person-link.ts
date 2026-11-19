import { randomInviteCode } from '@/lib/invite-code';

// One person can have several accounts (Pi and web). Linking them makes them one identity for points, level,
// invite code and name. The person proves they own both accounts by making a short code in one and typing it in the other.
export const MAX_LINKED_ACCOUNTS = 5;
export const LINK_CODE_TTL_MS = 10 * 60 * 1000;
export const LINK_CODE_LENGTH = 8;

export type AccountRef = { uid: string; username: string };
export type AccountKind = 'pi' | 'web';

export const accountKind = (uid: string): AccountKind => (uid.startsWith('web_') ? 'web' : 'pi');

export const randomLinkCode = (rand: () => number): string => randomInviteCode(rand);

/** What the person typed, tidied: spaces and dashes dropped, capitals. Null when it cannot be a link code. */
export function parseLinkCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const c = raw.replace(/[\s-]+/g, '').toUpperCase();
  return /^[A-HJ-NP-Z2-9]{8}$/.test(c) ? c : null;
}

export const linkCodeExpired = (expiresAtMs: number, now = Date.now()): boolean => !Number.isFinite(expiresAtMs) || expiresAtMs <= now;

/** Adds accounts to a list without repeats. Returns null when the person would pass the limit. */
export function mergeAccounts(existing: AccountRef[], add: AccountRef[]): AccountRef[] | null {
  const out = [...existing];
  for (const a of add) if (!out.some((x) => x.uid === a.uid)) out.push(a);
  return out.length > MAX_LINKED_ACCOUNTS ? null : out;
}

/** The account that owns the shared invite code: the one named primary, else the first. */
export const primaryOf = (accounts: AccountRef[], primaryUid: string | null): AccountRef | null =>
  accounts.find((a) => a.uid === primaryUid) ?? accounts[0] ?? null;

/** What is left after one account leaves: the accounts, and the new primary uid. Fewer than two accounts means no link at all. */
export function afterUnlink(accounts: AccountRef[], primaryUid: string | null, leavingUid: string): { accounts: AccountRef[]; primaryUid: string | null } {
  const rest = accounts.filter((a) => a.uid !== leavingUid);
  if (rest.length < 2) return { accounts: [], primaryUid: null };
  return { accounts: rest, primaryUid: rest.some((a) => a.uid === primaryUid) ? primaryUid : rest[0].uid };
}
