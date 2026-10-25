import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Layers, Compass, Crosshair } from 'lucide-react';
import L from 'leaflet';

interface SelfTrackingMapProps {
  lat: number;
  lng: number;
  accuracy?: number;
  deviceModel?: string;
  timestamp?: any;
  batteryLevel?: number | null;
  onRefresh?: () => void;
}

export const SelfTrackingMap: React.FC<SelfTrackingMapProps> = ({
  lat,
  lng,
  accuracy = 15,
  deviceModel = 'Registered Device',
  timestamp,
  batteryLevel,
  onRefresh
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default marker icon asset paths for Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Custom modern green pulsing pin icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(22, 132, 71, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; background-color: #168447; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: white; font-size: 14px;">
            📱
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Marker
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${deviceModel}</b><br/>Last reported here.`);

      // Accuracy radius circle
      const circle = L.circle([lat, lng], {
        radius: Math.max(accuracy, 10),
        color: '#168447',
        fillColor: '#168447',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lng], 16);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(Math.max(accuracy, 10));
      }
    }

    return () => {
      // Don't destroy on every re-render, keep instance
    };
  }, [lat, lng, accuracy, deviceModel]);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleCenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Map Header Status Bar */}
      <div className="p-3.5 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#168447] animate-pulse" />
          <span className="font-bold text-gray-900">
            Last Reported GPS Coordinates:
          </span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-semibold">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            Accuracy: <strong className="text-gray-800">±{Math.round(accuracy)}m</strong>
          </span>
          {batteryLevel !== null && batteryLevel !== undefined && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              🔋 {Math.round(batteryLevel * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[320px] sm:h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={handleCenterMap}
            title="Recenter on Device"
            className="w-9 h-9 bg-white text-gray-800 rounded-xl shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Crosshair className="w-4 h-4 text-[#168447]" />
          </button>
        </div>

        {/* Disclaimer Bar inside Map */}
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-gray-200 text-[10px] sm:text-[11px] text-gray-600 flex items-center justify-between shadow-xs">
          <span>
            📍 <strong>Notice:</strong> This is the last reported location, recorded while the device had active protection running.
          </span>
          <span className="text-gray-400 font-mono hidden sm:inline">OSM Tiles</span>
        </div>
      </div>

      {/* Map Footer Action Buttons */}
      <div className="p-3.5 sm:p-4 bg-white flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Reported: <strong>{timestamp ? new Date(timestamp).toLocaleString('en-GB') : 'Recently'}</strong>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#168447] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Directions</span>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};
