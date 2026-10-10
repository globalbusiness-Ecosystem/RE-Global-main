# VR Property Tour - Pannellum Integration Guide

## Overview

The VR Property Tour system provides a complete multi-room virtual tour experience using the Pannellum library. Users can explore different rooms with smooth transitions, navigate using interactive hotspots, and jump directly to any room.

## Features

✓ **Multi-Room Navigation**: Connect 4-5 rooms in sequence
✓ **Interactive Hotspots**: Glowing arrows inside panoramas pointing to next rooms
✓ **Smooth Transitions**: Animated camera movements between rooms
✓ **Drag to Explore**: Mouse/touch drag support for panorama exploration
✓ **Pinch to Zoom**: Mobile pinch-to-zoom functionality
✓ **Fullscreen Mode**: Immersive fullscreen viewing
✓ **Mini Room Bar**: Quick-jump navigation bar at bottom
✓ **Room Labels**: Display room name at top left
✓ **Buy with Pi**: Always-visible purchase button at bottom
✓ **Demo Images**: Pre-configured with Pannellum sample images

## Architecture

### Files

\`\`\`
/lib/
  ├── vr-tour-types.ts          # TypeScript interfaces
  ├── vr-tour-config.ts         # Demo rooms, hotspots, styling
/components/
  ├── vr-property-tour-viewer.tsx   # Main viewer component
  ├── vr-tour-demo.tsx              # Demo/example component
\`\`\`

### Component Structure

#### VRPropertyTourViewer
Main component that:
- Loads Pannellum library from CDN
- Manages room state and transitions
- Handles hotspot interactions
- Renders custom UI controls

#### VRTourDemo
Simple demo wrapper showing how to use the viewer with default demo property.

## Usage

### Basic Implementation

\`\`\`tsx
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

export function MyPropertyPage() {
  return (
    <VRPropertyTourViewer
      property={DEMO_PROPERTY}
      onClose={() => {/* handle close */}}
      onBuyClick={() => {/* handle buy */}}
    />
  );
}
\`\`\`

### Custom Property Data

\`\`\`tsx
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import type { VRPropertyTour } from '@/lib/vr-tour-types';

const myProperty: VRPropertyTour = {
  propertyId: 'prop-001',
  propertyName: 'Modern Apartment',
  price: 250000,
  piPrice: 25000,
  rooms: [
    {
      id: 0,
      name: 'Living Room',
      imageUrl: 'https://example.com/living-room.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        {
          pitch: 0,
          yaw: 90,
          targetRoom: 1,
          text: 'Go to Kitchen →',
          cssClass: 'vr-tour-hotspot',
        },
      ],
    },
    // ... more rooms
  ],
};

export function PropertyTour() {
  return (
    <VRPropertyTourViewer
      property={myProperty}
      onClose={() => {}}
      onBuyClick={() => {}}
    />
  );
}
\`\`\`

## Customization

### Room Configuration

Each room requires:

\`\`\`tsx
interface VRRoom {
  id: number;                    // Unique identifier
  name: string;                  // Room display name
  imageUrl: string;             // 360° equirectangular image URL
  pitch?: number;               // Initial vertical angle (0 = horizon)
  yaw?: number;                 // Initial horizontal angle (0 = front)
  hfov?: number;                // Horizontal field of view (50-120)
  hotspots: Hotspot[];          // Navigation hotspots
}
\`\`\`

### Hotspot Configuration

\`\`\`tsx
interface Hotspot {
  pitch: number;                // Vertical position (-90 to 90)
  yaw: number;                  // Horizontal position (0-360)
  targetRoom: number;           // Room index to navigate to
  text: string;                 // Tooltip text
  cssClass: string;             // CSS class for styling
}
\`\`\`

### Hotspot Positioning Guide

**Finding Hotspot Coordinates:**

1. Open the panorama in Pannellum debug mode
2. Hover over desired positions
3. Note the pitch and yaw values
4. Use these coordinates in your hotspot definitions

**Common Positions:**
- `yaw: 0°` = Front/Forward
- `yaw: 90°` = Right
- `yaw: 180°` = Behind
- `yaw: 270°` = Left
- `pitch: -20°` = Upper area (walls, doorways)
- `pitch: 0°` = Eye level (horizon)
- `pitch: 20°` = Lower area (floor)

### Styling Hotspots

Hotspots use CSS animations defined in `HOTSPOT_ANIMATION`. Customize by modifying:

\`\`\`typescript
// In vr-tour-config.ts
.pnlm-hotspot {
  width: 50px;                              // Size
  background-color: rgba(245, 158, 11, 0.3); // Base color
  border: 2px solid #F59E0B;                 // Border color
  animation: pulse-glow 2s ease-in-out infinite; // Animation
  box-shadow: ...; // Glow effect
}
\`\`\`

## Integration Points

### Property Modal / Tour Button

Add to your property card:

\`\`\`tsx
import { VRTourDemo } from '@/components/vr-tour-demo';

export function PropertyCard() {
  return (
    <div>
      {/* Property details */}
      <VRTourDemo />
    </div>
  );
}
\`\`\`

### Payment Integration

Connect to Pi payment:

\`\`\`tsx
const handleBuyClick = async () => {
  // Call Pi SDK payment
  const result = await piSdk.startPayment({
    amount: property.piPrice,
    memo: `Property Purchase: ${property.propertyName}`,
    metadata: { propertyId: property.propertyId }
  });
};
\`\`\`

## Performance Optimization

### Image Optimization
- Use equirectangular format (.jpg or .png)
- Recommended: 4096x2048 pixels for high quality
- Compress to 1-2MB using tools like ImageOptim
- CDN hosting recommended for fast loading

### Pannellum Configuration
\`\`\`typescript
const config = {
  minHfov: 50,      // Minimum zoom level
  maxHfov: 120,     // Maximum zoom level
  friction: 0.05,   // Drag resistance (lower = smoother)
  autoRotate: -2,   // Rotation speed (-5 to 5, negative = CCW)
};
\`\`\`

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Mobile: Touch drag and pinch zoom supported

## Troubleshooting

### Images Not Loading
- Verify CORS headers on CDN
- Check image URLs are publicly accessible
- Use `crossOrigin="anonymous"` in Image elements

### Hotspots Not Appearing
- Verify pitch/yaw values are within valid ranges
- Check room hotspots array is not empty
- Ensure targetRoom index is valid

### Slow Performance
- Reduce image resolution
- Disable auto-rotate on mobile
- Reduce hotspot count per room

## Future Enhancements

- [ ] Property data from API/database
- [ ] Real property images
- [ ] Floorplan overlay
- [ ] Measurement tools
- [ ] Annotation system
- [ ] Video walkthrough support
- [ ] 3D model support
- [ ] Analytics/heatmap
- [ ] Social sharing
- [ ] AR preview on mobile

## API Reference

### VRPropertyTourViewerProps

\`\`\`typescript
interface VRPropertyTourViewerProps {
  property?: VRPropertyTour;     // Property data (default: DEMO_PROPERTY)
  onClose: () => void;           // Close handler
  onBuyClick?: () => void;       // Buy button handler
}
\`\`\`

### DEMO_PROPERTY

Pre-configured demo with 5 connected rooms using Pannellum sample images. Perfect for testing and demonstrations.

### DEMO_ROOMS

Array of 5 rooms with hotspot configurations:
1. Living Room (hotspots to Bedroom, Bathroom)
2. Bedroom (hotspots to Kitchen, Living Room)
3. Kitchen (hotspots to Bathroom, Bedroom)
4. Bathroom (hotspots to Kitchen, Living Room)
5. Living Room (loop back to start)
