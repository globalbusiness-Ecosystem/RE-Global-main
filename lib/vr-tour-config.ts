/**
 * VR Property Tour - Demo Configuration with Property Images
 * Contains default room setup, hotspot positions, demo property data, and property photography URLs
 */

import { VRPropertyTour, VRRoom, Hotspot, PropertyImage } from './vr-tour-types';

// Premium luxury interior photography URLs for VR tours
const ROOM_IMAGES = {
  // Modern luxury living room with contemporary furnishings
  livingRoom: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
  // Elegant master bedroom with soft lighting
  bedroom: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
  // Modern luxury kitchen with high-end appliances
  kitchen: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg',
  // Spa-style luxury marble bathroom
  bathroom: 'https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg',
  // Luxury villa exterior with pool and terrace
  outdoor: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
};

// Real estate property photos for each room (2D gallery)
const PROPERTY_IMAGES: Record<string, PropertyImage[]> = {
  livingRoom: [
    { id: 'lr-1', url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', caption: 'Modern Living Room - Front View', featured: true },
    { id: 'lr-2', url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg', caption: 'Living Room - Side Angle' },
    { id: 'lr-3', url: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', caption: 'Luxury Seating Area' },
  ],
  bedroom: [
    { id: 'br-1', url: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg', caption: 'Master Bedroom - Main View', featured: true },
    { id: 'br-2', url: 'https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg', caption: 'Bedroom - Luxury Bed Frame' },
    { id: 'br-3', url: 'https://images.pexels.com/photos/1595521/pexels-photo-1595521.jpeg', caption: 'Bedroom - Window View' },
  ],
  kitchen: [
    { id: 'k-1', url: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg', caption: 'Modern Kitchen - Island View', featured: true },
    { id: 'k-2', url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg', caption: 'Kitchen - Appliances Close-up' },
    { id: 'k-3', url: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg', caption: 'Kitchen - Dining Area' },
  ],
  bathroom: [
    { id: 'bth-1', url: 'https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg', caption: 'Spa Bathroom - Main View', featured: true },
    { id: 'bth-2', url: 'https://images.pexels.com/photos/1547276/pexels-photo-1547276.jpeg', caption: 'Bathroom - Luxury Fixtures' },
    { id: 'bth-3', url: 'https://images.pexels.com/photos/2111591/pexels-photo-2111591.jpeg', caption: 'Bathroom - Modern Sink' },
  ],
  outdoor: [
    { id: 'od-1', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', caption: 'Outdoor Terrace - Pool View', featured: true },
    { id: 'od-2', url: 'https://images.pexels.com/photos/1579974/pexels-photo-1579974.jpeg', caption: 'Luxury Garden Area' },
    { id: 'od-3', url: 'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg', caption: 'Exterior - Evening Lighting' },
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
export const DEMO_ROOMS: VRRoom[] = [
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

// Hotspot styling configuration
export const HOTSPOT_STYLES = {
  width: '50px',
  height: '50px',
  backgroundColor: 'rgba(245, 158, 11, 0.3)',
  border: '2px solid #F59E0B',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#F59E0B',
  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.2)',
  transition: 'all 0.3s ease',
  animation: 'pulse-glow 2s ease-in-out infinite',
};

// CSS Animation for glowing hotspots
export const HOTSPOT_ANIMATION = `
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.2);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.8), inset 0 0 15px rgba(245, 158, 11, 0.4);
      transform: scale(1.1);
    }
  }

  .vr-tour-hotspot {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: rgba(245, 158, 11, 0.3);
    border: 2px solid #F59E0B;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: #F59E0B;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.2);
    animation: pulse-glow 2s ease-in-out infinite;
    transition: all 0.3s ease;
    z-index: 10;
  }

  .vr-tour-hotspot:hover {
    background-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 0 25px rgba(245, 158, 11, 1), inset 0 0 15px rgba(245, 158, 11, 0.6);
    transform: scale(1.2);
  }

  .vr-tour-hotspot::before {
    content: '→';
    font-size: 28px;
    font-weight: bold;
    color: #F59E0B;
  }

  .vr-tour-hotspot-tooltip {
    background-color: rgba(3, 7, 18, 0.95);
    color: #F59E0B;
    padding: 6px 12px;
    border: 1px solid #F59E0B;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    margin-top: -35px;
  }
`;
