/**
 * QR Code Utility Functions
 * Handles QR code generation, validation, batch operations, and printing
 */

interface PropertyQRData {
  propertyId: string;
  propertyName: string;
  price: number;
  city: string;
  bedrooms: number;
  area: number;
  currency?: string;
}

/**
 * Generate QR code URL using QR Server API
 */
export function generatePropertyQRUrl(
  propertyId: string,
  size: number = 512,
  baseUrl?: string
): string {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://re.pi');
  const propertyLink = `${url}?property=${encodeURIComponent(propertyId)}`;
  const encodedUrl = encodeURIComponent(propertyLink);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
}

/**
 * Validate QR code data
 */
export function validateQRData(data: PropertyQRData): boolean {
  return !!(
    data.propertyId &&
    data.propertyName &&
    typeof data.price === 'number' &&
    data.city &&
    typeof data.bedrooms === 'number' &&
    typeof data.area === 'number'
  );
}

/**
 * Generate batch QR codes for multiple properties
 */
export async function generateBatchQRCodes(
  properties: PropertyQRData[]
): Promise<Array<{ propertyId: string; qrUrl: string }>> {
  return properties.map((property) => ({
    propertyId: property.propertyId,
    qrUrl: generatePropertyQRUrl(property.propertyId),
  }));
}

