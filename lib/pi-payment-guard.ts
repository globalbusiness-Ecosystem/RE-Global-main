import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError, type AuthenticatedPiUser } from '@/lib/pi-auth';
import { isValidPaymentId, type PiPayment } from '@/lib/contract-guard';

const PI_API = 'https://api.minepi.com/v2';

export interface PaymentContext {
  user: AuthenticatedPiUser;
  paymentId: string;
  payment: PiPayment;
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Authenticates the caller (Pi access token) and checks the payment really
// belongs to them. Returns a ready-made error response, or the verified context.
export async function authorizePayment(
  req: NextRequest,
  paymentId: unknown
): Promise<PaymentContext | NextResponse> {
  if (!isValidPaymentId(paymentId)) return fail(400, 'Invalid paymentId');

  let user: AuthenticatedPiUser;
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    user = await verifyPiAccessToken(token);
  } catch (err) {
    return fail(err instanceof AuthError ? err.status : 401, 'Not authenticated');
  }

  if (!process.env.PI_API_KEY) return fail(500, 'Payments are not configured');

  let payment: PiPayment;
  try {
    const res = await fetch(`${PI_API}/payments/${paymentId}`, {
      headers: { Authorization: `Key ${process.env.PI_API_KEY}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return fail(404, 'Payment not found');
    if (!res.ok) return fail(502, 'Could not verify payment with Pi');
    payment = (await res.json()) as PiPayment;
  } catch {
    return fail(502, 'Could not verify payment with Pi');
  }

  if (!payment.user_uid || payment.user_uid !== user.uid) {
    return fail(403, 'Payment does not belong to this user');
  }
  return { user, paymentId, payment };
}

// Server-to-server call to Pi (approve / complete / cancel).
export async function piPaymentAction(
  paymentId: string,
  action: 'approve' | 'complete' | 'cancel',
  body?: Record<string, unknown>
): Promise<NextResponse> {
  try {
    const res = await fetch(`${PI_API}/payments/${paymentId}/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return fail(502, 'Could not reach Pi');
  }
}
