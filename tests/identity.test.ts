import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { friendlyName, isTechnicalName } from '@/lib/display-identity';

const src = (p: string) => readFileSync(p, 'utf8');

describe('one display identity', () => {
  it('never shows the technical web id', () => {
    expect(isTechnicalName('web_y18vp5vPUW')).toBe(true);
    expect(isTechnicalName('Elsayed777X')).toBe(false);
    expect(friendlyName({ username: 'web_y18vp5vPUW', displayName: 'Elsayed Asaad', handle: 'Elsayed777x' })).toBe('Elsayed Asaad');
    expect(friendlyName({ username: 'web_y18vp5vPUW', displayName: null, handle: 'Elsayed777x' })).toBe('Elsayed777x');
    expect(friendlyName({ username: 'web_y18vp5vPUW', displayName: ' ', handle: null })).toBeNull();
  });
  it('a Pi username is already a real name and stays', () => {
    expect(friendlyName({ username: 'Elsayed777X', displayName: 'Other' })).toBe('Elsayed777X');
  });
  it('the header menu and settings show the friendly name, not the raw username', () => {
    const h = src('components/header.tsx');
    expect(h).toContain('useIdentity()');
    expect(h).not.toMatch(/\{username\}/);
    const s = src('components/pages/settings-page.tsx');
    expect(s).toContain('useIdentity()');
    expect(s).not.toMatch(/@\$\{handle \?\? username\}/);
  });
  it('the Pi wallet card is for Pi accounts only, and Settings has no token or currency-token card', () => {
    expect(src('components/pages/dashboard-page.tsx')).toContain('!isWebAccount');
    const s = src('components/pages/settings-page.tsx');
    expect(s).not.toMatch(/\$RE|reToken|buyRE/);
    expect(s).not.toContain('Coins');
  });
});
