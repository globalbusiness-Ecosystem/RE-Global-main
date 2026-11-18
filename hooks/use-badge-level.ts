'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/api-token';
import { badgeLevelFor, parseBadgeLevel, type BadgeLevel } from '@/lib/badge-level';

/** The signed-in person's badge level (1 to 7) and points. Level 1 until it arrives. */
export function useMyBadgeLevel(accessToken: string | null | undefined): { level: BadgeLevel; points: number } {
  const [v, setV] = useState<{ level: BadgeLevel; points: number }>({ level: 1, points: 0 });
  useEffect(() => {
    if (!accessToken) { setV({ level: 1, points: 0 }); return; }
    let off = false;
    fetch('/api/my-rewards', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (off || !j) return;
        const points = typeof j.points === 'number' && Number.isFinite(j.points) ? j.points : 0;
        setV({ level: j.badgeLevel ? parseBadgeLevel(j.badgeLevel) : badgeLevelFor(points), points });
      })
      .catch(() => {});
    return () => { off = true; };
  }, [accessToken]);
  return v;
}
