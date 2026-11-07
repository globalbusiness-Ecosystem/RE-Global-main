import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CARD_RETURN_LABELS, type CardReturnKey } from '@/lib/card-return-labels';

const LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh'] as const;
const src = (p: string) => readFileSync(p, 'utf8');

describe('sandbox simulator', () => {
  const route = src('app/api/card/sandbox/complete/route.ts');
  it('only exists while the test secret is set, for signed-in people, on their own orders', () => {
    expect(route).toContain("guardApi(req, { scope: 'card-sandbox'");
    expect(route).toContain('process.env.CARD_SANDBOX_SECRET');
    expect(route).toContain("getProvider('sandbox')");
    expect(route).toContain('order.uid !== user.uid');
    expect(route.indexOf('CARD_SANDBOX_SECRET')).toBeLessThan(route.indexOf('getOrder('));
  });
  it('goes through the same signed-notification code path as a real payment company', () => {
    expect(route).toContain('handleCardWebhook(');
    expect(route).toContain('signHmacSha256(');
    expect(route).toContain('cardWebhookDeps');
    expect(src('app/api/card/webhook/[provider]/route.ts')).toContain('cardWebhookDeps');
  });
  it('the return page shows the test buttons only when asked to by the link, and every label is used and translated', () => {
    const page = src('app/payment/card-return/page.tsx');
    expect(page).toContain("q.get('sandbox') === '1'");
    for (const k of Object.keys(CARD_RETURN_LABELS) as CardReturnKey[]) {
      expect(page, k).toContain(`cr('${k}'`);
      for (const l of LANGS) expect(CARD_RETURN_LABELS[k][l].trim().length).toBeGreaterThan(0);
      for (const l of ['ar', 'ur', 'zh'] as const) expect(CARD_RETURN_LABELS[k][l]).not.toBe(CARD_RETURN_LABELS[k].en);
    }
  });
});
