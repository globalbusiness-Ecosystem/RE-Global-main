// Client-side holder for the Pi access token so non-React helpers can authenticate API calls.
let token: string | null = null;

export function setApiToken(t: string | null) {
  token = t;
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}
