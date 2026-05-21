# VR Tour Visual Reference & Hotspot Map

## UI Layout

\`\`\`
┌─────────────────────────────────────────────────────┐
│  [Living Room] │ [3/5]        Beachfront Villa  [✕] │  ← Top Bar
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│         [Panorama View - Pannellum]                │
│                                                     │
│              ↗ (Hotspot 1)                         │
│                                                     │
│              ↘ (Hotspot 2)                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Living] [Bedroom] [Kitchen] [Bathroom] [Living]   │  ← Mini Nav
│    ●                                                 │
│ [◄] [↻] [⬜] [►]              [Buy with π]         │  ← Controls
│                               50,000 π              │
└─────────────────────────────────────────────────────┘
\`\`\`

## Hotspot Coordinate System

\`\`\`
                        UP (pitch = -90°)
                             |
                             |
        Left              Eye Level          Right
        (yaw 270°)        (yaw 0°)          (yaw 90°)
             ←───────────────●───────────────→
                      |
                   DOWN
               (pitch = +90°)

Pitch Range: -90° to +90°
Yaw Range: 0° to 360°
\`\`\`

## Demo Tour Layout

\`\`\`
ROOM SEQUENCE
─────────────────────────

Living Room (0)
  ├─→ Hotspot 1: yaw=90°, pitch=0°   → Bedroom
  └─→ Hotspot 2: yaw=180°, pitch=-20° → Bathroom

      ↓ (User navigates)

Bedroom (1)
  ├─→ Hotspot 1: yaw=-90°, pitch=0°   → Kitchen
  └─→ Hotspot 2: yaw=180°, pitch=-20° → Living Room

      ↓

Kitchen (2)
  ├─→ Hotspot 1: yaw=90°, pitch=0°   → Bathroom
  └─→ Hotspot 2: yaw=0°, pitch=-20°  → Bedroom

      ↓

Bathroom (3)
  ├─→ Hotspot 1: yaw=-90°, pitch=-20° → Kitchen
  └─→ Hotspot 2: yaw=0°, pitch=-20°  → Living Room

      ↓

Living Room (4)
  └─→ Loop back to start...
\`\`\`

## Hotspot Positioning Guide

### Common Angles

\`\`\`
DOORWAY/EXIT HOTSPOTS
┌────────────────────────────────────────┐
│                                        │
│         Eye Level (pitch ≈ 0°)         │
│    Hotspot appears at doorway          │
│                                        │
└────────────────────────────────────────┘

UPPER WALL HOTSPOTS (Small Rooms)
┌────────────────────────────────────────┐
│  ↑ Hotspot (pitch ≈ -15°)             │
│                                        │
│     Eye Level (pitch = 0°)             │
│                                        │
└────────────────────────────────────────┘

NAVIGATION ARROWS IN SPACE
Left ← ─ Eye Level ─ → Right
Hotspots at yaw = 0°, 90°, 180°, 270°
\`\`\`

### Direction Mapping

\`\`\`
       N (yaw 0°)
            |
            |
    ↑ (pitch -20° to 0°)
    |
W ──┼── E    (Walls/Doorways)
(270°) (90°)
    |
    ↓ (pitch 0° to +20°)
            |
            |
       S (yaw 180°)
\`\`\`

## Hotspot Styling

### Visual Appearance

\`\`\`
     Glow Effect
         ╱╲
        ╱  ╲
       │ → │  ← Arrow Icon
       │    │
        ╲  ╱
         ╲╱
      Golden Ring

Animations:
• Pulse: 2s continuous cycle
• Hover: Scale 1.2x + enhanced glow
• Click: Navigate to room

Colors:
• Base: rgba(245, 158, 11, 0.3)
• Border: #F59E0B
• Shadow: 0 0 10-20px rgba(245, 158, 11, 0.5)
\`\`\`

### Hotspot Size Reference

\`\`\`
Normal State
┌─────────┐
│   50px  │
│   Size  │
│    →    │
└─────────┘

Hover State (1.2x scale)
  ┌───────────┐
  │    60px   │
  │   Size    │
  │     →     │
  └───────────┘
\`\`\`

## Navigation Flow Diagram

\`\`\`
┌─────────────────────────────────────────────┐
│                                             │
│  START: Living Room                         │
│         ├─ Click Hotspot → Bedroom          │
│         └─ Bottom: [Next] → Bedroom         │
│            Mini Nav: [Bedroom] click        │
│                                             │
│  Bedroom                                    │
│         ├─ Click Hotspot → Kitchen          │
│         └─ Navigate using any method        │
│                                             │
│  Kitchen                                    │
│         ├─ Multiple navigation options      │
│         └─ [Prev/Next] buttons work         │
│                                             │
│  Bathroom                                   │
│         └─ All routes back to main area     │
│                                             │
│  Living Room (loop back)                    │
│         └─ Cycle continues...               │
│                                             │
└─────────────────────────────────────────────┘
\`\`\`

## Responsive Breakpoints

\`\`\`
Mobile (< 640px)
┌──────────────────────────┐
│ [Room] X  │ Property [✕]│
├──────────────────────────┤
│                          │
│   [Panorama]             │
│                          │
├──────────────────────────┤
│[Room Buttons - Wrapped]  │
│[◄][↻][⬜][►][Buy]       │
└──────────────────────────┘

Tablet (640px - 1024px)
┌────────────────────────────────────┐
│ [Living] │ Property        [✕]     │
├────────────────────────────────────┤
│                                    │
│     [Panorama View]                │
│                                    │
├────────────────────────────────────┤
│[Rooms...........................] │
│[Controls......................Buy]│
└────────────────────────────────────┘

Desktop (> 1024px)
┌──────────────────────────────────────────┐
│[Living Room] 3/5  Property Name  [✕]    │
├──────────────────────────────────────────┤
│                                          │
│           [Full Panorama View]           │
│                                          │
├──────────────────────────────────────────┤
│[Living][Bedroom][Kitchen][Bathroom]...  │
│[◄][↻][⬜][►]           [Buy with π]    │
└──────────────────────────────────────────┘
\`\`\`

## Color Scheme

\`\`\`
Background:     #030712 (Dark Navy)
Accent/Gold:    #F59E0B (Warm Gold)
Borders:        #F59E0B (Gold)
Text Primary:   #FFFFFF (White)
Text Secondary: #A0AEC0 (Light Gray)

Hotspot Colors:
├─ Normal:      rgba(245, 158, 11, 0.3)
├─ Border:      #F59E0B
├─ Hover:       rgba(245, 158, 11, 0.5)
└─ Glow:        rgba(245, 158, 11, 0.5-1.0)
\`\`\`

## Animation Timings

\`\`\`
Panorama Load:      0-2s (loading spinner)
Room Transition:    0.8s (smooth panorama swap)
Hotspot Pulse:      2s (continuous)
Tooltip Appear:     Instant on hover
Camera Animation:   800ms (pitch/yaw update)
Auto-Rotate:        Slow (customizable)
\`\`\`

## Keyboard Controls (Built-in from Pannellum)

\`\`\`
Arrow Keys:     Rotate panorama
+ / -:          Zoom in/out
R:              Reset view
F:              Fullscreen (custom handler)
Esc:            Exit fullscreen
\`\`\`

## Touch Gestures

\`\`\`
Single Finger Drag:    Rotate panorama
Two Finger Pinch:      Zoom in/out
Tap:                   Click hotspots
Long Press:            (Reserved for future)
\`\`\`

## File Structure Reference

\`\`\`
Components Tree:
─────────────────
VRPropertyTourViewer
  ├─ Pannellum Container
  │   ├─ Hotspots (CSS styled)
  │   └─ Auto-rotate animation
  ├─ Top Bar
  │   ├─ Room Badge
  │   ├─ Property Name
  │   └─ Close Button
  ├─ Bottom Controls
  │   ├─ Mini Room Nav
  │   ├─ Action Buttons
  │   └─ Buy Button
  └─ Loading States
      ├─ Library Loading
      └─ Room Transition
\`\`\`

## Data Structure

\`\`\`typescript
Property {
  propertyId:   string
  propertyName: string
  rooms: [
    {
      id:        number
      name:      string
      imageUrl:  string
      pitch:     number (-90 to 90)
      yaw:       number (0 to 360)
      hfov:      number (50 to 120)
      hotspots: [
        {
          pitch:        number
          yaw:          number
          targetRoom:   number
          text:         string
        }
      ]
    }
  ]
  price?:   number
  piPrice?: number
}
\`\`\`

## Optimization Checklist

\`\`\`
Images:
  ☐ Equirectangular format
  ☐ 4096x2048 or 2048x1024 resolution
  ☐ Compressed to 1-2MB
  ☐ Hosted on CDN
  ☐ CORS headers configured

Panorama Settings:
  ☐ minHfov: 50 (prevents over-zoom)
  ☐ maxHfov: 120 (limits wide-angle)
  ☐ friction: 0.05 (smooth dragging)
  ☐ autoRotate: -2 (gentle rotation)

UI/UX:
  ☐ Hotspots clearly visible
  ☐ Tooltips readable
  ☐ Touch targets 44px minimum
  ☐ Responsive on all devices
\`\`\`
