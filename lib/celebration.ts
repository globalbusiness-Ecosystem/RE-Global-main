// The celebration shown when a person's identity is verified, and the bigger one for the founder.
// Everything here is plain logic (no browser, no server) so it can be tested; the admin controls all of it.

export const FREQUENCIES = ['once', 'daily', 'session'] as const;
export type Frequency = (typeof FREQUENCIES)[number];
export type CelebrationKind = 'user' | 'founder';

export type KindSettings = { enabled: boolean; music: boolean; volume: number; frequency: Frequency; musicUrl: string | null };
export type Greeting = { en?: string; ar?: string };
export type Celebration = {
  enabled: boolean;
  user: KindSettings;
  founder: KindSettings & { voice: boolean; voiceUrl: string | null; greeting: Greeting | null };
};

export const DEFAULT_GREETING: Required<Greeting> = { ar: 'مرحباً بك أيها الرئيس', en: 'Welcome, Chief' };
export const DEFAULT_CELEBRATION: Celebration = {
  enabled: true,
  user: { enabled: true, music: true, volume: 40, frequency: 'once', musicUrl: null },
  founder: { enabled: true, music: true, volume: 60, frequency: 'daily', musicUrl: null, voice: true, voiceUrl: null, greeting: null },
};

export const MAX_GREETING = 80;
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|wav|weba)$/i;

/** A voice or music file: https only, and it must look like an audio file. */
export function parseAudioUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s || s.length > 500) return null;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' && AUDIO_EXT.test(u.pathname) ? u.toString() : null;
  } catch { return null; }
}

const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
const volume = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : d);
const freq = (v: unknown, d: Frequency): Frequency => ((FREQUENCIES as readonly string[]).includes(v as string) ? (v as Frequency) : d);
const text = (v: unknown) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, MAX_GREETING) : '');

function parseKind(raw: unknown, d: KindSettings): KindSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return { enabled: bool(r.enabled, d.enabled), music: bool(r.music, d.music), volume: volume(r.volume, d.volume), frequency: freq(r.frequency, d.frequency), musicUrl: parseAudioUrl(r.musicUrl) };
}

/** Lenient read of what is stored (or sent): anything wrong falls back to the default for that field. */
export function parseCelebration(raw: unknown): Celebration {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const f = (r.founder && typeof r.founder === 'object' ? r.founder : {}) as Record<string, unknown>;
  const g = (f.greeting && typeof f.greeting === 'object' ? f.greeting : {}) as Record<string, unknown>;
  const greeting: Greeting = {};
  if (text(g.en)) greeting.en = text(g.en);
  if (text(g.ar)) greeting.ar = text(g.ar);
  return {
    enabled: bool(r.enabled, DEFAULT_CELEBRATION.enabled),
    user: parseKind(r.user, DEFAULT_CELEBRATION.user),
    founder: { ...parseKind(f, DEFAULT_CELEBRATION.founder), voice: bool(f.voice, DEFAULT_CELEBRATION.founder.voice), voiceUrl: parseAudioUrl(f.voiceUrl), greeting: greeting.en || greeting.ar ? greeting : null },
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** Should the celebration play now? `lastMs` is when this person last saw it on this device (null: never). */
export function shouldCelebrate(frequency: Frequency, lastMs: number | null, seenThisSession: boolean, now = Date.now()): boolean {
  if (frequency === 'once') return lastMs === null;
  if (frequency === 'daily') return lastMs === null || !Number.isFinite(lastMs) || now - lastMs >= DAY_MS;
  return !seenThisSession;
}

/** The founder's greeting in the person's language: what the admin wrote, else the English/Arabic text, else the default. */
export function greetingFor(c: Celebration, language: string): string {
  const g = c.founder.greeting;
  const own = g ? (g as Record<string, string | undefined>)[language] : undefined;
  if (own) return own;
  if (language === 'ar') return g?.ar || DEFAULT_GREETING.ar;
  return g?.en || DEFAULT_GREETING.en;
}

export const SPEECH_LANG: Record<string, string> = { ar: 'ar-SA', en: 'en-US', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', ur: 'ur-PK', zh: 'zh-CN' };
