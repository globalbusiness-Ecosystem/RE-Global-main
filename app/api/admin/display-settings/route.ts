import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';
import { logAdmin } from '@/lib/admin-audit';
import { getShowDemo } from '@/lib/demo-listings-server';

export const dynamic = 'force-dynamic';
const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  return NextResponse.json({ ok: true, showDemoListings: await getShowDemo() }, { headers: { 'Cache-Control': 'no-store' } });
}

// { showDemoListings: boolean } shows or hides the built-in sample listings for visitors.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => null);
  if (typeof body?.showDemoListings !== 'boolean') return NextResponse.json({ ok: false, error: 'showDemoListings must be true or false' }, { status: 400 });
  try {
    const before = await getShowDemo();
    await adminDb.collection('settings').doc('display').set({ showDemoListings: body.showDemoListings, updatedAt: Timestamp.now() }, { mergeFields: ['showDemoListings', 'updatedAt'] });
    await logAdmin('display.demo', { from: before, to: body.showDemoListings });
    return NextResponse.json({ ok: true, showDemoListings: body.showDemoListings });
  } catch (err) {
    console.error('[admin/display-settings] save error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
