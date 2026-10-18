// The 360 viewer address for an admin-supplied panorama link. Null unless it is a plain web link.
export function panoramaSrc(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const u = url.trim();
  if (!/^https?:\/\/[^\s]+$/i.test(u)) return null;
  return `https://pannellum.org/api/viewer/?panorama=${encodeURIComponent(u)}&autoLoad=true`;
}
