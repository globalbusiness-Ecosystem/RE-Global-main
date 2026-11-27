import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parsePropertyInput } from '@/lib/admin-property';
import { buildContractText } from '@/lib/contract-framework';
import { auditSummary } from '@/lib/audit-labels';

const base = { title: 'Villa', price: 100, currency: 'Pi', type: 'invest', propertyType: 'villa', status: 'available' };
const read = (p: string) => readFileSync(p, 'utf8');

describe('the Shari\'ah flag on a listing', () => {
  it('is saved only when it is exactly true, and is absent otherwise', () => {
    const on = parsePropertyInput({ ...base, shariah: true });
    expect(on.ok && on.doc.shariah).toBe(true);
    for (const v of [false, 'true', 1, null, undefined]) {
      const r = parsePropertyInput({ ...base, shariah: v });
      expect(r.ok && 'shariah' in r.doc, String(v)).toBe(false);
    }
  });
  it('an edit that does not mention the flag keeps it, and a change is written to the log', () => {
    const route = read('app/api/admin/properties/route.ts');
    expect(route).toContain('b.shariah === undefined && prev.shariah === true');
    expect(route).toContain('...shariahChange');
  });
  it('the form sends it and shows it', () => {
    const f = read('components/admin/property-form.tsx');
    expect(f).toContain('shariah: p.shariah === true');
    expect(f).toContain('form.shariah');
  });
  it('the contract gets the clause only for a flagged listing, and it claims no certificate', () => {
    const args = { kind: 'invest', rail: 'pi', governingLaw: 'the laws of the selected country', currency: 'Pi', amount: 100 } as any;
    expect(buildContractText(args, { shariah: false })).not.toContain("Shari'ah status");
    const t = buildContractText(args, { shariah: true });
    expect(t).toContain("Shari'ah status");
    expect(t).toContain('does not state that a Shari\'ah supervisory board has certified');
  });
  it('the activity log shows the change in plain words', () => {
    expect(auditSummary('property.edit', { title: 'Villa', shariah: true })).toBe('Villa · بند الشريعة: مفعّل');
    expect(auditSummary('property.edit', { title: 'Villa', shariah: false })).toBe('Villa · بند الشريعة: متوقف');
    expect(auditSummary('property.edit', { title: 'Villa' })).toBe('Villa');
  });
});
