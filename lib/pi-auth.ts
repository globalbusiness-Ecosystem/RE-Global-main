import 'server-only';

const BRAND: unique symbol = Symbol('AuthenticatedPiUser');

export interface AuthenticatedPiUser {
  readonly [BRAND]: true;
  readonly uid: string;
  readonly username: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

interface PiMeResponse {
  uid: string;
  username: string;
}

const PI_ME_ENDPOINT = 'https://api.minepi.com/v2/me';

export async function verifyPiAccessToken(accessToken: unknown): Promise<AuthenticatedPiUser> {
  if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
    throw new AuthError('Missing or malformed Pi access token');
  }

  let res: Response;
  try {
    res = await fetch(PI_ME_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
  } catch (err) {
    throw new AuthError('Could not reach Pi Platform API to verify identity', 503);
  }

  if (res.status === 401) {
    throw new AuthError('Pi access token is invalid or expired');
  }
  if (!res.ok) {
    throw new AuthError(`Pi Platform API returned an unexpected status: ${res.status}`, 502);
  }

  const me = (await res.json()) as Partial<PiMeResponse>;
  if (!me.uid || !me.username) {
    throw new AuthError('Pi Platform API returned a malformed /v2/me response', 502);
  }

  return { [BRAND]: true, uid: me.uid, username: me.username } as AuthenticatedPiUser;
}
