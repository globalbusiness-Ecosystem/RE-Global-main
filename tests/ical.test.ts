import { describe, it, expect } from 'vitest';
import { buildFeed, foldLine, icalText } from '@/lib/ical';

const NOW = Date.parse('2026-10-14T12:30:45.123Z');

describe('icalText', () => {
  it('escapes special characters', () => {
    const BS = String.fromCharCode(92);
    expect(icalText(`a,b;c${BS}d\ne`)).toBe(`a${BS},b${BS};c${BS}${BS}d${BS}ne`);
  });
});

describe('foldLine', () => {
  it('keeps short lines and folds long ones at 75 octets', () => {
    expect(foldLine('SUMMARY:Reserved')).toBe('SUMMARY:Reserved');
    const folded = foldLine('X:' + 'a'.repeat(200));
    const parts = folded.split('\r\n');
    expect(parts.length).toBeGreaterThan(2);
    for (const p of parts) expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75);
    expect(parts.slice(1).every((p) => p.startsWith(' '))).toBe(true);
    expect(parts.map((p, i) => (i ? p.slice(1) : p)).join('')).toBe('X:' + 'a'.repeat(200));
  });
  it('never splits a multi-byte character', () => {
    const line = 'X:' + 'فندق'.repeat(40);
    const back = foldLine(line).split('\r\n').map((p, i) => (i ? p.slice(1) : p)).join('');
    expect(back).toBe(line);
  });
});

describe('buildFeed', () => {
  const feed = buildFeed('prop1', 'Nile Hotel', [{ start: '2026-10-20', end: '2026-10-25' }], NOW);
  it('is a valid calendar with CRLF endings', () => {
    expect(feed.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(feed.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(feed.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });
  it('exports whole-day events where the end day is exclusive', () => {
    expect(feed).toContain('DTSTART;VALUE=DATE:20261020');
    expect(feed).toContain('DTEND;VALUE=DATE:20261025');
    expect(feed).toContain('UID:prop1-20261020-20261025@re-global');
    expect(feed).toContain('DTSTAMP:20261014T123045Z');
    expect(feed).toContain('SUMMARY:Reserved');
  });
  it('shows no personal data', () => {
    expect(feed).not.toMatch(/guest|paymentId|username|admin/i);
  });
  it('skips invalid and duplicate ranges', () => {
    const f = buildFeed('p', 'T', [
      { start: '2026-10-20', end: '2026-10-20' },
      { start: 'x', end: '2026-10-22' },
      { start: '2026-10-21', end: '2026-10-22' },
      { start: '2026-10-21', end: '2026-10-22' },
    ], NOW);
    expect(f.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
  it('is an empty calendar when nothing is taken', () => {
    expect(buildFeed('p', 'T', [], NOW)).not.toContain('VEVENT');
  });
});
