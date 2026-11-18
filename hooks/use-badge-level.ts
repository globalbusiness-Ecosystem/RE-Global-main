'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/api-token';
import { BADGE_THRESHOLDS, badgeLevelFor, parseBadgeLevel, parseThresholds, type BadgeLevel } from '@/lib/badge-level';

type Mine = { level: BadgeLevel; points: number; thresholds: number[] };
const EMPTY: Mine = { level: 1, points: 0, thresholds: [...BADGE_THRESHOLDS] };

/** The signed-in person's badge level (1 to 7), points and the level thresholds. Level 1 until it arrives. */
export function useMyBadgeLevel(accessToken: string | null | undefined): Mine {
  const [v, setV] = useState<Mine>(EMPTY);
  useEffect(() => {
    if (!accessToken) { setV(EMPTY); return; }
    let off = false;
    fetch('/api/my-rewards', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (off || !j) return;
        const points = typeof j.points === 'number' && Number.isFinite(j.points) ? j.points : 0;
        const thresholds = parseThresholds(j.badgeThresholds) ?? [...BADGE_THRESHOLDS];
        setV({ level: j.badgeLevel ? parseBadgeLevel(j.badgeLevel) : badgeLevelFor(points, thresholds), points, thresholds });
      })
      .catch(() => {});
    return () => { off = true; };
  }, [accessToken]);
  return v;
}
