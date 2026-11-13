import 'server-only';
import { getAppIcon } from '@/lib/app-icon-server';

export const dynamic = 'force-dynamic';

// Public: iPhones ask for this address when the app is added to the home screen. Sends them to the chosen icon.
export async function GET(req: Request) {
  const a = await getAppIcon();
  return Response.redirect(a.apple180 ?? new URL('/apple-icon.png', req.url).toString(), 302);
}
