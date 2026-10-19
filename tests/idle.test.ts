import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { idleState, IDLE_MS, WARN_MS } from '@/lib/idle';

describe('idleState', () => {
  const t0 = 1_000_000;
  it('is active while the admin is working', () => {
    expect(idleState(t0, t0).phase).toBe('active');
    expect(idleState(t0 + 5 * 60_000, t0).phase).toBe('active');
  });
  it('warns during the last minute and counts down', () => {
    const s = idleState(t0 + IDLE_MS - 30_000, t0);
    expect(s).toEqual({ phase: 'warning', secondsLeft: 30 });
    expect(idleState(t0 + IDLE_MS - WARN_MS, t0).phase).toBe('warning');
    expect(idleState(t0 + IDLE_MS - WARN_MS - 1, t0).phase).toBe('active');
  });
  it('expires at the limit and after', () => {
    expect(idleState(t0 + IDLE_MS, t0)).toEqual({ phase: 'expired', secondsLeft: 0 });
    expect(idleState(t0 + IDLE_MS * 5, t0).phase).toBe('expired');
  });
  it('is safe with a clock that went backwards or odd input', () => {
    expect(idleState(t0 - 5000, t0).phase).toBe('active');
    expect(idleState(NaN, t0).phase).toBe('expired');
  });
  it('uses 20 minutes with a 60 second warning', () => {
    expect(IDLE_MS).toBe(20 * 60 * 1000);
    expect(WARN_MS).toBe(60 * 1000);
  });
});

describe('wiring', () => {
  it('the admin panel signs out through the idle guard', () => {
    const p = readFileSync('app/admin/page.tsx', 'utf8');
    expect(p).toContain('<IdleGuard onTimeout={logout} />');
    expect(readFileSync('components/admin/idle-guard.tsx', 'utf8')).toContain('idleState');
  });
});
