import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('public/offline.html', 'utf8');
const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

// Runs the page's script with a tiny fake browser and returns what it changed.
function run(stored: string | null, browserLang: string) {
  const nodes: Record<string, { textContent: string; style: { display: string } }> = {};
  for (const id of ['t', 'm', 'm2', 'b']) nodes[id] = { textContent: '', style: { display: '' } };
  const root = { lang: 'en', dir: '' };
  const doc = { getElementById: (id: string) => nodes[id], documentElement: root, title: '' };
  const ctx = {
    document: doc,
    navigator: { language: browserLang },
    localStorage: { getItem: (k: string) => (k === 're_nav_language' ? stored : null) },
  };
  vm.runInNewContext(script, ctx);
  return { nodes, root, title: doc.title };
}

describe('offline page', () => {
  it('has a script and keeps working without it (English + Arabic text in the markup)', () => {
    expect(script.length).toBeGreaterThan(100);
    expect(html).toContain("You're offline");
    expect(html).toContain('لا يوجد اتصال');
  });
  it('shows each of the 7 app languages when it is the stored one', () => {
    const expected: Record<string, string> = { en: "You're offline", ar: 'لا يوجد اتصال', fr: 'Vous êtes hors ligne', es: 'Sin conexión', pt: 'Você está offline', ur: 'آپ آف لائن ہیں', zh: '您已离线' };
    for (const [lang, title] of Object.entries(expected)) {
      const r = run(lang, 'en-US');
      expect(r.nodes.t.textContent, lang).toBe(title);
      expect(r.nodes.m.textContent.length, lang).toBeGreaterThan(5);
      expect(r.nodes.b.textContent.length, lang).toBeGreaterThan(1);
      expect(r.root.lang).toBe(lang);
      expect(r.root.dir).toBe(lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr');
      expect(r.nodes.m2.style.display).toBe('none');
      expect(r.title).toContain(title);
    }
  });
  it('falls back to the browser language, then leaves the bilingual text alone', () => {
    expect(run(null, 'fr-CA').nodes.t.textContent).toBe('Vous êtes hors ligne');
    expect(run('zz', 'es-MX').nodes.t.textContent).toBe('Sin conexión');
    const untouched = run(null, 'ja-JP');
    expect(untouched.nodes.t.textContent).toBe('');
    expect(untouched.nodes.m2.style.display).toBe('');
  });
  it('ignores inherited object names as languages', () => {
    expect(run('constructor', 'ja').nodes.t.textContent).toBe('');
    expect(run('toString', 'ja').nodes.t.textContent).toBe('');
  });
  it('survives blocked storage', () => {
    const nodes: Record<string, any> = {};
    for (const id of ['t', 'm', 'm2', 'b']) nodes[id] = { textContent: '', style: { display: '' } };
    vm.runInNewContext(script, {
      document: { getElementById: (id: string) => nodes[id], documentElement: {}, title: '' },
      navigator: { language: 'pt-BR' },
      localStorage: { getItem: () => { throw new Error('blocked'); } },
    });
    expect(nodes.t.textContent).toBe('Você está offline');
  });
});
