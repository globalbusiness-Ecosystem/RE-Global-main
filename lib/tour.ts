// The automatic first-visit tour and the "hide the guide card" choice. Both are remembered on this device only
// (browser storage can be blocked or empty, so every read and write is wrapped and the app works without it).
export const TOUR_KEY = 'rg_tour_v1';
export const GUIDE_CARD_KEY = 'rg_guide_card_hidden_v1';
export const TOUR_EVENT = 'rg-start-tour';

function read(key: string): boolean {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1'; } catch { return false; }
}
function write(key: string) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, '1'); } catch { /* storage blocked: the tour may show again next visit */ }
}

export const isTourDone = () => read(TOUR_KEY);
export const markTourDone = () => write(TOUR_KEY);
export const isGuideCardHidden = () => read(GUIDE_CARD_KEY);
export const hideGuideCard = () => write(GUIDE_CARD_KEY);

/** Starts the tour now (from the guide page, say). The tour component on the home page listens for it. */
export function startTour() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TOUR_EVENT));
}

export interface TourStep { target: string | null; title: string; text: string }
