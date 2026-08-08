export type TravelMode = 'driving' | 'walking' | 'cycling';

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  location: [number, number]; // [lat, lng]
}

export interface Route {
  distance: number; // total meters
  duration: number; // total seconds
  geometry: [number, number][]; // [lat, lng] points
  steps: RouteStep[];
}

const PROFILE_ENDPOINT: Record<TravelMode, string> = {
  driving: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
  walking: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
  cycling: 'https://routing.openstreetmap.de/routed-bike/route/v1/bike',
};

// Minimal, readable instruction text from an OSRM maneuver step.
function describeStep(step: any, language: 'en' | 'ar'): string {
  const type = step.maneuver?.type;
  const modifier = step.maneuver?.modifier;
  const road = step.name || (language === 'ar' ? 'الطريق' : 'the road');

  const dict: Record<string, { en: string; ar: string }> = {
    depart: { en: `Head out on ${road}`, ar: `انطلق على ${road}` },
    arrive: { en: 'You have arrived at your destination', ar: 'لقد وصلت إلى وجهتك' },
    turn: {
      en: `Turn ${modifier || ''} onto ${road}`.replace(/\s+/g, ' '),
      ar: `اتجه ${modifier === 'left' ? 'يسار' : modifier === 'right' ? 'يمين' : ''} إلى ${road}`,
    },
    'new name': { en: `Continue onto ${road}`, ar: `تابع على ${road}` },
    continue: { en: `Continue on ${road}`, ar: `استمر على ${road}` },
    merge: { en: `Merge onto ${road}`, ar: `اندمج في ${road}` },
    roundabout: { en: `Enter the roundabout, then take ${road}`, ar: `ادخل الدوار ثم اتجه إلى ${road}` },
    fork: { en: `Keep ${modifier || ''} at the fork onto ${road}`.replace(/\s+/g, ' '), ar: `حافظ على ${modifier === 'left' ? 'اليسار' : 'اليمين'} عند التفرع إلى ${road}` },
  };

  const entry = dict[type] || { en: `Continue on ${road}`, ar: `استمر على ${road}` };
  return language === 'ar' ? entry.ar : entry.en;
}

export async function fetchRoute(
  mode: TravelMode,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  language: 'en' | 'ar' = 'en'
): Promise<Route | null> {
  try {
    const url = `${PROFILE_ENDPOINT[mode]}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;

    const geometry: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

    const steps: RouteStep[] = (route.legs?.[0]?.steps || []).map((s: any) => ({
      instruction: describeStep(s, language),
      distance: s.distance,
      duration: s.duration,
      location: [s.maneuver.location[1], s.maneuver.location[0]],
    }));

    return {
      distance: route.distance,
      duration: route.duration,
      geometry,
      steps,
    };
  } catch (e) {
    console.error('[Routing] fetchRoute error:', e);
    return null;
  }
}

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}
