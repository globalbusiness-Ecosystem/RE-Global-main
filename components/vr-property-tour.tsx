'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Maximize2, ChevronLeft, ChevronRight, Play, Pause, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Room {
  id: string;
  name: string;
  imageUrl: string;
  nextRoomId?: string;
  hotspots: Hotspot[];
}

interface Hotspot {
  id: string;
  pitch: number;
  yaw: number;
  targetRoomId: string;
  title: string;
}

interface VRPropertyTourProps {
  propertyId: string;
  propertyPrice?: number;
  currency?: string;
  rooms?: Room[];
  onClose: () => void;
  onBuyClick?: () => void;
}

const DEMO_ROOMS: Room[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1616394584318-e3e4e7874b0e?w=1280&h=640&fit=crop&q=85',
    nextRoomId: 'bedroom',
    hotspots: [
      {
        id: 'hotspot-1',
        pitch: 0,
        yaw: 90,
        targetRoomId: 'bedroom',
        title: '→ Bedroom',
      },
      {
        id: 'hotspot-2',
        pitch: 0,
        yaw: 180,
        targetRoomId: 'kitchen',
        title: '→ Kitchen',
      },
    ],
  },
  {
    id: 'bedroom',
    name: 'Master Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1280&h=640&fit=crop&q=85',
    nextRoomId: 'kitchen',
    hotspots: [
      {
        id: 'hotspot-3',
        pitch: 0,
        yaw: 90,
        targetRoomId: 'kitchen',
        title: '→ Kitchen',
      },
      {
        id: 'hotspot-4',
        pitch: 0,
        yaw: 270,
        targetRoomId: 'living-room',
        title: '← Living Room',
      },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1280&h=640&fit=crop&q=85',
    nextRoomId: 'bathroom',
    hotspots: [
      {
        id: 'hotspot-5',
        pitch: 0,
        yaw: 90,
        targetRoomId: 'bathroom',
        title: '→ Bathroom',
      },
      {
        id: 'hotspot-6',
        pitch: 0,
        yaw: 270,
        targetRoomId: 'living-room',
        title: '← Living Room',
      },
    ],
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1280&h=640&fit=crop&q=85',
    nextRoomId: 'living-room',
    hotspots: [
      {
        id: 'hotspot-7',
        pitch: 0,
        yaw: 90,
        targetRoomId: 'living-room',
        title: '← Living Room',
      },
    ],
  },
];

declare global {
  interface Window {
    pannellum: any;
  }
}

export const VRPropertyTour = ({
  propertyId,
  propertyPrice = 250000,
  currency = 'π',
  rooms = DEMO_ROOMS,
  onClose,
  onBuyClick,
}: VRPropertyTourProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const gazeReticleRef = useRef<HTMLDivElement>(null);

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [gazeCountdown, setGazeCountdown] = useState(0);
  const [gyroEnabled, setGyroEnabled] = useState(false);

  const gazeTimeoutRef = useRef<NodeJS.Timeout>();
  const gazeHotspotRef = useRef<string | null>(null);
  const currentRoom = rooms[currentRoomIndex];

  // Initialize Pannellum with full 360° viewer
  useEffect(() => {
    const loadPannellum = async () => {
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = 'https://pannellum.org/css/pannellum.css';
        document.head.appendChild(link);
      }

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

      const hotspots = currentRoom.hotspots.map((hotspot) => ({
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: 'custom',
        text: hotspot.title,
        cssClass: 'vr-hotspot-360',
        clickHandlerFunc: () => handleHotspotClick(hotspot.targetRoomId),
      }));

      const config = {
        default: {
          firstScene: currentRoom.id,
          autoLoad: true,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          compass: false,
          showControls: false,
          hotSpotDebug: false,
        },
        scenes: {
          [currentRoom.id]: {
            title: currentRoom.name,
            panorama: currentRoom.imageUrl,
            pitch: 0,
            yaw: 0,
            hfov: 100,
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
          setupGazeDetection();
          setupGyroscope();
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
      if (gazeTimeoutRef.current) clearTimeout(gazeTimeoutRef.current);
    };
  }, [currentRoom, autoRotate]);

  // Gaze detection with 2-second hotspot trigger
  const setupGazeDetection = () => {
    if (!viewerRef.current || !showHotspots) return;

    const detectGaze = () => {
      if (!viewerRef.current || !showHotspots) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const gazeRadius = 60;

      const hotspotElements = document.querySelectorAll('.vr-hotspot-360');
      let gazeHotspot: string | null = null;

      hotspotElements.forEach((element: any) => {
        const rect = element.getBoundingClientRect();
        const hotspotX = rect.left + rect.width / 2;
        const hotspotY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(centerX - hotspotX, 2) + Math.pow(centerY - hotspotY, 2)
        );

        if (distance < gazeRadius) {
          gazeHotspot = element.getAttribute('data-hotspot-id');
        }
      });

      if (gazeHotspot && gazeHotspot !== gazeHotspotRef.current) {
        gazeHotspotRef.current = gazeHotspot;
        setGazeCountdown(2);

        if (gazeTimeoutRef.current) clearTimeout(gazeTimeoutRef.current);

        gazeTimeoutRef.current = setTimeout(() => {
          const targetHotspot = currentRoom.hotspots.find(
            (h) => h.id === gazeHotspot
          );
          if (targetHotspot) {
            handleHotspotClick(targetHotspot.targetRoomId);
          }
        }, 2000);
      } else if (!gazeHotspot) {
        gazeHotspotRef.current = null;
        setGazeCountdown(0);
        if (gazeTimeoutRef.current) clearTimeout(gazeTimeoutRef.current);
      }

      requestAnimationFrame(detectGaze);
    };

    detectGaze();
  };

  // Setup gyroscope for device motion control
  const setupGyroscope = () => {
    if (!viewerRef.current) return;

    const requestPermission = async () => {
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && (DeviceOrientationEvent as any).requestPermission) {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            viewerRef.current.setOrientationControls(true);
            setGyroEnabled(true);
          }
        } else if (typeof window.DeviceOrientationEvent !== 'undefined') {
          viewerRef.current.setOrientationControls(true);
          setGyroEnabled(true);
        }
      } catch (error) {
        console.log('Gyroscope not available');
      }
    };

    requestPermission();
  };

  // Custom styling for 360° hotspots
  const addCustomStyling = () => {
    if (!document.getElementById('vr-360-styles')) {
      const style = document.createElement('style');
      style.id = 'vr-360-styles';
      style.textContent = `
        .pannellum-container {
          background-color: #030712 !important;
        }

        .vr-hotspot-360 {
          width: 70px !important;
          height: 70px !important;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, rgba(245, 158, 11, 0.3) 100%) !important;
          border: 3px solid #F59E0B !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          animation: pulse-360 2s ease-in-out infinite !important;
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.7), inset 0 0 15px rgba(245, 158, 11, 0.3) !important;
          font-size: 16px !important;
          font-weight: bold !important;
          color: #FFF8DC !important;
          padding: 0 !important;
        }

        .vr-hotspot-360:hover {
          transform: scale(1.3) !important;
          box-shadow: 0 0 40px rgba(245, 158, 11, 1), inset 0 0 20px rgba(245, 158, 11, 0.5) !important;
          background: radial-gradient(circle, rgba(245, 158, 11, 1) 0%, rgba(245, 158, 11, 0.6) 100%) !important;
        }

        @keyframes pulse-360 {
          0%, 100% {
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.7), inset 0 0 15px rgba(245, 158, 11, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(245, 158, 11, 1), inset 0 0 20px rgba(245, 158, 11, 0.5);
          }
        }

        .pannellum-controls {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  const handleHotspotClick = (targetRoomId: string) => {
    const targetIndex = rooms.findIndex((r) => r.id === targetRoomId);
    if (targetIndex !== -1) {
      setIsLoading(true);
      setCurrentRoomIndex(targetIndex);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const navigateRoom = (direction: 'prev' | 'next') => {
    let newIndex = currentRoomIndex;
    if (direction === 'next') {
      newIndex = (currentRoomIndex + 1) % rooms.length;
    } else {
      newIndex = (currentRoomIndex - 1 + rooms.length) % rooms.length;
    }
    setIsLoading(true);
    setCurrentRoomIndex(newIndex);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
    if (viewerRef.current) {
      viewerRef.current.setAutoRotate(!autoRotate ? -2 : 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Gaze Reticle - Center */}
      <div
        ref={gazeReticleRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
      >
        <div className="w-8 h-8 border-2 border-gold/60 rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gold rounded-full" />
        
        {gazeCountdown > 0 && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-gold font-bold text-2xl">
            {gazeCountdown}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-gold hover:text-yellow-300 transition-all border border-gold/30 hover:border-gold"
        aria-label="Close tour"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Room Info - Top Left */}
      <div className="absolute top-4 left-4 z-40">
        <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-gold/20">
          <h2 className="text-lg font-semibold text-gold">{currentRoom.name}</h2>
          <p className="text-xs text-gold/60">
            {currentRoomIndex + 1} / {rooms.length}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-gold font-medium">Loading {currentRoom.name}...</p>
          </div>
        </div>
      )}

      {/* Controls - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className="p-3 rounded-lg bg-black/50 border border-gold/30 hover:border-gold hover:bg-black/70 transition-all text-gold hover:text-yellow-300"
          title={showHotspots ? 'Hide hotspots' : 'Show hotspots'}
        >
          <Eye className={`w-5 h-5 ${!showHotspots ? 'opacity-50' : ''}`} />
        </button>

        <button
          onClick={toggleAutoRotate}
          className="p-3 rounded-lg bg-black/50 border border-gold/30 hover:border-gold hover:bg-black/70 transition-all text-gold hover:text-yellow-300"
          title={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
        >
          {autoRotate ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          onClick={handleFullscreen}
          className="p-3 rounded-lg bg-black/50 border border-gold/30 hover:border-gold hover:bg-black/70 transition-all text-gold hover:text-yellow-300"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {gyroEnabled && (
          <div className="text-xs text-gold/60 bg-black/50 px-3 py-1 rounded border border-gold/20 text-center">
            Gyro
          </div>
        )}
      </div>

      {/* Room Navigation - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/60 backdrop-blur-md border border-gold/20 rounded-full px-3 py-2 flex items-center gap-3">
          <button
            onClick={() => navigateRoom('prev')}
            className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold hover:text-yellow-300"
            title="Previous room"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2 px-2">
            {rooms.map((room, index) => (
              <button
                key={room.id}
                onClick={() => {
                  setIsLoading(true);
                  setCurrentRoomIndex(index);
                  setTimeout(() => setIsLoading(false), 500);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentRoomIndex
                    ? 'bg-gold w-6'
                    : 'bg-gold/40 hover:bg-gold/60'
                }`}
                title={room.name}
              />
            ))}
          </div>

          <button
            onClick={() => navigateRoom('next')}
            className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold hover:text-yellow-300"
            title="Next room"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Buy Button - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-40">
        <Button
          onClick={onBuyClick}
          className="bg-gold hover:bg-yellow-300 text-black font-semibold flex items-center gap-2"
        >
          Buy • {currency}
          {propertyPrice && `${propertyPrice.toLocaleString()}`}
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 text-center pointer-events-none">
        <p className="text-gold/60 text-sm bg-black/40 px-4 py-2 rounded backdrop-blur-sm border border-gold/20">
          Drag 360° • Scroll to zoom • Gaze 2s to navigate • Phone motion enabled
        </p>
      </div>
    </div>
  );
};
