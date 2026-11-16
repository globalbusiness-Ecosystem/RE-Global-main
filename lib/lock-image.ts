import { parseLogoUrl } from '@/lib/branding';

// The picture shown inside the big fingerprint button (lock screen, confirm window, settings). null = the built-in fingerprint icon.
export type LockImage = { imageUrl: string | null };
export const DEFAULT_LOCK_IMAGE: LockImage = { imageUrl: null };

export function parseLockImage(data: unknown): LockImage {
  const d = (data ?? {}) as Record<string, unknown>;
  return { imageUrl: parseLogoUrl(d.imageUrl) };
}
