// iCalendar (RFC 5545) feed of the taken days of one hotel / rental listing.
// Pure: no Firebase. Only dates are exposed (no names, no payment ids), so the link can be given to
// Google Calendar, Airbnb or Booking.com to keep other channels in sync.
import type { BookingDates } from '@/lib/booking-rules';

export const ICAL_PRODID = '-//RE Global//Availability//EN';
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// Text values: escape \ ; , and newlines (RFC 5545 3.3.11).
const BS = String.fromCharCode(92);
export const icalText = (s: string) =>
  s.split(BS).join(BS + BS).split(';').join(BS + ';').split(',').join(BS + ',').replace(/\r?\n/g, BS + 'n');

// Content lines are at most 75 octets: fold longer ones with CRLF + space (never split a UTF-8 character).
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = '';
  let size = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (size + n > limit) {
      parts.push(cur);
      cur = '';
      size = 0;
      limit = 74; // continuation lines start with one space
    }
    cur += ch;
    size += n;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

const compact = (day: string) => day.replace(/-/g, '');
const stamp = (nowMs: number) => new Date(nowMs).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

// Only real YYYY-MM-DD ranges with end after start are exported.
export function buildFeed(propertyId: string, title: string, busy: BookingDates[], nowMs: number): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${ICAL_PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icalText(title || 'RE Global')}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ];
  const seen = new Set<string>();
  for (const r of busy) {
    if (!DAY_RE.test(r.start) || !DAY_RE.test(r.end) || r.end <= r.start) continue;
    const uid = `${propertyId}-${compact(r.start)}-${compact(r.end)}@re-global`;
    if (seen.has(uid)) continue;
    seen.add(uid);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp(nowMs)}`,
      `DTSTART;VALUE=DATE:${compact(r.start)}`,
      `DTEND;VALUE=DATE:${compact(r.end)}`,
      'SUMMARY:Reserved',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
