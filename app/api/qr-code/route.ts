import { NextResponse } from 'next/server';
import { generatePropertyQRUrl, generateBatchQRCodes, validateQRData } from '@/lib/qr-code-utils';

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
  try {
    const body: PropertyQRRequest = await request.json();

    // Validate input
    if (!validateQRData(body as any)) {
      return NextResponse.json(
        { error: 'Invalid property data' },
        { status: 400 }
      );
    }

    const qrUrl = generatePropertyQRUrl(body.propertyId);
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://re.pi'}?property=${body.propertyId}`;

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
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      );
    }

    const qrUrl = generatePropertyQRUrl(propertyId);
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://re.pi'}?property=${propertyId}`;

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
