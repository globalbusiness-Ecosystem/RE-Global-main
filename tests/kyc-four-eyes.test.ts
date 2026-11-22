import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { nextStep, cleanFourEyes } from '@/lib/kyc-four-eyes';
import { groupOf, can } from '@/lib/admin-roles';

const src = (p: string) => readFileSync(p, 'utf8');

describe('four eyes rules', () => {
  const sara = { by: 'sara' };
  it('is on unless switched off', () => {
    expect(cleanFourEyes(null)).toEqual({ enabled: true });
    expect(cleanFourEyes({ enabled: false })).toEqual({ enabled: false });
    expect(cleanFourEyes({ enabled: 'no' })).toEqual({ enabled: true });
  });
  it('the owner always decides; a reviewer only recommends', () => {
    for (const enabled of [true, false]) {
      expect(nextStep({ enabled, role: 'owner', actor: 'owner', proposal: null })).toBe('apply');
      expect(nextStep({ enabled, role: 'reviewer', actor: 'omar', proposal: null })).toBe('propose');
      expect(nextStep({ enabled, role: 'reviewer', actor: 'omar', proposal: sara })).toBe('propose');
    }
  });
  it('with four eyes on, a compliance officer decides only on top of someone else\'s recommendation', () => {
    expect(nextStep({ enabled: true, role: 'compliance', actor: 'omar', proposal: null })).toBe('propose');
    expect(nextStep({ enabled: true, role: 'compliance', actor: 'omar', proposal: sara })).toBe('apply');
    expect(nextStep({ enabled: true, role: 'compliance', actor: 'sara', proposal: sara })).toBe('propose'); // never their own
  });
  it('with four eyes off, a compliance officer decides directly', () => {
    expect(nextStep({ enabled: false, role: 'compliance', actor: 'omar', proposal: null })).toBe('apply');
  });
});

describe('wiring', () => {
  it('a reviewer may call the decision route (it only records a recommendation) but not the settings', () => {
    expect(can('reviewer', groupOf('/api/admin/kyc'), 'PATCH')).toBe(true);
    expect(can('reviewer', groupOf('/api/admin/kyc-four-eyes'), 'PUT')).toBe(false);
    expect(can('reviewer', groupOf('/api/admin/kyc-retention'), 'POST')).toBe(false);
    expect(can('compliance', groupOf('/api/admin/kyc-four-eyes'), 'PUT')).toBe(true);
    expect(can('finance', groupOf('/api/admin/kyc'), 'PATCH')).toBe(false);
  });
  it('the decision route asks the rules before deciding, and the decision clears the recommendation', () => {
    const r = src('app/api/admin/kyc/route.ts');
    expect(r).toContain('nextStep(');
    expect(r).toContain('adminWho(req)');
    expect(r).toContain('saveProposal(');
    expect(r.indexOf('nextStep(')).toBeLessThan(r.indexOf('applyKycDecision(uid'));
    expect(src('lib/kyc-store.ts')).toContain('proposal: FieldValue.delete()');
  });
  it('a recommendation is only kept on a pending request, and the screen shows it', () => {
    expect(src('lib/kyc-four-eyes-store.ts')).toContain("status !== 'pending'");
    expect(src('components/admin/kyc-panel.tsx')).toContain('r.proposal');
    expect(src('components/admin/kyc-panel.tsx')).toContain('/api/admin/kyc-four-eyes');
  });
});
