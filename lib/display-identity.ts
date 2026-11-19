// What a person sees as "their name" in the app. Web accounts have a technical id ("web_…") that the database
// and the Firestore rules need; it is never shown. A Pi user's own Pi username is a real name and stays.
export function isTechnicalName(name: string | null | undefined): boolean {
  return typeof name === 'string' && name.startsWith('web_');
}

export function friendlyName(input: { username: string | null; displayName?: string | null; handle?: string | null; customName?: string | null }): string | null {
  // A name the person chose inside the platform (unique, see lib/display-name.ts) comes first.
  const chosen = input.customName?.trim();
  if (chosen) return chosen;
  if (input.username && !isTechnicalName(input.username)) return input.username;
  const shown = input.displayName?.trim();
  if (shown) return shown;
  return input.handle || null;
}
