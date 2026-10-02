import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';

// /admin renders the PIN login; every deeper admin route needs a valid session.
export async function middleware(req: NextRequest) {
  if (await isAdminRequest(req)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/admin';
  url.search = '';
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/admin/:path+'] };
