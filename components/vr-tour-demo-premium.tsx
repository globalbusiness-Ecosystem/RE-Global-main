'use client';

import { useState } from 'react';
import { LuxuryVRTour } from '@/components/luxury-vr-tour';
import { Button } from '@/components/ui/button';
import { EXAMPLE_LUXURY_PROPERTY } from '@/lib/luxury-vr-config';

export default function VRTourDemo() {
  const [showVRTour, setShowVRTour] = useState(false);

  const handleBuy = () => {
    alert('Initiating purchase flow with π network...');
    // Integrate with your payment system here
  };

  if (showVRTour) {
    return (
      <LuxuryVRTour
        config={EXAMPLE_LUXURY_PROPERTY}
        onClose={() => setShowVRTour(false)}
        onBuyClick={handleBuy}
        price={250000}
        currency="π"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6 md:p-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200 mb-4">
          Luxury VR Tour Experience
        </h1>
        <p className="text-gray-400 text-lg">
          Premium 360° panoramic property tours with gyroscope support, AI-enhanced staging, and multi-scene management.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: '🎬',
            title: '360° Panoramas',
            description: 'Immersive equirectangular panoramic views of every room',
          },
          {
            icon: '📱',
            title: 'Gyroscope Control',
            description: 'Mobile device orientation for look-around immersion',
          },
          {
            icon: '✨',
            title: 'AI Design Toggle',
            description: 'Switch between current state and furnished designs',
          },
          {
            icon: '🎯',
            title: 'Smart Hotspots',
            description: 'Gold pulse markers for seamless room navigation',
          },
          {
            icon: '⌨️',
            title: 'Multi-Control',
            description: 'Mouse, touch, gyroscope, and keyboard support',
          },
          {
            icon: '⚡',
            title: 'Performance',
            description: 'Optimized canvas rendering with smooth animations',
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-6 hover:border-amber-500/60 transition-colors"
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h3 className="text-amber-200 font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="max-w-4xl mx-auto text-center">
        <Button
          onClick={() => setShowVRTour(true)}
          size="lg"
          className="bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-bold text-lg shadow-lg shadow-amber-500/50 px-8 py-3"
        >
          🏠 Launch VR Tour
        </Button>

        <p className="text-gray-400 text-sm mt-6 max-w-2xl mx-auto">
          Example featuring the Luxury Penthouse with 5 rooms. Use mouse/touch to look around, scroll to zoom, and drag
          between rooms using hotspots.
        </p>
      </div>

      {/* Integration Info */}
      <div className="max-w-4xl mx-auto mt-16 bg-slate-800/30 border border-amber-500/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-amber-200 mb-4">Integration Guide</h2>
        <p className="text-gray-400 mb-4">
          The LuxuryVRTour component is ready to integrate with your property listings. Pass your VRTourConfig with
          scene data:
        </p>
        <pre className="bg-black/50 text-amber-200 p-4 rounded text-sm overflow-x-auto">
          {`<LuxuryVRTour
  config={yourVRTourConfig}
  onClose={() => setShowTour(false)}
  onBuyClick={handlePurchase}
  price={250000}
  currency="π"
/>`}
        </pre>
      </div>
    </div>
  );
}
