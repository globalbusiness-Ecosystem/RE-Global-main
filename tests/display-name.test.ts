import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NAME_COOLDOWN_MS, cooldownLeftMs, nameKey, parseDisplayName } from '@/lib/display-name';
import { friendlyName } from '@/lib/display-identity';
import { NAME_I18N } from '@/lib/display-name-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('display name rules', () => {
  it('accepts normal names in English and Arabic', () => {
    expect(parseDisplayName('  Elsayed   Al-shaib ')?.name).toBe('Elsayed Al-shaib');
    expect(parseDisplayName('السيد الشيب')?.name).toBe('السيد الشيب');
    expect(parseDisplayName("O'Brien")?.name).toBe("O'Brien");
  });
  it('treats look-alike spellings as the same name', () => {
    const k = nameKey('Ahmed Ali');
    expect(nameKey('ahmed.ali')).toBe(k);
    expect(nameKey('AHMED_ALI')).toBe(k);
    expect(nameKey('Ahmed-Ali')).toBe(k);
    expect(nameKey('أحمد')).toBe(nameKey('احمد'));
    expect(nameKey('مُحَمَّد')).toBe(nameKey('محمد'));
    expect(nameKey('فاطمة')).toBe(nameKey('فاطمه'));
    expect(nameKey('José')).toBe(nameKey('Jose'));
    expect(nameKey('Ahmed Ali')).not.toBe(nameKey('Ahmed Aly'));
  });
  it('refuses unsafe, technical and official-looking names', () => {
    for (const bad of ['', 'A', 'x'.repeat(41), '1abc', '_abc', 'web_abc123', 'www.x.com', 'visit http now', 'Ahmed@x', '<b>Hi</b>', 'Admin', 'Admin Ahmed', 'Re Global Team', 'Support', 'Official Page', 'المؤسس', 'الإدارة العامة', 'Founder', 'CEO', 'ادمن', 12, null, undefined]) {
      expect(parseDisplayName(bad as unknown), String(bad)).toBeNull();
    }
  });
  it('waits 7 days between changes', () => {
    const now = 1_000_000_000_000;
    expect(cooldownLeftMs(null, now)).toBe(0);
    expect(cooldownLeftMs(now - NAME_COOLDOWN_MS - 1, now)).toBe(0);
    expect(cooldownLeftMs(now - 1000, now)).toBe(NAME_COOLDOWN_MS - 1000);
  });
});

describe('where the chosen name is used', () => {
  it('comes first, then the usual order', () => {
    expect(friendlyName({ username: 'web_x1', displayName: 'Google Name', handle: 'h1', customName: 'My Name' })).toBe('My Name');
    expect(friendlyName({ username: 'PiUser', customName: 'My Name' })).toBe('My Name');
    expect(friendlyName({ username: 'PiUser', customName: ' ' })).toBe('PiUser');
    expect(friendlyName({ username: 'web_x1', displayName: 'Google Name' })).toBe('Google Name');
  });
  it('the store keeps names unique inside a transaction and releases the old one', () => {
    const s = src('lib/display-name-store.ts');
    expect(s).toContain('runTransaction');
    expect(s).toContain("error: 'taken'");
    expect(s).toContain("error: 'cooldown'");
    expect(s).toMatch(/tx\.delete\(adminDb\.collection\(BY_KEY\)/);
    expect(s).toContain('getFounderUids');
  });
  it('the API is signed-in only and the identity hook uses the chosen name', () => {
    expect(src('app/api/display-name/route.ts').match(/guardApi\(/g)!.length).toBe(2);
    expect(src('hooks/use-identity.ts')).toContain('customName');
  });
  it('the profile has the two-arrow switch (name / invite code) and a name editor', () => {
    const c = src('components/profile-identity-line.tsx');
    expect(c).toContain('RefreshCw');
    expect(c).toContain('Pencil');
    expect(c).toContain('/api/display-name');
    expect(src('components/pages/settings-page.tsx')).toContain('<ProfileIdentityLine');
  });
  it('every message exists in all 7 languages', () => {
    for (const l of ['en', 'ar', 'fr', 'es', 'pt', 'ur', 'zh']) for (const v of Object.values((NAME_I18N as any)[l])) expect((v as string).length).toBeGreaterThan(0);
    expect(Object.keys(NAME_I18N).length).toBe(7);
  });
});
