'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import type { AvatarState } from '@/components/user-avatar';

type Result = 'ok' | 'failed';

// Loads and saves the signed-in user's private profile picture.
export function useMyAvatar() {
  const { accessToken } = usePiAuth();
  const [avatar, setAvatar] = useState<AvatarState | null>(null);

  useEffect(() => {
    if (!accessToken) { setAvatar(null); return; }
    let live = true;
    fetch('/api/my-avatar', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (live) setAvatar(j && j.avatar ? j.avatar : null); })
      .catch(() => {});
    return () => { live = false; };
  }, [accessToken]);

  const save = useCallback(async (payload: { preset: string } | { photo: string }): Promise<Result> => {
    if (!accessToken) return 'failed';
    try {
      const r = await fetch('/api/my-avatar', { method: 'PUT', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) return 'failed';
      const j = await r.json();
      setAvatar(j.avatar || payload);
      return 'ok';
    } catch { return 'failed'; }
  }, [accessToken]);

  const remove = useCallback(async (): Promise<Result> => {
    if (!accessToken) return 'failed';
    try {
      const r = await fetch('/api/my-avatar', { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
      if (!r.ok) return 'failed';
      setAvatar(null);
      return 'ok';
    } catch { return 'failed'; }
  }, [accessToken]);

  return { avatar, save, remove, signedIn: Boolean(accessToken) };
}
