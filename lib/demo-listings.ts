// The built-in sample listings (the cards that ship with the app) can be hidden from visitors by the admin.
// Anything other than an explicit `false` keeps them visible, so a missing or broken setting never empties the pages.
export function parseShowDemo(v: unknown): boolean {
  return v !== false;
}
