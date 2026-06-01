import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { paymentId } = await req.json();
  
  const response = await fetch(
    `https://api.minepi.com/v2/payments/${paymentId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
      },
    }
  );
  
  const data = await response.json();
  return NextResponse.json(data);
}
