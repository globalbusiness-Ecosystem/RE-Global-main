import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

describe('avatar shows everywhere it should', () => {
  it('header uses the picture for the settings button and the menu', () => {
    const h = read('components/header.tsx');
    expect(h).toContain("useMyAvatar()");
    expect((h.match(/<UserAvatar /g) || []).length).toBe(2);
  });
  it('save and remove tell the other places', () => {
    const s = read('hooks/use-my-avatar.ts');
    expect(s).toContain("export const AVATAR_EVENT = 're-avatar-changed'");
    expect((s.match(/announce\(/g) || []).length).toBe(2);
    expect(s).toContain('addEventListener(AVATAR_EVENT');
    expect(s).toContain('removeEventListener(AVATAR_EVENT');
  });
});
