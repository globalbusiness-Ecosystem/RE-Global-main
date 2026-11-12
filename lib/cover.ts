// The coloured banner behind the profile picture. Pure data and helpers, shared by Settings and the picker.
export const COVERS = [
  { id: 'aurora', from: '#d4a73a', via: '#8b5cf6', to: '#2a1b5e' },
  { id: 'midnight', from: '#1e1b4b', via: '#5b21b6', to: '#0f0a24' },
  { id: 'ember', from: '#f59e0b', via: '#dc2626', to: '#4c1d95' },
  { id: 'ocean', from: '#06b6d4', via: '#4f46e5', to: '#1e1b4b' },
  { id: 'emerald', from: '#34d399', via: '#0f766e', to: '#1e1b4b' },
  { id: 'rose', from: '#f472b6', via: '#9333ea', to: '#1e1b4b' },
] as const;

export type CoverId = (typeof COVERS)[number]['id'];
export const DEFAULT_COVER: CoverId = 'aurora';

export function isCoverId(id: unknown): id is CoverId {
  return typeof id === 'string' && COVERS.some((c) => c.id === id);
}

export function coverCss(id: string): string {
  const c = COVERS.find((x) => x.id === id) ?? COVERS[0];
  return `radial-gradient(120% 140% at 85% 0%, ${c.from}cc 0%, transparent 55%), linear-gradient(135deg, ${c.via} 0%, ${c.to} 100%)`;
}
