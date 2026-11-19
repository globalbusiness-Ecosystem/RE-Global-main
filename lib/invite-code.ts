import { referralCodeOf } from '@/lib/contract-identity';
import { parseRefCode } from '@/lib/ref-code';

// One invite code per account, the same rules for Pi and web accounts. Letters that look alike (0/O, 1/I) are left out of new codes.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 8;

/** A fresh random code. `rand` returns a number in [0,1) (Math.random, or a crypto-backed function). */
export function randomInviteCode(rand: () => number): string {
  let out = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) out += ALPHABET[Math.min(ALPHABET.length - 1, Math.floor(rand() * ALPHABET.length))];
  return out;
}

/** The first code tried for an account: the code a Pi account has always had, so codes already shared keep working. */
export const legacyInviteCode = (username: string): string | null => parseRefCode(referralCodeOf(username));

/**
 * A Pi account's own invite code is its verified Pi name: capitals and digits only, at most 12 characters.
 * Null when nothing usable is left (fewer than 4 characters). A name that is already taken falls back to another code.
 */
export function piNameCode(username: string): string | null {
  const c = parseRefCode(username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
  return c;
}

/** The share link: https://site/r/CODE (it redirects to the app with the code kept). */
export const inviteUrl = (origin: string, code: string): string => `${origin.replace(/\/+$/, '')}/r/${encodeURIComponent(code)}`;
