'use client';

import { useEffect, useState } from 'react';

const bannerImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9a485dc3014f?w=1400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&h=300&fit=crop',
];

export default function PanoramicBanner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '180px' }}>
      <style>{`
        @keyframes kenBurns {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.15);
          }
        }
        
        .ken-burns-animation {
          animation: kenBurns 6s ease-out forwards;
        }
      `}</style>

      {/* Background Image with Ken Burns Animation */}
      <div
        className="absolute inset-0 bg-cover bg-center ken-burns-animation"
        style={{
          backgroundImage: `url('${bannerImages[currentImageIndex]}')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/30" />

      {/* Featured Properties Text */}
      <div className="absolute bottom-6 left-6 z-10">
        <h2 className="text-2xl font-bold tracking-wide" style={{ color: 'rgb(212, 175, 55)' }}>
          Featured Properties
        </h2>
      </div>
    </div>
  );
}
