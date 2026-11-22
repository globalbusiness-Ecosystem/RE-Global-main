// Who may do what in the admin panel. Pure rules, shared by the server guard and the management screen.
// Principles: least privilege (each role gets only its own areas), deny by default (a route nobody classified is owner-only),
// and the owner (the PIN account) is never limited.

export const ROLES = ['owner', 'compliance', 'reviewer', 'finance', 'content', 'viewer'] as const;
export type AdminRole = (typeof ROLES)[number];
export const STAFF_ROLES: AdminRole[] = ['compliance', 'reviewer', 'finance', 'content', 'viewer'];

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'المالك (كل الصلاحيات)',
  compliance: 'مسؤول امتثال (KYC والاحتفاظ)',
  reviewer: 'مراجع (يشوف طلبات KYC ويوصي بقرار)',
  finance: 'مالية (الدفعات والعمولات والمستخدمين)',
  content: 'محتوى (العقارات والنصوص)',
  viewer: 'مشاهد (قراءة فقط)',
};

export type AdminGroup = 'session' | 'overview' | 'kyc' | 'kycAdmin' | 'finance' | 'users' | 'content' | 'owner';

const prefixes = (list: string[]) => (p: string) => list.some((x) => p === `/api/admin/${x}` || p.startsWith(`/api/admin/${x}/`));
const isOverview = prefixes(['stats', 'attention', 'readiness']);
const isKyc = prefixes(['kyc']);
const isKycAdmin = prefixes(['kyc-policy', 'kyc-watchlist', 'kyc-retention', 'kyc-vault', 'kyc-four-eyes', 'compliance-register']);
const isFinance = prefixes(['payouts', 'card-orders', 'partner-commissions', 'market', 'market-settings', 'holdings', 'bookings', 'arrivals', 'occupancy', 'blocks', 'cancellation', 'pricing', 'partner-program', 'partner-projects', 'partner-referrals', 'partners', 'contracts', 'upload-contract']);
const isUsers = prefixes(['users', 'user-detail']);
const isContent = prefixes(['content', 'texts', 'properties', 'announcements', 'about', 'branding', 'app-icon', 'badges', 'celebration', 'display-settings', 'tours', 'home-features', 'lock-image', 'translate', 'geocode', 'audio-upload-url', 'video-upload-url', 'upload-image', 'legal', 'reviews', 'listing-reports', 'rewards', 'founder']);

/** The area a request belongs to. Anything not listed (backup, security, sessions, admins, logs…) is owner-only. */
export function groupOf(pathname: string): AdminGroup {
  const p = pathname.replace(/\/+$/, '');
  if (p === '/api/admin-auth' || p.startsWith('/api/admin-auth/')) return 'session';
  if (p === '/api/payments/app-to-user') return 'finance';
  if (!p.startsWith('/api/admin/')) return 'owner';
  if (isKycAdmin(p)) return 'kycAdmin'; // before isKyc: "kyc-policy" is not "kyc/…"
  if (isKyc(p)) return 'kyc';
  if (isOverview(p)) return 'overview';
  if (isFinance(p)) return 'finance';
  if (isUsers(p)) return 'users';
  if (isContent(p)) return 'content';
  return 'owner';
}

type Grant = { read: AdminGroup[]; write: AdminGroup[] };
const GRANTS: Record<AdminRole, Grant> = {
  owner: { read: [], write: [] }, // handled as "everything"
  compliance: { read: ['overview', 'kyc', 'kycAdmin', 'users'], write: ['kyc', 'kycAdmin'] },
  reviewer: { read: ['overview', 'kyc'], write: ['kyc'] }, // a reviewer's decision is only ever a recommendation (see kyc-four-eyes)
  finance: { read: ['overview', 'finance', 'users'], write: ['finance'] },
  content: { read: ['overview', 'content'], write: ['content'] },
  viewer: { read: ['overview', 'content'], write: [] },
};

/** Which main tabs of the panel a role sees (the server enforces the real limits; this only hides what would be refused). */
export const TAB_ACCESS: Record<AdminRole, string[]> = {
  owner: ['dashboard', 'properties', 'payments', 'users', 'content', 'admins'],
  compliance: ['dashboard', 'payments', 'users'],
  reviewer: ['dashboard', 'payments'],
  finance: ['dashboard', 'payments', 'users'],
  content: ['dashboard', 'properties', 'content'],
  viewer: ['dashboard', 'properties', 'content'],
};

export const isRole = (v: unknown): v is AdminRole => typeof v === 'string' && (ROLES as readonly string[]).includes(v);

/** May this role make this kind of request (GET/HEAD = read, anything else = write) in this area? Every signed-in admin may use the session endpoint. */
export function can(role: AdminRole, group: AdminGroup, method: string): boolean {
  if (role === 'owner') return true;
  if (group === 'session') return true;
  if (group === 'owner') return false;
  const read = method === 'GET' || method === 'HEAD';
  const g = GRANTS[role];
  return read ? g.read.includes(group) || g.write.includes(group) : g.write.includes(group);
}
