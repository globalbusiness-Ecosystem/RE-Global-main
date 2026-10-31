import { shareUrl } from './share';

export type ShareResult = 'shared' | 'copied' | 'failed' | 'cancelled';

// The browser pieces, injectable so the logic can be tested without a browser.
export interface ShareEnv {
  share?: (data: { title: string; url: string }) => Promise<void>;
  copy?: (text: string) => Promise<void>;
}

/** The phone's share sheet when there is one, otherwise copy the link. Closing the sheet is not an error. */
export async function shareListingLink(env: ShareEnv, title: string, url: string): Promise<ShareResult> {
  const tryCopy = async (): Promise<ShareResult> => {
    try {
      if (!env.copy) return 'failed';
      await env.copy(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  };
  if (!env.share) return tryCopy();
  try {
    await env.share({ title, url });
    return 'shared';
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return 'cancelled';
    return tryCopy();
  }
}

/** The real browser environment (client side only). */
export function browserShareEnv(): ShareEnv {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  return {
    share: nav && typeof nav.share === 'function' ? (d) => nav.share(d) : undefined,
    copy: nav?.clipboard ? (t) => nav.clipboard.writeText(t) : undefined,
  };
}

export { shareUrl };
