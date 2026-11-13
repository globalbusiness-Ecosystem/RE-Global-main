import { parseLogoUrl } from './branding';

// The icon people get when they install the app on their phone, and the colours around it. The admin can change them.
export type AppIcon = {
  icon192: string | null;
  icon512: string | null;
  maskable512: string | null;
  apple180: string | null;
  themeColor: string;
};

export const DEFAULT_THEME_COLOR = '#0d0722';
export const DEFAULT_APP_ICON: AppIcon = { icon192: null, icon512: null, maskable512: null, apple180: null, themeColor: DEFAULT_THEME_COLOR };

export function parseThemeColor(v: unknown): string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim().toLowerCase() : DEFAULT_THEME_COLOR;
}

export function parseAppIcon(data: unknown): AppIcon {
  const d = (data ?? {}) as Record<string, unknown>;
  const all = [parseLogoUrl(d.icon192), parseLogoUrl(d.icon512), parseLogoUrl(d.maskable512), parseLogoUrl(d.apple180)];
  // Either the whole set is there or the built-in icons are used, so a half-saved set never shows a broken icon.
  const complete = all.every((x) => x !== null);
  return {
    icon192: complete ? all[0] : null,
    icon512: complete ? all[1] : null,
    maskable512: complete ? all[2] : null,
    apple180: complete ? all[3] : null,
    themeColor: parseThemeColor(d.themeColor),
  };
}

// The web app manifest the phone reads when the app is installed.
export function buildManifest(a: AppIcon) {
  return {
    name: 'RE Platform - Global Real Estate Marketplace',
    short_name: 'RE Platform',
    description: 'Buy, rent, invest & explore properties on Pi Network',
    start_url: '/',
    display: 'standalone',
    background_color: a.themeColor,
    theme_color: a.themeColor,
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      { src: a.icon192 ?? '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: a.icon512 ?? '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: a.maskable512 ?? '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: a.apple180 ?? '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    screenshots: [{ src: '/placeholder.jpg', sizes: '540x720', type: 'image/jpeg', form_factor: 'narrow' }],
  };
}
