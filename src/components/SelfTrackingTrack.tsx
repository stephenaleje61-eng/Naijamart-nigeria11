import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  Copy, 
  Check, 
  RefreshCw, 
  Volume2, 
  LogOut, 
  AlertCircle, 
  Smartphone, 
  Lock, 
  ExternalLink, 
  Compass, 
  Info,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getOwnerRegisteredPhones, 
  generateRecoveryReport,
  getRegisteredPhoneById 
} from '../services/registeredPhoneService';
import { RegisteredPhone } from '../types';
import { SelfTrackingMap } from './SelfTrackingMap';

interface SelfTrackingTrackProps {
  onNavigate: (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => void;
}

export const SelfTrackingTrack: React.FC<SelfTrackingTrackProps> = ({ onNavigate }) => {
  const { user, openAuthModal, signOutUser } = useAuth();

  const [devices, setDevices] = useState<RegisteredPhone[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [ringNotice, setRingNotice] = useState<string | null>(null);

  // Load authorized devices for authenticated user
  const loadDevices = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await getOwnerRegisteredPhones(user.uid);
      setDevices(list);
      if (list.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(list[0].id);
      }
    } catch (err) {
      console.warn('Error loading user devices for tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [user]);

  // Refresh single selected device from Firestore
  const handleRefreshLocation = async () => {
    if (!selectedDeviceId || !user) return;
    setRefreshing(true);
    setRingNotice(null);

    try {
      const updated = await getRegisteredPhoneById(selectedDeviceId, user.uid);
      if (updated) {
        setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Copy Recovery Report
  const handleCopyReport = () => {
    const selected = devices.find((d) => d.id === selectedDeviceId);
    if (!selected) return;

    const reportText = generateRecoveryReport(selected);
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Ring My Phone (Audio siren in active browser)
  const handleRingPhone = () => {
    setRingNotice('Sound alert triggered! (Note: Web browsers can only sound alarms when this device has the protection page open and unmuted).');

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.6);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.9);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 1800);
    } catch {
      // Audio context policy
    }
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  // STEP 1: NOT SIGNED IN STATE
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-14 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#168447] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase text-[#168447] tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
              Step 1: Security Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
              Sign In to Track Your Lost Phone
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              To protect user privacy and prevent unauthorized surveillance, device GPS coordinates can only be viewed by the authenticated account owner.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#168447] hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Sign In with Account
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              Create Owner Account
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400">
            Never share your login credentials with anyone claiming to unlock your phone remotely.
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: USER LOGGED IN BUT HAS NO REGISTERED PHONES
  if (user && devices.length === 0 && !loading) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">
              No Devices Registered on This Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
              This device is not registered with NaijaMart Hub under your account. Register your phone before it gets stolen to enable location telemetry.
            </p>
          </div>

          {/* Official Alternative Fallbacks */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2">
            <span className="font-bold text-gray-900 block">
              Did you lose an unregistered phone? Try official tools:
            </span>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://www.google.com/android/find"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Google Find My Device</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.icloud.com/find"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Apple iCloud Find</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 bg-[#168447] text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Register Phone Now
            </button>
            <button
              onClick={signOutUser}
              className="px-4 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Device Recovery Dashboard
            </h1>
            <span className="bg-emerald-100 text-[#168447] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Authenticated Owner
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Signed in as <strong>{user?.email || user?.phoneNumber || 'Account Owner'}</strong>
          </p>
        </div>

        {/* Device Switcher Dropdown */}
        <div className="flex items-center gap-2">
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#168447]"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.deviceModel} ({d.imei.substring(0, 6)}...)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={signOutUser}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {ringNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 animate-fadeIn">
          <Volume2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <span>{ringNotice}</span>
        </div>
      )}

      {/* Selected Device Details & Actions */}
      {selectedDevice && (
        <>
          {/* Main Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleRefreshLocation}
              disabled={refreshing}
              className="p-3.5 bg-white hover:bg-emerald-50 rounded-2xl border border-gray-200 shadow-2xs text-left transition-colors flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div>
                <span className="text-xs font-black text-gray-900 block">Refresh Location</span>
                <span className="text-[10px] text-gray-500">Query latest Firestore sync</span>
              </div>
              <RefreshCw className={`w-4 h-4 text-[#168447] ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleCopyReport}
              className="p-3.5 bg-white hover:bg-blue-50 rounded-2xl border border-gray-200 shadow-2xs text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-black text-gray-900 block">
                  {copiedReport ? 'Report Copied!' : 'Copy Recovery Report'}
                </span>
                <span className="text-[10px] text-gray-500">For Nigerian Police / DPO</span>
              </div>
              {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={handleRingPhone}
              className="p-3.5 bg-white hover:bg-red-50 rounded-2xl border border-gray-200 shadow-2xs text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-black text-gray-900 block">Ring My Phone</span>
                <span className="text-[10px] text-gray-500">Browser Audio Siren</span>
              </div>
              <Volume2 className="w-4 h-4 text-red-600" />
            </button>

            <button
              onClick={() => onNavigate('protect')}
              className="p-3.5 bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 shadow-2xs text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-black text-gray-900 block">Open Protection Tab</span>
                <span className="text-[10px] text-gray-500">Stream from this device</span>
              </div>
              <Navigation className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* MAP DISPLAY OR NO LOCATION RECORDED */}
          {selectedDevice.lastLocation ? (
            <SelfTrackingMap
              lat={selectedDevice.lastLocation.lat}
              lng={selectedDevice.lastLocation.lng}
              accuracy={selectedDevice.lastLocation.accuracy}
              deviceModel={selectedDevice.deviceModel}
              timestamp={selectedDevice.lastLocationUpdatedAt || selectedDevice.lastLocation.timestamp}
              batteryLevel={selectedDevice.lastLocation.batteryLevel}
              onRefresh={handleRefreshLocation}
            />
          ) : (
            /* NO LOCATION REPORTED YET */
            <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  No Location Has Been Reported Yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                  The device may be offline, location access may be disabled, or protection may not be running on that phone.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-md mx-auto text-left text-xs space-y-1.5 text-gray-700">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-[#168447]">
                  <Info className="w-3.5 h-3.5" />
                  <span>How to begin location updates:</span>
                </span>
                <p>1. Open <strong>/protect</strong> on the device you want to track.</p>
                <p>2. Allow browser location permission.</p>
                <p>3. Tap <strong>Start Protection</strong>.</p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('protect')}
                  className="px-5 py-2.5 bg-[#168447] text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Start Protection on This Phone
                </button>
                <button
                  onClick={handleRefreshLocation}
                  disabled={refreshing}
                  className="px-4 py-2.5 bg-gray-100 text-gray-800 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {refreshing ? 'Checking...' : 'Check Again'}
                </button>
              </div>
            </div>
          )}

          {/* Device Profile & Police Extract Preview */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-black text-gray-900">
                  Device Registration & Legal Extract
                </h3>
              </div>
              <button
                onClick={handleCopyReport}
                className="text-xs font-bold text-[#168447] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Report Copied' : 'Copy Full Police Extract'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase">Device Model</span>
                <span className="font-bold text-gray-900">{selectedDevice.deviceModel}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase">15-Digit IMEI</span>
                <span className="font-mono font-bold text-gray-900">{selectedDevice.imei}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase">Owner Phone</span>
                <span className="font-bold text-gray-900">{selectedDevice.ownerPhone}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
