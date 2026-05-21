# VR Tour - Property Images Integration Guide

## Overview

The VR Property Tour system now includes a comprehensive property image gallery system that allows users to view 2D property photos alongside the 360° panoramic VR experience. This creates a more immersive and informative property viewing experience.

## Features

### 1. **Integrated Image Gallery**
- Compact thumbnail gallery in the bottom-right corner of the VR viewer
- Expandable full-screen gallery for detailed photo viewing
- Multiple images per room with captions
- Featured image indicators

### 2. **Gallery Controls**
- **Toggle Gallery Button**: Image icon in the top-right control panel
- **Compact Gallery**: Shows current image with navigation arrows
- **Expanded View**: Full-screen modal with thumbnail grid

### 3. **Navigation Features**
- Arrow buttons for next/previous images
- Thumbnail grid for quick selection
- Keyboard shortcuts (← → arrows, ESC to close)
- Auto-loop through images
- Counter showing current image number

## Implementation

### Data Structure

Each VR room now includes a `propertyImages` array:

\`\`\`typescript
interface PropertyImage {
  id: string;           // Unique identifier (e.g., 'lr-1', 'br-2')
  url: string;          // Image URL
  caption: string;      // Image description
  featured?: boolean;   // Mark as featured (displays indicator)
}

interface VRRoom {
  id: number;
  name: string;
  imageUrl: string;     // 360° panorama URL
  propertyImages?: PropertyImage[];  // NEW: 2D property photos
  hotspots: Hotspot[];
  description?: string;
  price?: number;
  // ... other properties
}
\`\`\`

### Configuration

Property images are configured in `/lib/vr-tour-config.ts`:

\`\`\`typescript
const PROPERTY_IMAGES: Record<string, PropertyImage[]> = {
  livingRoom: [
    { id: 'lr-1', url: 'https://...', caption: 'Modern Living Room - Front View', featured: true },
    { id: 'lr-2', url: 'https://...', caption: 'Living Room - Side Angle' },
    // ... more images
  ],
  bedroom: [ /* ... */ ],
  kitchen: [ /* ... */ ],
  bathroom: [ /* ... */ ],
  outdoor: [ /* ... */ ],
};
\`\`\`

### Component Integration

The `PropertyImageGallery` component is automatically rendered when:
1. `showImageGallery` state is true (default)
2. Current room has `propertyImages` defined
3. `propertyImages` array is not empty

## Usage

### For End Users

1. **View Photos**: Click the image icon (🖼️) in the top-right control panel
2. **Toggle Gallery**: Click again to hide/show the gallery
3. **Compact View**: Navigate with arrows in the bottom-right thumbnail gallery
4. **Expanded View**: Click the compact gallery to open full-screen view
5. **Keyboard Navigation**: Use arrow keys or ESC to close

### For Developers

#### Adding Property Images to a Room

\`\`\`typescript
import { PropertyImage } from '@/lib/vr-tour-types';

const propertyImages: PropertyImage[] = [
  {
    id: 'room-1',
    url: 'https://example.com/image1.jpg',
    caption: 'Room View 1',
    featured: true
  },
  {
    id: 'room-2',
    url: 'https://example.com/image2.jpg',
    caption: 'Room View 2'
  }
];

// Add to room configuration
const myRoom: VRRoom = {
  id: 0,
  name: 'Living Room',
  imageUrl: 'https://example.com/360-panorama.jpg',
  propertyImages: propertyImages,
  hotspots: []
};
\`\`\`

#### Custom Gallery Implementation

\`\`\`typescript
import { PropertyImageGallery } from '@/components/property-image-gallery';

export function MyComponent() {
  const images = [...];
  
  return (
    <PropertyImageGallery
      images={images}
      roomName="Living Room"
      onClose={() => console.log('Gallery closed')}
    />
  );
}
\`\`\`

## UI Components

### Compact Gallery (Bottom-Right)
- **Size**: 128px × 160px (w-32 h-40)
- **Features**:
  - Current image display
  - Navigation arrows
  - Image counter
  - Hover-to-expand hint
  - Thumbnail indicator strip

### Expanded Gallery Modal
- **Fullscreen**: Fixed position covering entire viewport
- **Features**:
  - Large image display (max-width-2xl, h-96)
  - Left/right navigation arrows
  - Close button (top-right)
  - Room name and image caption
  - Thumbnail grid (5-6 per row)
  - Image counter
  - Keyboard instruction hint

## Styling

### Color Scheme
- **Primary**: Gold (#F59E0B)
- **Background**: Near-black (#030712)
- **Borders**: Gold with transparency (gold/40 - gold/80)
- **Text**: Gold text on black background

### Responsive Behavior
- **Desktop**: Full gallery features enabled
- **Mobile**: Compact gallery optimized for small screens
- **Touch**: Swipe-friendly controls

## Best Practices

### Image Selection
1. **High Quality**: Use high-resolution images (2048×1536 px minimum)
2. **Variety**: Include different angles and lighting conditions
3. **Consistency**: Maintain consistent lighting and composition
4. **Featured Image**: Mark the best image as featured

### Image Captions
1. **Descriptive**: Use clear, concise descriptions
2. **Context**: Include room features or standout elements
3. **Format**: "Room Name - Feature/View"
4. **Examples**:
   - "Master Bedroom - Main View"
   - "Kitchen - Island and Appliances"
   - "Bathroom - Luxury Fixtures Detail"

### Configuration Tips
1. **Room Images**: 3-5 images per room is optimal
2. **Featured**: Always set at least one featured image
3. **Loading**: Use optimized image URLs (consider CDN)
4. **Fallback**: Images should gracefully degrade if URL fails

## Accessibility

- **ARIA Labels**: All buttons have `aria-label` attributes
- **Keyboard Navigation**: Full keyboard support (arrows, ESC)
- **Image Alt Text**: All images include descriptive alt text
- **Focus Management**: Proper focus handling for accessibility

## Performance

### Optimization
- **Lazy Loading**: Images load only when expanded
- **Image Compression**: Use optimized image sizes
- **Caching**: Browser caches images automatically
- **CDN**: Recommend using CDN for image delivery

### File Size Recommendations
- **Gallery Thumbs**: 300×225 px, ~50-75 KB
- **Full View**: 1200×900 px, ~150-250 KB

## Troubleshooting

### Gallery Not Appearing
- Check if `propertyImages` is defined in room config
- Verify image array is not empty
- Check `showImageGallery` state is true

### Images Not Loading
- Verify image URLs are correct and accessible
- Check CORS headers on CDN
- Ensure image format is supported (JPG, PNG, WebP)

### Performance Issues
- Reduce image file sizes
- Use image optimization services
- Consider lazy loading for many images

## Future Enhancements

1. **Image Upload**: Allow users to upload custom property images
2. **360 Integration**: Link 2D images to specific panorama hotspots
3. **Carousel Auto-play**: Auto-advance through images
4. **Image Filters**: Add filters or editing options
5. **Social Sharing**: Share individual images or galleries
6. **AR Preview**: Augmented reality image overlays

## File Structure

\`\`\`
/components
  - property-image-gallery.tsx    # Gallery component
  - vr-property-tour-viewer.tsx   # VR viewer with gallery integration

/lib
  - vr-tour-types.ts             # Type definitions (PropertyImage interface)
  - vr-tour-config.ts            # Configuration with property images
\`\`\`

## Examples

### Example: Real Estate Agent Setup

\`\`\`typescript
// Create a luxury penthouse property
const luxuryPenthouse: VRPropertyTour = {
  propertyId: 'lux-001',
  propertyName: 'Downtown Luxury Penthouse',
  price: 2500000,
  piPrice: 250000,
  rooms: [
    {
      id: 0,
      name: 'Master Suite',
      imageUrl: 'https://cdn.example.com/master-360.jpg',
      propertyImages: [
        { id: 'ms-1', url: 'https://cdn.example.com/master-1.jpg', caption: 'Master Bedroom - Main View', featured: true },
        { id: 'ms-2', url: 'https://cdn.example.com/master-2.jpg', caption: 'Master Bedroom - Sitting Area' },
      ],
      price: 2500000,
      hotspots: []
    }
  ]
};
\`\`\`

## Support

For issues or questions about the property image gallery system, refer to:
- Component code: `/components/property-image-gallery.tsx`
- Configuration: `/lib/vr-tour-config.ts`
- Type definitions: `/lib/vr-tour-types.ts`
