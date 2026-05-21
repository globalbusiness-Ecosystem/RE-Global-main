'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Maximize2, ChevronLeft, ChevronRight, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VRTourConfig } from '@/lib/vr-tour-types';

interface LuxuryVRTourProps {
  config: VRTourConfig;
  onClose: () => void;
  onBuyClick?: () => void;
  price?: number;
  currency?: string;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export const LuxuryVRTour: React.FC<LuxuryVRTourProps> = ({
  config,
  onClose,
  onBuyClick,
  price,
  currency = 'π',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const gazeReticleRef = useRef<HTMLDivElement>(null);
  
  const [currentSceneId, setCurrentSceneId] = useState(config.defaultSceneId);
  const [isLoading, setIsLoading] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [autoRotate, setAutoRotate] = useState(config.enableAutoRotate || false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [gazeCountdown, setGazeCountdown] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gazeTimeoutRef = useRef<NodeJS.Timeout>();
  const gazeHotspotRef = useRef<string | null>(null);

  const currentScene = config.scenes.find((s) => s.id === currentSceneId);

  // Load Pannellum and initialize 360 viewer
  useEffect(() => {
    if (!currentScene) return;

    const loadPannellum = async () => {
      // Load CSS
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = 'https://pannellum.org/css/pannellum.css';
        document.head.appendChild(link);
      }

      // Load JS
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

      const hotspots = currentScene.hotspots.map((hotspot) => ({
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: 'custom',
        text: hotspot.title,
        cssClass: 'vr-hotspot-360',
        clickHandlerFunc: () => navigateToScene(hotspot.targetRoom),
      }));

      const config = {
        default: {
          firstScene: currentScene.id,
          autoLoad: true,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          compass: false,
          showControls: false,
          hotSpotDebug: false,
        },
        scenes: {
          [currentScene.id]: {
            title: currentScene.title,
            panorama: currentScene.imageUrl,
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
        
        // Setup event handlers
        viewerRef.current.on('load', () => {
          setIsLoading(false);
          setupHotspotGazeDetection();
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
  }, [currentScene, autoRotate]);

  // Setup gyroscope
  useEffect(() => {
    if (!config.enableGyroscope || !viewerRef.current) return;

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
  }, [config.enableGyroscope]);

  // Gaze detection with hotspot targeting
  const setupHotspotGazeDetection = () => {
    if (!viewerRef.current) return;

    const detectGaze = () => {
      if (!viewerRef.current || !showHotspots) return;

      const viewer = viewerRef.current;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const gazeRadius = 60;

      // Check each hotspot
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
          const targetHotspot = currentScene?.hotspots.find(
            (h) => h.id === gazeHotspot
          );
          if (targetHotspot) {
            navigateToScene(targetHotspot.targetRoom);
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

  const navigateToScene = (targetSceneId: string) => {
    setIsLoading(true);
    setCurrentSceneId(targetSceneId);
    setTimeout(() => setIsLoading(false), 500);
  };

  const navigateScene = (direction: 'prev' | 'next') => {
    const currentIndex = config.scenes.findIndex((s) => s.id === currentSceneId);
    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % config.scenes.length;
    } else {
      newIndex = (currentIndex - 1 + config.scenes.length) % config.scenes.length;
    }

    setIsLoading(true);
    setCurrentSceneId(config.scenes[newIndex].id);
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

  if (!currentScene) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-gold font-semibold">Scene not found</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Gaze Reticle - Center */}
      <div
        ref={gazeReticleRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
      >
        <div className="w-8 h-8 border-2 border-gold/60 rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gold rounded-full" />
        
        {/* Gaze Countdown */}
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

      {/* Scene Info - Top Left */}
      <div className="absolute top-4 left-4 z-40">
        <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-gold/20">
          <h2 className="text-lg font-semibold text-gold">{currentScene.title}</h2>
          <p className="text-xs text-gold/60">
            {config.scenes.findIndex((s) => s.id === currentSceneId) + 1} / {config.scenes.length}
          </p>
          {currentScene.description && (
            <p className="text-xs text-gold/50 mt-1 max-w-xs">{currentScene.description}</p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-gold font-medium">Loading {currentScene.title}...</p>
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
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-lg bg-black/50 border border-gold/30 hover:border-gold hover:bg-black/70 transition-all text-gold hover:text-yellow-300"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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
            Gyro Active
          </div>
        )}
      </div>

      {/* Scene Navigation Bar - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/60 backdrop-blur-md border border-gold/20 rounded-full px-3 py-2 flex items-center gap-3">
          <button
            onClick={() => navigateScene('prev')}
            className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold hover:text-yellow-300"
            title="Previous scene"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2 px-2">
            {config.scenes.map((scene, index) => (
              <button
                key={scene.id}
                onClick={() => {
                  setIsLoading(true);
                  setCurrentSceneId(scene.id);
                  setTimeout(() => setIsLoading(false), 500);
                }}
                className={`rounded-full transition-all ${
                  currentSceneId === scene.id
                    ? 'bg-gold w-6 h-2'
                    : 'bg-gold/40 w-2 h-2 hover:bg-gold/60'
                }`}
                title={scene.title}
              />
            ))}
          </div>

          <button
            onClick={() => navigateScene('next')}
            className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold hover:text-yellow-300"
            title="Next scene"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Buy Button - Bottom Left */}
      {onBuyClick && (
        <div className="absolute bottom-6 left-6 z-40">
          <Button
            onClick={onBuyClick}
            className="bg-gold hover:bg-yellow-300 text-black font-semibold shadow-lg shadow-gold/50 border-0 transition-all hover:shadow-gold/80 px-6 py-2"
          >
            <span className="text-lg">🏠</span> Purchase • {currency}
            {price ? `${price.toLocaleString()}` : 'Contact'}
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 text-center pointer-events-none">
        <p className="text-gold/60 text-sm bg-black/40 px-4 py-2 rounded backdrop-blur-sm border border-gold/20">
          Drag 360° • Scroll to zoom • Gaze on hotspot for 2s to navigate
        </p>
      </div>
    </div>
  );
};
