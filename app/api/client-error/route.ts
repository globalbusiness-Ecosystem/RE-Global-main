import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';
import { normalizeClientError } from '@/lib/client-error';
import { recordClientError } from '@/lib/client-error-store';
import { alertAdmin } from '@/lib/admin-alert';

export const dynamic = 'force-dynamic';

const quiet = () => new NextResponse(null, { status: 204 });

// The site's own pages report crashes here. Always answers 204 (reveals nothing); small bodies only;
// limited per IP and overall; the owner gets one e-mail the first time a new kind of error appears.
export async function POST(req: NextRequest) {
  try {
    const ip = await consumeRateLimit(`cerr:${clientIp(req)}`, 20, 10 * 60 * 1000);
    if (!ip.ok) return quiet();
    const all = await consumeRateLimit('cerr:all', 300, 60 * 60 * 1000);
    if (!all.ok) return quiet();
    const text = await req.text();
    if (text.length > 6000) return quiet();
    const rec = normalizeClientError(JSON.parse(text));
    if (!rec) return quiet();
    if (await recordClientError(rec)) {
      await alertAdmin('client-error', 'خطأ جديد ظهر عند المستخدمين', { 'النوع': rec.kind, 'الرسالة': rec.message, 'الصفحة': rec.page });
    }
  } catch {
    // a malformed report is not worth an error
  }
  return quiet();
}
