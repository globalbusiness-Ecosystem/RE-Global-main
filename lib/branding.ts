// The platform logo the admin can change. Shared by the server (what is stored) and the pages (what is shown).
export type Branding = { logoUrl: string | null; animated: boolean };

export const DEFAULT_BRANDING: Branding = { logoUrl: null, animated: true };

// Only an https image address is accepted, so a stored value can never run code or point at a local file.
export function parseLogoUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (s.length === 0 || s.length > 600) return null;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export function parseBranding(data: unknown): Branding {
  const d = (data ?? {}) as Record<string, unknown>;
  return { logoUrl: parseLogoUrl(d.logoUrl), animated: typeof d.animated === 'boolean' ? d.animated : true };
}
