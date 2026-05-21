'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Eye, Pause, Play, Image as ImageIcon } from 'lucide-react';
import { DEMO_PROPERTY } from '@/lib/vr-tour-config';
import { VRPropertyTour } from '@/lib/vr-tour-types';
import { Button } from '@/components/ui/button';
import { PropertyImageGallery } from '@/components/property-image-gallery';

interface VRPropertyTourViewerProps {
  property?: VRPropertyTour;
  onClose: () => void;
  onBuyClick?: () => void;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export const VRPropertyTourViewer = ({
  property = DEMO_PROPERTY,
  onClose,
  onBuyClick,
}: VRPropertyTourViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(75);
  const [showImageGallery, setShowImageGallery] = useState(true);

  const currentRoom = property.rooms[currentRoomIndex];

  // Initialize Pannellum 360° viewer
  useEffect(() => {
    const loadPannellum = async () => {
      // Load CSS
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = 'https://pannellum.org/css/pannellum.css';
        document.head.appendChild(link);
      }

      // Load Script
      if (!window.pannellum) {
        const script = document.createElement('script');
        script.src = 'https://pannellum.org/js/pannellum.js';
        script.async = true;
        script.onload = () => initPannellum();
        document.body.appendChild(script);
      } else {
        initPannellum();
      }
    };

    const initPannellum = () => {
      if (!containerRef.current) return;

      const hotspots = (currentRoom.hotspots || []).map((hotspot, idx) => ({
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: 'custom',
        text: hotspot.text,
        cssClass: 'vr-hotspot-360-gold',
        clickHandlerFunc: () => handleHotspotClick(hotspot.targetRoom),
      }));

      const config = {
        default: {
          firstScene: currentRoom.name,
          autoLoad: true,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          compass: false,
          showControls: false,
          hotSpotDebug: false,
        },
        scenes: {
          [currentRoom.name]: {
            title: currentRoom.name,
            panorama: currentRoom.imageUrl,
            pitch: 0,
            yaw: 0,
            hfov: zoom,
            autoRotate: autoRotate ? -2 : 0,
            hotSpots: hotspots,
          },
        },
      };

      try {
        if (viewerRef.current) {
          viewerRef.current.destroy?.();
        }

        viewerRef.current = window.pannellum.viewer(containerRef.current, config);

        viewerRef.current.on('load', () => {
          setIsLoading(false);
          addCustomStyling();
        });

        viewerRef.current.on('error', (error: string) => {
          console.error('Pannellum error:', error);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Pannellum init error:', error);
        setIsLoading(false);
      }
    };

    loadPannellum();

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy?.();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [currentRoom, autoRotate, zoom]);

  // Custom styling for 360° hotspots
  const addCustomStyling = () => {
    if (!document.getElementById('vr-360-luxury-styles')) {
      const style = document.createElement('style');
      style.id = 'vr-360-luxury-styles';
      style.textContent = `
        .pannellum-container {
          background-color: #030712 !important;
        }

        .vr-hotspot-360-gold {
          width: 80px !important;
          height: 80px !important;
          background: radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.9) 0%, rgba(245, 158, 11, 0.4) 100%) !important;
          border: 3px solid #F59E0B !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          animation: pulse-360-gold 2.5s ease-in-out infinite !important;
          box-shadow: 
            0 0 30px rgba(245, 158, 11, 0.8),
            0 0 60px rgba(245, 158, 11, 0.4),
            inset 0 0 20px rgba(245, 158, 11, 0.3) !important;
          font-size: 28px !important;
          font-weight: bold !important;
          color: #FFF8DC !important;
          padding: 0 !important;
          user-select: none !important;
        }

        .vr-hotspot-360-gold:hover {
          transform: scale(1.35) !important;
          box-shadow: 
            0 0 50px rgba(245, 158, 11, 1),
            0 0 100px rgba(245, 158, 11, 0.6),
            inset 0 0 30px rgba(245, 158, 11, 0.5) !important;
          background: radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 1) 0%, rgba(245, 158, 11, 0.7) 100%) !important;
        }

        @keyframes pulse-360-gold {
          0%, 100% {
            box-shadow: 
              0 0 30px rgba(245, 158, 11, 0.8),
              0 0 60px rgba(245, 158, 11, 0.4),
              inset 0 0 20px rgba(245, 158, 11, 0.3);
          }
          50% {
            box-shadow: 
              0 0 50px rgba(245, 158, 11, 1),
              0 0 100px rgba(245, 158, 11, 0.6),
              inset 0 0 30px rgba(245, 158, 11, 0.5);
          }
        }

        .pannellum-controls {
          display: none !important;
        }

        .pannellum-container canvas {
          display: block !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  const handleHotspotClick = (targetRoomIndex: number) => {
    if (targetRoomIndex >= 0 && targetRoomIndex < property.rooms.length) {
      setIsLoading(true);
      setCurrentRoomIndex(targetRoomIndex);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
    if (viewerRef.current) {
      viewerRef.current.setAutoRotate(!autoRotate ? -2 : 0);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? prev - 10 : prev + 10;
      return Math.max(30, Math.min(120, newZoom));
    });
  };

  const goToRoom = (index: number) => {
    if (index >= 0 && index < property.rooms.length) {
      setIsLoading(true);
      setCurrentRoomIndex(index);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Close Button - Gold X */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 text-gold hover:text-yellow-300 transition-all border-2 border-gold hover:border-yellow-300 flex items-center justify-center"
        aria-label="Close VR tour"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Room Info - Top Left */}
      <div className="absolute top-6 left-6 z-40">
        <div className="bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border-2 border-gold/40 hover:border-gold/80 transition-all">
          <h2 className="text-xl font-bold text-gold">{currentRoom.name}</h2>
          <p className="text-sm text-gold/70 mt-1">
            Room {currentRoomIndex + 1} of {property.rooms.length}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gold/20 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-transparent border-t-gold rounded-full animate-spin" 
                   style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-gold font-semibold text-lg">Loading {currentRoom.name}...</p>
          </div>
        </div>
      )}

      {/* Controls - Top Right */}
      <div className="absolute top-6 right-20 z-40 flex gap-3 bg-black/60 backdrop-blur-md px-3 py-3 rounded-xl border border-gold/30">
        <button
          onClick={() => setShowImageGallery(!showImageGallery)}
          className="p-2 rounded-lg bg-black/50 border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all text-gold hover:text-yellow-300"
          title={showImageGallery ? 'Hide photo gallery' : 'Show photo gallery'}
        >
          <ImageIcon className={`w-5 h-5 ${!showImageGallery ? 'opacity-50' : ''}`} />
        </button>

        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className="p-2 rounded-lg bg-black/50 border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all text-gold hover:text-yellow-300"
          title={showHotspots ? 'Hide hotspots' : 'Show hotspots'}
        >
          <Eye className={`w-5 h-5 ${!showHotspots ? 'opacity-50' : ''}`} />
        </button>

        <button
          onClick={toggleAutoRotate}
          className="p-2 rounded-lg bg-black/50 border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all text-gold hover:text-yellow-300"
          title={autoRotate ? 'Stop rotating' : 'Start rotating'}
        >
          {autoRotate ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          onClick={() => handleZoom('in')}
          className="px-3 py-2 rounded-lg bg-black/50 border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all text-gold hover:text-yellow-300 font-semibold text-sm"
          title="Zoom in"
        >
          +
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="px-3 py-2 rounded-lg bg-black/50 border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all text-gold hover:text-yellow-300 font-semibold text-sm"
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* Room Navigation - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/70 backdrop-blur-md border-2 border-gold/40 hover:border-gold/60 transition-all rounded-full px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => goToRoom(currentRoomIndex - 1)}
            disabled={currentRoomIndex === 0}
            className="p-2 text-gold hover:text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ←
          </button>

          <div className="flex gap-2">
            {property.rooms.map((room, idx) => (
              <button
                key={idx}
                onClick={() => goToRoom(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentRoomIndex
                    ? 'bg-gold w-8'
                    : 'bg-gold/40 hover:bg-gold/70'
                }`}
                title={room.name}
              />
            ))}
          </div>

          <button
            onClick={() => goToRoom(currentRoomIndex + 1)}
            disabled={currentRoomIndex === property.rooms.length - 1}
            className="p-2 text-gold hover:text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            →
          </button>
        </div>
      </div>

      {/* Buy Button - Bottom Left */}
      <div className="absolute bottom-8 left-8 z-40">
        <Button
          onClick={onBuyClick}
          className="bg-gold hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
        >
          Buy • π {currentRoom.price?.toLocaleString() || 'Contact'}
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 text-center pointer-events-none">
        <p className="text-gold/60 text-sm bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm border border-gold/30">
          🖱️ Drag to explore • 🔍 Scroll/+− to zoom • ⭕ Gold dots = next room • 🖼️ Photos in bottom-right
        </p>
      </div>

      {/* Property Image Gallery - Bottom Right */}
      {showImageGallery && currentRoom.propertyImages && currentRoom.propertyImages.length > 0 && (
        <PropertyImageGallery
          images={currentRoom.propertyImages}
          roomName={currentRoom.name}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  );
};
