/**
 * VR Tour Utilities & Helper Functions with Performance Optimization
 */

import { VRPropertyTour, VRRoom, Hotspot } from './vr-tour-types';

// Performance optimization: Image compression and caching
interface OptimizedImage {
  original: string;
  webp: string;
  thumbnail: string;
  cached: boolean;
}

// Lazy loading queue for panoramic images
class PanoramaImageLoader {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingQueue: Set<string> = new Set();
  private maxConcurrentLoads = 3;

  async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    while (this.loadingQueue.size >= this.maxConcurrentLoads) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.loadingQueue.add(url);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.cache.set(url, img);
        this.loadingQueue.delete(url);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingQueue.delete(url);
        reject(new Error(`Failed to load: ${url}`));
      };

      img.src = url;
    });
  }

  preload(urls: string[]): Promise<void> {
    return Promise.all(urls.map(url => this.loadImage(url))).then(() => {});
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingQueue.size,
    };
  }
}

export const panoramaLoader = new PanoramaImageLoader();

/**
 * Create a hotspot with standard configuration
 */
export function createHotspot(
  pitch: number,
  yaw: number,
  targetRoom: number,
  text: string,
  cssClass: string = 'vr-tour-hotspot'
): Hotspot {
  return {
    pitch,
    yaw,
    targetRoom,
    text,
    cssClass,
  };
}

/**
 * Create a room with standard configuration
 */
export function createRoom(
  id: number,
  name: string,
  imageUrl: string,
  hotspots: Hotspot[],
  pitch: number = 0,
  yaw: number = 0,
  hfov: number = 100
): VRRoom {
  return {
    id,
    name,
    imageUrl,
    pitch,
    yaw,
    hfov,
    hotspots,
  };
}

/**
 * Create a property tour configuration
 */
export function createPropertyTour(
  propertyId: string,
  propertyName: string,
  rooms: VRRoom[],
  price?: number,
  piPrice?: number
): VRPropertyTour {
  return {
    propertyId,
    propertyName,
    rooms,
    price,
    piPrice,
  };
}

/**
 * Optimize panorama URL for best performance
 */
export function optimizePanoramaUrl(url: string, quality: '4k' | '2k' | '1080p' = '2k'): string {
  const qualityParams = {
    '4k': 'w=4096&q=90',
    '2k': 'w=2048&q=85',
    '1080p': 'w=1920&q=80',
  };

  if (url.includes('?')) {
    return `${url}&${qualityParams[quality]}`;
  }
  return `${url}?${qualityParams[quality]}`;
}

/**
 * Calculate optimal canvas resolution based on device
 */
export function getOptimalCanvasResolution(): { width: number; height: number; pixelRatio: number } {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  return {
    width: screenWidth * dpr,
    height: screenHeight * dpr,
    pixelRatio: dpr,
  };
}

/**
 * Debounce function for resize and interaction events
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Throttle function for animation frames
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

export function validatePropertyTour(property: VRPropertyTour): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!property.propertyId) {
    errors.push('Property ID is required');
  }

  if (!property.propertyName) {
    errors.push('Property name is required');
  }

  if (!property.rooms || property.rooms.length === 0) {
    errors.push('At least one room is required');
  }

  property.rooms.forEach((room, index) => {
    if (!room.name) {
      errors.push(`Room ${index} is missing a name`);
    }

    if (!room.imageUrl) {
      errors.push(`Room "${room.name}" is missing an image URL`);
    }

    room.hotspots.forEach((hotspot, hotspotIndex) => {
      if (hotspot.targetRoom < 0 || hotspot.targetRoom >= property.rooms.length) {
        errors.push(
          `Hotspot ${hotspotIndex} in room "${room.name}" targets invalid room index ${hotspot.targetRoom}`
        );
      }

      if (hotspot.pitch < -90 || hotspot.pitch > 90) {
        errors.push(
          `Hotspot ${hotspotIndex} in room "${room.name}" has invalid pitch: ${hotspot.pitch}`
        );
      }

      if (hotspot.yaw < 0 || hotspot.yaw > 360) {
        errors.push(
          `Hotspot ${hotspotIndex} in room "${room.name}" has invalid yaw: ${hotspot.yaw}`
        );
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get adjacent room indices for preloading
 */
export function getAdjacentRooms(
  currentRoomIndex: number,
  rooms: VRRoom[]
): number[] {
  const adjacent = new Set<number>();

  // Add previous room
  adjacent.add((currentRoomIndex - 1 + rooms.length) % rooms.length);

  // Add next room
  adjacent.add((currentRoomIndex + 1) % rooms.length);

  // Add all rooms targeted by hotspots
  rooms[currentRoomIndex].hotspots.forEach((hotspot) => {
    adjacent.add(hotspot.targetRoom);
  });

  return Array.from(adjacent);
}

/**
 * Convert compass direction to yaw angle
 */
export function directionToYaw(direction: 'north' | 'east' | 'south' | 'west'): number {
  const directions = {
    north: 0,
    east: 90,
    south: 180,
    west: 270,
  };
  return directions[direction];
}

/**
 * Get hotspot text with arrow direction based on yaw
 */
export function getDirectionalText(yaw: number, destination: string): string {
  const normalizedYaw = ((yaw % 360) + 360) % 360;

  let arrow = '→';
  if (normalizedYaw < 45 || normalizedYaw >= 315) arrow = '↑'; // Front
  else if (normalizedYaw >= 45 && normalizedYaw < 135) arrow = '→'; // Right
  else if (normalizedYaw >= 135 && normalizedYaw < 225) arrow = '↓'; // Back
  else if (normalizedYaw >= 225 && normalizedYaw < 315) arrow = '←'; // Left

  return `${destination} ${arrow}`;
}

/**
 * Generate sequential room connection (linear tour)
 */
export function createLinearTour(
  propertyId: string,
  propertyName: string,
  roomData: Array<{ name: string; imageUrl: string }>
): VRPropertyTour {
  const rooms = roomData.map((data, index) => {
    const hotspots: Hotspot[] = [];

    // Add hotspot to next room
    if (index < roomData.length - 1) {
      hotspots.push({
        pitch: -15,
        yaw: 90,
        targetRoom: index + 1,
        text: `Go to ${roomData[index + 1].name} →`,
        cssClass: 'vr-tour-hotspot',
      });
    }

    // Add hotspot to previous room (except first)
    if (index > 0) {
      hotspots.push({
        pitch: -15,
        yaw: 270,
        targetRoom: index - 1,
        text: `Back to ${roomData[index - 1].name} →`,
        cssClass: 'vr-tour-hotspot',
      });
    }

    // Add return to start (except last)
    if (index === roomData.length - 1 && index > 0) {
      hotspots.push({
        pitch: -20,
        yaw: 180,
        targetRoom: 0,
        text: 'Back to Start →',
        cssClass: 'vr-tour-hotspot',
      });
    }

    return createRoom(index, data.name, data.imageUrl, hotspots);
  });

  return createPropertyTour(propertyId, propertyName, rooms);
}

/**
 * Generate circular room connection (loop tour)
 */
export function createCircularTour(
  propertyId: string,
  propertyName: string,
  roomData: Array<{ name: string; imageUrl: string }>
): VRPropertyTour {
  const rooms = roomData.map((data, index) => {
    const nextIndex = (index + 1) % roomData.length;
    const prevIndex = (index - 1 + roomData.length) % roomData.length;

    const hotspots: Hotspot[] = [
      {
        pitch: -15,
        yaw: 90,
        targetRoom: nextIndex,
        text: `Go to ${roomData[nextIndex].name} →`,
        cssClass: 'vr-tour-hotspot',
      },
      {
        pitch: -15,
        yaw: 270,
        targetRoom: prevIndex,
        text: `Back to ${roomData[prevIndex].name} →`,
        cssClass: 'vr-tour-hotspot',
      },
    ];

    return createRoom(index, data.name, data.imageUrl, hotspots);
  });

  return createPropertyTour(propertyId, propertyName, rooms);
}

/**
 * Format Pi price for display
 */
export function formatPiPrice(piAmount: number): string {
  if (piAmount >= 1000000) {
    return `${(piAmount / 1000000).toFixed(1)}M π`;
  }
  if (piAmount >= 1000) {
    return `${(piAmount / 1000).toFixed(1)}K π`;
  }
  return `${piAmount} π`;
}

/**
 * Convert USD price to Pi (using mock conversion rate)
 */
export function convertUsdToPi(usdAmount: number, exchangeRate: number = 0.1): number {
  return Math.round(usdAmount / exchangeRate);
}

/**
 * Get optimal HFOV based on room type
 */
export function getOptimalHFOV(roomType: string): number {
  const hfovMap: Record<string, number> = {
    'Living Room': 100,
    Kitchen: 95,
    Bedroom: 100,
    Bathroom: 90,
    Hallway: 110,
    Exterior: 110,
    Outdoor: 120,
  };

  return hfovMap[roomType] || 100;
}

/**
 * Generate hotspot grid (useful for wide spaces)
 */
export function createHotspotGrid(
  targetRoom: number,
  destination: string,
  gridSize: number = 3
): Hotspot[] {
  const hotspots: Hotspot[] = [];
  const positions = [
    { pitch: -10, yaw: 0 },
    { pitch: -10, yaw: 90 },
    { pitch: -10, yaw: 180 },
    { pitch: -10, yaw: 270 },
    { pitch: 0, yaw: 45 },
    { pitch: 0, yaw: 135 },
    { pitch: 0, yaw: 225 },
    { pitch: 0, yaw: 315 },
    { pitch: 10, yaw: 90 },
  ];

  for (let i = 0; i < Math.min(gridSize, positions.length); i++) {
    const pos = positions[i];
    hotspots.push({
      pitch: pos.pitch,
      yaw: pos.yaw,
      targetRoom,
      text: `${destination} →`,
      cssClass: 'vr-tour-hotspot',
    });
  }

  return hotspots;
}

/**
 * Batch preload panorama images
 */
export async function preloadImages(imageUrls: string[]): Promise<string[]> {
  const loaded: string[] = [];

  for (const url of imageUrls) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      loaded.push(url);
    } catch (error) {
      console.error(`Failed to preload image: ${url}`, error);
    }
  }

  return loaded;
}

/**
 * Debug hotspot positions in console
 */
export function debugHotspots(room: VRRoom): void {
  console.group(`Room: ${room.name}`);
  room.hotspots.forEach((hotspot, index) => {
    console.log(
      `Hotspot ${index}: pitch=${hotspot.pitch}, yaw=${hotspot.yaw}, target=${hotspot.targetRoom}, text="${hotspot.text}"`
    );
  });
  console.groupEnd();
}
