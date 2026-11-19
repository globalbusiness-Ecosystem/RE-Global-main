'use client';

import { useEffect, useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useIdentity } from '@/hooks/use-identity';
import { useCelebration } from '@/hooks/use-celebration';
import { useFounder, useIsFounder } from '@/hooks/use-founder';
import { useMyBadgeLevel } from '@/hooks/use-badge-level';
import { useFirebaseDatabase } from '@/lib/firebase-database';
import { CelebrationOverlay } from '@/components/celebration-overlay';
import { greetingFor, shouldCelebrate, type CelebrationKind } from '@/lib/celebration';
import type { BadgeLevel } from '@/lib/badge-level';

const key = (kind: CelebrationKind, who: string) => `rg_celeb_${kind}_${who}`;
const readMs = (k: string): number | null => { try { const v = localStorage.getItem(k); const n = v ? Number(v) : NaN; return Number.isFinite(n) ? n : null; } catch { return null; } };
const seenSession = (k: string): boolean => { try { return sessionStorage.getItem(k) === '1'; } catch { return false; } };

/**
 * Mounted once for the whole app. When a person's identity is verified (or the signed-in account is the founder's), it plays the
 * celebration the admin set up, as often as the admin chose (once, once a day, or once per visit).
 */
export function CelebrationHost() {
  const { accessToken, username, isPiVerified, isInitialized } = usePiAuth();
  const { language } = useLanguage();
  const { isWebAccount, kycApproved, name } = useIdentity();
  const isFounder = useIsFounder(accessToken);
  const founder = useFounder();
  const my = useMyBadgeLevel(accessToken);
  const settings = useCelebration();
  const { getProfile } = useFirebaseDatabase();
  const [piVerified, setPiVerified] = useState(false);
  const [show, setShow] = useState<CelebrationKind | null>(null);

  useEffect(() => {
    if (!username || isWebAccount || !isPiVerified) { setPiVerified(false); return; }
    let off = false;
    getProfile(username).then((p) => { if (!off) setPiVerified(Boolean(p && p.emailVerified)); }).catch(() => { if (!off) setPiVerified(false); });
    return () => { off = true; };
  }, [username, isWebAccount, isPiVerified, getProfile]);

  const verified = isWebAccount ? kycApproved : piVerified;
  const kind: CelebrationKind | null = isFounder ? 'founder' : verified ? 'user' : null;

  useEffect(() => {
    if (!isInitialized || !username || !settings || !settings.enabled || !kind) return;
    const s = settings[kind];
    if (!s.enabled) return;
    const k = key(kind, username);
    if (!shouldCelebrate(s.frequency, readMs(k), seenSession(k + '_s'))) return;
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(k, String(Date.now())); sessionStorage.setItem(k + '_s', '1'); } catch { /* private mode */ }
      setShow(kind);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [isInitialized, username, settings, kind]);

  if (!show || !settings) return null;
  const level = (show === 'founder' ? founder.badgeLevel : my.level) as BadgeLevel;
  return <CelebrationOverlay kind={show} language={language} level={level} name={name} settings={settings[show]} greeting={show === 'founder' ? greetingFor(settings, language) : undefined} onClose={() => setShow(null)} />;
}
