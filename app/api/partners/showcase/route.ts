import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { showcase } from '@/lib/partner-projects-server';

export const dynamic = 'force-dynamic';

// Public: projects of approved partners that the team approved (short cards, or one full project with ?id=). Cached for a few minutes.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (id.includes('/') || id.length > 100) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  try {
    if (id) {
      const project = await showcase({ id });
      return project
        ? NextResponse.json({ project }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
        : NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ projects: await showcase() }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}
