# Quick Integration Guide for Remaining Pages

## How to Integrate Ultra Panoramic Viewer into Remaining Pages

### Complete in 3 Simple Steps

#### Step 1: Update Imports
Replace:
\`\`\`tsx
import { PanormicViewer } from '@/components/panoramic-viewer';
\`\`\`

With:
\`\`\`tsx
import { UltraPanormicViewer } from '@/components/ultra-panoramic-viewer';
import PanormicIntegration from '@/lib/panoramic-integration';
\`\`\`

#### Step 2: Find Your Panoramic Viewer Usage
Look for:
\`\`\`tsx
{activeTourProperty && (
  <PanormicViewer
    panoramaUrl={activeTourProperty.panoramaUrl}
    ...
  />
)}
\`\`\`

#### Step 3: Replace with Ultra Viewer
Replace with:
\`\`\`tsx
{activeTourProperty?.panoramaUrl && (
  PanormicIntegration.renderViewer({
    panoramaUrl: activeTourProperty.panoramaUrl,
    title: language === 'en' ? activeTourProperty.titleEn : activeTourProperty.titleAr,
    onClose: () => setActiveTourId(null),
    countryCode: activeTourProperty.country,
    propertyId: activeTourProperty.id,
    language,
  })
)}
\`\`\`

---

## Remaining Pages to Update

### 1. tokenized-page.tsx
**Location**: `/components/pages/tokenized-page.tsx`
**Properties**: Tokenized real estate assets
**Follow**: Same pattern as invest-page.tsx

### 2. offplan-page.tsx
**Location**: `/components/pages/offplan-page.tsx`
**Properties**: Off-plan developments
**Follow**: Same pattern as buy-page.tsx

### 3. abroad-page.tsx
**Location**: `/components/pages/abroad-page.tsx`
**Properties**: International properties
**Follow**: Same pattern as invest-page.tsx
**Note**: Let PanormicIntegration handle multi-region

### 4. properties-page.tsx
**Location**: `/components/pages/properties-page.tsx`
**Properties**: General property listings
**Follow**: Same pattern as buy-page.tsx

### 5. favorites-page.tsx
**Location**: `/components/pages/favorites-page.tsx`
**Properties**: User's favorite properties
**Follow**: Same pattern as buy-page.tsx
**Note**: May need to detect property category

---

## Code Template for All Remaining Pages

\`\`\`tsx
'use client';

import { MapPin, Bed, Maximize2, Video, Heart } from 'lucide-react';
import { useMemo, memo, useState } from 'react';
import { UltraPanormicViewer } from '@/components/ultra-panoramic-viewer';
import PanormicIntegration from '@/lib/panoramic-integration';

interface PageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export default function YourPage({ 
  language, 
  currency, 
  favorites, 
  toggleFavorite 
}: PageProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  
  const activeTourProperty = properties.find((p) => p.id === activeTourId);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Your Page Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            language={language}
            currency={currency}
            isFavorite={favoriteSet.has(property.id)}
            onToggleFavorite={() => toggleFavorite(property.id)}
            onTourClick={() => setActiveTourId(property.id)}
          />
        ))}
      </div>

      {/* Ultra Panoramic Viewer */}
      {activeTourProperty?.panoramaUrl && (
        PanormicIntegration.renderViewer({
          panoramaUrl: activeTourProperty.panoramaUrl,
          title: language === 'en' 
            ? activeTourProperty.titleEn 
            : activeTourProperty.titleAr,
          onClose: () => setActiveTourId(null),
          countryCode: activeTourProperty.country,
          propertyId: activeTourProperty.id,
          language,
        })
      )}
    </div>
  );
}
\`\`\`

---

## Important Notes

### Always Include:
1. ✅ `UltraPanormicViewer` import
2. ✅ `PanormicIntegration` import
3. ✅ `activeTourId` state
4. ✅ `activeTourProperty` finder
5. ✅ Conditional render check

### Never Include:
- ❌ Old `PanormicViewer` import
- ❌ Manual quality/region settings
- ❌ Missing country code
- ❌ Undefined language prop

### Quality Auto-Detection
\`\`\`tsx
// No need to specify quality - it auto-detects:
// MENA → 4K
// EU → 4K
// NA → 4K
// ASIA → 2K
// AFRICA → 2K
// LATAM → 2K
\`\`\`

### Region Auto-Detection
\`\`\`tsx
// PanormicIntegration.getRegion('AE') → 'MENA'
// PanormicIntegration.getRegion('US') → 'NA'
// PanormicIntegration.getRegion('SG') → 'ASIA'
// PanormicIntegration.getRegion('BR') → 'LATAM'
\`\`\`

---

## Testing Your Integration

1. **Quick Test**
   \`\`\`tsx
   import PanormicIntegration from '@/lib/panoramic-integration';
   
   console.log(PanormicIntegration.getRegion('AE')); // Should log 'MENA'
   console.log(PanormicIntegration.getQualityForRegion('MENA')); // Should log '4k'
   \`\`\`

2. **Component Test**
   - Open your page
   - Click a property with panoramaUrl
   - Viewer should appear with smooth transitions
   - Auto-rotation should start
   - Stats should display

3. **Performance Test**
   - Open DevTools Performance tab
   - Load time should be 1.5-2.5s
   - FPS should stay at 60 when rotating
   - Memory should not exceed 400MB

---

## Migration Timeline

- ✅ **Phase 1**: Core engine built (Done)
- ✅ **Phase 2**: Buy/Rent/Hotel/Invest integrated (Done)
- ⏳ **Phase 3**: Remaining 5 pages (In Progress)
- ⏳ **Phase 4**: Analytics integration (Pending)
- ⏳ **Phase 5**: Backend database sync (Pending)

---

## Support

For questions or issues:
1. Check ULTRA_PANORAMIC_COMPLETE_GUIDE.md
2. Review ULTRA_PANORAMIC_QUICK_REFERENCE.md
3. Check browser console for errors
4. Verify property has valid panoramaUrl

---

**Total Integration Time Per Page**: 5-10 minutes
**Difficulty Level**: Very Easy
**Breaking Changes**: None (backward compatible)
