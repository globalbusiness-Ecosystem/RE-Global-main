/**
 * VR Property Tour Configuration
 * Manages room definitions, hotspot positions, and property-specific tour data
 */

export interface Room {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  features?: string[];
  hotspots: Hotspot[];
}

export interface Hotspot {
  id: string;
  pitch: number; // -90 to 90
  yaw: number; // 0 to 360
  targetRoomId: string;
  title: string;
  icon?: string; // '→', '←', etc.
}

export interface PropertyVRTour {
  propertyId: string;
  propertyName: string;
  rooms: Room[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    totalRooms?: number;
  };
}

/**
 * Example property with rooms and hotspots
 */
export const EXAMPLE_LUXURY_APARTMENT: PropertyVRTour = {
  propertyId: 'luxury-apt-001',
  propertyName: 'Luxury Penthouse',
  rooms: [
    {
      id: 'living-room',
      name: 'Living Room',
      imageUrl: 'https://images.unsplash.com/photo-1616394584318-e3e4e7874b0e?w=1280&h=640&fit=crop&q=85',
      description: 'Spacious living area with floor-to-ceiling windows',
      features: ['45 sqm', 'City view', 'Premium hardwood floors'],
      hotspots: [
        {
          id: 'living-to-bedroom',
          pitch: 0,
          yaw: 90,
          targetRoomId: 'bedroom',
          title: '→ Bedroom',
        },
        {
          id: 'living-to-kitchen',
          pitch: 0,
          yaw: 180,
          targetRoomId: 'kitchen',
          title: '→ Kitchen',
        },
        {
          id: 'living-to-bathroom',
          pitch: -30,
          yaw: 270,
          targetRoomId: 'bathroom',
          title: '→ Bathroom',
        },
      ],
    },
    {
      id: 'bedroom',
      name: 'Master Bedroom',
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1280&h=640&fit=crop&q=85',
      description: 'Luxurious master suite with walk-in closet',
      features: ['32 sqm', 'Ensuite bathroom', 'Sky light'],
      hotspots: [
        {
          id: 'bedroom-to-living',
          pitch: 0,
          yaw: 270,
          targetRoomId: 'living-room',
          title: '← Living Room',
        },
        {
          id: 'bedroom-to-kitchen',
          pitch: 0,
          yaw: 90,
          targetRoomId: 'kitchen',
          title: '→ Kitchen',
        },
      ],
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1280&h=640&fit=crop&q=85',
      description: 'Modern chef\'s kitchen with premium appliances',
      features: ['18 sqm', 'Stainless steel', 'Island counter'],
      hotspots: [
        {
          id: 'kitchen-to-living',
          pitch: 0,
          yaw: 180,
          targetRoomId: 'living-room',
          title: '← Living Room',
        },
        {
          id: 'kitchen-to-dining',
          pitch: 0,
          yaw: 90,
          targetRoomId: 'bathroom',
          title: '→ Dining',
        },
      ],
    },
    {
      id: 'bathroom',
      name: 'Bathroom',
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1280&h=640&fit=crop&q=85',
      description: 'Spa-like bathroom with luxury fixtures',
      features: ['12 sqm', 'Marble tiles', 'Rainfall shower'],
      hotspots: [
        {
          id: 'bathroom-to-living',
          pitch: 0,
          yaw: 90,
          targetRoomId: 'living-room',
          title: '← Living Room',
        },
      ],
    },
  ],
};

/**
 * Template for creating new property tours
 */
export const createPropertyTour = (
  propertyId: string,
  propertyName: string,
  roomsData: Array<{
    id: string;
    name: string;
    imageUrl: string;
    description?: string;
    features?: string[];
    connections: Array<{ targetRoomId: string; yaw: number; pitch?: number }>;
  }>
): PropertyVRTour => {
  const rooms: Room[] = roomsData.map((roomData, index) => {
    const hotspots: Hotspot[] = roomData.connections.map(
      (connection, connIndex) => ({
        id: `${roomData.id}-hotspot-${connIndex}`,
        pitch: connection.pitch || 0,
        yaw: connection.yaw,
        targetRoomId: connection.targetRoomId,
        title: `→ ${roomsData.find((r) => r.id === connection.targetRoomId)?.name || 'Next Room'}`,
      })
    );

    return {
      id: roomData.id,
      name: roomData.name,
      imageUrl: roomData.imageUrl,
      description: roomData.description,
      features: roomData.features,
      hotspots,
    };
  });

  return {
    propertyId,
    propertyName,
    rooms,
    metadata: {
      createdAt: new Date().toISOString(),
      totalRooms: rooms.length,
    },
  };
};

/**
 * Get hotspot positions for common navigation patterns
 */
export const COMMON_HOTSPOT_POSITIONS = {
  // Straight ahead
  forward: { pitch: 0, yaw: 0 },
  // Right side
  right: { pitch: 0, yaw: 90 },
  // Behind
  backward: { pitch: 0, yaw: 180 },
  // Left side
  left: { pitch: 0, yaw: 270 },
  // Forward-right diagonal
  forwardRight: { pitch: 0, yaw: 45 },
  // Backward-right diagonal
  backwardRight: { pitch: 0, yaw: 135 },
  // Backward-left diagonal
  backwardLeft: { pitch: 0, yaw: 225 },
  // Forward-left diagonal
  forwardLeft: { pitch: 0, yaw: 315 },
  // Upper forward (looking up)
  upForward: { pitch: 45, yaw: 0 },
  // Lower forward (looking down)
  downForward: { pitch: -45, yaw: 0 },
};
