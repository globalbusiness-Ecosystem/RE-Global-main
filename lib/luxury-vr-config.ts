/**
 * Luxury VR Tour Configuration & Setup
 * Premium 360° panoramic tour system for RE Platform
 */

import type { VRTourConfig, VRScene } from '@/lib/vr-tour-types';

/**
 * Create a VR tour configuration from property data
 */
export const createVRTourConfig = (
  propertyId: string,
  propertyName: string,
  scenes: Omit<VRScene, 'id'>[]
): VRTourConfig => ({
  scenes: scenes.map((scene, index) => ({
    ...scene,
    id: scene.title.toLowerCase().replace(/\s+/g, '-'),
  })),
  propertyId,
  propertyName,
  defaultSceneId: scenes[0]?.title.toLowerCase().replace(/\s+/g, '-') || 'living-room',
  enableGyroscope: true,
  enableAutoRotate: true,
  autoRotateSpeed: 2,
});

/**
 * Example luxury property VR configuration with full 360° support
 */
export const EXAMPLE_LUXURY_PROPERTY: VRTourConfig = {
  propertyId: 'prop-001',
  propertyName: 'Luxury Penthouse',
  defaultSceneId: 'living-room',
  enableGyroscope: true,
  enableAutoRotate: true,
  autoRotateSpeed: 2,
  scenes: [
    {
      id: 'living-room',
      title: 'Living Room',
      description: 'Spacious living area with panoramic views',
      imageUrl: 'https://images.unsplash.com/photo-1616394584318-e3e4e7874b0e?w=2048&h=1024&fit=crop&q=90',
      furnishedImageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=2048&h=1024&fit=crop&q=90',
      pitch: 0,
      yaw: 0,
      hotspots: [
        {
          id: 'hotspot-1',
          pitch: 0,
          yaw: 90,
          targetRoom: 'bedroom',
          title: 'Master Bedroom',
          icon: '🛏️',
        },
        {
          id: 'hotspot-2',
          pitch: -30,
          yaw: -90,
          targetRoom: 'kitchen',
          title: 'Chef\'s Kitchen',
          icon: '🍳',
        },
      ],
    },
    {
      id: 'bedroom',
      title: 'Master Bedroom',
      description: 'Luxurious master suite with en-suite bathroom',
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=2048&h=1024&fit=crop&q=90',
      furnishedImageUrl: 'https://images.unsplash.com/photo-1540932239986-310128078ceb?w=2048&h=1024&fit=crop&q=90',
      pitch: 0,
      yaw: 0,
      hotspots: [
        {
          id: 'hotspot-3',
          pitch: 0,
          yaw: -90,
          targetRoom: 'living-room',
          title: 'Back to Living Room',
          icon: '←',
        },
        {
          id: 'hotspot-4',
          pitch: 0,
          yaw: 180,
          targetRoom: 'bathroom',
          title: 'Master Bathroom',
          icon: '🚿',
        },
      ],
    },
    {
      id: 'kitchen',
      title: 'Chef\'s Kitchen',
      description: 'State-of-the-art kitchen with premium appliances',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2048&h=1024&fit=crop&q=90',
      furnishedImageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=2048&h=1024&fit=crop&q=90',
      pitch: 0,
      yaw: 0,
      hotspots: [
        {
          id: 'hotspot-5',
          pitch: 0,
          yaw: -90,
          targetRoom: 'living-room',
          title: 'Back to Living Room',
          icon: '←',
        },
        {
          id: 'hotspot-6',
          pitch: 0,
          yaw: 90,
          targetRoom: 'dining-room',
          title: 'Dining Room',
          icon: '🍽️',
        },
      ],
    },
    {
      id: 'bathroom',
      title: 'Master Bathroom',
      description: 'Spa-like bathroom with luxury fixtures',
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=2048&h=1024&fit=crop&q=90',
      furnishedImageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=2048&h=1024&fit=crop&q=90',
      pitch: 0,
      yaw: 0,
      hotspots: [
        {
          id: 'hotspot-7',
          pitch: 0,
          yaw: -90,
          targetRoom: 'bedroom',
          title: 'Back to Bedroom',
          icon: '←',
        },
      ],
    },
    {
      id: 'dining-room',
      title: 'Dining Room',
      description: 'Elegant dining space for entertaining',
      imageUrl: 'https://images.unsplash.com/photo-1610243867752-e2e00ff1c414?w=2048&h=1024&fit=crop&q=90',
      furnishedImageUrl: 'https://images.unsplash.com/photo-1610243867752-e2e00ff1c414?w=2048&h=1024&fit=crop&q=90',
      pitch: 0,
      yaw: 0,
      hotspots: [
        {
          id: 'hotspot-8',
          pitch: 0,
          yaw: -90,
          targetRoom: 'kitchen',
          title: 'Back to Kitchen',
          icon: '←',
        },
        {
          id: 'hotspot-9',
          pitch: 0,
          yaw: 90,
          targetRoom: 'living-room',
          title: 'Living Room',
          icon: '🏠',
        },
      ],
    },
  ],
};

/**
 * Helper to convert equirectangular coordinates (yaw/pitch) to 3D spherical
 */
export const equirectangularToSpherical = (yaw: number, pitch: number) => ({
  phi: (yaw * Math.PI) / 180,
  theta: Math.PI / 2 + (pitch * Math.PI) / 180,
});

/**
 * Helper to convert 3D spherical to screen coordinates
 */
export const sphericalToScreen = (
  phi: number,
  theta: number,
  cameraX: number,
  cameraY: number,
  width: number,
  height: number
) => {
  const relPhi = phi - cameraX;
  const relTheta = theta - cameraY;

  const screenX = width / 2 + Math.cos(relPhi) * (width / 2) * Math.sin(relTheta);
  const screenY = height / 2 + Math.sin(relTheta) * (height / 2);

  return { screenX, screenY };
};

/**
 * Preload images for smooth transitions
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve();
    img.onerror = reject;
  });
};

/**
 * Preload all scenes in a tour configuration
 */
export const preloadTourConfig = async (config: VRTourConfig): Promise<void> => {
  const promises = config.scenes.flatMap((scene) => [
    preloadImage(scene.imageUrl),
    ...(scene.furnishedImageUrl ? [preloadImage(scene.furnishedImageUrl)] : []),
  ]);

  await Promise.all(promises);
};
