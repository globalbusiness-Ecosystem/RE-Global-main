/**
 * QR Code Utility Functions
 * Handles QR code generation, validation, batch operations, and printing
 */

export interface PropertyQRData {
  propertyId: string;
  propertyName: string;
  price: number;
  city: string;
  bedrooms: number;
  area: number;
  currency?: string;
}

export interface PrintQROptions {
  propertyId: string;
  propertyName: string;
  price: number;
  city: string;
  bedrooms: number;
  area: number;
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
  const propertyLink = `${url}?property=${propertyId}`;
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
 * Download QR code as image
 */
export async function downloadQRCode(
  qrImageUrl: string,
  propertyId: string
): Promise<void> {
  try {
    const response = await fetch(qrImageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${propertyId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download QR code:', error);
    throw error;
  }
}

/**
 * Copy QR code URL to clipboard
 */
export async function copyQRCodeToClipboard(propertyId: string): Promise<boolean> {
  try {
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://re.pi'}?property=${propertyId}`;
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
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

/**
 * Print QR code with property details
 */
export function printQRCode(
  qrImageUrl: string,
  options: PrintQROptions
): void {
  const printWindow = window.open('', '', 'height=500,width=500');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Code - ${options.propertyName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        .qr-code {
          margin: 20px 0;
          display: inline-block;
        }
        .qr-code img {
          width: 300px;
          height: 300px;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 10px;
          background: white;
        }
        .property-info {
          margin-top: 20px;
          border-top: 2px solid #f59e0b;
          padding-top: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 14px;
        }
        h2 {
          color: #030712;
          margin-bottom: 10px;
        }
        .price {
          font-size: 18px;
          font-weight: bold;
          color: #f59e0b;
          margin: 10px 0;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${options.propertyName}</h2>
        <div class="qr-code">
          <img src="${qrImageUrl}" alt="QR Code" />
        </div>
        <div class="property-info">
          <div class="price">π${options.price}</div>
          <div class="info-row">
            <span>Location:</span>
            <strong>${options.city}</strong>
          </div>
          <div class="info-row">
            <span>Bedrooms:</span>
            <strong>${options.bedrooms}</strong>
          </div>
          <div class="info-row">
            <span>Area:</span>
            <strong>${options.area} m²</strong>
          </div>
          <div class="info-row">
            <span>Property ID:</span>
            <strong>${options.propertyId}</strong>
          </div>
        </div>
      </div>
      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Create shareable link for property
 */
export function createShareableLink(propertyId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://re.pi';
  return `${baseUrl}?property=${propertyId}`;
}

/**
 * Format QR code data for export
 */
export function formatQRDataForExport(
  properties: PropertyQRData[]
): string {
  return properties
    .map(
      (p) =>
        `${p.propertyId},${p.propertyName},${p.price},${p.city},${p.bedrooms},${p.area}`
    )
    .join('\n');
}

/**
 * Generate QR code metadata
 */
export function generateQRMetadata(data: PropertyQRData): {
  title: string;
  description: string;
  url: string;
} {
  return {
    title: data.propertyName,
    description: `${data.bedrooms} bedroom property in ${data.city} - π${data.price}`,
    url: createShareableLink(data.propertyId),
  };
}
