import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
type Doc = Record<string, unknown>;
const h = vi.hoisted(() => ({ store: {} as Record<string, Record<string, Doc>> }));
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => ({ docs: Object.entries(h.store[name] ?? {}).filter(([, d]) => d[field] === value).map(([id, d]) => ({ id, data: () => d })) }),
        }),
      }),
      doc: (id: string) => ({
        get: async () => ({ exists: !!h.store[name]?.[id], data: () => h.store[name]?.[id] }),
        create: async (d: Doc) => {
          h.store[name] ??= {};
          if (h.store[name][id]) throw Object.assign(new Error('exists'), { code: 6 });
          h.store[name][id] = d;
        },
      }),
    }),
  },
}));
const send = vi.fn();
vi.mock('@/lib/send-email', () => ({ sendEmail: (...a: unknown[]) => send(...a), emailConfigured: () => true }));
vi.mock('@/lib/site-url', () => ({ siteUrl: () => 'https://re.example' }));

import { MAX_REMINDERS_PER_RUN, buildReminderMail, reminderDays, validEmail, wantsEmail } from '@/lib/guest-reminders';
import { sendGuestReminders } from '@/lib/guest-reminders-server';

const NOW = Date.parse('2026-10-30T07:00:00Z');

describe('pure rules', () => {
  it('finds tomorrow and yesterday, and refuses a bad date', () => {
    expect(reminderDays('2026-10-30')).toEqual({ tomorrow: '2026-10-31', yesterday: '2026-10-29' });
    expect(reminderDays('2026-12-31')).toEqual({ tomorrow: '2027-01-01', yesterday: '2026-12-30' });
    expect(reminderDays('2026-03-01')!.yesterday).toBe('2026-02-28');
    expect(reminderDays('nope')).toBeNull();
  });
  it('is on unless the guest turned notifications off', () => {
    expect(wantsEmail(null)).toBe(true);
    expect(wantsEmail({})).toBe(true);
    expect(wantsEmail({ notificationsEnabled: true })).toBe(true);
    expect(wantsEmail({ notificationsEnabled: false })).toBe(false);
  });
  it('accepts only a plain e-mail address', () => {
    expect(validEmail('a@b.co')).toBe(true);
    for (const bad of ['', 'x', 'a b@c.d', 'a@b', '<a@b.co>', 5, null, `${'a'.repeat(260)}@b.co`]) expect(validEmail(bad)).toBe(false);
  });
  it('writes both languages, escapes the property name and links the site', () => {
    const m = buildReminderMail('checkin', { title: '<script>x</script> Hotel', start: '2026-10-31', end: '2026-11-02' }, 'https://re.example');
    expect(m.subject).toContain('تسجيل الوصول بكرة');
    expect(m.subject).toContain('Check-in tomorrow');
    expect(m.html).not.toContain('<script>');
    expect(m.html).toContain('&lt;script&gt;');
    expect(m.html).toContain('https://re.example');
    expect(buildReminderMail('review', { title: 'T', start: 'a', end: 'b' }, 'https://x').subject).toContain('How was your stay?');
  });
});

const booking = (over: Doc = {}): Doc => ({ username: 'ann', status: 'confirmed', propertyTitle: 'Nile Hotel', start: '2026-11-10', end: '2026-11-12', ...over });

beforeEach(() => {
  send.mockReset(); send.mockResolvedValue(undefined);
  h.store = {
    profiles: { ann: { emailVerified: true, verifiedEmail: 'ann@example.com' }, bob: { emailVerified: false, verifiedEmail: 'bob@example.com' } },
    preferences: { ann: { notificationsEnabled: true } },
    bookings: {},
  };
});

describe('sendGuestReminders', () => {
  it('mails a check-in reminder for a stay that starts tomorrow', async () => {
    h.store.bookings = { b1: booking({ start: '2026-10-31' }), b2: booking({ start: '2026-11-05' }) };
    const r = await sendGuestReminders(NOW);
    expect(r).toEqual({ sent: 1, skipped: 0, failed: 0 });
    expect(send.mock.calls[0][0].to).toBe('ann@example.com');
    expect(send.mock.calls[0][0].subject).toContain('Check-in tomorrow');
  });
  it('asks for a review the day after, unless the stay was already reviewed', async () => {
    h.store.bookings = { b1: booking({ start: '2026-10-27', end: '2026-10-29' }), b2: booking({ start: '2026-10-26', end: '2026-10-29' }) };
    h.store.stay_reviews = { b2: { rating: 5 } };
    const r = await sendGuestReminders(NOW);
    expect(r).toEqual({ sent: 1, skipped: 1, failed: 0 });
    expect(send.mock.calls[0][0].subject).toContain('How was your stay?');
  });
  it('never mails the same reminder twice', async () => {
    h.store.bookings = { b1: booking({ start: '2026-10-31' }) };
    await sendGuestReminders(NOW);
    const again = await sendGuestReminders(NOW);
    expect(again).toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('skips cancelled stays, unverified e-mails, missing profiles and switched-off notifications', async () => {
    h.store.preferences.carl = { notificationsEnabled: false };
    h.store.profiles.carl = { emailVerified: true, verifiedEmail: 'carl@example.com' };
    h.store.bookings = {
      c1: booking({ start: '2026-10-31', status: 'cancelled' }),
      c2: booking({ start: '2026-10-31', username: 'bob' }),
      c3: booking({ start: '2026-10-31', username: 'ghost' }),
      c4: booking({ start: '2026-10-31', username: 'carl' }),
      c5: booking({ start: '2026-10-31', username: 'a/b' }),
    };
    const r = await sendGuestReminders(NOW);
    expect(r).toEqual({ sent: 0, skipped: 5, failed: 0 });
    expect(send).not.toHaveBeenCalled();
  });
  it('counts a failed send and carries on with the next guest', async () => {
    h.store.profiles.dan = { emailVerified: true, verifiedEmail: 'dan@example.com' };
    h.store.bookings = { d1: booking({ start: '2026-10-31', username: 'ann' }), d2: booking({ start: '2026-10-31', username: 'dan' }) };
    send.mockRejectedValueOnce(new Error('smtp down'));
    const r = await sendGuestReminders(NOW);
    expect(r.sent).toBe(1);
    expect(r.failed).toBe(1);
  });
  it('caps one run', async () => {
    h.store.bookings = Object.fromEntries(Array.from({ length: MAX_REMINDERS_PER_RUN + 20 }, (_, i) => [`m${i}`, booking({ start: '2026-10-31' })]));
    const r = await sendGuestReminders(NOW);
    expect(r.sent).toBe(MAX_REMINDERS_PER_RUN);
  });
});
