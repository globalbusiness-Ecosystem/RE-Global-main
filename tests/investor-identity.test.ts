import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NAME_I18N } from '@/lib/display-name-i18n';

const src = (p: string) => readFileSync(p, 'utf8');

describe('one investor identity across linked accounts', () => {
  it('linked accounts show the main account name (its chosen name, or its Pi name)', () => {
    const s = src('lib/display-name-store.ts');
    expect(s).toContain('primaryOf(person.accounts, person.primaryUid)');
    expect(s).toContain("accountKind(primary.uid) === 'pi'");
    expect(s).toContain('name = primary.username');
  });
  it('the name can only be changed from the main account', () => {
    expect(src('lib/display-name-store.ts')).toContain("error: 'use_primary'");
    expect(src('components/profile-identity-line.tsx')).toContain("'use_primary'");
  });
  it('a linked account without a picture shows the main account picture', () => {
    const s = src('app/api/my-avatar/route.ts');
    expect(s).toContain('getPerson');
    expect(s).toContain('person.primaryUid');
  });
  it('the new message exists in every language', () => {
    for (const l of Object.keys(NAME_I18N) as (keyof typeof NAME_I18N)[]) expect(NAME_I18N[l].usePrimary.length).toBeGreaterThan(5);
  });
});
