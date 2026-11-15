// Groups map points that would overlap on screen into one numbered marker (pure maths, no map library needed).

export type MapPoint = { id: string; lat: number; lng: number; type: string };
export type Cluster = { lat: number; lng: number; count: number; ids: string[]; types: Record<string, number>; bounds: [[number, number], [number, number]] };

/** From this zoom on every point is shown on its own. */
export const CLUSTER_MAX_ZOOM = 15;

// Web Mercator, in pixels of the whole world at this zoom (256px tiles).
const project = (lat: number, lng: number, zoom: number) => {
  const scale = 256 * 2 ** zoom;
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return { x: ((lng + 180) / 360) * scale, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale };
};

/** Points closer than `cell` screen pixels at this zoom end up in one cluster; its position is the average of its members. */
export function clusterPoints(points: MapPoint[], zoom: number, cell = 48): Cluster[] {
  const z = Math.round(zoom);
  const groups = new Map<string, MapPoint[]>();
  points.forEach((p, i) => {
    const key = z >= CLUSTER_MAX_ZOOM ? `solo-${i}` : (() => { const q = project(p.lat, p.lng, z); return `${Math.floor(q.x / cell)}:${Math.floor(q.y / cell)}`; })();
    const g = groups.get(key);
    if (g) g.push(p); else groups.set(key, [p]);
  });
  return [...groups.values()].map((g) => {
    const types: Record<string, number> = {};
    for (const p of g) types[p.type] = (types[p.type] ?? 0) + 1;
    const lats = g.map((p) => p.lat), lngs = g.map((p) => p.lng);
    return {
      lat: lats.reduce((a, b) => a + b, 0) / g.length,
      lng: lngs.reduce((a, b) => a + b, 0) / g.length,
      count: g.length, ids: g.map((p) => p.id), types,
      bounds: [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]] as [[number, number], [number, number]],
    };
  });
}

/** The same place listed twice (same type, same spot to ~10 m, same title) is shown once. */
export function dedupeListings<T extends { id: string | number; lat: number; lng: number; type: string; title: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((p) => {
    const k = `${p.type}|${p.lat.toFixed(4)}|${p.lng.toFixed(4)}|${p.title.trim().toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Size of the cluster bubble in px: grows slowly with the count so a big cluster is bigger but never huge. */
export const clusterSize = (count: number): number => Math.round(Math.min(56, 30 + Math.log2(Math.max(1, count)) * 6));
