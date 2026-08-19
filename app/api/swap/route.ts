import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken, AuthError } from '@/lib/pi-auth';
import { executeSwap } from '@/lib/market';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    const user = await verifyPiAccessToken(accessToken);

    const body = await req.json().catch(() => null);
    const direction = body?.direction;
    const amountIn = Number(body?.amountIn);
    const minAmountOut = body?.minAmountOut !== undefined ? Number(body.minAmountOut) : 0;

    if (direction !== 'buy' && direction !== 'sell') {
      return NextResponse.json(
        { success: false, error: "direction must be 'buy' or 'sell'" },
        { status: 400 }
      );
    }

    const result = await executeSwap(user, direction, amountIn, minAmountOut);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('[api/swap] unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
