/**
 * VR Property Tour - Demo Configuration with Property Images
 * Contains default room setup, hotspot positions, demo property data, and property photography URLs
 */

import { VRPropertyTour, VRRoom, Hotspot, PropertyImage } from './vr-tour-types';

// Premium luxury interior photography URLs for VR tours
// NOTE: these must be true equirectangular (2:1) panoramas for Pannellum to render them.
// Using Pannellum's own verified demo panoramas as placeholders until real 360° photography
// of each property is captured and uploaded.
const ROOM_IMAGES = {
  livingRoom: 'https://pannellum.org/images/alma.jpg',
  bedroom: 'https://pannellum.org/images/tocopilla.jpg',
  kitchen: 'https://pannellum.org/images/lascar.jpg',
  bathroom: 'https://pannellum.org/images/cerro-toco-0.jpg',
  outdoor: 'https://pannellum.org/images/from-tree.jpg',
};

// Real estate property photos for each room (2D gallery)
// Real NYC penthouse photos stored locally in /public/property-photos/nyc-penthouse/
const PROPERTY_IMAGES: Record<string, PropertyImage[]> = {
  livingRoom: [
    { id: 'lr-1', url: '/property-photos/nyc-penthouse/photo-01.jpg', caption: 'Living Room - Main View', featured: true },
    { id: 'lr-2', url: '/property-photos/nyc-penthouse/photo-02.jpg', caption: 'Living Room - Seating Area' },
    { id: 'lr-3', url: '/property-photos/nyc-penthouse/photo-03.jpg', caption: 'Living Room - City View' },
  ],
  bedroom: [
    { id: 'br-1', url: '/property-photos/nyc-penthouse/photo-04.jpg', caption: 'Master Bedroom - Main View', featured: true },
    { id: 'br-2', url: '/property-photos/nyc-penthouse/photo-05.jpg', caption: 'Bedroom - Window View' },
  ],
  kitchen: [
    { id: 'k-1', url: '/property-photos/nyc-penthouse/photo-06.jpg', caption: 'Kitchen - Main View', featured: true },
  ],
  bathroom: [
    { id: 'bth-1', url: '/property-photos/nyc-penthouse/photo-07.jpg', caption: 'Bathroom - Main View', featured: true },
  ],
  outdoor: [
    { id: 'od-1', url: '/property-photos/nyc-penthouse/photo-08.jpg', caption: 'Outdoor - Terrace View', featured: true },
    { id: 'od-2', url: '/property-photos/nyc-penthouse/photo-09.jpg', caption: 'Outdoor - Skyline View' },
    { id: 'od-3', url: '/property-photos/nyc-penthouse/photo-10.jpg', caption: 'Outdoor - Evening View' },
  ],
};

// Hotspot positions and configurations for each room
const createHotspot = (pitch: number, yaw: number, targetRoom: number, text: string): Hotspot => ({
  pitch,
  yaw,
  targetRoom,
  text,
  cssClass: 'vr-tour-hotspot',
});

// Room definitions with hotspot positions and property images
const DEMO_ROOMS: VRRoom[] = [
  {
    id: 0,
    name: 'Living Room',
    imageUrl: ROOM_IMAGES.livingRoom,
    pitch: 0,
    yaw: 0,
    hfov: 100,
    price: 850000,
    description: 'Spacious living room with modern furnishings and natural lighting',
    propertyImages: PROPERTY_IMAGES.livingRoom,
    hotspots: [
      createHotspot(0, 90, 1, 'Go to Bedroom →'),
      createHotspot(-20, 180, 4, 'Go to Bathroom →'),
    ],
  },
  {
    id: 1,
    name: 'Bedroom',
    imageUrl: ROOM_IMAGES.bedroom,
    pitch: 0,
    yaw: 0,
    hfov: 100,
    price: 850000,
    description: 'Luxurious master bedroom with premium bedding and soft ambiance',
    propertyImages: PROPERTY_IMAGES.bedroom,
    hotspots: [
      createHotspot(0, -90, 2, 'Go to Kitchen →'),
      createHotspot(-20, 180, 0, 'Back to Living Room →'),
    ],
  },
  {
    id: 2,
    name: 'Kitchen',
    imageUrl: ROOM_IMAGES.kitchen,
    pitch: 0,
    yaw: 0,
    hfov: 100,
    price: 850000,
    description: 'Modern kitchen equipped with high-end appliances and marble counters',
    propertyImages: PROPERTY_IMAGES.kitchen,
    hotspots: [
      createHotspot(0, 90, 3, 'Go to Bathroom →'),
      createHotspot(-20, 0, 1, 'Back to Bedroom →'),
    ],
  },
  {
    id: 3,
    name: 'Bathroom',
    imageUrl: ROOM_IMAGES.bathroom,
    pitch: 0,
    yaw: 0,
    hfov: 100,
    price: 850000,
    description: 'Spa-style bathroom with luxury fixtures and marble finishes',
    propertyImages: PROPERTY_IMAGES.bathroom,
    hotspots: [
      createHotspot(0, -90, 2, 'Back to Kitchen →'),
      createHotspot(-20, 0, 0, 'Back to Living Room →'),
    ],
  },
  {
    id: 4,
    name: 'Outdoor',
    imageUrl: ROOM_IMAGES.outdoor,
    pitch: 0,
    yaw: 0,
    hfov: 100,
    price: 850000,
    description: 'Beautiful outdoor terrace with infinity pool and garden area',
    propertyImages: PROPERTY_IMAGES.outdoor,
    hotspots: [
      createHotspot(0, 90, 1, 'Go to Bedroom →'),
      createHotspot(-20, 180, 3, 'Go to Bathroom →'),
    ],
  },
];

// Demo property configuration
export const DEMO_PROPERTY: VRPropertyTour = {
  propertyId: 'demo-001',
  propertyName: 'Luxury Penthouse',
  rooms: DEMO_ROOMS,
  price: 850000,
  piPrice: 85000,
};

