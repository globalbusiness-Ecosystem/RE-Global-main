# Ultra Panoramic Viewer - Quick Reference Card

## 📦 Installation

\`\`\`tsx
import { UltraPanormicViewer } from '@/components/ultra-panoramic-viewer';
\`\`\`

## 🎯 Basic Usage

\`\`\`tsx
const [showViewer, setShowViewer] = useState(false);

return (
  <>
    <button onClick={() => setShowViewer(true)}>View 360°</button>
    
    {showViewer && (
      <UltraPanormicViewer
        panoramaUrl="image-url"
        title="Property Title"
        onClose={() => setShowViewer(false)}
      />
    )}
  </>
);
\`\`\`

## ⚙️ Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panoramaUrl` | string | required | Full panorama image URL |
| `title` | string | required | Display title |
| `onClose` | function | required | Close handler |
| `quality` | enum | '4k' | '8k'\|'6k'\|'4k'\|'2k'\|'1080p' |
| `enableAutoRotate` | boolean | true | Auto-rotation enabled |
| `enableStats` | boolean | true | Show FPS/memory stats |
| `region` | enum | 'MENA' | 'NA'\|'EU'\|'ASIA'\|'MENA'\|'AFRICA'\|'LATAM' |

## 🎮 Controls

| Control | Action |
|---------|--------|
| **Drag** | Rotate view |
| **Scroll** | Zoom in/out |
| **4K/6K/8K** | Change quality |
| **▶️ Play** | Auto-rotate |
| **🔄 Reset** | Reset view |
| **⛶ Full** | Fullscreen |
| **X** | Close |

## 🌍 Regions

\`\`\`tsx
region="MENA"   // Arabic RTL, UAE CDN
region="EU"     // English LTR, EU CDN
region="NA"     // English LTR, US CDN
region="ASIA"   // English LTR, Singapore CDN
region="AFRICA" // English LTR, SA CDN
region="LATAM"  // Portuguese LTR, Brazil CDN
\`\`\`

## 📊 Quality Levels

\`\`\`tsx
quality="8k"    // 7680×4320 (premium)
quality="6k"    // 6016×3384 (luxury)
quality="4k"    // 3840×2160 (standard)
quality="2k"    // 2560×1440 (mobile)
quality="1080p" // 1920×1080 (low-end)
\`\`\`

## 🚀 Performance Tips

\`\`\`tsx
// Mobile - Lower quality
<UltraPanormicViewer quality="2k" region="MENA" />

// High bandwidth - Highest quality
<UltraPanormicViewer quality="8k" region="NA" />

// Adaptive - Auto-selects based on device/bandwidth
<UltraPanormicViewer region="EU" />
\`\`\`

## 📱 Mobile Optimization

\`\`\`tsx
<UltraPanormicViewer
  panoramaUrl={url}
  title={title}
  onClose={handleClose}
  quality="2k"        // Mobile-friendly
  enableAutoRotate={false}
  enableStats={false}
/>
\`\`\`

## 🔌 Integration Examples

### Property Card
\`\`\`tsx
{showTour && (
  <UltraPanormicViewer
    panoramaUrl={property.panoramaUrl}
    title={property.title}
    onClose={() => setShowTour(false)}
    quality="4k"
  />
)}
\`\`\`

### Property Grid
\`\`\`tsx
{properties.map(prop => (
  <button key={prop.id} onClick={() => showPanorama(prop)}>
    360° Tour
  </button>
))}
\`\`\`

### Modal
\`\`\`tsx
<Dialog open={showViewer} onOpenChange={setShowViewer}>
  <UltraPanormicViewer
    panoramaUrl={url}
    title={title}
    onClose={() => setShowViewer(false)}
  />
</Dialog>
\`\`\`

## 🎨 Styling

The component uses Tailwind CSS and respects theme:
- Background: `#030712` (dark)
- Accent: `#F59E0B` (gold)
- Uses CSS Grid for responsive layout

## 📈 Features

✅ 8K Ultra HD support  
✅ 60 FPS smooth rendering  
✅ Offline support via IndexedDB  
✅ Adaptive quality (bandwidth-aware)  
✅ Mobile optimized  
✅ Touch gestures (drag, pinch)  
✅ Kinetic momentum scrolling  
✅ RTL language support  
✅ 195+ countries optimized  
✅ Performance monitoring  

## 🔧 Advanced Config

\`\`\`tsx
// Offline with cache
<UltraPanormicViewer
  panoramaUrl={url}
  title={title}
  onClose={handleClose}
  quality="4k"
  region="MENA"
/>
// Auto-caches to IndexedDB
\`\`\`

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Low FPS | Lower quality level |
| Blank canvas | Check image URL CORS |
| No touch | Ensure touch event support |
| High memory | Clear cache, lower quality |
| Slow load | Check bandwidth, pre-cache |

## 📚 Files

- Component: `/components/ultra-panoramic-viewer.tsx`
- Engine: `/lib/panoramic-hd-engine.ts`
- Guide: `/lib/ULTRA_PANORAMIC_COMPLETE_GUIDE.md`
- Migration: `/lib/ULTRA_PANORAMIC_MIGRATION_GUIDE.md`

## 🎓 Learn More

- Read: `ULTRA_PANORAMIC_COMPLETE_GUIDE.md`
- Migrate: `ULTRA_PANORAMIC_MIGRATION_GUIDE.md`
- Contact: globalbusiness435@gmail.com
