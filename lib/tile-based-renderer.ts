/**
 * Advanced Tile-Based Panoramic Rendering Engine
 * Enables efficient 8K+ rendering through intelligent tile management
 */

interface TileConfig {
  tileSize: number;
  totalTiles: number;
  gridSize: number;
}

interface CachedTile {
  url: string;
  canvas: OffscreenCanvas;
  loaded: boolean;
  timestamp: number;
}

export class TileBasedPanoramicRenderer {
  private tiles: Map<string, CachedTile> = new Map();
  private loadingQueue: Set<string> = new Set();
  private maxConcurrentLoads = 4;
  private tileCache: Map<string, ImageBitmap> = new Map();
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, private config: TileConfig) {
    try {
      this.canvas = new OffscreenCanvas(canvas.width, canvas.height);
      this.ctx = this.canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    } catch {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d')!;
    }
  }

  async loadTile(tileUrl: string, tileId: string): Promise<void> {
    if (this.tileCache.has(tileId)) return;
    if (this.loadingQueue.size >= this.maxConcurrentLoads) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.loadingQueue.add(tileId);

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        createImageBitmap(img).then(bitmap => {
          this.tileCache.set(tileId, bitmap);
          this.loadingQueue.delete(tileId);
          resolve();
        });
      };

      img.onerror = () => {
        this.loadingQueue.delete(tileId);
        resolve();
      };

      img.src = tileUrl;
    });
  }

  async preloadVisibleTiles(
    centerX: number,
    centerY: number,
    viewportWidth: number,
    viewportHeight: number,
    baseUrl: string
  ): Promise<void> {
    const visibleRange = {
      startX: Math.max(0, centerX - viewportWidth),
      endX: Math.min(this.config.gridSize - 1, centerX + viewportWidth),
      startY: Math.max(0, centerY - viewportHeight),
      endY: Math.min(this.config.gridSize - 1, centerY + viewportHeight),
    };

    const tilesToLoad = [];
    for (let y = visibleRange.startY; y <= visibleRange.endY; y++) {
      for (let x = visibleRange.startX; x <= visibleRange.endX; x++) {
        const tileId = `tile_${x}_${y}`;
        const tileUrl = `${baseUrl}?x=${x}&y=${y}`;
        tilesToLoad.push(this.loadTile(tileUrl, tileId));
      }
    }

    await Promise.all(tilesToLoad);
  }

  renderTiles(
    centerX: number,
    centerY: number,
    zoom: number,
    rotation: number
  ): void {
    if (!this.ctx) return;

    const tileCount = Math.ceil(this.config.gridSize / Math.max(1, zoom));
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    
    // Apply rotation
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(rotation);
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    for (let y = 0; y < tileCount; y++) {
      for (let x = 0; x < tileCount; x++) {
        const tileId = `tile_${x}_${y}`;
        const bitmap = this.tileCache.get(tileId);
        
        if (bitmap) {
          const targetSize = this.config.tileSize / zoom;
          const x_pos = (x * this.config.tileSize) / zoom;
          const y_pos = (y * this.config.tileSize) / zoom;
          
          this.ctx.drawImage(bitmap, x_pos, y_pos, targetSize, targetSize);
        }
      }
    }

    this.ctx.restore();
  }

  clearCache(): void {
    this.tileCache.forEach(bitmap => bitmap.close?.());
    this.tileCache.clear();
  }

  getMemoryUsage(): number {
    return this.tileCache.size * (this.config.tileSize ** 2 * 4);
  }
}

export class AdaptiveResolutionManager {
  private qualityLevels = {
    '8k': { width: 7680, height: 4320, tiles: 16 },
    '6k': { width: 6016, height: 3384, tiles: 12 },
    '4k': { width: 3840, height: 2160, tiles: 9 },
    '2k': { width: 2560, height: 1440, tiles: 4 },
    '1080p': { width: 1920, height: 1080, tiles: 1 },
  };

  selectOptimalQuality(fps: number, bandwidth: number, memory: number): string {
    if (fps < 30 || memory < 512 || bandwidth < 1) return '1080p';
    if (fps < 45 || memory < 1024 || bandwidth < 3) return '2k';
    if (fps < 55 || memory < 2048 || bandwidth < 5) return '4k';
    if (memory >= 4096 && bandwidth >= 8) return '6k';
    return '4k';
  }

  getQualitySettings(quality: string) {
    return this.qualityLevels[quality as keyof typeof this.qualityLevels];
  }
}
