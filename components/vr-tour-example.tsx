'use client';

import { useState } from 'react';
import { VRPropertyTour } from '@/components/vr-property-tour';
import { useVRTour } from '@/hooks/use-vr-tour';
import { EXAMPLE_LUXURY_APARTMENT } from '@/lib/vr-property-config';
import { Button } from '@/components/ui/button';

/**
 * Example component showing how to integrate VR property tours
 * Use this as a reference for adding VR tours to property cards or detail pages
 */
export const VRTourExample = () => {
  const {
    isOpen,
    currentTour,
    openTour,
    closeTour,
    handleBuyClick,
  } = useVRTour({
    onTourStart: (propertyId) => {
      console.log('🎬 VR Tour started:', propertyId);
    },
    onTourEnd: (propertyId) => {
      console.log('🎬 VR Tour ended:', propertyId);
    },
    onRoomChange: (roomId, roomName) => {
      console.log(`📍 Navigated to room:`, roomName);
    },
    onBuyClick: (propertyId, price) => {
      console.log(`💰 Buy clicked for property ${propertyId} - Price: π${price}`);
    },
  });

  const handleOpenTour = () => {
    openTour(EXAMPLE_LUXURY_APARTMENT);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Tour Launcher Card */}
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {EXAMPLE_LUXURY_APARTMENT.propertyName}
            </h2>
            <p className="text-muted-foreground mt-1">
              {EXAMPLE_LUXURY_APARTMENT.rooms.length} rooms • 360° VR Tour Available
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {EXAMPLE_LUXURY_APARTMENT.rooms.map((room) => (
              <div key={room.id} className="bg-background/50 rounded p-3">
                <p className="font-semibold text-sm text-accent">{room.name}</p>
                {room.features && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {room.features.join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleOpenTour}
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            Launch VR Tour 🥽
          </Button>
        </div>
      </div>

      {/* Integration Instructions */}
      <div className="bg-background border border-muted rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-foreground">How to Integrate VR Tours</h3>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-accent mb-1">1. Import Components & Hook</p>
            <code className="bg-muted text-muted-foreground block p-2 rounded text-xs overflow-x-auto">
              {`import { VRPropertyTour } from '@/components/vr-property-tour';\nimport { useVRTour } from '@/hooks/use-vr-tour';`}
            </code>
          </div>

          <div>
            <p className="font-medium text-accent mb-1">2. Initialize Hook</p>
            <code className="bg-muted text-muted-foreground block p-2 rounded text-xs overflow-x-auto">
              {`const { isOpen, currentTour, openTour, closeTour } = useVRTour();`}
            </code>
          </div>

          <div>
            <p className="font-medium text-accent mb-1">3. Create Room Data</p>
            <code className="bg-muted text-muted-foreground block p-2 rounded text-xs overflow-x-auto">
              {`const tour = createPropertyTour('prop-1', 'Property Name', [\n  { id: 'room1', name: 'Living Room', imageUrl: '...', connections: [...] },\n  ...\n]);`}
            </code>
          </div>

          <div>
            <p className="font-medium text-accent mb-1">4. Render Tour</p>
            <code className="bg-muted text-muted-foreground block p-2 rounded text-xs overflow-x-auto">
              {`{isOpen && currentTour && (\n  <VRPropertyTour\n    propertyId={currentTour.propertyId}\n    rooms={currentTour.rooms}\n    onClose={closeTour}\n    onBuyClick={handleBuy}\n  />\n)}`}
            </code>
          </div>
        </div>
      </div>

      {/* Room Data Format */}
      <div className="bg-background border border-muted rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Room & Hotspot Configuration</h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">imageUrl:</strong> Panoramic 360° equirectangular image
          </p>
          <p>
            <strong className="text-foreground">pitch:</strong> Vertical angle (-90 to 90, where 0 is horizontal)
          </p>
          <p>
            <strong className="text-foreground">yaw:</strong> Horizontal angle (0-360°, where 0 is forward)
          </p>
          <p>
            <strong className="text-foreground">targetRoomId:</strong> ID of room to navigate to when hotspot clicked
          </p>
        </div>
      </div>

      {/* Render VR Tour if Open */}
      {isOpen && currentTour && (
        <VRPropertyTour
          propertyId={currentTour.propertyId}
          rooms={currentTour.rooms}
          onClose={closeTour}
          onBuyClick={handleBuyClick}
        />
      )}
    </div>
  );
};
