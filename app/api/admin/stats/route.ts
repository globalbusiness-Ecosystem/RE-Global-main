import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminRequest } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [props, contracts, profiles, banned, audit] = await Promise.all([
      adminDb.collection('properties').select('type', 'status', 'hidden', 'featured').get(),
      adminDb
        .collection('contracts')
        .select('amount', 'type', 'createdAt', 'propertyTitle', 'buyerUsername', 'currency')
        .limit(5000)
        .get(),
      adminDb.collection('profiles').count().get(),
      adminDb.collection('banned_users').count().get(),
      adminDb.collection('admin_audit').orderBy('at', 'desc').limit(15).get(),
    ]);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let hidden = 0;
    let featured = 0;
    props.docs.forEach((d) => {
      const p = d.data();
      byType[p.type] = (byType[p.type] || 0) + 1;
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      if (p.hidden === true) hidden++;
      if (p.featured === true) featured++;
    });

    const now = Date.now();
    const series: Record<string, { count: number; amount: number }> = {};
    for (let i = 13; i >= 0; i--) series[dayKey(new Date(now - i * DAY))] = { count: 0, amount: 0 };
    const cByType: Record<string, { count: number; amount: number }> = {};
    let totalAmount = 0;
    let last7 = { count: 0, amount: 0 };
    const rows = contracts.docs.map((d) => {
      const c = d.data();
      const at: Date = c.createdAt?.toDate?.() ?? new Date(0);
      const amount = Number(c.amount) || 0;
      totalAmount += amount;
      const t = (cByType[c.type] ||= { count: 0, amount: 0 });
      t.count++;
      t.amount += amount;
      const k = dayKey(at);
      if (series[k]) {
        series[k].count++;
        series[k].amount += amount;
      }
      if (now - at.getTime() < 7 * DAY) {
        last7.count++;
        last7.amount += amount;
      }
      return { id: d.id, propertyTitle: c.propertyTitle, buyerUsername: c.buyerUsername, amount, currency: c.currency, type: c.type, at: at.toISOString() };
    });
    rows.sort((a, b) => b.at.localeCompare(a.at));

    return NextResponse.json(
      {
        ok: true,
        properties: { total: props.size, byType, byStatus, hidden, featured },
        contracts: { total: contracts.size, totalAmount, byType: cByType, last7, recent: rows.slice(0, 8) },
        users: { profiles: profiles.data().count, banned: banned.data().count },
        series: Object.entries(series).map(([date, v]) => ({ date, ...v })),
        activity: audit.docs.map((d) => {
          const a = d.data();
          return { id: d.id, action: a.action, detail: a.detail ?? {}, at: a.at?.toDate?.().toISOString() ?? null };
        }),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[admin/stats] error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
