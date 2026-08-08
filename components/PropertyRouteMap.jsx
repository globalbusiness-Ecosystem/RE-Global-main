"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const carIcon = L.divIcon({
  className: "car-marker",
  html: `<div style="font-size:26px;transform:rotate(0deg)">🚗</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const SPEED_ALERT_THRESHOLD_KMH = 60;

export default function PropertyRouteMap({ property, onPropertySelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routingControl = useRef(null);
  const carMarker = useRef(null);
  const watchId = useRef(null);

  const [userPos, setUserPos] = useState(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [showSpeedAlert, setShowSpeedAlert] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("المتصفح مش بيدعم تحديد الموقع");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("محتاجين إذن الموقع علشان نوريلك المسار للعقار");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!userPos || mapInstance.current) return;
    const map = L.map(mapRef.current).setView([userPos.lat, userPos.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.marker([userPos.lat, userPos.lng]).addTo(map).bindPopup("موقعك الحالي").openPopup();
    carMarker.current = L.marker([userPos.lat, userPos.lng], { icon: carIcon }).addTo(map);
    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [userPos]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !userPos || !property) return;
    if (routingControl.current) map.removeControl(routingControl.current);
    routingControl.current = L.Routing.control({
      waypoints: [L.latLng(userPos.lat, userPos.lng), L.latLng(property.lat, property.lng)],
      lineOptions: { styles: [{ color: "#2563eb", weight: 5, opacity: 0.85 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: (i, wp) =>
        i === 1 ? L.marker(wp.latLng).bindPopup(property.title || "العقار") : null,
    }).addTo(map);
  }, [property, userPos]);

  const handlePosition = useCallback((pos) => {
    const { latitude, longitude, speed } = pos.coords;
    const map = mapInstance.current;
    if (carMarker.current) carMarker.current.setLatLng([latitude, longitude]);
    if (map) map.panTo([latitude, longitude], { animate: true });
    const kmh = speed && speed > 0 ? Math.round(speed * 3.6) : 0;
    setSpeedKmh(kmh);
    setShowSpeedAlert(kmh >= SPEED_ALERT_THRESHOLD_KMH);
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation || watchId.current) return;
    watchId.current = navigator.geolocation.watchPosition(
      handlePosition,
      () => setError("مش قادرين نتابع موقعك دلوقتي"),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setShowSpeedAlert(false);
    setSpeedKmh(0);
  };

  useEffect(() => stopTracking, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
      {locating && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80">
          <span className="animate-pulse text-sm text-gray-600">بنحدد موقعك الحالي...</span>
        </div>
      )}
      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-red-600 text-white text-sm px-4 py-2 rounded-full shadow">
          {error}
        </div>
      )}
      {showSpeedAlert && (
        <div className="absolute top-3 right-3 z-[1000] bg-amber-500 text-white px-4 py-2 rounded-xl shadow-lg font-semibold flex items-center gap-2">
          ⚠️ سرعتك {speedKmh} كم/س — خد بالك
        </div>
      )}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button onClick={startTracking} className="bg-blue-600 text-white px-4 py-2 rounded-full shadow text-sm">
          ابدأ التتبع للعقار
        </button>
        <button onClick={stopTracking} className="bg-gray-700 text-white px-4 py-2 rounded-full shadow text-sm">
          إيقاف
        </button>
      </div>
      {speedKmh > 0 && !showSpeedAlert && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 px-3 py-1.5 rounded-full shadow text-sm font-medium">
          {speedKmh} كم/س
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
}
