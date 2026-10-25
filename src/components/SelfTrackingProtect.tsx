import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Square, 
  Battery, 
  Clock, 
  Radio, 
  Download, 
  Smartphone,
  Lock,
  Info,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getOwnerRegisteredPhones, 
  updateDeviceLocation, 
  toggleDeviceProtection 
} from '../services/registeredPhoneService';
import { RegisteredPhone, DeviceLocation } from '../types';

interface SelfTrackingProtectProps {
  onNavigate: (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => void;
}

export const SelfTrackingProtect: React.FC<SelfTrackingProtectProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();

  const [devices, setDevices] = useState<RegisteredPhone[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Protection & Geolocation state
  const [isProtecting, setIsProtecting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('prompt');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState<number>(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savingToFirestore, setSavingToFirestore] = useState(false);

  // Watch position reference & throttle control
  const watchIdRef = useRef<number | null>(null);
  const lastSyncTimestampRef = useRef<number>(0);

  // 1. Fetch user's registered devices on load
  useEffect(() => {
    async function loadDevices() {
      if (!user) {
        setLoadingDevices(false);
        return;
      }
      setLoadingDevices(true);
      try {
        const list = await getOwnerRegisteredPhones(user.uid);
        setDevices(list);
        if (list.length > 0) {
          setSelectedDeviceId(list[0].id);
          setIsProtecting(list[0].protectionEnabled || false);
        }
      } catch (err) {
        console.warn('Error loading devices:', err);
      } finally {
        setLoadingDevices(false);
      }
    }

    loadDevices();
  }, [user]);

  // 2. Check browser permission query if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((permission) => {
          setPermissionStatus(permission.state);
          permission.onchange = () => {
            setPermissionStatus(permission.state);
          };
        })
        .catch(() => {
          setPermissionStatus('unknown');
        });
    }

    // 3. Optional legitimate battery level (never fabricated)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level);
        });
      }).catch(() => {
        setBatteryLevel(null);
      });
    }
  }, []);

  // Cleanup watch position on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const handleStartProtection = () => {
    setLocationError(null);

    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (!selectedDeviceId) {
      setLocationError('Please select a registered device first, or register this phone.');
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsProtecting(true);

    // Watch position options
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        setCurrentCoords({ lat, lng, accuracy });
        setPermissionStatus('granted');

        const now = Date.now();
        const twoMinutesMs = 2 * 60 * 1000;

        // Throttle Firestore updates to every 2 minutes or upon first lock
        if (now - lastSyncTimestampRef.current >= twoMinutesMs || lastSyncTimestampRef.current === 0) {
          lastSyncTimestampRef.current = now;
          setSavingToFirestore(true);

          try {
            await updateDeviceLocation(selectedDeviceId, {
              lat,
              lng,
              accuracy,
              timestamp: new Date().toISOString(),
              address: 'Live Active GPS Stream',
              batteryLevel: batteryLevel
            });

            setLastSavedTime(new Date());
            setUpdateCount((prev) => prev + 1);
          } catch (err) {
            console.warn('Update location fail:', err);
          } finally {
            setSavingToFirestore(false);
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (err.code === 1) {
          setPermissionStatus('denied');
          setLocationError('Location permission denied. Please allow location in your browser site settings.');
          setIsProtecting(false);
        } else if (err.code === 2) {
          setLocationError('GPS position unavailable. Please ensure Location is enabled in phone settings.');
        } else if (err.code === 3) {
          setLocationError('GPS connection timed out. Retrying satellite connection...');
        }
      },
      options
    );

    watchIdRef.current = watchId;

    // Toggle protectionEnabled flag in Firestore
    toggleDeviceProtection(selectedDeviceId, true);
  };

  const handleStopProtection = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsProtecting(false);
    if (selectedDeviceId) {
      toggleDeviceProtection(selectedDeviceId, false);
    }
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
              isProtecting ? 'bg-emerald-100 text-[#168447] animate-pulse' : 'bg-gray-100 text-gray-500'
            }`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  Location Protection Console
                </h1>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  isProtecting ? 'bg-emerald-100 text-[#168447]' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isProtecting ? 'Active Tracking' : 'Standby'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Keep this tab open while traveling or working to stream live coordinates to your private account.
              </p>
            </div>
          </div>

          {!user && (
            <button
              onClick={() => openAuthModal('signin')}
              className="bg-[#168447] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Sign In to Protect
            </button>
          )}
        </div>

        {/* Device Selection Bar */}
        {user && devices.length > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Device to Protect:
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#168447]"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.deviceModel} (IMEI: {d.imei})
                </option>
              ))}
            </select>
          </div>
        )}

        {user && devices.length === 0 && !loadingDevices && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <span>You have not registered any phones yet on this account.</span>
            <button
              onClick={() => onNavigate('register')}
              className="bg-[#168447] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 flex-shrink-0 cursor-pointer"
            >
              Register Phone First
            </button>
          </div>
        )}

        {/* Permission Status Feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <span className="text-gray-400 block text-[11px]">Browser Permission:</span>
            <span className={`font-black text-sm capitalize ${
              permissionStatus === 'granted' ? 'text-[#168447]' : permissionStatus === 'denied' ? 'text-red-600' : 'text-amber-700'
            }`}>
              {permissionStatus}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <span className="text-gray-400 block text-[11px]">Battery Level (Hardware):</span>
            <span className="font-bold text-sm text-gray-800">
              {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}% (Verified)` : 'Unavailable'}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <span className="text-gray-400 block text-[11px]">Firestore Cloud Sync:</span>
            <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              {savingToFirestore && <div className="w-3 h-3 border-2 border-[#168447] border-t-transparent rounded-full animate-spin" />}
              <span>{updateCount > 0 ? `${updateCount} updates synced` : 'Idle'}</span>
            </span>
          </div>
        </div>

        {locationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Live GPS Telemetry Box */}
        {currentCoords && (
          <div className="mb-6 p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#168447]" />
                <span>Active GPS Coordinates Acquired</span>
              </span>
              <span className="text-[11px] text-emerald-700">
                Last synced: {lastSavedTime ? lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono pt-1">
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-gray-500 font-sans block">Latitude:</span>
                <span className="font-bold text-gray-900">{currentCoords.lat.toFixed(6)}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-gray-500 font-sans block">Longitude:</span>
                <span className="font-bold text-gray-900">{currentCoords.lng.toFixed(6)}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-500 font-sans block">Accuracy:</span>
                <span className="font-bold text-[#168447]">±{Math.round(currentCoords.accuracy)} meters</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls: Start / Stop */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isProtecting ? (
            <button
              onClick={handleStartProtection}
              className="w-full sm:w-auto flex-1 py-4 bg-[#168447] hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Location Protection</span>
            </button>
          ) : (
            <button
              onClick={handleStopProtection}
              className="w-full sm:w-auto flex-1 py-4 bg-gray-800 hover:bg-gray-900 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Square className="w-4 h-4 fill-current text-red-400" />
              <span>Stop Location Protection</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('track')}
            className="w-full sm:w-auto px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
          >
            <span>View Tracker Dashboard</span>
          </button>
        </div>
      </div>

      {/* Honest Technical Limitations Explanation Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 font-black text-gray-900 text-sm">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Understanding Web Geolocation vs Native App Tracking</span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Due to operating system privacy policies on Android and iOS, web browsers can only report GPS coordinates while the tab is active or within supported service worker wake limits. When a phone is powered off, location services are disabled, or the browser is force-closed, no new GPS pings can be transmitted.
        </p>

        {/* Optional Native APK Companion for 24/7 Background Tracking */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-xs">
                Need Unrestricted 24/7 Background Location on Android?
              </span>
              <span className="bg-[#168447] text-white text-[9px] font-black px-2 py-0.2 rounded-full uppercase">
                Optional
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Download our Flutter companion app with background location service and autostart on restart.
            </p>
          </div>

          <a
            href="/apk/naijamart-protector.apk"
            download="naijamart-protector.apk"
            className="bg-[#168447] hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </a>
        </div>
      </div>
    </div>
  );
};
