import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { paymentId } = await req.json();

  const response = await fetch(
    `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
