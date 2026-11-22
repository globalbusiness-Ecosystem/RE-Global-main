import { ADMIN_COOKIE_NAME, verifyAdminToken, adminTokenIssuedAt, adminTokenIdentity } from '@/lib/admin-session';
import { revokedBefore } from '@/lib/admin-revoke';
import { groupOf, can, isRole, type AdminRole } from '@/lib/admin-roles';

// The check every admin API route uses: a valid signed session, not cut off by "log out everywhere", and, for a staff account,
// still active (a suspended or deleted account stops on its next request), with a role that allows this kind of request in this area.
// Every write by anyone is also logged with who did it. Server-side only: it reads Firestore, so it must not be imported by middleware (edge) or client code.
// (lib/admin-session.ts has the signature-only check the middleware uses.)

type Req = { cookies: { get(name: string): { value: string } | undefined }; method?: string; url?: string; nextUrl?: { pathname: string } };
export type AdminWho = { sub: string; role: AdminRole; name: string };

function pathOf(req: Req): string | null {
  if (req.nextUrl?.pathname) return req.nextUrl.pathname;
  try { return req.url ? new URL(req.url).pathname : null; } catch { return null; }
}

/** Who is making this request, or null when not allowed (no session, revoked, suspended, or the role does not cover it). */
export async function adminWho(req: Req): Promise<AdminWho | null> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifyAdminToken(token))) return null;
  const iat = adminTokenIssuedAt(token);
  try {
    if (iat <= (await revokedBefore())) return null;
  } catch { /* store unreachable: the signed token and its 8 h expiry still apply */ }
  const id = adminTokenIdentity(token);
  let who: AdminWho;
  if (id.sub === 'owner') who = { sub: 'owner', role: 'owner', name: 'owner' };
  else {
    const st = await (await import('@/lib/admin-accounts')).adminStatus(id.sub);
    if (!st || !st.active || iat <= st.revokedAt || !isRole(st.role)) return null;
    who = { sub: id.sub, role: st.role, name: st.name };
  }
  if (who.role !== 'owner') {
    const p = pathOf(req);
    if (!p || !can(who.role, groupOf(p), req.method ?? 'GET')) return null; // deny by default
  }
  return who;
}

export async function isAdminRequest(req: Req): Promise<boolean> {
  const who = await adminWho(req);
  if (!who) return false;
  // Every change by every admin (the owner too) is recorded with the person's name; reads are not (they would drown the log).
  const m = req.method ?? 'GET';
  if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') {
    const p = pathOf(req);
    if (p && groupOf(p) !== 'session') {
      try { await (await import('@/lib/admin-audit')).logAdmin('admin.write', { actor: who.sub, name: who.name, role: who.role, method: m, path: p, group: groupOf(p) }); } catch { /* never blocks the action */ }
    }
  }
  return true;
}
