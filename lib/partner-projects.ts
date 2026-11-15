import { COUNTRIES } from './legal-profiles';

// A partner's own projects (their portfolio). A project is written by an approved partner, reviewed by the admin, and only then shown to everyone.
export const PROJECT_KINDS = ['apartment', 'villa', 'land', 'commercial', 'hotel', 'other'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];
export const PROJECT_CURRENCIES = ['USD', 'EUR', 'GBP', 'EGP', 'AED', 'SAR', 'PI'] as const;
export type ProjectCurrency = (typeof PROJECT_CURRENCIES)[number];
export const PROJECT_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'hidden'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const MAX_PROJECTS = 20;
export const MAX_IMAGES = 8;
export const MAX_PLANS = 3;

/** An instalment plan the partner offers: a share paid up front, the rest over `months`, with an optional extra charge on the financed part. */
export type InstallmentPlan = { label: string; downPct: number; months: number; extraPct: number };

export type ProjectInput = {
  title: string; description: string; kind: ProjectKind; country: string; city: string; price: number; currency: ProjectCurrency;
  images: string[]; contact: string; installments: InstallmentPlan[];
};
export type ProjectError = 'title' | 'description' | 'kind' | 'country' | 'city' | 'price' | 'currency' | 'images' | 'contact' | 'plan';

const line = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
// Free text keeps its line breaks (at most one empty line in a row).
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r/g, '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');
const num = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
export const round2 = (n: number) => Math.round(n * 100) / 100;

export const isKind = (v: unknown): v is ProjectKind => typeof v === 'string' && (PROJECT_KINDS as readonly string[]).includes(v);
export const isCurrency = (v: unknown): v is ProjectCurrency => typeof v === 'string' && (PROJECT_CURRENCIES as readonly string[]).includes(v);

export function parsePlan(raw: unknown): InstallmentPlan | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const downPct = num(r.downPct), months = num(r.months), extraPct = r.extraPct === undefined || r.extraPct === '' ? 0 : num(r.extraPct);
  if (!Number.isFinite(downPct) || downPct < 0 || downPct > 90) return null;
  if (!Number.isInteger(months) || months < 2 || months > 240) return null;
  if (!Number.isFinite(extraPct) || extraPct < 0 || extraPct > 100) return null;
  return { label: line(r.label, 40), downPct: round2(downPct), months, extraPct: round2(extraPct) };
}

export function parseProject(raw: unknown): { ok: true; value: ProjectInput } | { ok: false; error: ProjectError } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const title = line(r.title, 100);
  if (title.length < 3) return { ok: false, error: 'title' };
  const description = text(r.description, 2000);
  if (description.length < 20) return { ok: false, error: 'description' };
  if (!isKind(r.kind)) return { ok: false, error: 'kind' };
  const country = typeof r.country === 'string' ? r.country.trim().toUpperCase() : '';
  if (!Object.prototype.hasOwnProperty.call(COUNTRIES, country)) return { ok: false, error: 'country' };
  const city = line(r.city, 60);
  if (city.length < 2) return { ok: false, error: 'city' };
  const price = num(r.price);
  if (!Number.isFinite(price) || price <= 0 || price > 1e10) return { ok: false, error: 'price' };
  if (!isCurrency(r.currency)) return { ok: false, error: 'currency' };
  const imagesRaw = Array.isArray(r.images) ? r.images : [];
  const images = imagesRaw.filter((u): u is string => typeof u === 'string' && /^https:\/\/[^\s]{4,480}$/.test(u));
  if (images.length !== imagesRaw.length || images.length > MAX_IMAGES) return { ok: false, error: 'images' };
  const contact = line(r.contact, 80);
  if (contact && !/^(\+?[0-9 ]{7,20}|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/.test(contact)) return { ok: false, error: 'contact' };
  const plansRaw = Array.isArray(r.installments) ? r.installments : [];
  if (plansRaw.length > MAX_PLANS) return { ok: false, error: 'plan' };
  const installments: InstallmentPlan[] = [];
  for (const p of plansRaw) {
    const plan = parsePlan(p);
    if (!plan) return { ok: false, error: 'plan' };
    installments.push(plan);
  }
  return { ok: true, value: { title, description, kind: r.kind, country, city, price: round2(price), currency: r.currency, images, contact, installments } };
}

/** What a plan means in money: the up-front part, the financed part, the monthly payment and the total the buyer pays. */
export function installmentSchedule(price: number, plan: InstallmentPlan) {
  const down = round2((price * plan.downPct) / 100);
  const financed = round2(price - down);
  const financedWithExtra = round2(financed * (1 + plan.extraPct / 100));
  return { down, financed, monthly: round2(financedWithExtra / plan.months), months: plan.months, total: round2(down + financedWithExtra), extra: round2(financedWithExtra - financed) };
}

/** The cheapest monthly payment among the plans (for the "from X / month" tag), or null when there are none. */
export function lowestMonthly(price: number, plans: InstallmentPlan[]): number | null {
  return plans.length ? Math.min(...plans.map((p) => installmentSchedule(price, p).monthly)) : null;
}

/** Which statuses the owner may edit, and which status a saved project gets: an approved project goes back to review when changed. */
export function statusAfterSave(current: ProjectStatus | null, submit: boolean): ProjectStatus | null {
  if (current === 'hidden') return null; // hidden by the team: only the team can bring it back
  if (submit) return 'pending';
  if (current === 'approved' || current === 'pending') return 'pending';
  return 'draft';
}

/** Only images that this platform stored for partners may be shown. */
export const isPartnerImage = (url: string, storageBase: string): boolean => !!storageBase && url.startsWith(`${storageBase.replace(/\/+$/, '')}/storage/v1/object/public/`) && /\/partners\/[^/]+\//.test(url);
