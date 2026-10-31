'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { shareUrl } from '@/lib/share';
import { shareListingLink, browserShareEnv } from '@/lib/share-action';
import { SHARE_I18N } from '@/lib/share-i18n';

// Share button: the phone's share sheet when there is one, otherwise copies the public link.
export function ShareListing({ id, title, language }: { id: string; title: string; language: NavLanguage }) {
  const t = SHARE_I18N[language] ?? SHARE_I18N.en;
  const [note, setNote] = useState('');

  const go = async () => {
    const url = shareUrl(window.location.origin, id, language);
    setNote('');
    const r = await shareListingLink(browserShareEnv(), title, url);
    if (r === 'copied') setNote(t.copied);
    else if (r === 'failed') setNote(t.copyFailed);
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={go} className="inline-flex items-center gap-1 rounded-lg border border-accent px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10">
        <Share2 className="h-4 w-4" aria-hidden="true" />{t.share}
      </button>
      {note && <span className="text-xs text-gray-300" role="status">{note}</span>}
    </span>
  );
}
