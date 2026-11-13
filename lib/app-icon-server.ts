import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_APP_ICON, parseAppIcon, type AppIcon } from '@/lib/app-icon';

// settings/appIcon. The built-in icons when nothing is saved or the database cannot be reached.
export async function getAppIcon(): Promise<AppIcon> {
  try {
    const snap = await Promise.race([
      adminDb.collection('settings').doc('appIcon').get(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('app icon timeout')), 3000)),
    ]);
    return snap.exists ? parseAppIcon(snap.data()) : DEFAULT_APP_ICON;
  } catch {
    return DEFAULT_APP_ICON;
  }
}
