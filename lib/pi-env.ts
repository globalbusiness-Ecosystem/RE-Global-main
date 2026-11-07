// The Pi SDK script is loaded on every page (app/layout.tsx), so window.Pi exists in Chrome too.
// The real Pi Browser is recognised by its user agent, or by the app being framed (Pi sandbox / Pi app host).
export function isPiBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (/PiBrowser/i.test(navigator.userAgent)) return true;
    return window.self !== window.top;
  } catch {
    return true; // cross-origin access to window.top throws only when framed
  }
}
