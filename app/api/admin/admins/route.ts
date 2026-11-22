import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { listAdmins, createAdmin, suspendAdmin, resumeAdmin, setAdminRole, resetAdminPin, resetAdminTotp, deleteAdmin } from '@/lib/admin-accounts';
import { activityReport } from '@/lib/admin-report-store';
import { cleanUsername } from '@/lib/admin-pin';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const bad = (error = 'Invalid') => NextResponse.json({ ok: false, error }, { status: 400, headers: H });

// Managing admin accounts. Owner only: "admins" is not in any role's areas, so the guard refuses every staff account here.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const hours = Math.min(24 * 30, Math.max(1, Number(new URL(req.url).searchParams.get('hours')) || 24));
  const [admins, report] = await Promise.all([listAdmins(), activityReport(hours).catch(() => [])]);
  return NextResponse.json({ ok: true, admins, report, hours }, { headers: H });
}

// { username, name, role, pin? } -> the PIN is returned once.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return bad();
  const r = await createAdmin({ username: b.username, name: b.name, role: b.role, pin: b.pin });
  if (!r.ok) return bad(r.error === 'exists' ? 'الاسم ده موجود' : r.error === 'pin' ? 'الـ PIN ضعيف (10 خانات على الأقل بحروف وأرقام)' : r.error === 'role' ? 'دور غير صالح' : 'اسم الدخول لازم 3-24 حرف إنجليزي/رقم');
  await logAdmin('admin.account.create', { id: r.id, role: b.role });
  return NextResponse.json({ ok: true, id: r.id, pin: r.pin }, { headers: H });
}

// { id, action: 'suspend' | 'resume' | 'role' | 'resetPin' | 'resetTotp', reason?, role? }
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const id = cleanUsername(b?.id);
  if (!id) return bad();
  let ok = false, pin: string | null = null;
  switch (b?.action) {
    case 'suspend': ok = await suspendAdmin(id, typeof b.reason === 'string' ? b.reason : ''); break;
    case 'resume': ok = await resumeAdmin(id); break;
    case 'role': ok = await setAdminRole(id, b.role); break;
    case 'resetTotp': ok = await resetAdminTotp(id); break;
    case 'resetPin': pin = await resetAdminPin(id); ok = !!pin; break;
    default: return bad();
  }
  if (!ok) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404, headers: H });
  await logAdmin(`admin.account.${String(b.action)}`, { id, ...(b.action === 'role' ? { role: b.role } : {}) });
  return NextResponse.json({ ok: true, ...(pin ? { pin } : {}) }, { headers: H });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = cleanUsername(new URL(req.url).searchParams.get('id'));
  if (!id || !(await deleteAdmin(id))) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404, headers: H });
  await logAdmin('admin.account.delete', { id });
  return NextResponse.json({ ok: true }, { headers: H });
}
