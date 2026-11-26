import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CLAUSES, FRAMEWORK_KINDS, buildContractText, buildResaleContractText, previewFrameworkTerms, isFrameworkText, type FrameworkKind } from '@/lib/contract-framework';
import { DISABLEABLE_IDS, EDITABLE_IDS, LOCKED_IDS, hasOverrides, parseStored, renderVars, textProblem, validateDraft, type TermsOverrides } from '@/lib/contract-terms';
import { contractKind } from '@/lib/contract-kind';
import { auditLabel, auditSummary } from '@/lib/audit-labels';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Marina Tower', buyerUsername: 'ahmed', sellerUsername: 'RE-Global-Platform', type: 'invest', amount: 100, currency: 'Pi', paymentId: 'pay1', txid: 'tx1', shares: { count: 25, totalShares: 200 }, legal: { statusLine: 'Pending', governingLaw: 'the laws of Egypt' } };
const GOOD = 'The Buyer understands that the Shares are held through a company that the Listing names, and that title stays with it.';
const ov = (over: Partial<TermsOverrides> = {}): TermsOverrides => ({ revision: 3, clauses: { 'subject-invest': { text: GOOD } }, custom: [], ...over });
const termsOf = (t: string) => t.slice(t.indexOf('\nTERMS\n'));

describe('the clause lists agree with the library', () => {
  it('every id is a real clause, and locked and editable never overlap', () => {
    const ids = CLAUSES.map((c) => c.id);
    for (const id of [...LOCKED_IDS, ...EDITABLE_IDS]) expect(ids, id).toContain(id);
    for (const id of ids) expect(LOCKED_IDS.includes(id) !== EDITABLE_IDS.includes(id), id).toBe(true);
    for (const id of DISABLEABLE_IDS) expect(EDITABLE_IDS).toContain(id);
  });
  it('the payment, refund, signing, data, liability, law and pilot clauses are locked', () => {
    for (const id of ['price-pi', 'price-card', 'resale-settlement', 'e-execution', 'cancellation', 'data', 'liability', 'law', 'pilot']) expect(LOCKED_IDS).toContain(id);
  });
  it('the built-in text of every editable clause passes the rules the admin text must pass', () => {
    for (const c of CLAUSES.filter((x) => EDITABLE_IDS.includes(x.id))) {
      const k = (c.kinds === 'all' ? FRAMEWORK_KINDS : c.kinds)[0];
      const t = c.body({ kind: k, rail: 'pi', governingLaw: 'x', currency: 'Pi', amount: 1, paymentId: 'a', txid: 'b', hasInspection: true });
      expect(textProblem(t, c.id), c.id).toBeNull();
    }
  });
});

describe('validation', () => {
  it('accepts a normal edit and a custom clause, and cleans whitespace', () => {
    const v = validateDraft({ clauses: { roles: { text: `${GOOD}\n\n  Second   line.` } }, custom: [{ title: 'Registration costs', text: 'Registration costs are shared equally by the parties.' }] });
    expect(v.ok).toBe(true);
    if (v.ok) { expect(v.value.clauses.roles.text).not.toMatch(/\n|  /); expect(v.value.custom).toHaveLength(1); }
  });
  it.each(LOCKED_IDS)('refuses to edit the locked clause %s', (id) => {
    const v = validateDraft({ clauses: { [id]: { text: GOOD } } });
    expect(v.ok).toBe(false);
  });
  it('refuses unknown clauses, and switching off a clause that must stay', () => {
    expect(validateDraft({ clauses: { nope: { text: GOOD } } }).ok).toBe(false);
    expect(validateDraft({ clauses: { risk: { disabled: true } } }).ok).toBe(false);
    expect(validateDraft({ clauses: { inspection: { disabled: true } } }).ok).toBe(true);
  });
  it.each([
    'The Platform provides a guaranteed return of ten percent every year.',
    'The Platform guarantees a profit to every holder of Shares.',
    'This investment is risk-free for all of the buyers here.',
    'The offering is certified by a supervisory board of scholars.',
    'The offering is compliant with Shariah principles in every way.',
    'The structure is fully compliant with the law of the country.',
  ])('refuses a promise or a compliance claim: %s', (t) => {
    expect(textProblem(t, 'x')).not.toBeNull();
  });
  it('keeps the honest wording "does not guarantee any return" allowed', () => {
    expect(textProblem('The Platform does not guarantee any return or distribution to holders.', 'x')).toBeNull();
    expect(textProblem('There is no guarantee of any return on the Shares for the holder.', 'x')).toBeNull();
  });
  it('refuses Arabic, links, emails, short or long text, unknown variables and stray braces', () => {
    expect(textProblem('هذا النص عربي ولا يصلح للعقد الموقّع أبدا', 'x')).toMatch(/English/);
    expect(textProblem('See https://example.com for the full details of it.', 'x')).toMatch(/web/);
    expect(textProblem('Write to someone@example.com about the details here.', 'x')).toMatch(/email/);
    expect(textProblem('Too short.', 'x')).toMatch(/short/);
    expect(textProblem('a'.repeat(2001), 'x')).toMatch(/long/);
    expect(textProblem('The price is {{secret}} in total for the whole thing.', 'x')).toMatch(/unknown variable/);
    expect(textProblem('The price is {oops in total for the whole thing here.', 'x')).toMatch(/braces/);
    expect(textProblem('The law is {{governingLaw}} for the whole of this contract.', 'x')).toBeNull();
  });
  it('limits the number of custom clauses and checks their titles', () => {
    const c = { title: 'A fine title', text: GOOD };
    expect(validateDraft({ custom: Array(11).fill(c) }).ok).toBe(false);
    expect(validateDraft({ custom: [{ title: 'x', text: GOOD }] }).ok).toBe(false);
    expect(validateDraft({ custom: [{ title: 'Has a dot. in it', text: GOOD }] }).ok).toBe(false);
    expect(validateDraft('garbage').ok).toBe(true);
  });
});

describe('the edited terms in a contract', () => {
  const plain = buildContractText(base);
  const edited = buildContractText(base, { overrides: ov() });
  it('prints the edit, the revision in the marker, and keeps numbering and the parsers', () => {
    expect(edited).toContain(GOOD);
    expect(edited).toContain('(invest) terms r3');
    expect(isFrameworkText(edited)).toBe(true);
    expect(contractKind({ type: 'invest', contractText: edited })).toBe('invest');
    const nums = [...termsOf(edited).matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums).toEqual(nums.map((_, i) => i + 1));
    expect(plain).not.toContain('terms r');
  });
  it('everything outside the edited clause is identical', () => {
    const strip = (t: string) => t.replace(/^Date: .*$/m, 'Date: X').replace(/\(invest\) terms r3/, '(invest)').split('\n').filter((l) => !l.includes('Subject and rights attached to Shares')).join('\n');
    expect(strip(edited)).toBe(strip(plain));
  });
  it('locked clauses cannot be changed even by a stored document that tries to', () => {
    const sneaky = buildContractText(base, { overrides: { revision: 4, clauses: { pilot: { text: 'This contract is final and binding in every respect now.' }, law: { text: 'Another law applies here for sure.' }, cancellation: { disabled: true } } as never, custom: [] } });
    expect(sneaky).toContain('technical pilot phase');
    expect(sneaky).toContain('governed by the laws of Egypt');
    expect(sneaky).toContain('Cancellation, withdrawal and refund');
  });
  it('custom clauses come just before the governing law, with variables filled in', () => {
    const t = buildContractText(base, { overrides: ov({ custom: [{ title: 'Costs', text: 'Costs follow {{governingLaw}} and are quoted in {{currency}}.' }] }) });
    expect(t).toMatch(/\d+\. Costs\. Costs follow the laws of Egypt and are quoted in Pi\.\n\d+\. Governing law\./);
  });
  it('a switched-off clause disappears and the rest stays numbered', () => {
    const t = buildContractText(base, { overrides: ov({ clauses: { transfers: { disabled: true } } }) });
    expect(t).not.toContain('Transfers and the shares market');
    const nums = [...termsOf(t).matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
  it('an empty override changes nothing, not even the marker', () => {
    expect(termsOf(buildContractText(base, { overrides: { revision: 9, clauses: {}, custom: [] } }))).toBe(termsOf(plain));
    expect(hasOverrides({ clauses: {}, custom: [] })).toBe(false);
  });
  it('works for a resale and for every kind through the preview', () => {
    const r = buildResaleContractText({ contractId: 'r1', propertyId: 'p1', propertyTitle: 'T', sellerUsername: 's', buyerUsername: 'b', shares: 1, totalShares: 10, pricePerShare: 5, amount: 5, fee: 0.1, proceeds: 4.9, currency: 'Pi', paymentId: 'p', txid: 't', legal: { statusLine: 'x', governingLaw: 'the laws of Egypt' } },
      { overrides: ov({ clauses: { 'subject-resale': { text: GOOD } } }) });
    expect(r).toContain(GOOD);
    for (const k of FRAMEWORK_KINDS as FrameworkKind[]) {
      const t = previewFrameworkTerms(k, ov({ clauses: { roles: { text: GOOD } } }), true);
      expect(t).toContain(GOOD);
      expect(t).toContain(`(${k}) terms r3`);
    }
  });
  it('the text still claims no returns and no compliance after an allowed edit', () => {
    expect(edited.toLowerCase()).not.toMatch(/guaranteed return|risk[- ]free|certified by|is compliant with/);
  });
});

describe('stored documents', () => {
  it('a valid document becomes overrides with its revision', () => {
    const p = parseStored({ revision: 5, clauses: { roles: { text: GOOD } }, custom: [] });
    expect(p?.revision).toBe(5);
  });
  it('a missing, empty or invalid document means the built-in text', () => {
    expect(parseStored(undefined)).toBeUndefined();
    expect(parseStored({ revision: 0, clauses: { roles: { text: GOOD } } })).toBeUndefined();
    expect(parseStored({ revision: 2, clauses: {}, custom: [] })).toBeUndefined();
    expect(parseStored({ revision: 2, clauses: { pilot: { text: GOOD } } })).toBeUndefined();
    expect(parseStored({ revision: 2, clauses: { roles: { text: 'This is a guaranteed return for all holders.' } } })).toBeUndefined();
  });
  it('variables are filled in; unknown ones become empty', () => {
    expect(renderVars('{{amount}} {{currency}} under {{governingLaw}}', { governingLaw: 'L', amount: 5, currency: 'Pi' })).toBe('5 Pi under L');
  });
});

describe('wiring', () => {
  const read = (p: string) => readFileSync(p, 'utf8');
  it('every place that writes a contract loads the admin terms and passes them in', () => {
    for (const f of ['app/api/contracts/sign/route.ts', 'lib/card-contract.ts', 'lib/resale-contract.ts']) {
      const s = read(f);
      expect(s, f).toContain('getContractTerms');
      expect(s, f).toContain('overrides: termsOverrides');
    }
  });
  it('the admin route is guarded, never cached, validates before saving, and is logged', () => {
    const s = read('app/api/admin/contract-terms/route.ts');
    expect(s).toContain('isAdminRequest');
    expect(s).toContain('no-store');
    expect(s).toContain('validateDraft');
    expect(s).toContain("logAdmin('contract.terms'");
  });
  it('the activity log has a label for it', () => {
    expect(auditLabel('contract.terms')).toBe('تعديل بنود العقد');
    expect(auditSummary('contract.terms', { revision: 4, note: 'x' })).toBe('نسخة 4 · x');
  });
});
