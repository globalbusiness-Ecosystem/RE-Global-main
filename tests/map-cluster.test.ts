import { describe, it, expect } from 'vitest';
import { clusterPoints, dedupeListings, clusterSize, CLUSTER_MAX_ZOOM } from '@/lib/map-cluster';
import { MAP_UI } from '@/lib/map-ui-i18n';

const P = (id: string, lat: number, lng: number, type = 'buy') => ({ id, lat, lng, type });

describe('clusterPoints', () => {
  it('puts neighbouring points into one numbered cluster at a low zoom', () => {
    const c = clusterPoints([P('a', 48.8566, 2.3522), P('b', 48.86, 2.35), P('c', 51.5, -0.12)], 3);
    expect(c.map((x) => x.count).sort()).toEqual([3]);
  });
  it('keeps far-apart places separate and counts the types', () => {
    const c = clusterPoints([P('a', 48.85, 2.35, 'buy'), P('b', 48.86, 2.36, 'rent'), P('c', -33.9, 151.2, 'buy')], 6);
    expect(c).toHaveLength(2);
    const paris = c.find((x) => x.count === 2)!;
    expect(paris.types).toEqual({ buy: 1, rent: 1 });
    expect(paris.ids.sort()).toEqual(['a', 'b']);
  });
  it('shows every point alone from the max zoom, even when they sit on the same spot', () => {
    const c = clusterPoints([P('a', 48.85, 2.35), P('b', 48.85, 2.35)], CLUSTER_MAX_ZOOM);
    expect(c).toHaveLength(2);
  });
  it('zooming in splits a cluster up', () => {
    const pts = [P('a', 41.3874, 2.169), P('b', 41.3851, 2.1734), P('c', 41.4, 2.2)];
    expect(clusterPoints(pts, 4).length).toBeLessThan(clusterPoints(pts, 13).length + 1);
    expect(clusterPoints(pts, 4)).toHaveLength(1);
    expect(clusterPoints(pts, 14).length).toBeGreaterThan(1);
  });
  it('the cluster sits at the average and its bounds cover every member', () => {
    const [c] = clusterPoints([P('a', 10, 20), P('b', 10.2, 20.2)], 2);
    expect(c.lat).toBeCloseTo(10.1);
    expect(c.bounds).toEqual([[10, 20], [10.2, 20.2]]);
  });
  it('handles an empty list and a bubble size that stays reasonable', () => {
    expect(clusterPoints([], 3)).toEqual([]);
    expect(clusterSize(1)).toBeGreaterThanOrEqual(30);
    expect(clusterSize(100000)).toBeLessThanOrEqual(56);
  });
});

describe('dedupeListings', () => {
  it('drops the same listing seen twice but keeps different ones on the same spot', () => {
    const a = { id: 1, lat: 48.8566, lng: 2.3522, type: 'buy', title: 'Paris Flat' };
    const out = dedupeListings([a, { ...a, id: 2, title: ' paris flat ' }, { ...a, id: 3, type: 'rent' }, { ...a, id: 4, title: 'Other' }]);
    expect(out.map((x) => x.id)).toEqual([1, 3, 4]);
  });
});

describe('map controls text', () => {
  it('exists in all seven languages', () => {
    for (const [k, row] of Object.entries(MAP_UI)) expect(Object.values(row).filter(Boolean), k).toHaveLength(7);
  });
});
