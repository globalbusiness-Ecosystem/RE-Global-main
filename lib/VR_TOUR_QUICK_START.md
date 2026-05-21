# VR Tour Quick Start & Examples

## Quick Start (5 minutes)

### 1. Use the Demo

\`\`\`tsx
import { VRTourDemo } from '@/components/vr-tour-demo';

export default function Home() {
  return (
    <div className="p-4">
      <h1>Property Tour</h1>
      <VRTourDemo />
    </div>
  );
}
\`\`\`

Click "Start VR Tour" button to launch the immersive experience.

### 2. Customize Demo Property

Edit `/lib/vr-tour-config.ts`:

\`\`\`typescript
export const DEMO_ROOMS: VRRoom[] = [
  {
    id: 0,
    name: 'Your Room Name',
    imageUrl: 'https://your-cdn.com/your-image.jpg',
    pitch: 0,
    yaw: 0,
    hfov: 100,
    hotspots: [
      createHotspot(0, 90, 1, 'Next Room →'),
    ],
  },
  // Add more rooms...
];
\`\`\`

### 3. Create Custom Property Tour

\`\`\`tsx
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import type { VRPropertyTour } from '@/lib/vr-tour-types';

const myProperty: VRPropertyTour = {
  propertyId: 'beachhouse-001',
  propertyName: 'Malibu Beach House',
  price: 5000000,
  piPrice: 500000,
  rooms: [
    {
      id: 0,
      name: 'Master Bedroom',
      imageUrl: 'https://cdn.example.com/master-bedroom-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        {
          pitch: -15,
          yaw: 90,
          targetRoom: 1,
          text: 'Go to Bathroom →',
          cssClass: 'vr-tour-hotspot',
        },
        {
          pitch: -20,
          yaw: 180,
          targetRoom: 2,
          text: 'Go to Living Room →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
    // ... more rooms
  ],
};

export function TourPage() {
  return (
    <VRPropertyTourViewer
      property={myProperty}
      onClose={() => console.log('Tour closed')}
      onBuyClick={() => console.log('Buy clicked')}
    />
  );
}
\`\`\`

## Examples

### Example 1: Simple Apartment Tour (2 Rooms)

\`\`\`typescript
const simpleApartment: VRPropertyTour = {
  propertyId: 'apt-small-001',
  propertyName: 'Studio Apartment',
  rooms: [
    {
      id: 0,
      name: 'Studio',
      imageUrl: 'https://pannellum.org/images/alma.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        {
          pitch: 0,
          yaw: 90,
          targetRoom: 1,
          text: 'View Kitchen →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
    {
      id: 1,
      name: 'Kitchen',
      imageUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        {
          pitch: 0,
          yaw: 270,
          targetRoom: 0,
          text: 'Back to Studio →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
  ],
};
\`\`\`

### Example 2: Luxury Villa (5 Rooms)

\`\`\`typescript
const luxuryVilla: VRPropertyTour = {
  propertyId: 'villa-luxury-001',
  propertyName: 'Luxury Villa with Pool',
  price: 2000000,
  piPrice: 200000,
  rooms: [
    {
      id: 0,
      name: 'Entrance Foyer',
      imageUrl: 'https://your-cdn.com/foyer-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: 0, yaw: 0, targetRoom: 1, text: 'Living Room →', cssClass: 'vr-tour-hotspot' },
        { pitch: 0, yaw: 90, targetRoom: 2, text: 'Kitchen →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 1,
      name: 'Living Room',
      imageUrl: 'https://your-cdn.com/living-room-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: 0, yaw: 180, targetRoom: 0, text: 'Back to Foyer →', cssClass: 'vr-tour-hotspot' },
        { pitch: 0, yaw: 90, targetRoom: 3, text: 'Master Bedroom →', cssClass: 'vr-tour-hotspot' },
        { pitch: 0, yaw: 270, targetRoom: 4, text: 'Pool Area →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 2,
      name: 'Kitchen',
      imageUrl: 'https://your-cdn.com/kitchen-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: 0, yaw: 180, targetRoom: 0, text: 'Back to Foyer →', cssClass: 'vr-tour-hotspot' },
        { pitch: 0, yaw: 90, targetRoom: 1, text: 'Living Room →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 3,
      name: 'Master Bedroom',
      imageUrl: 'https://your-cdn.com/bedroom-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: 0, yaw: 270, targetRoom: 1, text: 'Back to Living Room →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 4,
      name: 'Pool Area',
      imageUrl: 'https://your-cdn.com/pool-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: 0, yaw: 90, targetRoom: 1, text: 'Back to Living Room →', cssClass: 'vr-tour-hotspot' },
      ],
    },
  ],
};
\`\`\`

### Example 3: Commercial Office Space

\`\`\`typescript
const officeSpace: VRPropertyTour = {
  propertyId: 'office-tech-001',
  propertyName: 'Modern Tech Office',
  price: 1500000,
  piPrice: 150000,
  rooms: [
    {
      id: 0,
      name: 'Reception',
      imageUrl: 'https://your-cdn.com/reception-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: -10, yaw: 0, targetRoom: 1, text: 'Open Floor →', cssClass: 'vr-tour-hotspot' },
        { pitch: -10, yaw: 90, targetRoom: 2, text: 'Conference Rm →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 1,
      name: 'Open Floor',
      imageUrl: 'https://your-cdn.com/openfloor-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: -10, yaw: 180, targetRoom: 0, text: 'Reception →', cssClass: 'vr-tour-hotspot' },
        { pitch: -10, yaw: 90, targetRoom: 3, text: 'Break Room →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 2,
      name: 'Conference Room',
      imageUrl: 'https://your-cdn.com/conference-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: -10, yaw: 180, targetRoom: 0, text: 'Back to Reception →', cssClass: 'vr-tour-hotspot' },
      ],
    },
    {
      id: 3,
      name: 'Break Room',
      imageUrl: 'https://your-cdn.com/breakroom-360.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        { pitch: -10, yaw: 270, targetRoom: 1, text: 'Open Floor →', cssClass: 'vr-tour-hotspot' },
      ],
    },
  ],
};
\`\`\`

## Integration Patterns

### Pattern 1: Property Modal

\`\`\`tsx
import { useState } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';

export function PropertyCard({ property }) {
  const [showTour, setShowTour] = useState(false);

  if (showTour) {
    return (
      <VRPropertyTourViewer
        property={property}
        onClose={() => setShowTour(false)}
        onBuyClick={() => {
          // Integrate with Pi payment SDK
        }}
      />
    );
  }

  return (
    <div className="property-card">
      <img src={property.thumbnail} alt={property.name} />
      <h3>{property.name}</h3>
      <p>{property.piPrice} π</p>
      <button onClick={() => setShowTour(true)}>
        View VR Tour
      </button>
    </div>
  );
}
\`\`\`

### Pattern 2: Dedicated Tour Page

\`\`\`tsx
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { getProperty } from '@/lib/api';

export async function TourPage({ params }) {
  const property = await getProperty(params.id);

  return (
    <VRPropertyTourViewer
      property={property}
      onClose={() => window.history.back()}
      onBuyClick={() => {
        // Trigger checkout or payment flow
      }}
    />
  );
}
\`\`\`

### Pattern 3: API Integration

\`\`\`tsx
async function fetchPropertyTour(propertyId: string) {
  const response = await fetch(`/api/properties/${propertyId}/tour`);
  return response.json(); // Returns VRPropertyTour
}

// In component:
const property = await fetchPropertyTour('prop-001');
\`\`\`

## Tips & Best Practices

### Image Tips
- Use professional 360° camera photos
- Shoot at different times of day for variety
- Include all rooms and outdoor spaces
- Ensure good lighting for clarity
- Stitch images properly to avoid distortion

### Hotspot Tips
- Place hotspots at doorways or transitions
- Use consistent yaw angles for similar room connections
- Keep pitch values between -20° and 0° for doorways
- Test hotspot positions in Pannellum debug mode
- Include return hotspots for easy navigation

### UX Tips
- Keep rooms count between 3-8 for best experience
- Show room names clearly when transitioning
- Allow auto-rotation to showcase rooms
- Provide multiple navigation methods
- Test on mobile devices

### Performance Tips
- Compress images to 1-2MB each
- Host images on CDN
- Preload adjacent room images
- Disable auto-rotate on mobile if needed
- Lazy-load hotspots when entering rooms
