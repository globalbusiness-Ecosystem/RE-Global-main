'use client';
import type { NavLanguage } from '@/lib/nav-i18n';
import { a11yLabels } from '@/lib/a11y-labels';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Car, Footprints, Bike, Volume2, VolumeX, Navigation as NavigationIcon, Loader2 } from 'lucide-react';
import { fetchRoute, haversineMeters, type Route, type TravelMode } from '@/lib/routing';
import { np, speechLang, routeTextLang, type NavPanelKey } from '@/lib/nav-panel-labels';

interface NavigationPanelProps {
  language: NavLanguage;
  destination: { lat: number; lng: number; title: string };
  onClose: () => void;
  L: any; // Leaflet instance (already loaded by the map page)
}

const MODE_ICON: Record<TravelMode, any> = { driving: Car, walking: Footprints, cycling: Bike };
const MODE_KEY: Record<TravelMode, NavPanelKey> = { driving: 'modeDrive', walking: 'modeWalk', cycling: 'modeBike' };

export function NavigationPanel({ language, destination, onClose, L }: NavigationPanelProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const liveMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const announcedStepsRef = useRef<Set<number>>(new Set());

  const [mode, setMode] = useState<TravelMode>('driving');
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livePosition, setLivePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [remainingMeters, setRemainingMeters] = useState<number | null>(null);

  const speak = useCallback(
    (text: string, spokenIn?: string) => {
      if (!voiceOn || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = speechLang(spokenIn ?? language);
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.error('[Navigation] speech error:', e);
      }
    },
    [voiceOn, language]
  );

  useEffect(() => {
    if (!mapDivRef.current || !L || mapRef.current) return;
    const map = L.map(mapDivRef.current, { zoomControl: true }).setView([destination.lat, destination.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    destMarkerRef.current = L.marker([destination.lat, destination.lng]).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [L, destination]);

  const loadRoute = useCallback(
    async (from: { lat: number; lng: number }) => {
      setLoading(true);
      setError(null);
      const r = await fetchRoute(mode, from, destination, routeTextLang(language));
      if (!r) {
        setError(np('routeFail', language));
        setLoading(false);
        return;
      }
      setRoute(r);
      setRemainingMeters(r.distance);
      announcedStepsRef.current = new Set();
      setLoading(false);

      if (mapRef.current && L) {
        if (routeLineRef.current) mapRef.current.removeLayer(routeLineRef.current);
        routeLineRef.current = L.polyline(r.geometry, { color: '#D4AF37', weight: 5 }).addTo(mapRef.current);
        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
      }

      if (r.steps[0]) speak(r.steps[0].instruction, routeTextLang(language));
    },
    [mode, destination, language, L, speak]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(np('noGeo', language));
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLivePosition(coords);
      },
      (err) => {
        console.error('[Navigation] geolocation error:', err);
        setError(np('trackFail', language));
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [language]);

  useEffect(() => {
    if (livePosition && !route) loadRoute(livePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePosition]);

  useEffect(() => {
    if (livePosition) loadRoute(livePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (!livePosition) return;

    if (mapRef.current && L) {
      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng([livePosition.lat, livePosition.lng]);
      } else {
        const icon = L.divIcon({
          className: 'nav-live-marker',
          html: `<div style="width:18px;height:18px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.35);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        liveMarkerRef.current = L.marker([livePosition.lat, livePosition.lng], { icon, zIndexOffset: 1000 }).addTo(
          mapRef.current
        );
      }
    }

    const remaining = haversineMeters(livePosition, destination);
    setRemainingMeters(remaining);

    if (remaining < 30) {
      speak(np('arrived', language));
    }

    if (route) {
      route.steps.forEach((step, idx) => {
        if (announcedStepsRef.current.has(idx)) return;
        const d = haversineMeters(livePosition, { lat: step.location[0], lng: step.location[1] });
        if (d < 40) {
          announcedStepsRef.current.add(idx);
          speak(step.instruction, routeTextLang(language));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePosition]);

  const remainingKm = remainingMeters !== null ? remainingMeters / 1000 : null;
  const remainingMinutes =
    route && remainingMeters !== null && route.distance > 0
      ? Math.max(1, Math.round((remainingMeters / route.distance) * (route.duration / 60)))
      : null;

  return (
    <div className="fixed inset-0 bg-black z-[120] flex flex-col">
      <div className="p-4 flex items-center justify-between bg-black/80 border-b border-accent/20">
        <div className="min-w-0">
          <h2 className="font-bold text-white truncate">{destination.title}</h2>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <NavigationIcon className="w-3 h-3 text-accent" />
            {np('live', language)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/10 text-white"
            title={np('voice', language)}
          >
            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>
          <button onClick={onClose} aria-label={a11yLabels(language).close} className="p-2 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-3 bg-black/60">
        {(['driving', 'walking', 'cycling'] as const).map((m) => {
          const Icon = MODE_ICON[m];
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm border transition ${
                mode === m ? 'bg-accent text-black border-accent font-semibold' : 'border-gray-700 text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {np(MODE_KEY[m], language)}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-black/60 border-b border-accent/10 flex items-center justify-between">
        {loading ? (
          <span className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            {np('calculating', language)}
          </span>
        ) : error ? (
          <span className="text-sm text-red-400">{error}</span>
        ) : (
          <>
            <div>
              <p className="text-2xl font-bold text-accent">
                {remainingKm !== null
                  ? remainingKm < 1
                    ? `${Math.round(remainingKm * 1000)} m`
                    : `${remainingKm.toFixed(1)} km`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">{np('remaining', language)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{remainingMinutes ?? '—'} {np('min', language)}</p>
              <p className="text-xs text-gray-400">{np('eta', language)}</p>
            </div>
          </>
        )}
      </div>

      <div ref={mapDivRef} className="flex-1" />

      {route && route.steps.length > 0 && (
        <div className="p-4 bg-black/90 border-t border-accent/20">
          <p className="text-xs text-gray-400 mb-1">{np('next', language)}</p>
          <p className="text-white font-medium">
            {route.steps.find((_, i) => !announcedStepsRef.current.has(i))?.instruction || route.steps[0].instruction}
          </p>
        </div>
      )}
    </div>
  );
}
