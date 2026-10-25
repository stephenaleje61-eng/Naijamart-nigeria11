import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  ShieldCheck, 
  Battery, 
  Clock, 
  Crosshair, 
  AlertTriangle 
} from 'lucide-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface PhoneLocationMapProps {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  city?: string;
  timestamp?: any;
  batteryLevel?: number;
  model?: string;
  isRinging?: boolean;
}

export const PhoneLocationMap: React.FC<PhoneLocationMapProps> = ({
  lat,
  lng,
  accuracy = 12,
  address,
  city,
  timestamp,
  batteryLevel = 84,
  model = 'Protected Phone',
  isRinging = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [googleMapLoaded, setGoogleMapLoaded] = useState(false);
  const [mapMode, setMapMode] = useState<'google' | 'interactive'>('google');

  // Check for Google Maps key in env
  const apiKey = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_GOOGLE_MAPS_KEY) ||
    '';

  const formatTime = (ts: any) => {
    if (!ts) return 'Active now';
    try {
      const date = ts instanceof Date ? ts : new Date(ts);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  // Attempt Google Maps JS API loader if key provided
  useEffect(() => {
    let isCancelled = false;

    if (!apiKey || !mapContainerRef.current) {
      setMapMode('interactive');
      return;
    }

    try {
      setOptions({
        key: apiKey,
        v: 'weekly'
      });

      Promise.all([importLibrary('maps'), importLibrary('marker')])
        .then(([mapsLib, markerLib]: [any, any]) => {
          if (isCancelled || !mapContainerRef.current) return;
          const center = { lat, lng };
          const map = new mapsLib.Map(mapContainerRef.current, {
            center,
            zoom: 16,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false
          });

          // Add Marker
          new markerLib.Marker({
            position: center,
            map,
            title: model
          });

          // Add accuracy circle
          new mapsLib.Circle({
            strokeColor: '#008751',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#008751',
            fillOpacity: 0.15,
            map,
            center,
            radius: accuracy
          });

          setGoogleMapLoaded(true);
          setMapMode('google');
        })
        .catch((err: any) => {
          console.warn('Google Maps JS API load notice (using high-accuracy fallback canvas):', err);
          setMapMode('interactive');
        });
    } catch (e) {
      setMapMode('interactive');
    }

    return () => {
      isCancelled = true;
    };
  }, [apiKey, lat, lng, accuracy, model]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Top Bar with Live Device Indicators */}
      <div className="bg-gray-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute opacity-75"></span>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full relative"></span>
          </div>
          <div>
            <div className="text-xs font-black flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REAL-TIME GPS TELEMETRY</span>
            </div>
            <p className="text-xs font-bold text-gray-200 truncate max-w-[200px] sm:max-w-xs">
              {model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Battery */}
          <div className="flex items-center gap-1.5 bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-700">
            <Battery className={`w-3.5 h-3.5 ${batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="font-bold text-gray-200">{batteryLevel}%</span>
          </div>

          {/* Last Seen */}
          <div className="flex items-center gap-1.5 bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-700 text-gray-300">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <span>{formatTime(timestamp)}</span>
          </div>

          {/* External Google Maps Button */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-[#008751] hover:bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold transition-colors shadow-2xs"
          >
            <span>Open Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Ringing Siren Alert if active */}
      {isRinging && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-xs font-black flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>ALERT: Device is sounding a 110dB siren alarm!</span>
        </div>
      )}

      {/* Map Canvas / Viewer */}
      <div className="relative w-full h-72 sm:h-96 bg-gray-100 overflow-hidden">
        {/* Google Maps container */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full ${mapMode === 'google' && googleMapLoaded ? 'block' : 'hidden'}`}
        />

        {/* High-accuracy interactive vector map fallback */}
        {(!googleMapLoaded || mapMode === 'interactive') && (
          <iframe
            title="Real-Time GPS Map"
            src={osmEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        )}

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-black text-gray-800 shadow-sm flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-[#008751]" />
          <span>Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
        </div>

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm flex items-center gap-1">
          <span>Accuracy:</span>
          <span className="font-bold text-emerald-700">±{accuracy}m</span>
        </div>

        {/* Center Target Indicator if using interactive fallback */}
        {(!googleMapLoaded || mapMode === 'interactive') && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#008751]/20 border-2 border-[#008751] animate-ping" />
              <div className="absolute w-8 h-8 rounded-full bg-[#008751] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Location Banner */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gray-200 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#008751] flex items-center justify-center flex-shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-gray-900 truncate">
                {address || 'Coordinates Transmitted by Companion Service'}
              </div>
              <div className="text-[11px] text-gray-500 truncate">
                {city || 'Nigeria'} • High Accuracy (within {accuracy}m radius)
              </div>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-[#008751] hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-colors"
          >
            <span>Navigate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
