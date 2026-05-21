/**
 * Enhanced Global Panoramic Viewer Component
 * Optimized for 195+ countries, all network conditions, and device types
 * Supports RTL, i18n, adaptive loading, and performance optimization
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Settings, Zap, Wifi, WifiOff, Gauge } from 'lucide-react';
import {
  Region,
  Language,
  RegionalConfig,
  REGIONAL_CONFIGS,
  detectBandwidth,
  selectQualityByBandwidth,
  selectQualityByDevice,
  findFastestCDN,
  ProgressiveImageLoader,
  MosaicTiler,
  WebVitalsMonitor,
  PanoramicCache,
  isOffline,
  detectBattery,
  getPrefersReducedMotion,
} from '@/lib/panoramic-global-utils';
import type { QualityLevel } from '@/lib/panoramic-4k-utils';

interface GlobalPanormicViewerProps {
  panoramaUrl: string;
  title: string;
  onClose: () => void;
  propertyType?: string;
  propertyPrice?: number;
  propertyId?: string;
  region?: Region;
  language?: Language;
  quality?: QualityLevel;
}

// ==================== LOCALIZATION ====================

const i18n: Record<Language, Record<string, string>> = {
  'en': {
    quality: 'Quality',
    tour: '360° Virtual Tour',
    loading: 'Loading panorama...',
    offline: 'Offline Mode',
    bandwidth: 'Bandwidth',
    fps: 'FPS',
    close: 'Close',
    reset: 'Reset View',
    powered: 'Powered by AI',
  },
  'ar': {
    quality: 'الجودة',
    tour: 'جولة افتراضية 360°',
    loading: 'جاري تحميل البانوراما...',
    offline: 'وضع عدم الاتصال',
    bandwidth: 'نطاق ترددي',
    fps: 'إطار/ثانية',
    close: 'إغلاق',
    reset: 'إعادة تعيين العرض',
    powered: 'مدعوم بالذكاء الاصطناعي',
  },
  'fr': {
    quality: 'Qualité',
    tour: 'Visite virtuelle à 360°',
    loading: 'Chargement du panorama...',
    offline: 'Mode Hors Ligne',
    bandwidth: 'Bande Passante',
    fps: 'i/s',
    close: 'Fermer',
    reset: 'Réinitialiser',
    powered: 'Alimenté par l\'IA',
  },
  'es': {
    quality: 'Calidad',
    tour: 'Tour Virtual 360°',
    loading: 'Cargando panorama...',
    offline: 'Modo Desconectado',
    bandwidth: 'Ancho de Banda',
    fps: 'FPS',
    close: 'Cerrar',
    reset: 'Reiniciar',
    powered: 'Impulsado por IA',
  },
  'zh': {
    quality: '质量',
    tour: '360° 虚拟游览',
    loading: '加载全景图...',
    offline: '离线模式',
    bandwidth: '带宽',
    fps: '帧数',
    close: '关闭',
    reset: '重置视图',
    powered: '由人工智能驱动',
  },
  'pt': {
    quality: 'Qualidade',
    tour: 'Tour Virtual 360°',
    loading: 'Carregando panorama...',
    offline: 'Modo Offline',
    bandwidth: 'Largura de Banda',
    fps: 'FPS',
    close: 'Fechar',
    reset: 'Redefinir',
    powered: 'Alimentado por IA',
  },
  'de': {
    quality: 'Qualität',
    tour: '360° Virtuelle Tour',
    loading: 'Panorama wird geladen...',
    offline: 'Offline-Modus',
    bandwidth: 'Bandbreite',
    fps: 'fps',
    close: 'Schließen',
    reset: 'Zurücksetzen',
    powered: 'Betrieben von KI',
  },
  'ja': {
    quality: '品質',
    tour: '360° バーチャルツアー',
    loading: 'パノラマを読み込み中...',
    offline: 'オフラインモード',
    bandwidth: '帯域幅',
    fps: 'fps',
    close: '閉じる',
    reset: 'リセット',
    powered: 'AI を使用',
  },
  'ru': {
    quality: 'Качество',
    tour: 'Виртуальный тур 360°',
    loading: 'Загрузка панорамы...',
    offline: 'Автономный режим',
    bandwidth: 'Пропускная способность',
    fps: 'FPS',
    close: 'Закрыть',
    reset: 'Сброс',
    powered: 'На базе ИИ',
  },
};

// ==================== COMPONENT ====================

export const GlobalPanormicViewer = ({
  panoramaUrl,
  title,
  onClose,
  propertyType,
  propertyPrice = 50000,
  propertyId = 'property-1',
  region = 'MENA',
  language = 'en',
  quality: initialQuality,
}: GlobalPanormicViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>(
    initialQuality || selectQualityByDevice()
  );
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);
  const [bandwidth, setBandwidth] = useState(detectBandwidth());
  const [fps, setFps] = useState(60);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [reducedMotion, setReducedMotion] = useState(getPrefersReducedMotion());

  const rotationRef = useRef({ yaw: 0, pitch: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const zoomRef = useRef(1);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cacheRef = useRef<PanoramicCache | null>(null);
  const vitalsRef = useRef<WebVitalsMonitor | null>(null);

  const regionalConfig = REGIONAL_CONFIGS[region];
  const t = i18n[language] || i18n['en'];

  // Initialize cache and vitals
  useEffect(() => {
    const initializeCache = async () => {
      const cache = new PanoramicCache();
      const initialized = await cache.initialize();
      cacheRef.current = initialized ? cache : null;
    };

    const initializeVitals = () => {
      vitalsRef.current = new WebVitalsMonitor();
      vitalsRef.current.initialize();
    };

    initializeCache();
    initializeVitals();
  }, []);

  // Monitor battery and network
  useEffect(() => {
    const monitorBattery = async () => {
      const battery = await detectBattery();
      setBatteryLevel(battery.level * 100);

      if (battery.level < 0.2 && currentQuality !== '1080p') {
        setCurrentQuality('1080p');
      }
    };

    monitorBattery();

    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentQuality]);

  // Detect bandwidth changes and adapt quality
  useEffect(() => {
    const handleConnectionChange = () => {
      const newBandwidth = detectBandwidth();
      setBandwidth(newBandwidth);

      // Adaptive quality switching
      if (newBandwidth.isSlowConnection && currentQuality !== '1080p') {
        setCurrentQuality('1080p');
      } else if (!newBandwidth.isSlowConnection && newBandwidth.speed >= 10) {
        setCurrentQuality('4k');
      }
    };

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, [currentQuality]);

  // Render panorama
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with regional optimization
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const qualityMultiplier =
        currentQuality === '4k' ? 2 : currentQuality === '2k' ? 1.5 : 1;
      
      canvas.width = window.innerWidth * dpr * qualityMultiplier;
      canvas.height = window.innerHeight * dpr * qualityMultiplier;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr * qualityMultiplier, dpr * qualityMultiplier);
    };

    resizeCanvas();

    // Load image with progressive loading
    const loadImage = async () => {
      try {
        // Check cache first
        let imgData = await cacheRef.current?.get(panoramaUrl);

        if (imgData) {
          const img = new Image();
          img.onload = () => {
            imageRef.current = img;
            setIsLoading(false);
          };
          img.src = URL.createObjectURL(imgData);
          return;
        }

        // Use progressive loader
        const loader = new ProgressiveImageLoader(
          `${panoramaUrl}?size=tiny`,
          panoramaUrl
        );

        const img = await loader.load((progress) => {
          console.log(`[v0] Panorama loading: ${progress.toFixed(0)}%`);
        });

        imageRef.current = img;

        // Cache for offline
        if (cacheRef.current && img.src) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const c = canvas.getContext('2d');
          c?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              cacheRef.current?.set(panoramaUrl, blob);
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load panorama:', error);
        setIsLoading(false);
      }
    };

    loadImage();

    // Render loop
    const renderPanorama = () => {
      const { yaw, pitch } = rotationRef.current;
      const img = imageRef.current;
      if (!img) return;

      // Clear
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Source crop
      const srcX = ((yaw / 360) % 1) * img.width;
      const srcY = ((pitch / 180 + 0.5) % 1) * img.height;
      const sourceWidth = img.width / zoomRef.current;
      const sourceHeight = img.height / zoomRef.current;

      // Draw
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = currentQuality === '4k' ? 'high' : 'medium';

      ctx.drawImage(
        img,
        Math.max(0, Math.min(srcX, img.width - sourceWidth)),
        Math.max(0, Math.min(srcY, img.height - sourceHeight)),
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    let animationFrameId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const animationLoop = (currentTime: number) => {
      renderPanorama();

      // FPS calculation
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animationLoop);
    };

    animationFrameId = requestAnimationFrame(animationLoop);

    // Event handlers
    const handleMouseDown = (e: MouseEvent) => {
      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      rotationRef.current.yaw -= (e.clientX - dragRef.current.startX) * 0.5;
      rotationRef.current.pitch += (e.clientY - dragRef.current.startY) * 0.5;
      rotationRef.current.pitch = Math.max(-90, Math.min(90, rotationRef.current.pitch));
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxZoom = currentQuality === '4k' ? 4 : currentQuality === '2k' ? 3 : 2.5;
      zoomRef.current += e.deltaY > 0 ? -0.1 : 0.1;
      zoomRef.current = Math.max(1, Math.min(maxZoom, zoomRef.current));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [currentQuality, panoramaUrl]);

  const handleResetView = useCallback(() => {
    rotationRef.current.yaw = 0;
    rotationRef.current.pitch = 0;
    zoomRef.current = 1;
  }, []);

  const isRTL = regionalConfig.rtl;

  return (
    <div
      className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col ${
        isRTL ? 'rtl' : 'ltr'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-muted-foreground">{t.loading}</p>
            {bandwidth.speed > 0 && (
              <p className="text-xs text-muted-foreground">
                {bandwidth.speed.toFixed(1)} Mbps
              </p>
            )}
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className={`absolute top-4 z-50 p-2 rounded-full bg-accent text-accent-foreground hover:opacity-80 transition-opacity ${
          isRTL ? 'left-4' : 'right-4'
        }`}
        aria-label={t.close}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Status Bar */}
      {!isLoading && (
        <div
          className={`absolute top-4 z-50 flex gap-2 ${isRTL ? 'right-16' : 'left-4'}`}
        >
          {isOfflineMode && (
            <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500 flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-500">{t.offline}</span>
            </div>
          )}

          {!isOfflineMode && (
            <div className="px-3 py-1 rounded-full bg-accent/20 border border-accent flex items-center gap-1">
              <Wifi className="w-3 h-3 text-accent" />
              <span className="text-xs text-accent">
                {bandwidth.speed.toFixed(1)} Mbps
              </span>
            </div>
          )}

          <div className="px-3 py-1 rounded-full bg-accent/20 border border-accent flex items-center gap-1">
            <Gauge className="w-3 h-3 text-accent" />
            <span className="text-xs text-accent">{fps} {t.fps}</span>
          </div>
        </div>
      )}

      {/* Quality Controls */}
      {!isLoading && (
        <div
          className={`absolute top-20 z-50 flex gap-2 ${isRTL ? 'left-4' : 'right-4'}`}
        >
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
              >
                {q.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg bg-accent/10 border border-accent hover:bg-accent/20 transition-colors"
            aria-label={t.reset}
          >
            <Settings className="w-5 h-5 text-accent" />
          </button>
        </div>
      )}

      {/* Info */}
      {!isLoading && (
        <div className={`absolute top-4 z-50 flex items-center gap-1 px-3 py-1 bg-accent/10 border border-accent rounded-full ${
          isRTL ? 'right-80' : 'left-80'
        }`}>
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-xs font-semibold text-accent">{t.powered}</span>
        </div>
      )}
    </div>
  );
};

export default GlobalPanormicViewer;
