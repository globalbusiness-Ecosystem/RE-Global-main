import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const page = readFileSync('app/market/page.tsx', 'utf8');
const button = readFileSync('components/unified-payment-button.tsx', 'utf8');

describe('shares market layout', () => {
  it('lays numbers and π amounts out left-to-right in their own isolated run, so Arabic and Urdu never scramble them', () => {
    expect(page).toContain('<bdi dir="ltr"');
    expect(page).not.toMatch(/\{[a-z.]*(total|pricePerShare|amount)\} π/);
    expect(page).not.toContain('× {l.pricePerShare}');
  });
  it('uses tabs, cards with stat tiles and a sticky header instead of one long list', () => {
    for (const s of ['role="tablist"', 'role="tab"', 'sticky top-0', '<dl className={tiles}>']) expect(page).toContain(s);
  });
  it('the back arrow points the right way for right-to-left languages', () => {
    expect(page).toContain("dir === 'rtl' ? ArrowRight : ArrowLeft");
  });
  it('the buy button isolates its amount too (it is used on every page that sells)', () => {
    expect(button).toContain('<bdi dir="ltr" className="tabular-nums">π{price}</bdi>');
  });
  it('still trades through the same API routes', () => {
    for (const s of ["'/api/market/listings'", "'/api/market/me'", "'/api/market/listings/cancel'", 'transactionType="resale"']) expect(page).toContain(s);
  });
});
