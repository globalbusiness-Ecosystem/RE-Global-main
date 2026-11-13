import 'server-only';
import { getAppIcon } from '@/lib/app-icon-server';
import { buildManifest } from '@/lib/app-icon';

export const dynamic = 'force-dynamic';

// Public: the phone reads it when the app is installed. Built from the icon the admin chose; cached for a minute.
export async function GET() {
  return new Response(JSON.stringify(buildManifest(await getAppIcon())), {
    headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
