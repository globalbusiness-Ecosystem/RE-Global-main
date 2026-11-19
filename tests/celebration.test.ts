import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DEFAULT_CELEBRATION, DEFAULT_GREETING, greetingFor, parseAudioUrl, parseCelebration, shouldCelebrate } from '@/lib/celebration';
import { CELEBRATION_I18N } from '@/lib/celebration-i18n';

const src = (p: string) => readFileSync(p, 'utf8');
const DAY = 24 * 60 * 60 * 1000;

describe('celebration settings', () => {
  it('defaults are on, with a quiet user celebration and a bigger founder one', () => {
    expect(DEFAULT_CELEBRATION.enabled).toBe(true);
    expect(DEFAULT_CELEBRATION.user.frequency).toBe('once');
    expect(DEFAULT_CELEBRATION.founder.voice).toBe(true);
    expect(DEFAULT_CELEBRATION.founder.volume).toBeGreaterThan(DEFAULT_CELEBRATION.user.volume);
  });
  it('anything wrong falls back to the default for that field', () => {
    const c = parseCelebration({ enabled: 'yes', user: { volume: 500, frequency: 'weekly', music: false }, founder: { volume: -5, voice: 1 } });
    expect(c.enabled).toBe(true);
    expect(c.user.volume).toBe(100);
    expect(c.user.frequency).toBe('once');
    expect(c.user.music).toBe(false);
    expect(c.founder.volume).toBe(0);
    expect(c.founder.voice).toBe(true);
    expect(parseCelebration(null)).toEqual(DEFAULT_CELEBRATION);
  });
  it('audio links must be https audio files', () => {
    expect(parseAudioUrl('https://x.supabase.co/storage/v1/object/public/p/audio/a.mp3')).not.toBeNull();
    expect(parseAudioUrl('https://x.com/a.M4A?x=1')).not.toBeNull();
    for (const bad of ['http://x.com/a.mp3', 'https://x.com/a.exe', 'javascript:alert(1)', 'https://x.com/a', '', 5, null]) expect(parseAudioUrl(bad as unknown)).toBeNull();
  });
  it('the greeting follows the language and falls back safely', () => {
    expect(greetingFor(DEFAULT_CELEBRATION, 'ar')).toBe(DEFAULT_GREETING.ar);
    expect(greetingFor(DEFAULT_CELEBRATION, 'fr')).toBe(DEFAULT_GREETING.en);
    const c = parseCelebration({ founder: { greeting: { ar: '  أهلاً يا ريس  ', en: '' } } });
    expect(greetingFor(c, 'ar')).toBe('أهلاً يا ريس');
    expect(greetingFor(c, 'en')).toBe(DEFAULT_GREETING.en);
  });
});

describe('how often it plays', () => {
  const now = 1_800_000_000_000;
  it('once: only the first time', () => {
    expect(shouldCelebrate('once', null, false, now)).toBe(true);
    expect(shouldCelebrate('once', now - 10 * DAY, false, now)).toBe(false);
  });
  it('daily: once every 24 hours', () => {
    expect(shouldCelebrate('daily', null, false, now)).toBe(true);
    expect(shouldCelebrate('daily', now - DAY + 1000, false, now)).toBe(false);
    expect(shouldCelebrate('daily', now - DAY, false, now)).toBe(true);
  });
  it('session: once per visit', () => {
    expect(shouldCelebrate('session', now, false, now)).toBe(true);
    expect(shouldCelebrate('session', null, true, now)).toBe(false);
  });
});

describe('wiring', () => {
  it('the app mounts the host, which plays only for verified people or the founder', () => {
    expect(src('components/app-wrapper.tsx')).toContain('<CelebrationHost />');
    const h = src('components/celebration-host.tsx');
    expect(h).toContain("isFounder ? 'founder' : verified ? 'user' : null");
    expect(h).toContain('shouldCelebrate');
  });
  it('the overlay respects reduced motion and offers a tap when the browser blocks sound', () => {
    const o = src('components/celebration-overlay.tsx');
    expect(o).toContain('prefers-reduced-motion');
    expect(o).toContain('tapSound');
    expect(o).toContain('role="dialog"');
  });
  it('the public settings route is rate limited and the admin routes are admin-only', () => {
    expect(src('app/api/celebration/route.ts')).toContain('ipLimited');
    for (const f of ['app/api/admin/celebration/route.ts', 'app/api/admin/audio-upload-url/route.ts']) expect(src(f)).toContain('isAdminRequest');
    expect(src('app/api/admin/celebration/route.ts').match(/isAdminRequest/g)!.length).toBeGreaterThanOrEqual(3);
    expect(src('components/admin/content-tab.tsx')).toContain('<CelebrationSettings');
  });
  it('no music file is bundled: the music is synthesised', () => {
    expect(src('lib/celebration-sound.ts')).toContain('createOscillator');
  });
  it('every message exists in all 7 languages', () => {
    expect(Object.keys(CELEBRATION_I18N).length).toBe(7);
    for (const l of Object.values(CELEBRATION_I18N)) for (const v of Object.values(l)) expect(v.length).toBeGreaterThan(0);
  });
});
