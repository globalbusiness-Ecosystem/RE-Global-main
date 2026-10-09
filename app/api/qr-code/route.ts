import { NextResponse } from 'next/server';
import { generatePropertyQRUrl, generateBatchQRCodes, validateQRData } from '@/lib/qr-code-utils';
import { consumeRateLimit, clientIp } from '@/lib/rate-limit';

// Public endpoint: limit per IP and accept only simple property ids.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
async function rateLimited(request: Request): Promise<NextResponse | null> {
  const rl = await consumeRateLimit(`qr:${clientIp(request)}`, 60, 10 * 60 * 1000);
  return rl.ok
    ? null
    : NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
}

export interface PropertyQRRequest {
  propertyId: string;
  propertyName: string;
  price: number;
  city: string;
  bedrooms: number;
  area: number;
  currency: string;
}

/**
 * POST /api/qr-code
 * Generate QR code for a single property
 */
export async function POST(request: Request) {
  const limited = await rateLimited(request);
  if (limited) return limited;
  try {
    const body: PropertyQRRequest = await request.json();

    // Validate input
    if (!validateQRData(body as any) || !ID_PATTERN.test(String(body.propertyId))) {
      return NextResponse.json(
        { error: 'Invalid property data' },
        { status: 400 }
      );
    }

    const qrUrl = generatePropertyQRUrl(body.propertyId);
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://re.pi'}?property=${encodeURIComponent(body.propertyId)}`;

    return NextResponse.json({
      success: true,
      propertyId: body.propertyId,
      qrCode: qrUrl,
      shareUrl,
      metadata: {
        property: body.propertyName,
        price: body.price,
        city: body.city,
        bedrooms: body.bedrooms,
        area: body.area,
      },
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qr-code?propertyId=xxx
 * Get QR code for a specific property
 */
export async function GET(request: Request) {
  const limited = await rateLimited(request);
  if (limited) return limited;
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId || !ID_PATTERN.test(propertyId)) {
      return NextResponse.json(
        { error: 'A valid propertyId is required' },
        { status: 400 }
      );
    }

    const qrUrl = generatePropertyQRUrl(propertyId);
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://re.pi'}?property=${encodeURIComponent(propertyId)}`;

    return NextResponse.json({
      success: true,
      propertyId,
      qrCode: qrUrl,
      shareUrl,
    });
  } catch (error) {
    console.error('QR Code retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve QR code' },
      { status: 500 }
    );
  }
}
