// The username a web account chooses for itself. It is also the account's invite code (like a Pi username), so it
// follows the invite-code rules: letters and digits only, 4 to 12 characters. It starts with a letter. Uniqueness
// ignores upper/lower case ("Ahmed7" and "ahmed7" are the same name).
export type ParsedHandle = { handle: string; key: string; code: string };

const SHAPE = /^[A-Za-z][A-Za-z0-9]{3,11}$/;
// Names that could be mistaken for the platform or its team.
const RESERVED_START = ['admin', 'reglobal', 'support', 'official', 'moderator', 'platform', 'system', 'staff'];
const RESERVED_EXACT = ['root', 'team', 'help', 'null', 'undefined', 'pinetwork', 'piapp'];

export function parseHandle(raw: unknown): ParsedHandle | null {
  if (typeof raw !== 'string') return null;
  const handle = raw.trim();
  if (!SHAPE.test(handle)) return null;
  const key = handle.toLowerCase();
  if (RESERVED_EXACT.includes(key) || RESERVED_START.some((p) => key.startsWith(p))) return null;
  return { handle, key, code: handle.toUpperCase() };
}
