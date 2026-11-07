import 'server-only';
import { NextResponse } from 'next/server';
import { getKyc } from '@/lib/kyc-store';
import { needsKyc } from '@/lib/kyc-rules';

/**
 * For routes that move money: people who signed in outside the Pi Browser must be verified first.
 * Returns the response to send back when the person is blocked, or null when they may go on.
 * Pi users pass (Pi verified them). A failed lookup blocks (fails closed).
 */
export async function kycBlock(uid: string): Promise<NextResponse | null> {
  if (!needsKyc(uid)) return null;
  const H = { 'Cache-Control': 'no-store' };
  let status: string;
  try { status = (await getKyc(uid)).status; } catch { return NextResponse.json({ error: 'Try again' }, { status: 503, headers: H }); }
  if (status !== 'approved') return NextResponse.json({ error: 'Identity verification required', code: 'kyc_required', kyc: status }, { status: 403, headers: H });
  return null;
}
