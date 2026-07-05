import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PIN = process.env.ADMIN_PIN;

export async function POST(req: NextRequest) {
  if (!ADMIN_PIN) {
    return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
  }
  const { pin } = await req.json();
  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', 'authenticated', {
    httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 8, path: '/',
  });
  return res;
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session');
  return NextResponse.json({ ok: session?.value === 'authenticated' });
}
