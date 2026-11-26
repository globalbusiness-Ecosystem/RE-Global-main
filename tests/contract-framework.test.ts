import { describe, it, expect, afterEach } from 'vitest';
import { generateContractText, generateResaleContractText, hashContract } from '@/lib/contract-signing';
import {
  CLAUSES, FRAMEWORK_BASIS, FRAMEWORK_KINDS, FRAMEWORK_MARKER, FRAMEWORK_VERSION,
  buildContractText, buildResaleContractText, clausesFor, frameworkEnabled, frameworkKindOf, isFrameworkText, type FrameworkKind, type FrameworkParams,
} from '@/lib/contract-framework';
import { contractKind } from '@/lib/contract-kind';
import { buyerDisplayFromText, isCardContractText } from '@/lib/contract-identity';
import { translateContract } from '@/lib/contract-translations';

const base = { contractId: 'c1', propertyId: 'p1', propertyTitle: 'Marina Tower', buyerUsername: 'ahmed', sellerUsername: 'RE-Global-Platform', type: 'buy', amount: 100, currency: 'Pi', paymentId: 'pay1', txid: 'tx1' };
const legal = { statusLine: 'Pending legal review in Egypt', governingLaw: 'the laws of Egypt' };
const resaleBase = { contractId: 'r1', propertyId: 'p1', propertyTitle: 'Marina Tower', sellerUsername: 'sara', buyerUsername: 'omar', shares: 10, totalShares: 200, pricePerShare: 5, amount: 50, fee: 1, proceeds: 49, currency: 'Pi', paymentId: 'pay2', txid: 'tx2', legal };

const deals: Record<FrameworkKind, string> = {
  sale: buildContractText({ ...base, legal }),
  invest: buildContractText({ ...base, type: 'invest', shares: { count: 25, totalShares: 200 }, legal }),
  rent: buildContractText({ ...base, type: 'rent', booking: { start: '2026-12-01', end: '2026-12-31', nights: 30 }, legal }),
  hotel: buildContractText({ ...base, type: 'buy', booking: { start: '2026-12-01', end: '2026-12-04', nights: 3 }, legal }),
  resale: buildResaleContractText(resaleBase),
};
const termsOf = (t: string) => t.slice(t.indexOf('\nTERMS\n'));

afterEach(() => { delete process.env.CONTRACT_FRAMEWORK; });

describe('framework text keeps the original header', () => {
  it('everything before TERMS is identical to the original generator (only the date differs)', () => {
    const strip = (t: string) => t.replace(/^Date: .*$/m, 'Date: X');
    const head = (t: string) => strip(t.slice(0, t.indexOf('\nTERMS\n')));
    expect(head(deals.sale)).toBe(head(generateContractText({ ...base, legal })));
    expect(head(deals.resale)).toBe(head(generateResaleContractText(resaleBase)));
  });
  it('the parsers still read every kind', () => {
    expect(contractKind({ type: 'buy', contractText: deals.sale })).toBe('sale');
    expect(contractKind({ type: 'invest', contractText: deals.invest })).toBe('invest');
    expect(contractKind({ type: 'rent', contractText: deals.rent })).toBe('rent');
    expect(contractKind({ type: 'buy', contractText: deals.hotel })).toBe('hotel');
    const card = buildContractText({ ...base, currency: 'EGP', card: { orderId: 'o1', buyerName: 'Ahmed Mohamed Ali', nameMode: 'real' }, legal });
    expect(isCardContractText(card)).toBe(true);
    expect(buyerDisplayFromText(card)).not.toBeNull();
    expect(isCardContractText(deals.sale)).toBe(false);
  });
  it('is marked with the framework version, and the old text is not', () => {
    for (const t of Object.values(deals)) expect(isFrameworkText(t)).toBe(true);
    expect(deals.sale).toContain(`${FRAMEWORK_MARKER}${FRAMEWORK_VERSION} (sale)`);
    expect(isFrameworkText(generateContractText({ ...base, legal }))).toBe(false);
    expect(isFrameworkText(undefined)).toBe(false);
  });
});

describe('every kind gets a complete, clean contract', () => {
  it.each(FRAMEWORK_KINDS)('%s: clauses are numbered 1..N with no gaps and no leftovers', (k) => {
    const t = termsOf(deals[k]);
    const nums = [...t.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums.length).toBeGreaterThan(10);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
    expect(t).not.toMatch(/undefined|NaN|\[object|\$\{|\{\w+\}/);
  });
  it.each(FRAMEWORK_KINDS)('%s: always has the common protections and the pilot notice', (k) => {
    const t = deals[k];
    for (const s of ['Electronic execution and evidence', 'Identity, anti-money-laundering and sanctions', 'Cancellation, withdrawal and refund', 'Personal data', 'Limits of liability', 'Disputes', 'Governing law', 'Pilot phase', 'General']) expect(t).toContain(`. ${s}. `);
    expect(t).toContain('technical pilot phase');
    expect(t).toContain('governed by the laws of Egypt');
  });
  it('shares carry their rights, distributions, transfers and risk; a plain sale does not', () => {
    for (const s of ['Subject and rights attached to Shares', 'Distributions and costs', 'Transfers and the shares market', 'Risk disclosure']) expect(deals.invest).toContain(s);
    expect(deals.invest).toContain('does not guarantee any return');
    expect(deals.sale).not.toContain('Distributions and costs');
    expect(deals.sale).not.toContain('attached to Shares');
  });
  it('rent and hotel use their own subject, and cancellation follows the listing policy', () => {
    expect(deals.rent).toContain('tenant');
    expect(deals.hotel).toContain('the guest');
    expect(deals.hotel).toContain('cancellation policy stated in the Listing');
    expect(deals.sale).not.toContain('the guest');
  });
  it('a resale has the seller confirmation, the fee and the settlement, and says the platform is not the seller', () => {
    expect(deals.resale).toContain('free of any pledge or claim known to it');
    expect(deals.resale).toContain('keeps the fee of 1 Pi and owes the Seller the remaining 49 Pi');
    expect(deals.resale).toContain('not a party to the sale of the Shares');
  });
  it('who is responsible when an obligation is not met is written down', () => {
    for (const t of Object.values(deals)) expect(t).toContain('does not meet an obligation');
  });
});

describe('payment rails', () => {
  it('Pi names the payment and transaction; card names the order and refunds to the card', () => {
    expect(deals.sale).toContain('Payment ID: pay1, Transaction: tx1');
    expect(deals.sale).toContain('in Pi to the same account');
    const card = buildContractText({ ...base, currency: 'EGP', card: { orderId: 'ord9', buyerName: 'Ahmed Mohamed Ali' }, legal });
    expect(card).toContain('Order ID: ord9');
    expect(card).toContain('to the same card through the payment provider');
    expect(card).not.toContain('Transaction: tx1');
  });
});

describe('what the contract must not claim', () => {
  it.each(FRAMEWORK_KINDS)('%s: no promise of returns, no claim of compliance or certification', (k) => {
    const t = deals[k].toLowerCase();
    expect(t).not.toMatch(/guaranteed return|guarantees a return|will earn|risk[- ]free|shari'?ah[- ]compliant|certified by/);
    expect(t).not.toContain('is compliant with');
  });
  it('the Shari\'ah clause appears only when the listing says so, and only says what is true', () => {
    expect(deals.invest).not.toContain("Shari'ah status");
    const s = buildContractText({ ...base, type: 'invest', shares: { count: 1, totalShares: 10 }, legal }, { shariah: true });
    expect(s).toContain("Shari'ah status");
    expect(s).toContain('does not state that a Shari\'ah supervisory board has certified');
    expect(s.toLowerCase()).not.toContain('compliant with shari');
  });
  it('the contract carries no email, phone or secret-looking value', () => {
    for (const t of Object.values(deals)) expect(t).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}|\+\d{8,}|S[A-Z2-7]{55}/);
  });
});

describe('legal profile, versioning, rollback', () => {
  it('the extra clause of a country profile is included', () => {
    const t = buildContractText({ ...base, legal: { ...legal, extraClause: 'Registration costs are borne by the Buyer.' } });
    expect(t).toContain('Additional terms. Registration costs are borne by the Buyer.');
  });
  it('same inputs give the same terms and a different hash when the terms differ', () => {
    expect(termsOf(buildContractText({ ...base, legal }))).toBe(termsOf(deals.sale));
    expect(hashContract(deals.sale)).not.toBe(hashContract(deals.invest));
  });
  it('CONTRACT_FRAMEWORK=legacy brings back the original six clauses', () => {
    process.env.CONTRACT_FRAMEWORK = 'legacy';
    expect(frameworkEnabled()).toBe(false);
    const t = buildContractText({ ...base, legal });
    expect(isFrameworkText(t)).toBe(false);
    expect(t).toContain('6. Governing law.');
    expect(isFrameworkText(buildResaleContractText(resaleBase))).toBe(false);
  });
  it('the kind of a deal follows the same rules the app uses elsewhere', () => {
    expect(frameworkKindOf({ type: 'rent' })).toBe('rent');
    expect(frameworkKindOf({ type: 'tokenized' })).toBe('invest');
    expect(frameworkKindOf({ type: 'buy', shares: { count: 1, totalShares: 2 } })).toBe('invest');
    expect(frameworkKindOf({ type: 'buy', booking: { start: 'a', end: 'b', nights: 1 } })).toBe('hotel');
    expect(frameworkKindOf({ type: 'buy' })).toBe('sale');
  });
});

describe('the translated view never shows terms that are not the signed ones', () => {
  it('a framework contract is shown as its signed English text with the note', () => {
    const out = translateContract('ar', { id: 'c1', contractText: deals.invest, propertyId: 'p1', propertyTitle: 'T', buyerUsername: 'u', sellerUsername: 's', type: 'invest', amount: 1, currency: 'Pi' });
    expect(out).toContain(deals.invest);
    expect(out).toContain('ملاحظة');
  });
  it('an older contract is still translated as before', () => {
    const old = generateContractText({ ...base, legal });
    const out = translateContract('ar', { id: 'c1', contractText: old, propertyId: 'p1', propertyTitle: 'T', buyerUsername: 'u', sellerUsername: 's', type: 'buy', amount: 1, currency: 'Pi' });
    expect(out).not.toContain(FRAMEWORK_MARKER);
  });
});

describe('the clause library', () => {
  it('has unique ids, titles and a reference list for counsel on every clause that makes a legal point', () => {
    const ids = CLAUSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CLAUSES) {
      expect(c.title.length).toBeGreaterThan(3);
      if (c.id !== 'pilot') expect(c.basis.length, c.id).toBeGreaterThan(0);
    }
  });
  it('covers the four families of international references it is documented against', () => {
    const joined = FRAMEWORK_BASIS.join(' | ');
    for (const k of ['UNCITRAL', 'UNIDROIT', 'eIDAS', 'GDPR', 'Consumer', 'IOSCO', 'MiCA', 'FATF', 'AAOIFI']) expect(joined, k).toContain(k);
  });
  it('every clause is used by at least one kind', () => {
    const p = (kind: FrameworkKind, rail: 'pi' | 'card' = 'pi'): FrameworkParams => ({ kind, rail, governingLaw: 'x', currency: 'Pi', amount: 1, paymentId: 'a', txid: 'b', shariah: true });
    const used = new Set(FRAMEWORK_KINDS.flatMap((k) => ['pi', 'card'].flatMap((r) => clausesFor(p(k, r as 'pi' | 'card')).map((c) => c.id))));
    for (const c of CLAUSES) expect(used.has(c.id), c.id).toBe(true);
  });
});
