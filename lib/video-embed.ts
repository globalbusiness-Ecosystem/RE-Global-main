// A video the admin pastes as a link: YouTube, Vimeo, or a direct video file. Anything else (or anything not https) is refused,
// so a stored value can never run code or load a page we did not mean to show.
export type VideoRef = { type: 'youtube'; id: string } | { type: 'vimeo'; id: string } | { type: 'file'; url: string };

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const FILE_EXT = /\.(mp4|webm|m4v|mov)$/i;

export function parseVideoUrl(v: unknown): VideoRef | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s || s.length > 600) return null;
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase();
  if (host === 'youtu.be') { const id = u.pathname.slice(1).split('/')[0]; return YT_ID.test(id) ? { type: 'youtube', id } : null; }
  if (YT_HOSTS.has(host)) {
    const q = u.searchParams.get('v');
    if (q && YT_ID.test(q)) return { type: 'youtube', id: q };
    const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
    return m ? { type: 'youtube', id: m[1] } : null;
  }
  if (host === 'vimeo.com' || host === 'www.vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/(?:^|\/)(\d{5,12})(?:\/|$)/);
    return m ? { type: 'vimeo', id: m[1] } : null;
  }
  return FILE_EXT.test(u.pathname) ? { type: 'file', url: u.toString() } : null;
}

export function embedUrl(r: VideoRef): string | null {
  if (r.type === 'youtube') return `https://www.youtube-nocookie.com/embed/${r.id}?rel=0&playsinline=1&autoplay=1`;
  if (r.type === 'vimeo') return `https://player.vimeo.com/video/${r.id}?autoplay=1`;
  return null;
}

/** A still picture for the card when the admin did not upload one (only YouTube gives one for free). */
export function videoThumb(r: VideoRef): string | null {
  return r.type === 'youtube' ? `https://i.ytimg.com/vi/${r.id}/hqdefault.jpg` : null;
}
