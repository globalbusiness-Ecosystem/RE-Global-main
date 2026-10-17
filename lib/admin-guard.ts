import { ADMIN_COOKIE_NAME, verifyAdminToken, adminTokenIssuedAt } from '@/lib/admin-session';
import { revokedBefore } from '@/lib/admin-revoke';

// The check every admin API route uses: a valid signed session AND not cut off by "log out everywhere".
// Server-side only: it reads Firestore, so it must not be imported by middleware (edge) or client code.
// (lib/admin-session.ts has the signature-only check the middleware uses.)
export async function isAdminRequest(req: { cookies: { get(name: string): { value: string } | undefined } }): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifyAdminToken(token))) return false;
  try {
    if (adminTokenIssuedAt(token) <= (await revokedBefore())) return false;
  } catch { /* store unreachable: the signed token and its 8 h expiry still apply */ }
  return true;
}
