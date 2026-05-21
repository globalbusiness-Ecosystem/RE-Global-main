/**
 * Panoramic Camera Optimizer - Enterprise-Grade Efficiency Manager
 * Coordinates all panoramic rendering systems for maximum performance
 */

import { QualityLevel } from './panoramic-4k-utils';

export interface PanopticOptimization {
  // Rendering
  renderMode: 'sphere' | 'cube' | 'flat' | 'adaptive';
  qualityLevel: QualityLevel;
  fpsTarget: number;
  
  // Memory
  cacheSize: number;
  tileBuffering: number;
  preloadDistance: number;
  
  // Network
  bandwidth: number;
  compressionRatio: number;
  progressiveLoading: boolean;
  
  // User Experience
  smoothInteraction: boolean;
  kineticScrolling: boolean;
  autoRotation: boolean;
}

export class PanoramicOptimizer {
  private static instance: PanoramicOptimizer;
  private metrics = {
    fps: 0,
    renderTime: 0,
    bandwidth: 0,
    memory: 0,
    battery: 100,
  };

  private config: PanopticOptimization = {
    renderMode: 'sphere',
    qualityLevel: '2k',
    fpsTarget: 60,
    cacheSize: 256,
    tileBuffering: 2,
    preloadDistance: 1024,
    bandwidth: 10, // Mbps estimate
    compressionRatio: 0.8,
    progressiveLoading: true,
    smoothInteraction: true,
    kineticScrolling: true,
    autoRotation: false,
  };

  private constructor() {
    this.detectDeviceCapabilities();
  }

  static getInstance(): PanoramicOptimizer {
    if (!PanoramicOptimizer.instance) {
      PanoramicOptimizer.instance = new PanoramicOptimizer();
    }
    return PanoramicOptimizer.instance;
  }

  private detectDeviceCapabilities(): void {
    // Detect device type
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 600;

    // Detect memory
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // Detect GPU capability (via WebGL)
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const hasGPU = !!gl;

    // Detect battery status
    (navigator as any).getBattery?.().then((battery: any) => {
      this.metrics.battery = battery.level * 100;
    });

    // Set optimal config based on device
    if (isMobile) {
      this.config.qualityLevel = '1080p';
      this.config.fpsTarget = 30;
      this.config.cacheSize = 128;
      this.config.kineticScrolling = true;
    } else if (isTablet) {
      this.config.qualityLevel = '2k';
      this.config.fpsTarget = 45;
      this.config.cacheSize = 256;
    } else {
      this.config.qualityLevel = deviceMemory >= 8 ? '4k' : '2k';
      this.config.fpsTarget = hasGPU ? 60 : 45;
      this.config.cacheSize = deviceMemory >= 8 ? 512 : 256;
    }
  }

  // Detect network speed and adjust quality
  detectNetworkQuality(): void {
    if ((navigator as any).connection) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
      
      const speeds = {
        '4g': 10,
        '3g': 3,
        '2g': 0.5,
        'slow-2g': 0.1,
      };
      
      this.metrics.bandwidth = speeds[effectiveType as keyof typeof speeds] || 10;
      
      // Adjust quality based on bandwidth
      if (this.metrics.bandwidth < 1) {
        this.config.qualityLevel = '1080p';
      } else if (this.metrics.bandwidth < 3) {
        this.config.qualityLevel = '2k';
      } else {
        this.config.qualityLevel = '4k';
      }
    }
  }

  // Adaptive rendering based on performance
  adaptiveQualityAdjustment(currentFps: number): void {
    const targetFps = this.config.fpsTarget;
    
    if (currentFps < targetFps * 0.8) {
      // Lower quality if FPS drops
      const qualities: QualityLevel[] = ['1080p', '2k', '4k'];
      const currentIndex = qualities.indexOf(this.config.qualityLevel);
      if (currentIndex > 0) {
        this.config.qualityLevel = qualities[currentIndex - 1];
        this.config.compressionRatio -= 0.1;
      }
    } else if (currentFps > targetFps && this.metrics.battery > 50) {
      // Increase quality if performance is good and battery is healthy
      const qualities: QualityLevel[] = ['1080p', '2k', '4k'];
      const currentIndex = qualities.indexOf(this.config.qualityLevel);
      if (currentIndex < qualities.length - 1) {
        this.config.qualityLevel = qualities[currentIndex + 1];
        this.config.compressionRatio = Math.min(1.0, this.config.compressionRatio + 0.05);
      }
    }
  }

  // Update performance metrics
  updateMetrics(fps: number, renderTime: number, bandwidth: number, memory: number): void {
    this.metrics = { fps, renderTime, bandwidth, memory, battery: this.metrics.battery };
    this.adaptiveQualityAdjustment(fps);
  }

  // Get optimized configuration
  getOptimalConfig(): PanopticOptimization {
    return { ...this.config };
  }

  // Get performance metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Preload tiles for smooth navigation
  preloadTiles(panoramaUrl: string, tileCount: number): Promise<void> {
    const tiles = [];
    for (let i = 0; i < tileCount; i++) {
      const tileUrl = `${panoramaUrl}?tile=${i}`;
      tiles.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = tileUrl;
      }));
    }
    return Promise.all(tiles).then(() => {});
  }

  // Calculate optimal buffer size
  calculateOptimalBufferSize(): number {
    const memory = this.metrics.memory;
    const bandwidth = this.metrics.bandwidth;
    
    if (bandwidth < 1 || memory < 256) return 128;
    if (bandwidth < 5 || memory < 512) return 256;
    if (bandwidth < 10 || memory < 1024) return 512;
    return 1024;
  }

  // Enable/disable features based on battery
  optimizeForBattery(): void {
    if (this.metrics.battery < 20) {
      this.config.qualityLevel = '1080p';
      this.config.fpsTarget = 24;
      this.config.autoRotation = false;
      this.config.progressiveLoading = false;
    } else if (this.metrics.battery < 50) {
      this.config.qualityLevel = '2k';
      this.config.fpsTarget = 30;
      this.config.autoRotation = false;
    }
  }
}

export const panoramicOptimizer = PanoramicOptimizer.getInstance();
