'use client';

import { useState } from 'react';
import { VRPropertyTourViewer } from '@/components/vr-property-tour-viewer';
import { Button } from '@/components/ui/button';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';

export const VRTourDemo = () => {
  const [showTour, setShowTour] = useState(false);

  const handleBuyClick = () => {
    alert('Buy with Pi feature - Integrate with Pi payment SDK here');
  };

  if (showTour) {
    return (
      <VRPropertyTourViewer
        property={DEMO_PROPERTY}
        onClose={() => setShowTour(false)}
        onBuyClick={handleBuyClick}
      />
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4">
      <Button
        onClick={() => setShowTour(true)}
        size="lg"
        className="bg-accent hover:opacity-90 text-accent-foreground font-semibold"
      >
        Start VR Tour
      </Button>
    </div>
  );
};

export default VRTourDemo;
