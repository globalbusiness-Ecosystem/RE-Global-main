import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { uid, amount, memo } = await req.json();
  
  const response = await fetch(
    'https://api.minepi.com/v2/payments',
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: {
          amount,
          memo: memo || 'RE Platform Reward',
          metadata: { type: 'app_to_user' },
          uid,
        }
      }),
    }
  );
  
  const data = await response.json();
  return NextResponse.json(data);
}
