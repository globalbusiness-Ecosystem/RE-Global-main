import { COUNTRIES } from './legal-profiles';
import { PURCHASE_TYPES } from './rewards';

// Partner program: four kinds of partner, an application the admin reviews, and a commission the admin sets per kind.
export const PARTNER_ROLES = ['broker', 'developer', 'investor', 'sales'] as const;
export type PartnerRole = (typeof PARTNER_ROLES)[number];
export const PARTNER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];
export const COMMISSION_STATUSES = ['accrued', 'paid', 'void'] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const isRole = (v: unknown): v is PartnerRole => typeof v === 'string' && (PARTNER_ROLES as readonly string[]).includes(v);

export type Application = { role: PartnerRole; company: string; country: string; phone: string; about: string; website: string; listed: boolean };
export type ApplicationError = 'role' | 'company' | 'country' | 'phone' | 'about' | 'website';

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

export function parseApplication(raw: unknown): { ok: true; value: Application } | { ok: false; error: ApplicationError } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  if (!isRole(r.role)) return { ok: false, error: 'role' };
  const company = clean(r.company, 100);
  if (company.length < 2) return { ok: false, error: 'company' };
  const country = typeof r.country === 'string' ? r.country.trim().toUpperCase() : '';
  if (!Object.prototype.hasOwnProperty.call(COUNTRIES, country)) return { ok: false, error: 'country' };
  const phone = clean(r.phone, 20);
  if (!/^\+?[0-9 ]{7,20}$/.test(phone)) return { ok: false, error: 'phone' };
  const about = clean(r.about, 600);
  if (about.length < 20) return { ok: false, error: 'about' };
  const website = clean(r.website, 200);
  if (website && !/^https:\/\/[^\s/$.?#][^\s]*$/i.test(website)) return { ok: false, error: 'website' };
  return { ok: true, value: { role: r.role, company, country, phone, about, website, listed: r.listed === true } };
}

export type ProgramRules = { enabled: boolean; rates: Record<PartnerRole, number> };
export const RATE_MAX = 20;
// No commission is promised until the admin sets a percentage.
export const DEFAULT_PROGRAM: ProgramRules = { enabled: true, rates: { broker: 0, developer: 0, investor: 0, sales: 0 } };

const rate = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > RATE_MAX) return null;
  return Math.round(n * 100) / 100;
};

// Strict check for what the admin saves: null when anything is wrong.
export function parseProgramRules(raw: unknown): ProgramRules | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  if (typeof r.enabled !== 'boolean') return null;
  const rates = {} as Record<PartnerRole, number>;
  for (const role of PARTNER_ROLES) {
    const v = rate(r.rates?.[role]);
    if (v === null) return null;
    rates[role] = v;
  }
  return { enabled: r.enabled, rates };
}

// Lenient read of the stored document: anything off falls back to the safe default.
export function readProgramRules(raw: unknown): ProgramRules {
  return parseProgramRules(raw) ?? DEFAULT_PROGRAM;
}

// Percent of a deal, to the cent.
export const commissionAmount = (base: number, ratePct: number): number => Math.round(base * ratePct) / 100;

// A completed purchase of a property counts. Resale and stays do not.
export const isCommissionable = (c: { status?: unknown; type?: unknown; amount?: unknown }): boolean =>
  c.status === 'completed' && typeof c.type === 'string' && PURCHASE_TYPES.includes(c.type) && typeof c.amount === 'number' && c.amount > 0;
