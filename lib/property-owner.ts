// The owner of a property, kept apart from the public catalogue (Firestore property_owners/{propertyId}, server only).
// The contract shows only a masked line: a company by name, a person by initials, the registration number by its last 4 characters.
// The full record stays in the admin and is never part of a public contract text.

export type OwnerKind = 'individual' | 'company';
export type PropertyOwner = { kind: OwnerKind; name: string; registrationNo?: string };
export type ParsedOwner = { ok: true; owner: PropertyOwner | null } | { ok: false; error: string };

const oneLine = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f{}]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Admin input -> a clean owner, or null (name left empty = no owner recorded). */
export function parseOwner(b: unknown): ParsedOwner {
  if (b === null || b === undefined) return { ok: true, owner: null };
  if (typeof b !== 'object') return { ok: false, error: 'Invalid owner' };
  const o = b as Record<string, unknown>;
  const name = oneLine(o.name, 120);
  if (!name) return { ok: true, owner: null };
  if (name.length < 2) return { ok: false, error: 'Owner name is too short' };
  if (o.kind !== 'individual' && o.kind !== 'company') return { ok: false, error: 'Owner type must be individual or company' };
  const reg = oneLine(o.registrationNo, 40);
  if (reg && !/^[\p{L}\p{N} ./\-]+$/u.test(reg)) return { ok: false, error: 'Registration number has invalid characters' };
  return { ok: true, owner: { kind: o.kind, name, ...(reg ? { registrationNo: reg } : {}) } };
}

const maskName = (name: string): string => name.split(' ').filter(Boolean).map((w) => `${Array.from(w)[0]}***`).join(' ');
const maskReg = (r: string): string => (r.length > 4 ? `***${r.slice(-4)}` : '***');

/** The one line the contract prints for the owner. */
export function ownerLine(o: PropertyOwner): string {
  if (o.kind === 'company') return `${o.name} (company${o.registrationNo ? `, registration no. ${maskReg(o.registrationNo)}` : ''})`;
  return `${maskName(o.name)} (individual${o.registrationNo ? `, ID ${maskReg(o.registrationNo)}` : ''})`;
}

/** A stored document -> owner, or undefined when absent or not valid. */
export function parseStoredOwner(data: unknown): PropertyOwner | undefined {
  const p = parseOwner(data);
  return p.ok && p.owner ? p.owner : undefined;
}
