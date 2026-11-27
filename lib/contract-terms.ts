// Admin-editable contract terms: pure rules (no server imports), shared by the admin API, the panel, the framework and the tests.
//
// What the admin may change, and what he may not:
//  - LOCKED clauses carry the payment, refund, evidence, data, liability, governing law and pilot-phase wording. The parsers and the
//    public verify page depend on some of them, and counsel must approve changes to the rest. They are changed in code only.
//  - EDITABLE clauses may get a new text. A few of them may also be switched off (DISABLEABLE).
//  - The admin may add CUSTOM clauses; they are printed just before the governing-law clause.
//  - Every text is checked here: English only (the English text is the signed original), one paragraph, length limits, only the
//    variables listed below, and none of the phrases that promise a return or claim compliance or certification.
//  - A contract that was already signed is never touched: it keeps the text it was signed with.

export type ClauseEdit = { text?: string; disabled?: boolean };
export type CustomClause = { title: string; text: string };
export type TermsOverrides = { revision: number; clauses: Record<string, ClauseEdit>; custom: CustomClause[] };
export type TermsDraft = { clauses: Record<string, ClauseEdit>; custom: CustomClause[] };

export const LOCKED_IDS = ['owner', 'price-pi', 'price-card', 'resale-settlement', 'e-execution', 'cancellation', 'data', 'liability', 'law', 'pilot'];
export const EDITABLE_IDS = ['definitions', 'subject-sale', 'subject-invest', 'subject-rent', 'subject-hotel', 'subject-resale', 'compliance', 'inspection', 'risk', 'risk-short', 'distributions', 'transfers', 'roles', 'shariah', 'force-majeure', 'disputes', 'general'];
export const DISABLEABLE_IDS = ['inspection', 'transfers', 'shariah', 'force-majeure'];

export const VARIABLES = ['governingLaw', 'amount', 'currency'] as const;
export const MAX_TEXT = 2000;
export const MIN_TEXT = 20;
export const MAX_CUSTOM = 10;

// Phrases that would turn a contract into a promise or a compliance claim the platform cannot back.
const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /guarantee[sd]?\s+(a\s+|any\s+|the\s+)?(return|profit|income|yield|gain)s?/i, why: 'promises a return' },
  { re: /guaranteed\s+(return|profit|income|yield|gain)s?/i, why: 'promises a return' },
  { re: /risk[\s-]*free|no[\s-]+risk|without\s+risk|sure\s+profit|will\s+earn/i, why: 'says there is no risk' },
  { re: /certified\s+by|approved\s+by|licen[sc]ed\s+by|regulated\s+by/i, why: 'claims a certification or approval' },
  { re: /(is|are|be|being|fully)\s+compliant\s+with|in\s+compliance\s+with|shari'?ah[\s-]*compliant|halal\s+certified/i, why: 'claims compliance' },
];

const CTRL = /[\u0000-\u001f\u007f]+/g;
const clean = (v: unknown): string => String(v ?? '').replace(CTRL, ' ').replace(/\s+/g, ' ').trim();

/** Problems with one text, or null when it is fine. */
export function textProblem(raw: unknown, label: string): string | null {
  const t = clean(raw);
  if (t.length < MIN_TEXT) return `${label}: too short (at least ${MIN_TEXT} characters)`;
  if (t.length > MAX_TEXT) return `${label}: too long (at most ${MAX_TEXT} characters)`;
  if (/[\u0590-\u08FF]/.test(t)) return `${label}: English only (the English text is the signed original)`;
  if (/https?:\/\/|www\./i.test(t)) return `${label}: no web addresses`;
  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(t)) return `${label}: no email addresses`;
  // "does not guarantee any return" is the honest wording and stays allowed; only the promise itself is refused.
  const promise = t.replace(/\b(?:do|does|did|will|shall|can|could|may|must)\s+not\s+guarantee[sd]?/gi, ' ').replace(/\b(?:no|without|not\s+a)\s+guarantee[sd]?/gi, ' ');
  for (const f of FORBIDDEN) if (f.re.test(promise)) return `${label}: ${f.why}`;
  for (const m of t.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)) if (!(VARIABLES as readonly string[]).includes(m[1])) return `${label}: unknown variable {{${m[1]}}}`;
  const stripped = t.replace(/\{\{\s*[^}]*?\s*\}\}/g, '');
  if (/[{}]/.test(stripped)) return `${label}: stray braces`;
  return null;
}

export type Checked = { ok: true; value: TermsDraft } | { ok: false; errors: string[] };

/** Checks a draft from the admin (or a stored document) and returns the cleaned draft. */
export function validateDraft(input: unknown): Checked {
  const errors: string[] = [];
  const src = (input && typeof input === 'object' ? input : {}) as { clauses?: unknown; custom?: unknown };
  const clauses: Record<string, ClauseEdit> = {};
  const rawClauses = src.clauses && typeof src.clauses === 'object' && !Array.isArray(src.clauses) ? (src.clauses as Record<string, unknown>) : {};
  for (const [id, v] of Object.entries(rawClauses)) {
    if (LOCKED_IDS.includes(id)) { errors.push(`${id}: this clause is locked`); continue; }
    if (!EDITABLE_IDS.includes(id)) { errors.push(`${id}: unknown clause`); continue; }
    const e = (v && typeof v === 'object' ? v : {}) as ClauseEdit;
    const out: ClauseEdit = {};
    if (e.disabled === true) {
      if (!DISABLEABLE_IDS.includes(id)) errors.push(`${id}: this clause cannot be switched off`);
      else out.disabled = true;
    }
    if (e.text !== undefined && e.text !== null && clean(e.text) !== '') {
      const p = textProblem(e.text, id);
      if (p) errors.push(p); else out.text = clean(e.text);
    }
    if (out.text !== undefined || out.disabled) clauses[id] = out;
  }
  const custom: CustomClause[] = [];
  const rawCustom = Array.isArray(src.custom) ? src.custom : [];
  if (rawCustom.length > MAX_CUSTOM) errors.push(`at most ${MAX_CUSTOM} custom clauses`);
  rawCustom.slice(0, MAX_CUSTOM).forEach((c, i) => {
    const o = (c && typeof c === 'object' ? c : {}) as Partial<CustomClause>;
    const title = clean(o.title);
    const label = `custom ${i + 1}`;
    if (title.length < 3 || title.length > 80) errors.push(`${label}: title must be 3 to 80 characters`);
    else if (/[\u0590-\u08FF]/.test(title)) errors.push(`${label}: title must be English`);
    else if (/\{\{|\}\}|[.\n]/.test(title)) errors.push(`${label}: no dots or variables in the title`);
    const p = textProblem(o.text, label);
    if (p) errors.push(p);
    if (title && !p) custom.push({ title, text: clean(o.text) });
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: { clauses, custom } };
}

export const hasOverrides = (o: TermsDraft | null | undefined): boolean => !!o && (Object.keys(o.clauses).length > 0 || o.custom.length > 0);

/** A stored Firestore document -> overrides, or undefined when absent or not valid (the built-in text is used, never a half-valid one). */
export function parseStored(data: unknown): TermsOverrides | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as { revision?: unknown };
  const revision = Math.floor(Number(d.revision));
  if (!(revision > 0)) return undefined;
  const v = validateDraft(data);
  if (!v.ok || !hasOverrides(v.value)) return undefined;
  return { revision, ...v.value };
}

export function renderVars(text: string, vars: { governingLaw: string; amount: number; currency: string }): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => (k === 'governingLaw' ? vars.governingLaw : k === 'amount' ? String(vars.amount) : k === 'currency' ? vars.currency : ''));
}
