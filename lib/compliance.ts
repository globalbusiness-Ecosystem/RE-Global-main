// Compliance register: security incidents with a notification clock, and privacy requests with an answer deadline.
// Pure rules (no database). The windows follow the common standard (GDPR: 72 hours to notify a breach, one month to answer a request);
// Egypt's data-protection law has its own periods, so they are settings of this file that the company's lawyer should confirm.

export const NOTIFY_HOURS = 72;
export const REQUEST_DAYS = 30;
export const SOON_HOURS = 24;

export const SEVERITIES = ['low', 'medium', 'high'] as const;
export const INCIDENT_STATUS = ['open', 'contained', 'notified', 'closed'] as const;
export const REQUEST_KINDS = ['access', 'erase', 'correct', 'object'] as const;
export const REQUEST_STATUS = ['open', 'done', 'refused'] as const;
export type Severity = (typeof SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUS)[number];
export type RequestKind = (typeof REQUEST_KINDS)[number];
export type RequestStatus = (typeof REQUEST_STATUS)[number];

const oneOf = <T extends string>(list: readonly T[], v: unknown): T | null => (typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : null);
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const time = (v: unknown, now: number): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? new Date(v).getTime() : NaN;
  return Number.isFinite(n) && n <= now + 3_600_000 && n > now - 5 * 365 * 86_400_000 ? n : now; // not in the future, not absurdly old
};

export type NewIncident = { title: string; description: string; severity: Severity; personalData: boolean; discoveredAtMs: number };
export function cleanIncident(b: unknown, now = Date.now()): NewIncident | null {
  const x = (b ?? {}) as Record<string, unknown>;
  const title = text(x.title, 120);
  const severity = oneOf(SEVERITIES, x.severity);
  if (!title || !severity) return null;
  return { title, description: text(x.description, 2000), severity, personalData: x.personalData === true, discoveredAtMs: time(x.discoveredAt, now) };
}

export type NewRequest = { kind: RequestKind; requester: string; note: string; receivedAtMs: number };
export function cleanRequest(b: unknown, now = Date.now()): NewRequest | null {
  const x = (b ?? {}) as Record<string, unknown>;
  const kind = oneOf(REQUEST_KINDS, x.kind);
  const requester = text(x.requester, 120);
  if (!kind || !requester) return null;
  return { kind, requester, note: text(x.note, 2000), receivedAtMs: time(x.receivedAt, now) };
}

export const incidentDeadline = (discoveredAtMs: number) => discoveredAtMs + NOTIFY_HOURS * 3_600_000;
export const requestDeadline = (receivedAtMs: number) => receivedAtMs + REQUEST_DAYS * 86_400_000;

export type ClockState = 'stopped' | 'none' | 'ok' | 'soon' | 'late';
/** The clock on a deadline: stopped once the matter is handled, or none when there is nothing to notify. */
export function clock(deadlineMs: number | null, handled: boolean, now = Date.now(), soonHours = SOON_HOURS): { state: ClockState; hoursLeft: number } {
  if (deadlineMs === null) return { state: 'none', hoursLeft: 0 };
  if (handled) return { state: 'stopped', hoursLeft: 0 };
  const hoursLeft = Math.floor((deadlineMs - now) / 3_600_000);
  return { state: deadlineMs <= now ? 'late' : hoursLeft <= soonHours ? 'soon' : 'ok', hoursLeft };
}

/** An incident's notification clock only runs when personal data is involved and nobody has notified or closed it yet. */
export function incidentClock(i: { personalData: boolean; status: IncidentStatus; discoveredAtMs: number }, now = Date.now()) {
  return clock(i.personalData ? incidentDeadline(i.discoveredAtMs) : null, i.status === 'notified' || i.status === 'closed', now);
}
export const requestClock = (r: { status: RequestStatus; receivedAtMs: number }, now = Date.now()) => clock(requestDeadline(r.receivedAtMs), r.status !== 'open', now, 5 * 24);

/** Counts for the admin's "needs attention" list. */
export function complianceAttention(incidents: { personalData: boolean; status: IncidentStatus; discoveredAtMs: number }[], requests: { status: RequestStatus; receivedAtMs: number }[], now = Date.now()) {
  const ic = incidents.map((i) => incidentClock(i, now).state);
  const rc = requests.map((r) => requestClock(r, now).state);
  return {
    late: ic.filter((s) => s === 'late').length + rc.filter((s) => s === 'late').length,
    soon: ic.filter((s) => s === 'soon').length + rc.filter((s) => s === 'soon').length,
    openIncidents: incidents.filter((i) => i.status === 'open').length,
  };
}
