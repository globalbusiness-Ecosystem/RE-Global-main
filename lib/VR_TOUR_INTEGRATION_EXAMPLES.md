# VR Tour Integration Examples

## Complete Implementation Example

### Step 1: Define Your Property Data

Create `/data/properties/beachhouse.ts`:

\`\`\`typescript
import { VRPropertyTour } from '@/lib/vr-tour-types';

export const beachHouse: VRPropertyTour = {
  propertyId: 'beach-001',
  propertyName: 'Beachfront Villa',
  price: 3500000,
  piPrice: 350000,
  rooms: [
    {
      id: 0,
      name: 'Master Bedroom',
      imageUrl: 'https://your-cdn.com/images/master-bedroom-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        {
          pitch: -15,
          yaw: 90,
          targetRoom: 1,
          text: 'Bathroom →',
          cssClass: 'vr-tour-hotspot',
        },
        {
          pitch: -20,
          yaw: 0,
          targetRoom: 2,
          text: 'Ocean View →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
    {
      id: 1,
      name: 'Bathroom',
      imageUrl: 'https://your-cdn.com/images/bathroom-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 95,
      hotspots: [
        {
          pitch: -15,
          yaw: 270,
          targetRoom: 0,
          text: 'Back to Bedroom →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
    {
      id: 2,
      name: 'Ocean View Terrace',
      imageUrl: 'https://your-cdn.com/images/terrace-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 120,
      hotspots: [
        {
          pitch: 0,
          yaw: 180,
          targetRoom: 0,
          text: 'Back to Bedroom →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
  ],
};
\`\`\`

### Step 2: Create Property Page

Create `/app/properties/[id]/page.tsx`:

\`\`\`typescript
'use client';

import { useState } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { beachHouse } from '@/data/properties/beachhouse';
import { Button } from '@/components/ui/button';

export default function PropertyPage() {
  const [showVRTour, setShowVRTour] = useState(false);

  if (showVRTour) {
    return (
      <VRPropertyTourViewer
        property={beachHouse}
        onClose={() => setShowVRTour(false)}
        onBuyClick={() => {
          // Handle Pi payment
          console.log('Initiating purchase...');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {beachHouse.propertyName}
          </h1>
          <p className="text-xl text-accent font-semibold">
            {beachHouse.piPrice?.toLocaleString()} π
          </p>
        </div>

        {/* VR Tour Button */}
        <Button
          onClick={() => setShowVRTour(true)}
          size="lg"
          className="bg-accent hover:opacity-90 mb-8"
        >
          Start VR Tour
        </Button>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
            <p className="text-muted-foreground">
              Stunning beachfront villa with 3 spacious rooms overlooking the ocean.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Features</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Ocean views from every room</li>
              <li>• Private beach access</li>
              <li>• Modern amenities</li>
              <li>• Smart home system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

### Step 3: Add to Property Card Component

Update existing property card:

\`\`\`typescript
'use client';

import { useState } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import type { VRPropertyTour } from '@/lib/vr-tour-types';

interface PropertyCardProps {
  property: VRPropertyTour;
  thumbnail: string;
}

export function PropertyCard({ property, thumbnail }: PropertyCardProps) {
  const [showTour, setShowTour] = useState(false);

  if (showTour) {
    return (
      <VRPropertyTourViewer
        property={property}
        onClose={() => setShowTour(false)}
      />
    );
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg">
      <img src={thumbnail} alt={property.propertyName} className="w-full h-48 object-cover" />

      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-2">
          {property.propertyName}
        </h3>

        <p className="text-accent font-semibold mb-4">
          {property.piPrice?.toLocaleString()} π
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTour(true)}
            className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded hover:opacity-90 transition-opacity"
          >
            VR Tour
          </button>
          <button className="flex-1 px-4 py-2 border border-accent text-accent rounded hover:bg-accent/10">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\`

## API Integration Example

### Backend Setup

Create `/app/api/properties/[id]/tour/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { VRPropertyTour } from '@/lib/vr-tour-types';

// Mock database - replace with real DB
const properties: Record<string, VRPropertyTour> = {
  'beach-001': {
    propertyId: 'beach-001',
    propertyName: 'Beachfront Villa',
    rooms: [
      // ... room data
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = properties[params.id];

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
\`\`\`

### Client-Side Usage

\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import type { VRPropertyTour } from '@/lib/vr-tour-types';

export function DynamicPropertyPage({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<VRPropertyTour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`/api/properties/${propertyId}/tour`);
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Failed to fetch property:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return <div>Loading property...</div>;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <VRPropertyTourViewer
      property={property}
      onClose={() => window.history.back()}
      onBuyClick={() => {
        console.log('Purchase:', property.propertyId);
      }}
    />
  );
}
\`\`\`

## Pi Payment Integration

### Step 1: Install Pi SDK

\`\`\`bash
npm install pi
\`\`\`

### Step 2: Create Payment Handler

Create `/lib/pi-payment.ts`:

\`\`\`typescript
export async function initiatePropertyPurchase(
  propertyId: string,
  propertyName: string,
  piAmount: number
) {
  try {
    // Assuming Pi SDK is available globally
    if (!window.pi) {
      throw new Error('Pi SDK not initialized');
    }

    const payment = await window.pi.payments.createPayment({
      amount: piAmount,
      memo: `Purchase: ${propertyName}`,
      metadata: {
        propertyId,
        timestamp: new Date().toISOString(),
      },
    });

    // Submit to backend for verification
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.identifier,
        propertyId,
        amount: piAmount,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return { success: true, paymentId: payment.identifier };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error };
  }
}
\`\`\`

### Step 3: Update VR Viewer

\`\`\`typescript
import { initiatePropertyPurchase } from '@/lib/pi-payment';

export function PropertyPage() {
  const handleBuy = async () => {
    const result = await initiatePropertyPurchase(
      property.propertyId,
      property.propertyName,
      property.piPrice!
    );

    if (result.success) {
      alert('Payment successful!');
      // Redirect to confirmation page
    } else {
      alert('Payment failed');
    }
  };

  return (
    <VRPropertyTourViewer
      property={property}
      onClose={() => {}}
      onBuyClick={handleBuy}
    />
  );
}
\`\`\`

## Advanced: Programmatic Tour Generation

\`\`\`typescript
import {
  createLinearTour,
  createCircularTour,
  createPropertyTour,
} from '@/lib/vr-tour-utils';

// Generate from API data
async function buildPropertyTour(propertyData: any) {
  const rooms = propertyData.rooms.map((room: any) => ({
    name: room.name,
    imageUrl: room.panoramaUrl,
  }));

  // Create linear or circular tour
  const tour =
    propertyData.layout === 'circular'
      ? createCircularTour(
          propertyData.id,
          propertyData.name,
          rooms
        )
      : createLinearTour(propertyData.id, propertyData.name, rooms);

  return tour;
}
\`\`\`

## Testing

\`\`\`typescript
import { validatePropertyTour } from '@/lib/vr-tour-utils';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

// Test demo property
const validation = validatePropertyTour(DEMO_PROPERTY);
console.log('Valid:', validation.isValid);
console.log('Errors:', validation.errors);
\`\`\`
