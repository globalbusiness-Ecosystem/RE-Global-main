import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { rateLimited } from '@/lib/rate-guard';
import { parseProject } from '@/lib/partner-projects';
import { deleteProject, listMyProjects, saveProject } from '@/lib/partner-projects-server';
import { getPartner } from '@/lib/partners-server';

export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store' };

async function auth(req: NextRequest) {
  try {
    return { user: await verifyPiAccessToken(req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')) };
  } catch (err) {
    return { res: NextResponse.json({ error: 'Not authenticated' }, { status: err instanceof AuthError ? err.status : 401, headers: HEADERS }) };
  }
}

// The signed-in partner's own projects (any status).
export async function GET(req: NextRequest) {
  const a = await auth(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('partner-projects-read', a.user.uid, 60, 60 * 1000);
  if (limited) return limited;
  try {
    const partner = await getPartner(a.user.username);
    if (!partner || partner.status !== 'approved') return NextResponse.json({ error: 'not_partner' }, { status: 403, headers: HEADERS });
    return NextResponse.json({ projects: await listMyProjects(a.user.username) }, { headers: HEADERS });
  } catch (err) {
    console.error('[partners/projects] list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

// { id?, submit?, ...project }: saves a project (new without id) and, with submit, sends it to the team for review.
export async function POST(req: NextRequest) {
  const a = await auth(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('partner-projects-write', a.user.uid, 40, 60 * 60 * 1000);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = parseProject(body);
  if (!parsed.ok) return NextResponse.json({ error: 'invalid', field: parsed.error }, { status: 400, headers: HEADERS });
  const id = typeof body?.id === 'string' && body.id && !body.id.includes('/') ? body.id : undefined;
  try {
    const r = await saveProject(a.user.uid, a.user.username, parsed.value, { id, submit: body?.submit === true });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status, headers: HEADERS });
    return NextResponse.json({ ok: true, id: r.id, status: r.status }, { headers: HEADERS });
  } catch (err) {
    console.error('[partners/projects] save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}

// ?id=: the owner deletes one of their projects.
export async function DELETE(req: NextRequest) {
  const a = await auth(req);
  if (!a.user) return a.res;
  const limited = await rateLimited('partner-projects-write', a.user.uid, 40, 60 * 60 * 1000);
  if (limited) return limited;
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!id || id.includes('/')) return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: HEADERS });
  try {
    return (await deleteProject(a.user.username, id))
      ? NextResponse.json({ ok: true }, { headers: HEADERS })
      : NextResponse.json({ error: 'not_found' }, { status: 404, headers: HEADERS });
  } catch (err) {
    console.error('[partners/projects] delete error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: HEADERS });
  }
}
