// How long technical records are kept (GDPR "storage limitation"). Pure: just the rules, no database.
// Legal records (payments, contracts, ownership, payouts, the admin activity log) are NOT here: they are kept on purpose.

export type RetentionRule = { collection: string; field: string; before: Date };

const DAY = 24 * 60 * 60 * 1000;

export function retentionRules(now: Date = new Date()): RetentionRule[] {
  const ago = (days: number) => new Date(now.getTime() - days * DAY);
  return [
    { collection: 'rate_limits', field: 'expireAt', before: now },            // counters past their window
    { collection: 'email_otps', field: 'expiresAt', before: ago(1) },          // one-time codes, a day after they expired
    { collection: 'client_errors', field: 'lastAt', before: ago(90) },         // browser error reports
    { collection: 'csp_reports', field: 'lastAt', before: ago(90) },           // security-policy reports
    { collection: 'listing_reports', field: 'resolvedAt', before: ago(180) },  // closed reports about listings (open ones have no resolvedAt)
  ];
}
