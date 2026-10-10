# VR Hotspots Navigation Guide

## Overview

The VR Property Tour Viewer includes fully functional interactive hotspots that appear as **glowing gold arrows (→)** inside the 360° panorama. These hotspots enable seamless room-to-room navigation with smooth transitions.

## How It Works

### Hotspot Features

- **Visual Design**: Gold circular hotspots with animated glow effect
- **Position**: Hotspots appear at specific pitch/yaw coordinates within the panorama
- **Interaction**: Click any hotspot to navigate to the connected room
- **Tooltip**: Hover over hotspots to see navigation text (e.g., "Go to Bedroom →")
- **Animation**: Continuous pulse glow effect with hover scale up
- **Smooth Transitions**: 800ms smooth transition animation when changing rooms

### Demo Room Flow

\`\`\`
Living Room (4 rooms total: 1/4)
├─ Hotspot 1: Yaw 90°, Pitch 0° → Go to Bedroom
└─ Hotspot 2: Yaw 180°, Pitch -20° → Go to Bathroom

Bedroom (2/4)
├─ Hotspot 1: Yaw -90°, Pitch 0° → Go to Kitchen
└─ Hotspot 2: Yaw 180°, Pitch -20° → Back to Living Room

Kitchen (3/4)
├─ Hotspot 1: Yaw 90°, Pitch 0° → Go to Bathroom
└─ Hotspot 2: Yaw 0°, Pitch -20° → Back to Bedroom

Bathroom (4/4)
├─ Hotspot 1: Yaw -90°, Pitch 0° → Back to Kitchen
└─ Hotspot 2: Yaw 0°, Pitch -20° → Back to Living Room
\`\`\`

## Visual Styling

### Default Hotspot State
- Size: 50px circular
- Background: Semi-transparent gold with 30% opacity
- Border: 2px solid gold (#F59E0B)
- Content: Arrow emoji (→)
- Glow: Box shadow with 10px blur
- Animation: Pulse effect, 2 second cycle

### Hover State
- Background: 50% opacity
- Glow: 25px blur, full opacity
- Scale: 1.2x (20% larger)
- Cursor: Pointer hand
- Transition: 300ms smooth

### Animation Keyframes

\`\`\`css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
    transform: scale(1.1);
  }
}
\`\`\`

## Customizing Hotspots

### For a Single Property

Edit `/lib/vr-tour-config.ts`:

\`\`\`typescript
export const DEMO_PROPERTY: VRPropertyTour = {
  propertyId: 'your-property-id',
  propertyName: 'Your Property Name',
  rooms: [
    {
      id: 0,
      name: 'Room Name',
      imageUrl: 'https://your-property-images.com/room1.jpg',
      pitch: 0,
      yaw: 0,
      hfov: 100,
      hotspots: [
        createHotspot(0, 90, 1, 'Go to Next Room →'),
        createHotspot(-20, 180, 2, 'Go to Other Room →'),
      ],
    },
    // More rooms...
  ],
  price: 500000,
  piPrice: 50000,
};
\`\`\`

### Hotspot Coordinates Explained

- **Pitch** (vertical): -90° to 90°
  - -90° = Looking down at floor
  - 0° = Looking straight ahead
  - 90° = Looking up at ceiling
  
- **Yaw** (horizontal): 0° to 360°
  - 0° = Due North (front)
  - 90° = Due East (right)
  - 180° = Due South (back)
  - 270° = Due West (left)

### Example: Door Navigation

To create a hotspot pointing to a door on the right side at medium height:

\`\`\`typescript
createHotspot(10, 90, 1, 'Go to Kitchen →')
//            ↑   ↑   ↑
//          pitch yaw targetRoom
\`\`\`

## Integration Points

### 1. Home Page Button

The VR Tour is integrated into the home page. Click "VR Tour" in the categories grid to launch.

### 2. Custom Property Component

\`\`\`tsx
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

export function PropertyVRTour() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Launch VR Tour</button>
      {isOpen && (
        <VRPropertyTourViewer
          property={DEMO_PROPERTY}
          onClose={() => setIsOpen(false)}
          onBuyClick={() => console.log('Buy clicked')}
        />
      )}
    </>
  );
}
\`\`\`

### 3. Bottom Navigation Bar

Users can instantly jump to any room using the mini navigation bar at the bottom:
- Shows all rooms as clickable buttons
- Current room highlighted in gold
- Non-current rooms show with semi-transparent background
- Click any room name to navigate there directly

### 4. Control Buttons

All controls appear in the bottom-left corner:
- **← Previous**: Go to previous room in order
- **⟳ Reset**: Reset view to room's default pitch/yaw/zoom
- **⛶ Fullscreen**: Toggle fullscreen immersive mode
- **Next →**: Go to next room in order

### 5. Buy Button

Orange "Buy with π" button always visible in bottom-right. Integrates with Pi payment SDK.

## Transition Animation

When clicking a hotspot or room button:

1. **Start**: 200ms fade-out overlay appears
2. **Transition**: Panorama changes with 800ms smooth animation
3. **Hotspots**: Previous hotspots cleared, new ones added after 300ms
4. **Complete**: Loading spinner disappears, user can interact immediately

Smooth pitch/yaw transitions use Pannellum's native animation engine for professional feel.

## Performance Optimizations

- Hotspots are cleared before room change to prevent overlap
- Image preloading ready (can be implemented)
- CSS animation uses GPU acceleration (transform/box-shadow)
- Event handlers are memoized with useCallback
- Pannellum library loaded from CDN only once per session

## Troubleshooting

### Hotspots Not Showing
- Check that room has hotspots array defined
- Verify pitch/yaw values are within -90 to 90 (pitch) and 0-360 (yaw) ranges
- Ensure imageUrl is accessible

### Hotspots Not Clickable
- Verify clickHandlerFunc is defined in hotspot config
- Check that z-index is set properly (should be 10+)
- Ensure panorama is fully loaded before interaction

### Smooth Transition Not Working
- Check that setPanorama() is called before pitch/yaw transitions
- Verify duration values (default 800ms)
- Ensure HOTSPOT_ANIMATION styles are injected into DOM

## Future Enhancements

- Add audio cues when entering rooms
- Create custom hotspot shapes (arrows, doorways)
- Add analytics tracking for room visits
- Implement teleportation between non-adjacent rooms
- Add sequential room unlocking for properties
