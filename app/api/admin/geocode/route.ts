import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-guard';
import { ipLimited } from '@/lib/rate-guard';
import { geocodeQuery } from '@/lib/geocode';
import { geocode } from '@/lib/geocode-server';
import { COUNTRIES } from '@/lib/legal-profiles';

export const dynamic = 'force-dynamic';

// Admin only: turns a typed address into map coordinates for a listing.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limited = await ipLimited('admin-geocode', req, 30, 60_000);
  if (limited) return limited;

  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const code = typeof b?.country === 'string' && /^[A-Za-z]{2}$/.test(b.country) ? b.country.toUpperCase() : '';
  const countryName = code ? (COUNTRIES as Record<string, { en?: string }>)[code]?.en : '';
  const q = geocodeQuery(b?.location, countryName);
  if (!q) return NextResponse.json({ error: 'Location is required' }, { status: 400 });

  const hit = await geocode(q, code);
  if (!hit) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json(hit, { headers: { 'Cache-Control': 'no-store' } });
}
