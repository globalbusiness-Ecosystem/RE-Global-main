'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Zap, Play, Pause, RotateCcw, ChevronDown, Bot, Home, Settings } from 'lucide-react';

interface PanorammicViewerProps {
  panoramaUrl: string;
  title: string;
  onClose: () => void;
  propertyType?: string;
  propertyPrice?: number;
  propertyId?: string;
  quality?: '4k' | '2k' | '1080p';
}

// Room definitions for multi-room tours
interface Room {
  name: string;
  panoramaUrl: string;
}

// Room details for AI chat
interface RoomDetails {
  name: string;
  size: string;
  features: string[];
  style: string;
}

// 4K Resolution Configuration
const QUALITY_CONFIG = {
  '4k': { maxZoom: 4, scale: 2.0, pixelRatio: 2, bufferSize: 512 },
  '2k': { maxZoom: 3, scale: 1.5, pixelRatio: 1.5, bufferSize: 256 },
  '1080p': { maxZoom: 2.5, scale: 1.0, pixelRatio: 1, bufferSize: 128 },
};

// Room details for AI chat with facts about each room
const ROOM_DATA: Record<string, RoomDetails> = {
  'Living Room': {
    name: 'Living Room',
    size: '45 sqm (485 sqft)',
    features: ['Floor-to-ceiling windows', 'Premium hardwood floors', 'Built-in entertainment center', 'Fireplace accent wall'],
    style: 'Contemporary Minimalist',
  },
  'Kitchen': {
    name: 'Kitchen',
    size: '18 sqm (194 sqft)',
    features: ['Stainless steel appliances', 'Italian marble countertops', 'Custom cabinetry', 'Induction cooktop'],
    style: 'Modern Chef\'s Cuisine',
  },
  'Bedroom': {
    name: 'Master Bedroom',
    size: '32 sqm (344 sqft)',
    features: ['Walk-in closet', 'Ensuite bathroom', 'Skylight window', 'Smart climate control'],
    style: 'Luxury Retreat',
  },
  'Outdoor': {
    name: 'Outdoor Terrace',
    size: '60 sqm (645 sqft)',
    features: ['Infinity pool view', 'Lounge seating areas', 'Water fountain', 'Solar pergola'],
    style: 'Resort Living',
  },
};

// 4K Panorama image library with higher resolution options
const PANNELLUM_SAMPLES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
];

// Helper to get panorama URL based on room index
const getPanoramaUrl = (roomIndex: number): string => {
  return PANNELLUM_SAMPLES[roomIndex % 3];
};

// Room category keys in order for the tour
const ROOM_CATEGORIES = ['Living Room', 'Kitchen', 'Bedroom', 'Outdoor'] as const;

// Room definitions in order
interface RoomWithCategory extends Room {
  category: string;
}

const ROOMS: RoomWithCategory[] = ROOM_CATEGORIES.map((category) => ({
  name: category,
  category: category,
  panoramaUrl: getPanoramaUrl(ROOM_CATEGORIES.indexOf(category)),
}));

// Cinematic easing functions
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Advanced image filtering for 4K quality
const applyImageFiltering = (ctx: CanvasRenderingContext2D, quality: '4k' | '2k' | '1080p') => {
  if (quality === '4k') {
    ctx.filter = 'contrast(1.1) brightness(0.95) saturate(1.05)';
  } else if (quality === '2k') {
    ctx.filter = 'contrast(1.05) brightness(0.98) saturate(1.02)';
  } else {
    ctx.filter = 'contrast(1.0) brightness(1.0) saturate(1.0)';
  }
};

export const PanormicViewer = ({ 
  panoramaUrl, 
  title, 
  onClose, 
  propertyType, 
  propertyPrice = 50000, 
  propertyId = 'property-1',
  quality = '4k'
}: PanorammicViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIGenerating, setIsAIGenerating] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [rotationProgress, setRotationProgress] = useState(0);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [roomLabel, setRoomLabel] = useState('');
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'4k' | '2k' | '1080p'>(quality);
  
  const rotationRef = useRef({ yaw: 0, pitch: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const zoomRef = useRef(1);
  const autoRotateRef = useRef({ startTime: 0, duration: 20000 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const qualityConfig = QUALITY_CONFIG[currentQuality];

  // Get the current room's panorama URL
  const selectedPanoramaUrl = ROOMS[currentRoomIndex]?.panoramaUrl || ROOM_PANORAMA_URLS[0];
  const currentRoomData = ROOM_DATA[ROOMS[currentRoomIndex]?.name] || ROOM_DATA['Living Room'];

  // Helper to get room facts for chat
  const getRoomFacts = (room: RoomDetails): string[] => {
    const facts = [];
    facts.push(`📐 Size: ${room.size}`);
    if (room.features.length > 0) {
      facts.push(`✨ Features: ${room.features.slice(0, 2).join(', ')}`);
    }
    facts.push(`🎨 Style: ${room.style}`);
    return facts;
  };

  // Handle room transitions
  useEffect(() => {
    const currentRoom = ROOMS[currentRoomIndex];
    setRoomLabel(currentRoom.name);

    // Show room label for 1.5 seconds
    const labelTimer = setTimeout(() => {
      setRoomLabel('');
    }, 1500);

    return () => clearTimeout(labelTimer);
  }, [currentRoomIndex]);

  // Auto transition between rooms every 5 seconds
  useEffect(() => {
    if (!isAutoRotating || isAIGenerating || isLoading) return;

    const transitionTimer = setInterval(() => {
      setCurrentRoomIndex((prev) => {
        const nextIndex = (prev + 1) % ROOMS.length;
        // Update the room with the next panorama URL based on room index
        ROOMS[nextIndex].panoramaUrl = getPanoramaUrl(nextIndex);
        return nextIndex;
      });
      setIsLoading(true); // Reset loading state when changing rooms
      rotationRef.current.yaw = 0;
      rotationRef.current.pitch = 0;
      autoRotateRef.current.startTime = Date.now();
    }, 5000);

    return () => clearInterval(transitionTimer);
  }, [isAutoRotating, isAIGenerating, isLoading]);

  useEffect(() => {
    // Simulate AI tour generation for 2 seconds
    const aiTimer = setTimeout(() => {
      setIsAIGenerating(false);
      autoRotateRef.current.startTime = Date.now();
    }, 2000);

    return () => clearTimeout(aiTimer);
  }, []);

  const getAutoRotationSpeed = (speed: number): number => {
    if (speed === 0) return 0.3; // Slow
    if (speed === 2) return 0.9; // Fast
    return 0.6; // Medium (speed 1)
  };

  useEffect(() => {
    if (isAIGenerating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen with 4K support
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const qualityMultiplier = currentQuality === '4k' ? 2 : currentQuality === '2k' ? 1.5 : 1;
      canvas.width = window.innerWidth * dpr * qualityMultiplier;
      canvas.height = window.innerHeight * dpr * qualityMultiplier;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr * qualityMultiplier, dpr * qualityMultiplier);
    };
    resizeCanvas();

    // Load the panorama image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setIsLoading(false);
      renderPanorama();
    };
    img.onerror = () => {
      console.error('Failed to load panorama image');
      setIsLoading(false);
    };
    img.src = selectedPanoramaUrl;

    // Render panorama with current rotation
    const renderPanorama = () => {
      const { yaw, pitch } = rotationRef.current;
      const zoom = Math.min(zoomRef.current, qualityConfig.maxZoom);

      const img = imageRef.current;
      if (!img) return;

      // Calculate source crop area based on yaw and pitch with enhanced precision
      const srcX = ((yaw / 360) % 1) * img.width;
      const srcY = ((pitch / 180 + 0.5) % 1) * img.height;

      const sourceWidth = img.width / zoom;
      const sourceHeight = img.height / zoom;

      // Clamp source area
      const clampedX = Math.max(0, Math.min(srcX, img.width - sourceWidth));
      const clampedY = Math.max(0, Math.min(srcY, img.height - sourceHeight));

      // Clear canvas
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply quality-specific filters and enhancements
      applyImageFiltering(ctx, currentQuality);

      // Draw panorama with high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = currentQuality === '4k' ? 'high' : 'medium';

      ctx.drawImage(
        img,
        clampedX,
        clampedY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Reset filter
      ctx.filter = 'none';

      // Schedule next frame if dragging or auto-rotating
      if (dragRef.current.isDragging || isAutoRotating) {
        requestAnimationFrame(renderPanorama);
      }
    };

    // Auto-rotation animation loop
    let animationFrameId: number;
    const autoRotate = () => {
      if (isAutoRotating && !dragRef.current.isDragging) {
        const currentTime = Date.now();
        const elapsed = currentTime - autoRotateRef.current.startTime;
        const duration = autoRotateRef.current.duration / getAutoRotationSpeed(rotationSpeed);
        
        // Calculate progress with easing
        let progress = (elapsed % duration) / duration;
        const easedProgress = easeInOutCubic(progress);
        
        // Update yaw smoothly with easing
        const targetYaw = easedProgress * 360;
        rotationRef.current.yaw = targetYaw;
        
        // Update progress bar
        setRotationProgress(progress * 100);
      }

      renderPanorama();
      animationFrameId = requestAnimationFrame(autoRotate);
    };

    animationFrameId = requestAnimationFrame(autoRotate);

    // Mouse drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      // Update rotation (1 pixel = ~0.5 degrees)
      rotationRef.current.yaw -= deltaX * 0.5;
      rotationRef.current.pitch += deltaY * 0.5;

      // Clamp pitch to ±90 degrees
      rotationRef.current.pitch = Math.max(
        -90,
        Math.min(90, rotationRef.current.pitch)
      );

      // Normalize yaw to 0-360
      rotationRef.current.yaw =
        ((rotationRef.current.yaw % 360) + 360) % 360;

      // Update drag start for next frame
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;

      renderPanorama();
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };

    // Scroll to zoom with 4K max zoom support
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxZoom = qualityConfig.maxZoom;
      const minZoom = 1;
      zoomRef.current += e.deltaY > 0 ? -0.1 : 0.1;
      zoomRef.current = Math.max(minZoom, Math.min(maxZoom, zoomRef.current));
      renderPanorama();
    };

    // Resize handler
    const handleResize = () => {
      resizeCanvas();
      renderPanorama();
    };

    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        dragRef.current.isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.isDragging || e.touches.length !== 1) return;
      e.preventDefault();

      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;

      rotationRef.current.yaw -= deltaX * 0.5;
      rotationRef.current.pitch += deltaY * 0.5;

      rotationRef.current.pitch = Math.max(
        -90,
        Math.min(90, rotationRef.current.pitch)
      );

      rotationRef.current.yaw =
        ((rotationRef.current.yaw % 360) + 360) % 360;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      renderPanorama();
    };

    const handleTouchEnd = () => {
      dragRef.current.isDragging = false;
    };

    // Escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);

    // Initial render
    renderPanorama();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
    }, [selectedPanoramaUrl, isAIGenerating, isAutoRotating, rotationSpeed, onClose, currentQuality]);

  const handleResetView = () => {
    rotationRef.current.yaw = 0;
    rotationRef.current.pitch = 0;
    autoRotateRef.current.startTime = Date.now();
    setRotationProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ display: isAIGenerating || isLoading ? 'none' : 'block' }}
      />

      {/* Progress Bar */}
      {!isAIGenerating && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-background/50 z-50">
          <div
            className="h-full bg-accent transition-all duration-100"
            style={{ width: `${rotationProgress}%` }}
          />
        </div>
      )}

      {/* Quality Controls */}
      {!isAIGenerating && !isLoading && (
        <div className="absolute top-20 right-4 z-50 flex gap-2">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-accent/30 flex gap-2">
            {(['4k', '2k', '1080p'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setCurrentQuality(q)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  currentQuality === q
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-background/80 text-muted-foreground'
                }`}
                title={`Switch to ${q.toUpperCase()} quality`}
              >
                {q.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentQuality('4k')}
            className="p-2 rounded-lg bg-accent/10 border border-accent hover:bg-accent/20 transition-colors"
            title="Reset to 4K Ultra HD"
          >
            <Settings className="w-5 h-5 text-accent" />
          </button>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-accent text-accent-foreground hover:opacity-80 transition-opacity"
        aria-label="Close tour"
      >
        <X className="w-6 h-6" />
      </button>

      {/* AI Badge */}
      {!isAIGenerating && !isLoading && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-1 px-3 py-1 bg-accent/10 border border-accent rounded-full">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-xs font-semibold text-accent">Powered by AI</span>
        </div>
      )}

      {/* Title */}
      {!isAIGenerating && (
        <div className="absolute left-4 z-50" style={{ top: 'calc(1rem + 2.5rem)' }}>
          <p className="text-foreground font-semibold text-sm">{title}</p>
          <p className="text-muted-foreground text-xs">360° AI Virtual Tour</p>
        </div>
      )}

      {/* AI Generation Loading State */}
      {isAIGenerating && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg font-semibold text-accent">🤖 Generating your AI tour...</p>
              <p className="text-xs text-muted-foreground">Analyzing property features</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Loading State */}
      {!isAIGenerating && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading panorama...</p>
          </div>
        </div>
      )}

      {/* Room Name Label */}
      {!isAIGenerating && !isLoading && roomLabel && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-background/90 backdrop-blur-md px-6 py-3 rounded-lg border border-accent/30 animate-fade-in">
            <p className="text-lg font-semibold text-accent text-center">{roomLabel}</p>
          </div>
        </div>
      )}

      {/* AI Chat Panel */}
      {!isAIGenerating && !isLoading && !isChatMinimized && (
        <div className="absolute bottom-48 left-4 z-50 w-80 max-w-[calc(100%-2rem)]">
          <div className="bg-gradient-to-b from-[#1a1410]/95 to-[#0f0b08]/95 backdrop-blur-md border border-[#F59E0B]/30 rounded-lg overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="bg-[#2a1f15] border-b border-[#F59E0B]/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-[#F59E0B]">Room Guide</span>
              </div>
              <button
                onClick={() => setIsChatMinimized(true)}
                className="p-1 hover:bg-[#F59E0B]/10 rounded transition-colors"
                aria-label="Minimize chat"
              >
                <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
              {/* Welcome Message */}
              <div className="flex gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <div className="bg-[#2a1f15] border border-[#F59E0B]/20 rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-300">Welcome to {currentRoomData.name}! Let me tell you about this stunning space.</p>
                  </div>
                </div>
              </div>

              {/* Room Facts */}
              {getRoomFacts(currentRoomData).map((fact, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2a1f15] border border-[#F59E0B]/20 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-200">{fact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Footer */}
            <div className="bg-[#2a1f15] border-t border-[#F59E0B]/20 px-4 py-3">
              <p className="text-xs text-gray-400">🎯 Tip: Drag to explore • Scroll to zoom</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Minimized Button */}
      {!isAIGenerating && !isLoading && isChatMinimized && (
        <button
          onClick={() => setIsChatMinimized(false)}
          className="absolute bottom-48 left-4 z-50 p-3 bg-gradient-to-br from-[#F59E0B] to-[#d97706] rounded-full shadow-lg hover:shadow-xl transition-shadow hover:scale-110 transform"
          aria-label="Expand chat"
          title="Show room guide"
        >
          <Bot className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Control Panel */}
      {!isAIGenerating && !isLoading && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-3 rounded-lg z-50">
          <div className="flex flex-col gap-3">
            {/* Buy Button */}
            <button
              onClick={async () => {
                if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
                  alert('Pi Network not available');
                  return;
                }

                try {
                  window.Pi.createPayment(
                    {
                      amount: propertyPrice / 1000, // Convert to Pi amount
                      memo: `Buy Property: ${title}`,
                      metadata: {
                        propertyId,
                        propertyTitle: title,
                      },
                    },
                    {
                      onReadyForServerApproval: async (paymentId: string) => {
                        console.log('[v0] Payment approved:', paymentId);
                      },
                      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                        console.log('[v0] Payment completed:', paymentId, txid);
                      },
                      onCancel: () => {
                        console.log('[v0] Payment cancelled');
                      },
                      onError: (error: any) => {
                        console.error('[v0] Payment error:', error);
                      },
                    }
                  );
                } catch (error) {
                  console.error('[v0] Payment initiation error:', error);
                }
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#F59E0B] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              title={`Buy with Pi - ${propertyPrice} USD`}
            >
              <Home className="w-4 h-4" />
              <span>Buy with Pi</span>
            </button>

            {/* Room Navigation Dots */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {ROOMS.map((room, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Update panorama URL for the room
                    ROOMS[index].panoramaUrl = getPanoramaUrl(index);
                    setCurrentRoomIndex(index);
                    setIsLoading(true);
                    rotationRef.current.yaw = 0;
                    rotationRef.current.pitch = 0;
                    autoRotateRef.current.startTime = Date.now();
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentRoomIndex
                      ? 'bg-accent w-7'
                      : 'bg-accent/30 hover:bg-accent/50'
                  }`}
                  aria-label={`Go to ${room.name}`}
                  title={room.name}
                />
              ))}
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent rounded-lg text-accent hover:bg-accent/20 transition-colors"
                aria-label={isAutoRotating ? 'Pause rotation' : 'Play rotation'}
              >
                {isAutoRotating ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="text-xs font-semibold">{isAutoRotating ? 'Pause' : 'Play'}</span>
              </button>

              {/* Speed Slider */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseInt(e.target.value))}
                  className="w-24 h-1 bg-accent/30 rounded-lg appearance-none cursor-pointer accent-accent"
                  style={{
                    background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${(rotationSpeed / 2) * 100}%, #1e293b ${(rotationSpeed / 2) * 100}%, #1e293b 100%)`
                  }}
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {rotationSpeed === 0 ? 'Slow' : rotationSpeed === 1 ? 'Med' : 'Fast'}
                </span>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetView}
                className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent rounded-lg text-accent hover:bg-accent/20 transition-colors"
                aria-label="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-semibold">Reset</span>
              </button>
            </div>

            {/* Instructions */}
            <p className="text-xs text-muted-foreground">
              Drag to look around • Scroll to zoom • Press ESC or click X to exit • Click dots to change rooms
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
