# VR Property Tour System Documentation

## Overview

The VR Property Tour system provides a complete 360° virtual tour experience for properties using the Pannellum library. Users can explore multiple connected rooms with interactive hotspots, smooth navigation, and a sleek UI optimized for mobile and desktop.

## Features

### ✨ Core Features
- **Multi-Room Navigation**: Connect unlimited rooms with clickable hotspots
- **Interactive Hotspots**: Glowing arrows with smooth animations guide navigation
- **Room Navigation Bar**: Quick-access dots at bottom to jump to any room
- **Panoramic Exploration**: Drag to explore, pinch to zoom, fullscreen mode
- **Smooth Transitions**: Animated room transitions with loading states
- **Responsive Design**: Mobile-first design that works on all devices
- **Buy Integration**: Always-visible purchase button with Pi currency

### 🎨 UI Components
- Room name display (top left)
- Navigation bar (bottom center) with prev/next arrows and room indicators
- Buy button (bottom left) with price display
- Fullscreen toggle (bottom right)
- Loading states and transitions
- Hotspot pulse animations

## File Structure

\`\`\`
components/
  └── vr-property-tour.tsx          # Main VR tour component
  └── vr-tour-example.tsx           # Example integration
  
hooks/
  └── use-vr-tour.ts                # VR tour state management hook
  
lib/
  └── vr-property-config.ts         # Configuration and data structures
\`\`\`

## Usage

### Basic Setup

\`\`\`tsx
import { VRPropertyTour } from '@/components/vr-property-tour';
import { useVRTour } from '@/hooks/use-vr-tour';
import { EXAMPLE_LUXURY_APARTMENT } from '@/lib/vr-property-config';

export const MyPropertyPage = () => {
  const { isOpen, currentTour, openTour, closeTour } = useVRTour();

  return (
    <div>
      <button onClick={() => openTour(EXAMPLE_LUXURY_APARTMENT)}>
        Launch VR Tour
      </button>

      {isOpen && currentTour && (
        <VRPropertyTour
          propertyId={currentTour.propertyId}
          rooms={currentTour.rooms}
          onClose={closeTour}
          onBuyClick={() => console.log('Buy clicked')}
        />
      )}
    </div>
  );
};
\`\`\`

### Creating Custom Property Tours

\`\`\`tsx
import { createPropertyTour } from '@/lib/vr-property-config';

const myPropertyTour = createPropertyTour(
  'property-001',
  'My Luxury Home',
  [
    {
      id: 'living-room',
      name: 'Living Room',
      imageUrl: 'https://example.com/living-room-360.jpg',
      features: ['45 sqm', 'City view'],
      connections: [
        { targetRoomId: 'bedroom', yaw: 90 },
        { targetRoomId: 'kitchen', yaw: 180 },
      ],
    },
    {
      id: 'bedroom',
      name: 'Master Bedroom',
      imageUrl: 'https://example.com/bedroom-360.jpg',
      features: ['32 sqm', 'Ensuite'],
      connections: [
        { targetRoomId: 'living-room', yaw: 270 },
      ],
    },
    // ... more rooms
  ]
);
\`\`\`

## Data Structures

### Room Object

\`\`\`typescript
interface Room {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  imageUrl: string;              // 360° equirectangular image URL
  description?: string;          // Optional room description
  features?: string[];           // Optional features list
  hotspots: Hotspot[];          // Navigation hotspots
}
\`\`\`

### Hotspot Object

\`\`\`typescript
interface Hotspot {
  id: string;                    // Unique identifier
  pitch: number;                 // Vertical angle (-90 to 90)
  yaw: number;                   // Horizontal angle (0 to 360)
  targetRoomId: string;         // Target room ID
  title: string;                // Display text
  icon?: string;                // Optional icon
}
\`\`\`

## Hotspot Positioning

Hotspots are positioned using spherical coordinates:

- **Yaw (0-360°)**: Horizontal rotation
  - `0°` = Forward (north)
  - `90°` = Right (east)
  - `180°` = Backward (south)
  - `270°` = Left (west)

- **Pitch (-90 to 90)**: Vertical rotation
  - `0°` = Horizontal center
  - `45°` = Looking up
  - `-45°` = Looking down
  - `90°` = Straight up
  - `-90°` = Straight down

### Common Positions

Use `COMMON_HOTSPOT_POSITIONS` for quick setup:

\`\`\`tsx
import { COMMON_HOTSPOT_POSITIONS } from '@/lib/vr-property-config';

const hotspots = [
  {
    ...COMMON_HOTSPOT_POSITIONS.right,
    targetRoomId: 'kitchen',
    title: '→ Kitchen',
  },
  {
    ...COMMON_HOTSPOT_POSITIONS.forward,
    targetRoomId: 'bedroom',
    title: '→ Bedroom',
  },
];
\`\`\`

## useVRTour Hook

The hook provides comprehensive tour state management:

\`\`\`typescript
const {
  isOpen,                    // Is tour currently displayed
  currentTour,              // Current PropertyVRTour object
  currentRoomIndex,         // Current room index
  currentRoom,              // Current room object
  openTour,                 // Open tour with PropertyVRTour
  closeTour,                // Close tour
  navigateToRoom,           // Navigate to room by ID
  navigateByIndex,          // Navigate to room by index
  nextRoom,                 // Go to next room
  previousRoom,             // Go to previous room
  handleBuyClick,           // Trigger buy action
} = useVRTour({
  onTourStart: (propertyId) => {},      // Called when tour opens
  onTourEnd: (propertyId) => {},        // Called when tour closes
  onRoomChange: (roomId, roomName) => {}, // Called when room changes
  onBuyClick: (propertyId, price) => {}, // Called on buy click
});
\`\`\`

## VRPropertyTour Component

Main component that renders the interactive 360° tour:

\`\`\`typescript
interface VRPropertyTourProps {
  propertyId: string;           // Property identifier
  propertyPrice?: number;       // Price for buy button
  currency?: string;            // Currency symbol (default: 'π')
  rooms?: Room[];              // Array of rooms (uses demo if not provided)
  onClose: () => void;         // Close handler
  onBuyClick?: () => void;     // Buy button handler
}
\`\`\`

### Features
- Auto-loads Pannellum library from CDN
- Creates hotspots as glowing, pulsing arrows
- Smooth room transitions with loading states
- Mobile-touch support
- Keyboard controls (ESC to close)
- Fullscreen support

## Styling

### Default Colors
- **Accent**: `#F59E0B` (Orange/Gold)
- **Background**: `#030712` (Dark)

### Customizing Hotspots

Edit hotspot styles in `vr-property-tour.tsx`:

\`\`\`tsx
.vr-hotspot {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, rgba(245, 158, 11, 0.3) 100%);
  border: 2px solid #F59E0B;
  // ... customize as needed
}
\`\`\`

## Integration Points

### With Property Cards

\`\`\`tsx
const PropertyCard = ({ property }) => {
  const { openTour } = useVRTour();

  return (
    <div>
      <h3>{property.name}</h3>
      <button onClick={() => openTour(property.vrTour)}>
        🥽 View VR Tour
      </button>
    </div>
  );
};
\`\`\`

### With Property Details

\`\`\`tsx
const PropertyDetails = ({ propertyId }) => {
  const { isOpen, currentTour, openTour, closeTour } = useVRTour();
  const property = fetchPropertyData(propertyId);

  return (
    <div>
      <button onClick={() => openTour(property.vrTour)}>
        Launch 360° Tour
      </button>

      {isOpen && (
        <VRPropertyTour
          propertyId={propertyId}
          propertyPrice={property.price}
          rooms={currentTour?.rooms}
          onClose={closeTour}
          onBuyClick={() => initiateCheckout(property)}
        />
      )}
    </div>
  );
};
\`\`\`

## Future Enhancements

### Planned Features
- Real estate agent annotations
- Floor plan overlay
- Room measurement tool
- 3D model integration
- Analytics tracking (dwell time per room)
- Comparison mode (multiple properties)
- Photo gallery within tour
- QR code sharing

### Customization Options
- Custom hotspot icons
- Room descriptions and info panels
- Audio narration support
- Guided tour paths
- Room booking directly from tour
- Video integration

## Performance Optimization

### Image Optimization
- Use 4096x2048 resolution panoramic images
- Compress with tools like ImageOptim or TinyPNG
- Consider CDN delivery for faster loading
- Use WebP format when supported

### Best Practices
1. Pre-load images for better performance
2. Limit rooms to 5-7 per tour
3. Use CSS lazy loading for hotspots
4. Monitor viewport performance on mobile

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari 11+, Chrome Android)

## Troubleshooting

### Panorama not loading
- Check image URL is accessible
- Verify CORS headers are set correctly
- Ensure image is valid equirectangular format

### Hotspots not appearing
- Check pitch/yaw values are within valid ranges
- Verify CSS class name matches styling
- Check browser console for Pannellum errors

### Performance issues
- Reduce image resolution
- Limit number of rooms
- Enable image lazy loading
- Use smaller hotspot icons

## License

Uses Pannellum (open source) for panorama rendering.

## Resources

- **Pannellum Docs**: https://pannellum.org/documentation/overview/
- **Equirectangular Images**: https://pannellum.org/images/
- **Create Panoramas**: https://www.photosphere.app/
