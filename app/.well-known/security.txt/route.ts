import { NextResponse } from 'next/server';
import { siteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

// RFC 9116 security.txt: tells researchers where to report a vulnerability. The contact comes from the
// SECURITY_CONTACT_EMAIL setting (nothing is published until it is set). "Expires" is always ~6 months ahead.
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

export async function GET() {
  const email = process.env.SECURITY_CONTACT_EMAIL?.trim();
  if (!email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const body = [
    `Contact: mailto:${email}`,
    `Expires: ${new Date(Date.now() + SIX_MONTHS_MS).toISOString()}`,
    'Preferred-Languages: ar, en',
    `Canonical: ${siteUrl()}/.well-known/security.txt`,
    '',
  ].join('\n');
  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
