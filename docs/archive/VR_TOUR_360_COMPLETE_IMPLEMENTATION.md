# Professional Interior 360° VR Tour - Implementation Guide

## Overview
The Interior 360° VR Tour is now fully implemented as a professional, immersive feature within the RE Platform. This guide explains how it works and how to integrate it into your property pages.

---

## ✨ Features Implemented

### 1. **360° Panoramic Viewer**
- **Pannellum Integration**: Uses Pannellum.js for true 360° panoramic viewing
- **Smooth Drag Navigation**: Buttery smooth mouse and touch drag to explore
- **Pinch-to-Zoom**: Full zoom control (30-120° FOV) using scroll or +/− buttons
- **Auto-Rotate**: Optional automatic rotation for passive viewing

### 2. **Gold Hotspots**
- **Interactive Markers**: Glowing gold circles (⭕) mark room transitions
- **Smart Animations**: Pulsing glow effect with scale on hover
- **Room Navigation**: Click any hotspot to smoothly transition to adjacent rooms
- **Visual Feedback**: Smooth transitions with loading indicators

### 3. **Luxury Dark Theme UI**
- **Black Background**: #030712 background for premium feel
- **Gold Accents**: #F59E0B (F59E0B) for all interactive elements
- **Frosted Glass**: Semi-transparent backdrops with blur effects
- **Elegant Borders**: Gold-bordered UI elements throughout

### 4. **Full-Screen Immersion**
- **Standalone Component**: Opens as fixed fullscreen overlay (z-50)
- **Gold Close Button**: Large, prominent X button to return to property details
- **Loading States**: Professional spinner with room name during transitions
- **Non-Intrusive**: Doesn't modify rest of app structure

---

## 🎮 User Controls

| Control | Action |
|---------|--------|
| **🖱️ Drag** | Look around 360° panorama |
| **🔍 Scroll** | Zoom in/out |
| **+/−** | Adjust zoom level |
| **Play/Pause** | Auto-rotate panorama |
| **👁️ Icon** | Toggle hotspot visibility |
| **⭕ Gold Dots** | Navigate to next room |
| **Dots (Bottom)** | Quick room selection |
| **← →** | Previous/next room |
| **X (Top Right)** | Close and return |

---

## 🚀 Integration Points

### Property Card Button
\`\`\`typescript
// In components/property-card.tsx
<button
  onClick={handleTourClick}
  className="... bg-gold hover:bg-yellow-300 ..."
>
  <Camera className="w-4 h-4" />
</button>
\`\`\`

### Property Pages (Buy, Rent, etc.)
\`\`\`typescript
// In components/pages/buy-page.tsx
const [activeTourId, setActiveTourId] = useState<string | null>(null);

// Show VR Tour when button clicked
if (activeTourId) {
  return (
    <VRPropertyTourViewer
      property={DEMO_PROPERTY}
      onClose={() => setActiveTourId(null)}
      onBuyClick={handleBuy}
    />
  );
}
\`\`\`

---

## 📐 Architecture

### Component Structure
\`\`\`
VRPropertyTourViewer (Main Container)
├── Pannellum 360° Viewer
├── Room Info Badge (Top Left)
├── Close Button (Top Right) ← GOLD X
├── Control Buttons (Top Right)
│   ├── Eye (Toggle Hotspots)
│   ├── Play/Pause (Auto Rotate)
│   ├── +/− (Zoom)
├── Room Navigator (Bottom Center)
│   ├── ← Prev Button
│   ├── Room Indicator Dots
│   └── Next → Button
├── Buy Button (Bottom Left) ← GOLD
├── Instructions Text (Bottom Center)
└── Loading Spinner (Center)
\`\`\`

### Data Flow
\`\`\`
Property Page
    ↓
Click "VR Tour" Button
    ↓
setActiveTourId(propertyId)
    ↓
<VRPropertyTourViewer property={DEMO_PROPERTY} />
    ↓
Pannellum Renders 360° Image
    ↓
Click Hotspot → handleHotspotClick(nextRoomIndex)
    ↓
setCurrentRoomIndex(nextRoomIndex)
    ↓
Component Re-renders with New Room
\`\`\`

---

## 🎨 Styling Details

### Color Palette
- **Primary Dark**: `#030712` (Near black, luxury feel)
- **Accent Gold**: `#F59E0B` (Warm gold, high visibility)
- **Hover Gold**: `#FCD34D` (Yellow-300, bright feedback)
- **Transparent**: `rgba(245, 158, 11, 0.X)` (Variable opacity)

### Key Style Classes
\`\`\`css
/* Main container - full screen, centered */
.pannellum-container {
  background-color: #030712 !important;
  z-index: 50;
  position: fixed;
  inset: 0;
}

/* Hotspots - glowing gold circles */
.vr-hotspot-360-gold {
  width: 80px !important;
  height: 80px !important;
  border: 3px solid #F59E0B !important;
  background: radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.9), rgba(245, 158, 11, 0.4));
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.8), inset 0 0 20px rgba(245, 158, 11, 0.3);
  animation: pulse-360-gold 2.5s ease-in-out infinite;
}

.vr-hotspot-360-gold:hover {
  transform: scale(1.35);
  box-shadow: 0 0 50px rgba(245, 158, 11, 1), inset 0 0 30px rgba(245, 158, 11, 0.5);
}
\`\`\`

---

## 📋 Room Configuration

### Adding New Rooms
Edit `/lib/vr-tour-config.ts`:

\`\`\`typescript
{
  id: 5,                           // Unique ID
  name: 'Dining Room',             // Display name
  imageUrl: 'https://...',         // 360° image URL
  pitch: 0,                        // Vertical angle
  yaw: 0,                          // Horizontal angle
  hfov: 100,                       // Default field of view
  price: 850000,                   // Property price
  hotspots: [
    createHotspot(0, 90, 2, 'Go to Kitchen →'),     // pitch, yaw, targetRoom, text
    createHotspot(-20, 180, 0, 'Back to Living Room →'),
  ],
}
\`\`\`

### Creating Hotspots
\`\`\`typescript
const createHotspot = (
  pitch: number,      // Vertical position (-90 to 90)
  yaw: number,        // Horizontal position (0-360)
  targetRoom: number, // Room index to navigate to
  text: string        // Button text
): Hotspot => ({
  pitch,
  yaw,
  targetRoom,
  text,
  cssClass: 'vr-tour-hotspot',
});
\`\`\`

---

## 🔧 Customization Options

### Zoom Range
\`\`\`typescript
// In VRPropertyTourViewer
const handleZoom = (direction: 'in' | 'out') => {
  setZoom((prev) => {
    const newZoom = direction === 'in' ? prev - 10 : prev + 10;
    return Math.max(30, Math.min(120, newZoom)); // Min: 30°, Max: 120°
  });
};
\`\`\`

### Auto-Rotate Speed
\`\`\`typescript
// In Pannellum config
autoRotate: autoRotate ? -2 : 0  // Change -2 to adjust speed
\`\`\`

### Hotspot Styling
Edit the `addCustomStyling()` function to modify:
- Size: `width: 80px`
- Border: `3px solid #F59E0B`
- Glow: `box-shadow: 0 0 30px rgba(245, 158, 11, 0.8)`
- Animation: `pulse-360-gold` keyframes

---

## 🌍 Example 360° Image Sources

For best results, use equirectangular panoramic images:

1. **Pexels**: https://www.pexels.com/ (Free high-quality photos)
2. **Unsplash**: https://unsplash.com/ (Large luxury property collection)
3. **Matterport**: Virtual tours with 360° photos
4. **Custom Capture**: Use 360° camera or panorama stitching software

---

## ✅ Trigger Behavior

### How to Start VR Tour

**1. From Property Card**
- Click camera icon (gold) in top-left corner
- Instantly opens fullscreen VR viewer

**2. From Property Listings**
- Click "Tour" video icon button
- Sets `activeTourId` state
- Component renders VR viewer

**3. From Buy/Rent Pages**
- Click video icon in action buttons
- Launches immersive tour

### Closing the Tour
- Click large gold **X** button (top-right)
- Returns to previous page/card
- Calls `onClose()` callback

---

## 🐛 Troubleshooting

### Issue: Hotspots not showing
- Check if `showHotspots` state is true
- Verify `createHotspot()` coordinates are correct
- Ensure room index matches array length

### Issue: Pannellum not loading
- Check browser console for errors
- Verify CDN links are accessible
- Try hard refresh (Ctrl+Shift+R)

### Issue: Zoom not working
- Scroll events must be enabled
- Try +/− buttons instead
- Check browser zoom settings

### Issue: Performance lag
- Reduce image resolution (< 4MB per image)
- Disable auto-rotate if not needed
- Check browser memory usage

---

## 📱 Mobile Support

The VR tour is fully responsive and mobile-friendly:
- Touch drag for panorama viewing
- Pinch-to-zoom support
- Full-screen immersion on mobile
- Optimized button sizes for touch
- Gyroscope support (if available)

---

## 🎬 User Experience Flow

\`\`\`
1. User sees property card
   ↓
2. Clicks gold camera icon
   ↓
3. VR viewer opens (fullscreen, black background)
   ↓
4. User drags to explore 360° room
   ↓
5. User scrolls to zoom in/out for details
   ↓
6. User clicks gold hotspot to go to next room
   ↓
7. Smooth fade-in of new room
   ↓
8. User explores other rooms using hotspots
   ↓
9. User clicks gold X to return to property card
   ↓
10. Page state restores with all details visible
\`\`\`

---

## 🚀 Next Steps

1. **Upload custom 360° images** for your properties
2. **Update DEMO_ROOMS** with real property data
3. **Adjust hotspot coordinates** to match your images
4. **Test on mobile** devices for UX
5. **Connect to Pi payment** system for "Buy" button
6. **Add analytics** to track tour engagement

---

## 📞 Support & Questions

For implementation questions or to add features:
- Review `/components/vr-property-tour-viewer.tsx`
- Check `/lib/vr-tour-config.ts` for room setup
- See `/lib/vr-tour-types.ts` for data structures
