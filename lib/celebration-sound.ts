'use client';

// Sound for the celebration. The music is made on the spot with the browser's own audio (soft chords and a few bells), so there is
// no file to host or license; the admin may replace it with their own https audio file. Browsers often refuse sound until the person
// touches the screen, so every function reports whether it was blocked and the celebration then shows a "tap for sound" button.

export type SoundHandle = { stop: () => void; resume: () => Promise<void>; blocked: () => boolean };

type AudioCtor = typeof AudioContext;
const audioCtor = (): AudioCtor | null => (typeof window === 'undefined' ? null : window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext || null);
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** Soft music for about `seconds`. `grand` adds a short fanfare at the start (for the founder). null when the browser has no audio. */
export function startMusic(volume01: number, opts: { grand?: boolean; seconds?: number } = {}): SoundHandle | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  let ctx: AudioContext;
  try { ctx = new Ctor(); } catch { return null; }
  const seconds = opts.seconds ?? 10;
  const peak = Math.max(0, Math.min(1, volume01)) * 0.3;
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const t0 = ctx.currentTime + 0.05;
  master.gain.linearRampToValueAtTime(peak, t0 + 1.2);
  master.gain.setValueAtTime(peak, t0 + Math.max(1.3, seconds - 2.5));
  master.gain.linearRampToValueAtTime(0, t0 + seconds);

  const note = (midi: number, start: number, dur: number, type: OscillatorType, vol: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0, t0 + start);
    g.gain.linearRampToValueAtTime(vol, t0 + start + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    o.connect(g); g.connect(master);
    o.start(t0 + start); o.stop(t0 + start + dur + 0.05);
  };

  // Cmaj7 - Am7 - Fmaj7 - G6, a slow and calm loop.
  const chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]];
  const step = 2.6;
  for (let i = 0; i * step < seconds; i++) {
    const c = chords[i % chords.length];
    c.forEach((m) => note(m - 12, i * step, step + 0.8, 'triangle', 0.5));
    c.forEach((m, j) => note(m + 12, i * step + j * 0.45, 1.6, 'sine', 0.35));
  }
  if (opts.grand) {
    [72, 76, 79, 84].forEach((m, j) => note(m, j * 0.18, 1.9, 'triangle', 0.6));
    [88, 91, 96].forEach((m, j) => note(m, 0.9 + j * 0.3, 1.4, 'sine', 0.22));
  }

  const resume = async () => { try { await ctx.resume(); } catch { /* still blocked */ } };
  void resume();
  let stopped = false;
  return {
    resume,
    blocked: () => ctx.state === 'suspended',
    stop: () => {
      if (stopped) return;
      stopped = true;
      try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25); } catch { /* ignore */ }
      setTimeout(() => { try { void ctx.close(); } catch { /* ignore */ } }, 400);
    },
  };
}

/** Plays an audio file from a link the admin set. blocked() is true when the browser refused to start it. */
export function playAudioUrl(url: string, volume01: number): SoundHandle {
  const a = new Audio(url);
  a.volume = Math.max(0, Math.min(1, volume01));
  let blocked = false;
  const resume = async () => { try { await a.play(); blocked = false; } catch { blocked = true; } };
  void resume();
  return { resume, blocked: () => blocked, stop: () => { try { a.pause(); } catch { /* ignore */ } } };
}

/** Speaks the greeting with the device's own voice. false when the device cannot speak. */
export function speak(text: string, langTag: string, volume01: number): boolean {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return false;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langTag;
    u.volume = Math.max(0, Math.min(1, volume01));
    u.rate = 0.9;
    const base = langTag.slice(0, 2).toLowerCase();
    const v = synth.getVoices().find((x) => x.lang.toLowerCase().startsWith(base));
    if (v) u.voice = v;
    synth.speak(u);
    return true;
  } catch { return false; }
}
export const stopSpeaking = () => { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } };
