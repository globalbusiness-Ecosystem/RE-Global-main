# VR Property Tour - Quick Start Guide

## 5-Minute Setup

### Step 1: Import Components
\`\`\`tsx
import { VRPropertyTour } from '@/components/vr-property-tour';
import { useVRTour } from '@/hooks/use-vr-tour';
import { EXAMPLE_LUXURY_APARTMENT } from '@/lib/vr-property-config';
\`\`\`

### Step 2: Use the Hook
\`\`\`tsx
const { isOpen, currentTour, openTour, closeTour } = useVRTour();
\`\`\`

### Step 3: Add Button to Open Tour
\`\`\`tsx
<button onClick={() => openTour(EXAMPLE_LUXURY_APARTMENT)}>
  Launch VR Tour 🥽
</button>
\`\`\`

### Step 4: Render Component
\`\`\`tsx
{isOpen && currentTour && (
  <VRPropertyTour
    propertyId={currentTour.propertyId}
    rooms={currentTour.rooms}
    onClose={closeTour}
    onBuyClick={handleBuy}
  />
)}
\`\`\`

## Common Tasks

### Create a Simple 2-Room Tour
\`\`\`tsx
import { createPropertyTour, COMMON_HOTSPOT_POSITIONS } from '@/lib/vr-property-config';

const tour = createPropertyTour(
  'my-property',
  'Beautiful Home',
  [
    {
      id: 'room1',
      name: 'Living Room',
      imageUrl: 'https://your-cdn.com/living-room-360.jpg',
      connections: [
        { targetRoomId: 'room2', yaw: 90 }
      ]
    },
    {
      id: 'room2',
      name: 'Bedroom',
      imageUrl: 'https://your-cdn.com/bedroom-360.jpg',
      connections: [
        { targetRoomId: 'room1', yaw: 270 }
      ]
    }
  ]
);
\`\`\`

### Add Event Listeners
\`\`\`tsx
const { openTour, closeTour } = useVRTour({
  onTourStart: (propertyId) => {
    console.log('Tour started:', propertyId);
    // Track analytics
  },
  onRoomChange: (roomId, roomName) => {
    console.log('User entered:', roomName);
  },
  onBuyClick: (propertyId, price) => {
    // Navigate to checkout
  }
});
\`\`\`

### Hotspot Positioning Quick Reference
\`\`\`
        UP (-90°)
           |
           |
    270° --+-- 90°
    LEFT   |   RIGHT
           |
          FORWARD (0°)

Behind = 180°
\`\`\`

## File Locations

| File | Purpose |
|------|---------|
| `components/vr-property-tour.tsx` | Main VR component |
| `hooks/use-vr-tour.ts` | State management hook |
| `lib/vr-property-config.ts` | Config & data structures |
| `components/vr-tour-example.tsx` | Complete example |

## Demo

View the complete working example:
\`\`\`tsx
import { VRTourExample } from '@/components/vr-tour-example';

export default function Page() {
  return <VRTourExample />;
}
\`\`\`

## Troubleshooting

**Hotspots not showing?**
- Make sure pitch/yaw are in valid ranges
- Pitch: -90 to 90
- Yaw: 0 to 360

**Tour loading slowly?**
- Use compressed panoramic images (4096x2048 or smaller)
- Verify CORS headers on image server

**Can't navigate between rooms?**
- Check `targetRoomId` matches actual room ID
- Verify room IDs in hotspots array

## Next Steps

1. Replace demo images with real panoramic photos
2. Set up property-specific room configurations
3. Integrate with checkout flow
4. Add analytics tracking
5. Test on mobile devices

## Resources

- Demo: `components/vr-tour-example.tsx`
- Full Docs: `lib/VR_PROPERTY_TOUR_DOCUMENTATION.md`
- Pannellum: https://pannellum.org/documentation/
