# VR Property Tour - Advanced Configuration Examples

## Real Estate Property Tours

### Luxury Apartment Tour
\`\`\`typescript
import { createPropertyTour, COMMON_HOTSPOT_POSITIONS } from '@/lib/vr-property-config';

const luxuryApartment = createPropertyTour(
  'luxury-apt-2024-001',
  'Penthouse Suite - Downtown Tower',
  [
    {
      id: 'foyer',
      name: 'Grand Foyer',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-foyer-360.jpg',
      description: 'Elegant entry with marble floors',
      features: ['Double height ceiling', 'Custom chandelier', 'Marble flooring'],
      connections: [
        { targetRoomId: 'living-room', yaw: 0, pitch: 0 },
        { targetRoomId: 'guest-bedroom', yaw: 90, pitch: 0 },
        { targetRoomId: 'kitchen', yaw: 180, pitch: 0 },
      ]
    },
    {
      id: 'living-room',
      name: 'Living Room',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-living-360.jpg',
      description: 'Panoramic city views from floor-to-ceiling windows',
      features: ['45 sqm', 'City view', 'Premium finishes'],
      connections: [
        { targetRoomId: 'foyer', yaw: 180, pitch: 0 },
        { targetRoomId: 'master-bedroom', yaw: 90, pitch: 0 },
        { targetRoomId: 'terrace', yaw: 45, pitch: 0 },
      ]
    },
    {
      id: 'master-bedroom',
      name: 'Master Bedroom',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-bedroom-360.jpg',
      description: 'Luxurious ensuite bedroom with walk-in closet',
      features: ['32 sqm', 'Ensuite bathroom', 'Walk-in closet'],
      connections: [
        { targetRoomId: 'living-room', yaw: 270, pitch: 0 },
        { targetRoomId: 'bathroom', yaw: 90, pitch: 0 },
      ]
    },
    {
      id: 'bathroom',
      name: 'Master Bathroom',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-bathroom-360.jpg',
      description: 'Spa-like bathroom with premium fixtures',
      features: ['Marble tiles', 'Rainfall shower', 'Heated floors'],
      connections: [
        { targetRoomId: 'master-bedroom', yaw: 270, pitch: 0 },
      ]
    },
    {
      id: 'kitchen',
      name: 'Chef\'s Kitchen',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-kitchen-360.jpg',
      description: 'Modern chef\'s kitchen with premium appliances',
      features: ['18 sqm', 'Stainless steel', 'Island counter'],
      connections: [
        { targetRoomId: 'foyer', yaw: 0, pitch: 0 },
        { targetRoomId: 'dining-room', yaw: 90, pitch: 0 },
      ]
    },
    {
      id: 'dining-room',
      name: 'Dining Room',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-dining-360.jpg',
      description: 'Formal dining area',
      features: ['12 sqm', 'Seats 8', 'Premium finishes'],
      connections: [
        { targetRoomId: 'kitchen', yaw: 270, pitch: 0 },
        { targetRoomId: 'living-room', yaw: 180, pitch: 0 },
      ]
    },
    {
      id: 'guest-bedroom',
      name: 'Guest Bedroom',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-guest-360.jpg',
      description: 'Comfortable guest room with ensuite',
      features: ['20 sqm', 'Ensuite', 'City view'],
      connections: [
        { targetRoomId: 'foyer', yaw: 270, pitch: 0 },
        { targetRoomId: 'living-room', yaw: 180, pitch: 0 },
      ]
    },
    {
      id: 'terrace',
      name: 'Private Terrace',
      imageUrl: 'https://cdn.realestate.com/properties/luxury-apt-terrace-360.jpg',
      description: 'Outdoor terrace with infinity pool',
      features: ['60 sqm', 'Infinity pool', 'Lounge areas'],
      connections: [
        { targetRoomId: 'living-room', yaw: 315, pitch: 0 },
      ]
    }
  ]
);
\`\`\`

### Family Home Tour
\`\`\`typescript
const familyHome = createPropertyTour(
  'family-home-2024-456',
  'Suburban Family Home',
  [
    {
      id: 'entrance',
      name: 'Entrance Hall',
      imageUrl: 'https://cdn.realestate.com/family-entrance-360.jpg',
      features: ['Welcoming entry', 'Storage'],
      connections: [
        { targetRoomId: 'living-room', yaw: 0 },
        { targetRoomId: 'kitchen', yaw: 90 },
      ]
    },
    {
      id: 'living-room',
      name: 'Living Room',
      imageUrl: 'https://cdn.realestate.com/family-living-360.jpg',
      features: ['30 sqm', 'Natural light', 'Fireplace'],
      connections: [
        { targetRoomId: 'entrance', yaw: 180 },
        { targetRoomId: 'kitchen', yaw: 90 },
        { targetRoomId: 'bedroom-1', yaw: 270 },
      ]
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      imageUrl: 'https://cdn.realestate.com/family-kitchen-360.jpg',
      features: ['Spacious', 'Modern appliances', 'Breakfast bar'],
      connections: [
        { targetRoomId: 'living-room', yaw: 270 },
        { targetRoomId: 'garden', yaw: 45 },
      ]
    },
    {
      id: 'garden',
      name: 'Garden',
      imageUrl: 'https://cdn.realestate.com/family-garden-360.jpg',
      features: ['Large garden', 'Deck', 'Mature trees'],
      connections: [
        { targetRoomId: 'kitchen', yaw: 225 },
      ]
    },
    {
      id: 'bedroom-1',
      name: 'Master Bedroom',
      imageUrl: 'https://cdn.realestate.com/family-master-360.jpg',
      features: ['25 sqm', 'Ensuite', 'Walk-in wardrobe'],
      connections: [
        { targetRoomId: 'living-room', yaw: 90 },
        { targetRoomId: 'main-bathroom', yaw: 270 },
      ]
    },
    {
      id: 'bedroom-2',
      name: 'Bedroom 2',
      imageUrl: 'https://cdn.realestate.com/family-bedroom2-360.jpg',
      features: ['18 sqm', 'Storage', 'Garden view'],
      connections: [
        { targetRoomId: 'main-bathroom', yaw: 180 },
      ]
    },
    {
      id: 'bedroom-3',
      name: 'Bedroom 3',
      imageUrl: 'https://cdn.realestate.com/family-bedroom3-360.jpg',
      features: ['15 sqm', 'Bright', 'Hardwood floor'],
      connections: [
        { targetRoomId: 'main-bathroom', yaw: 90 },
      ]
    },
    {
      id: 'main-bathroom',
      name: 'Main Bathroom',
      imageUrl: 'https://cdn.realestate.com/family-bathroom-360.jpg',
      features: ['Modern fixtures', 'Shower & tub'],
      connections: [
        { targetRoomId: 'bedroom-1', yaw: 90 },
        { targetRoomId: 'bedroom-2', yaw: 0 },
        { targetRoomId: 'bedroom-3', yaw: 270 },
      ]
    },
  ]
);
\`\`\`

### Commercial Space Tour
\`\`\`typescript
const commercialSpace = createPropertyTour(
  'commercial-2024-789',
  'Premium Office Space - Business District',
  [
    {
      id: 'reception',
      name: 'Reception Area',
      imageUrl: 'https://cdn.realestate.com/office-reception-360.jpg',
      features: ['Professional look', 'Natural light'],
      connections: [
        { targetRoomId: 'open-office', yaw: 0 },
        { targetRoomId: 'meeting-room-1', yaw: 90 },
        { targetRoomId: 'meeting-room-2', yaw: 270 },
      ]
    },
    {
      id: 'open-office',
      name: 'Open Office Area',
      imageUrl: 'https://cdn.realestate.com/office-open-360.jpg',
      features: ['200 sqm', '15+ desks', 'Floor-to-ceiling windows'],
      connections: [
        { targetRoomId: 'reception', yaw: 180 },
        { targetRoomId: 'meeting-room-1', yaw: 90 },
        { targetRoomId: 'kitchen', yaw: 0 },
      ]
    },
    {
      id: 'meeting-room-1',
      name: 'Board Room',
      imageUrl: 'https://cdn.realestate.com/office-boardroom-360.jpg',
      features: ['Premium finish', 'AV equipment', 'Seats 10'],
      connections: [
        { targetRoomId: 'reception', yaw: 270 },
        { targetRoomId: 'open-office', yaw: 270 },
      ]
    },
    {
      id: 'meeting-room-2',
      name: 'Meeting Room 1',
      imageUrl: 'https://cdn.realestate.com/office-meeting1-360.jpg',
      features: ['Intimate', 'Private', 'Seats 4'],
      connections: [
        { targetRoomId: 'reception', yaw: 90 },
      ]
    },
    {
      id: 'kitchen',
      name: 'Break Room & Kitchen',
      imageUrl: 'https://cdn.realestate.com/office-kitchen-360.jpg',
      features: ['Fully equipped', 'Seating', 'WiFi'],
      connections: [
        { targetRoomId: 'open-office', yaw: 180 },
      ]
    },
  ]
);
\`\`\`

## Advanced Configuration Patterns

### Multi-Level Building
\`\`\`typescript
// Use naming convention for floor identification
const groundFloor = createPropertyTour('building-g', 'Ground Floor', [/* ... */]);
const firstFloor = createPropertyTour('building-1', 'First Floor', [/* ... */]);
const secondFloor = createPropertyTour('building-2', 'Second Floor', [/* ... */]);

// Store in array for easy access
const buildingTours = [groundFloor, firstFloor, secondFloor];
\`\`\`

### Seasonal Property Views
\`\`\`typescript
// Summer view
const summerTour = createPropertyTour('villa-summer', 'Villa - Summer', [
  {
    id: 'pool-area',
    name: 'Pool Area',
    imageUrl: 'https://cdn.realestate.com/pool-summer-360.jpg',
    connections: [{ targetRoomId: 'patio', yaw: 90 }]
  },
  // ... more rooms
]);

// Winter view
const winterTour = createPropertyTour('villa-winter', 'Villa - Winter', [
  {
    id: 'ski-lounge',
    name: 'Ski Lounge',
    imageUrl: 'https://cdn.realestate.com/lounge-winter-360.jpg',
    connections: [{ targetRoomId: 'fireplace', yaw: 90 }]
  },
  // ... more rooms
]);
\`\`\`

### Before & After Renovation
\`\`\`typescript
const beforeRenovation = createPropertyTour('property-before', 'Property - Before', [/* ... */]);
const afterRenovation = createPropertyTour('property-after', 'Property - After', [/* ... */]);

// Allow users to toggle between views
const [showAfter, setShowAfter] = useState(true);
const tour = showAfter ? afterRenovation : beforeRenovation;
\`\`\`

## Dynamic Room Generation

\`\`\`typescript
interface RoomData {
  id: string;
  name: string;
  imageUrl: string;
  connections: { targetId: string; angle: number }[];
}

function generateTourFromData(propertyId: string, name: string, rooms: RoomData[]) {
  const connectionMap = new Map();
  
  // Build connection graph
  rooms.forEach(room => {
    connectionMap.set(room.id, room.connections);
  });

  // Create tour with automatic navigation
  const tourRooms = rooms.map(room => ({
    id: room.id,
    name: room.name,
    imageUrl: room.imageUrl,
    connections: room.connections.map(conn => ({
      targetRoomId: conn.targetId,
      yaw: conn.angle,
    }))
  }));

  return createPropertyTour(propertyId, name, tourRooms);
}
\`\`\`

## Integration with CMS

\`\`\`typescript
async function fetchPropertyTourFromCMS(propertyId: string) {
  const response = await fetch(`/api/cms/properties/${propertyId}/tour`);
  const data = await response.json();
  
  return createPropertyTour(
    data.propertyId,
    data.propertyName,
    data.rooms.map(room => ({
      id: room.id,
      name: room.name,
      imageUrl: room.imageUrl,
      description: room.description,
      features: room.features,
      connections: room.connections
    }))
  );
}
\`\`\`

## Mobile-Optimized Configuration

\`\`\`typescript
const mobileOptimizedConfig = {
  imageQuality: 'medium', // Use smaller images for mobile
  maxRooms: 5,           // Limit rooms for faster loading
  preloadNextRoom: true,  // Pre-load next room
  enableAutoRotate: false, // Disable on mobile for battery
  hotspotSize: 50,        // Smaller hotspots for touch
};
\`\`\`

## Analytics Integration

\`\`\`typescript
const { openTour } = useVRTour({
  onTourStart: (propertyId) => {
    // Track tour start
    analytics.track('vr_tour_start', {
      propertyId,
      timestamp: new Date().toISOString(),
    });
  },
  onRoomChange: (roomId, roomName) => {
    // Track room navigation
    analytics.track('vr_tour_room_change', {
      roomId,
      roomName,
      timestamp: new Date().toISOString(),
    });
  },
  onBuyClick: (propertyId, price) => {
    // Track conversion attempt
    analytics.track('vr_tour_buy_click', {
      propertyId,
      price,
      timestamp: new Date().toISOString(),
    });
  }
});
\`\`\`

## Performance Optimization Tips

1. **Image Optimization**
   - Use 4096x2048 or 2048x1024 resolution
   - Compress with WebP when supported
   - Use CDN with geographic distribution

2. **Lazy Loading**
   - Pre-load only next 2 rooms
   - Load previous room on demand

3. **Caching Strategy**
   - Cache tours for 24 hours
   - Version tours when updated
   - Use service workers for offline support
