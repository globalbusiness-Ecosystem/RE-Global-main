# VR Hotspots Visual Reference

## Panorama Coordinate System

When viewing a 360° equirectangular image, think of it as a sphere around you:

\`\`\`
                    UP (Pitch +90°)
                          |
                          |
WEST ←─────────────────────O──────────────→ EAST
(Yaw 270°)         (You standing here)      (Yaw 90°)
                          |
                          |
                   DOWN (Pitch -90°)

Horizontal View (looking straight ahead):
  NORTH        EAST         SOUTH        WEST
  0°           90°          180°         270°
\`\`\`

## Demo Property Room Layout

### Room 1: Living Room (Yaw Reference)

\`\`\`
       UP
       |
       ↑ Pitch +20°
       |
W ←────O────→ E
 270° 0°  90°
\`\`\`

**Hotspots:**
- **Arrow →** (Yaw 90°, Pitch 0°): Points RIGHT (East) → Bedroom
- **Arrow →** (Yaw 180°, Pitch -20°): Points BACK & DOWN (South) → Bathroom

### Room 2: Bedroom

**Hotspots:**
- **Arrow →** (Yaw -90°, Pitch 0°): Points LEFT (West) → Kitchen
- **Arrow →** (Yaw 180°, Pitch -20°): Points BACK (South) → Living Room

### Room 3: Kitchen

**Hotspots:**
- **Arrow →** (Yaw 90°, Pitch 0°): Points RIGHT (East) → Bathroom
- **Arrow →** (Yaw 0°, Pitch -20°): Points NORTH → Bedroom

### Room 4: Bathroom

**Hotspots:**
- **Arrow →** (Yaw -90°, Pitch 0°): Points LEFT (West) → Kitchen
- **Arrow →** (Yaw 0°, Pitch -20°): Points NORTH → Living Room

## Hotspot Visual Appearance

### At Rest (Continuous Animation)
\`\`\`
        ╭─────────────╮
        │ ╭─────────╮ │
        │ │    →    │ │ ← Gold border (2px)
        │ │ (pulse) │ │
        │ ╰─────────╯ │
        ╰─────────────╯
  Glow Effect: 10px soft shadow
  Size: 50px × 50px circle
\`\`\`

### On Hover
\`\`\`
        ╭─────────────╮
        │ ╭─────────╮ │
        │ │    →    │ │ ← Brighter, thicker glow
        │ │ (scale  │ │   
        │ │  1.2x)  │ │ ← Grows 20% larger
        │ ╰─────────╯ │
        ╰─────────────╯
  Glow Effect: 25px bright shadow (full opacity)
  Cursor: Hand pointer
\`\`\`

## Color Palette

- **Border & Text**: #F59E0B (Gold/Amber-500)
- **Background Base**: rgba(245, 158, 11, 0.3) (30% opacity)
- **Background Hover**: rgba(245, 158, 11, 0.5) (50% opacity)
- **Glow Default**: rgba(245, 158, 11, 0.5) (outer) + 0.2 (inner)
- **Glow Hover**: rgba(245, 158, 11, 1.0) (outer) + 0.6 (inner)
- **Glow Peak**: Box shadow at 50% animation point

## Animation Timeline

### Pulse Glow (2 second loop)
\`\`\`
Time:  0ms ────────── 1000ms ────────── 2000ms
       │              │                  │
Scale: 1.0 ─→ 1.1 ─→ 1.0 ─→ 1.0        (repeats)
       
Glow:  10px ─→ 20px ─→ 10px ─→ 10px    (repeats)
       
Effect: Breathing, pulsing glow draws attention
\`\`\`

### Room Transition (800ms)
\`\`\`
Current Room         Transition              New Room
─────────────        ─────────────          ─────────────
Hotspots visible     200ms fade out         Hotspots invisible
                     Load new image
                     Pan camera (800ms)
                     Clear old hotspots
                     Add new hotspots       Hotspots appear
                                           (300ms delay)
\`\`\`

## Hotspot Positioning Examples

### Example 1: Door to the Right
\`\`\`
Yaw: 90° (East/Right)
Pitch: 0° (Eye level)

Visual: Hotspot appears on right side of panorama
        at same height as viewer's eyes
\`\`\`

### Example 2: Door Down Below
\`\`\`
Yaw: 180° (South/Back)
Pitch: -20° (Slightly down from eye level)

Visual: Hotspot appears in back-lower area
        slightly below viewer's eye level
\`\`\`

### Example 3: Window Up High
\`\`\`
Yaw: 45° (Northeast)
Pitch: 30° (Looking up)

Visual: Hotspot appears in upper-right area
        good for skylights or high windows
\`\`\`

## Interactive Elements at Bottom

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Room Buttons:                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │Living Rm│ │ Bedroom │ │ Kitchen │ │ Bathroom│        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│  (Gold/highlighted)  (Semi-transparent background)      │
│                                                           │
│  Controls:                              Buy Button:       │
│  ◀  ⟳  ⛶  ▶                          ┌──────────────┐   │
│  (4 buttons)                           │ Buy with π   │   │
│                                        └──────────────┘   │
│                                        (Orange accent)    │
│                                                           │
│  Price Display:                                           │
│  50000 π (centered below, small text)                     │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Coordinate Finder Tips

To find exact hotspot coordinates for your images:

1. **Use Pannellum Inspector**: Visit pannellum.org and use their viewer
2. **Note When You See the Feature**: Hover mouse and note yaw/pitch
3. **Test in Small Steps**: Start with yaw: 0, 90, 180, 270
4. **Adjust Pitch**: For doors, try pitch 0-20° down
5. **Refine Visually**: Use small adjustments until arrow points right

## Performance Metrics

- **Hotspot Render**: < 16ms (60fps)
- **Animation Frame**: Smooth at 60fps (uses GPU)
- **Click Response**: < 50ms from click to room transition start
- **Room Load**: ~300-800ms depending on image size
- **Memory**: Minimal (hotspots are DOM elements, not canvas)

## Accessibility Considerations

- Hotspots have `cursor: pointer` for visual feedback
- Tooltips show on hover with readable text
- Click handlers work with mouse and touch
- Controls have ARIA labels (can be enhanced)
- Color contrast meets WCAG AA standards (#F59E0B on dark background)
