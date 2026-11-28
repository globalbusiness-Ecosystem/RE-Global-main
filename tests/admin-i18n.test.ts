import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SHELL, dirOf, navNames, otherLang, parseLang, subLabel, tabLabel, tr } from '@/lib/admin-i18n';
import { NAV } from '@/lib/admin-nav';

const read = (p: string) => readFileSync(p, 'utf8');
// Arabic block, built from code points so this file stays plain ASCII-safe.
const ARABIC = new RegExp('[' + String.fromCharCode(0x600) + '-' + String.fromCharCode(0x6ff) + ']');
const SHOWS_OTHER_LANGUAGE = ['langSwitch', 'langSwitchShort'];

describe('language and direction', () => {
  it('only the exact value "en" is English; everything else is Arabic', () => {
    expect(parseLang('en')).toBe('en');
    for (const v of ['ar', 'EN', 'english', '', null, undefined, 1]) expect(parseLang(v), String(v)).toBe('ar');
  });
  it('English reads left to right, Arabic right to left', () => {
    expect(dirOf('en')).toBe('ltr');
    expect(dirOf('ar')).toBe('rtl');
  });
});

describe('switching and the jump box names', () => {
  it('the switch button goes to the other language', () => {
    expect(otherLang('ar')).toBe('en');
    expect(otherLang('en')).toBe('ar');
  });
  it('the jump box shows the chosen language first and the other one beside it', () => {
    const e = { label: 'سعر Pi', en: 'Pi rate' };
    expect(navNames(e, 'en')).toEqual({ main: 'Pi rate', other: 'سعر Pi', otherDir: 'rtl' });
    expect(navNames(e, 'ar')).toEqual({ main: 'سعر Pi', other: 'Pi rate', otherDir: 'ltr' });
  });
});

describe('the shell texts', () => {
  const keys = Object.keys(SHELL) as (keyof typeof SHELL)[];
  it('every text exists in both languages', () => {
    for (const k of keys) { expect(SHELL[k].ar.length, k).toBeGreaterThan(0); expect(SHELL[k].en.length, k).toBeGreaterThan(0); }
  });
  it('the English text has no Arabic letters, except the button that names the other language', () => {
    for (const k of keys) if (!SHOWS_OTHER_LANGUAGE.includes(k)) expect(ARABIC.test(SHELL[k].en), k).toBe(false);
  });
  it('the Arabic text is Arabic (menu names and messages)', () => {
    for (const k of keys.filter((x) => /^tab_|^title$|^security$|^openSite$|^logout|^quick|Aria$/.test(x) && !SHOWS_OTHER_LANGUAGE.includes(x))) expect(ARABIC.test(SHELL[k].ar), k).toBe(true);
  });
  it('tr and tabLabel pick the right language, and an unknown tab falls back', () => {
    expect(tr('logout', 'en')).toBe('Sign out');
    expect(tabLabel('payments', 'en')).toBe('Payments');
    expect(tabLabel('payments', 'ar')).toBe(SHELL.tab_payments.ar);
    expect(tabLabel('nope', 'en', 'x')).toBe('x');
  });
  it('every top tab in the jump list has a menu name in both languages', () => {
    for (const id of new Set(NAV.map((n) => n.tab))) expect(`tab_${id}` in SHELL, id).toBe(true);
  });
});

describe('section names', () => {
  it('English takes the name from the jump list, Arabic keeps what the screen says', () => {
    expect(subLabel('payments', 'kyc', 'en', 'x')).toBe('Identity verification');
    expect(subLabel('payments', 'kyc', 'ar', 'التحقق من الهوية')).toBe('التحقق من الهوية');
    expect(subLabel('payments', 'nope', 'en', 'fallback')).toBe('fallback');
  });
  it('every section has an English name without Arabic letters', () => {
    for (const n of NAV) expect(ARABIC.test(n.en), `${n.tab}/${n.sub ?? ''}`).toBe(false);
  });
});

describe('wiring', () => {
  it('the admin page sets the direction from the language, provides it, and has a switch button', () => {
    const p = read('app/admin/page.tsx');
    expect(p).toContain('dir={dirOf(lang)}');
    expect(p).toContain('<AdminLangContext.Provider');
    expect(p).toContain('</AdminLangContext.Provider>');
    expect(p).toContain('setLang(otherLang(lang))');
    expect(p).toContain('localStorage.setItem(LANG_KEY');
  });
  it('the menu uses direction-neutral classes (start/end), not left/right', () => {
    const p = read('app/admin/page.tsx');
    expect(p).toContain('border-e border-border');
    expect(p).not.toMatch(/<aside[^>]*border-l/);
    expect(p).not.toContain('px-3 py-2.5 text-right');
  });
  it('the section bar and the jump box read the language', () => {
    expect(read('components/admin/sub-tabs.tsx')).toContain('subLabel(storeKey, t.id, lang, t.label)');
    expect(read('components/admin/quick-nav.tsx')).toContain('useAdminLang()');
  });
  it('outside the admin page the language is Arabic', () => {
    expect(read('components/admin/admin-lang.tsx')).toContain("lang: 'ar'");
  });
});
