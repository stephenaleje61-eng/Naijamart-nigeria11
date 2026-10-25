import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Crosshair, 
  ExternalLink, 
  Shield, 
  Smartphone,
  Lock,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  createInitialTrackLog, 
  updateTrackLogWithGpsConsent, 
  lookupProtectedPhone 
} from '../services/phoneProtectService';
import { ProtectedPhone } from '../types';

interface TrackImeiViewProps {
  imei: string;
  onNavigateHome: () => void;
}

export const TrackImeiView: React.FC<TrackImeiViewProps> = ({
  imei,
  onNavigateHome
}) => {
  const [phone, setPhone] = useState<ProtectedPhone | null>(null);
  const [loading, setLoading] = useState(true);
  const [logDocId, setLogDocId] = useState<string | null>(null);

  // Network IP data captured on load
  const [ipData, setIpData] = useState<{
    ip: string;
    city: string;
    region: string;
    org: string;
  }>({
    ip: '',
    city: 'Nigeria',
    region: '',
    org: ''
  });

  // User consent state
  const [consentChecked, setConsentChecked] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [sharedCoords, setSharedCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 1. On page load: Capture real IP & network metadata from https://ipapi.co/json/
  // and immediately save to Firestore collection "track_logs" with consentGiven: false
  useEffect(() => {
    let isMounted = true;

    async function captureAndLogAccess() {
      try {
        let detectedIp = '';
        let detectedCity = 'Nigeria';
        let detectedRegion = '';
        let detectedOrg = '';

        try {
          // Fetch real client IP and network area from ipapi.co
          const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            detectedIp = data.ip || '';
            detectedCity = data.city || 'Nigeria';
            detectedRegion = data.region || '';
            detectedOrg = data.org || '';
          }
        } catch (fetchErr) {
          console.warn('IP lookup fallback:', fetchErr);
        }

        if (isMounted) {
          setIpData({
            ip: detectedIp,
            city: detectedCity,
            region: detectedRegion,
            org: detectedOrg
          });
        }

        // Save initial track log to Firestore collection "track_logs"
        const docId = await createInitialTrackLog({
          imei,
          ip: detectedIp || 'Direct Device Access',
          city: detectedCity,
          region: detectedRegion,
          org: detectedOrg,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
        });

        if (isMounted) {
          setLogDocId(docId);
        }

        // Query device information from protected_phones collection
        const found = await lookupProtectedPhone(imei);
        if (isMounted) {
          setPhone(found);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Track access initialization warning:', err);
        if (isMounted) setLoading(false);
      }
    }

    captureAndLogAccess();

    return () => {
      isMounted = false;
    };
  }, [imei]);

  // 2. On Button Click: Request exact GPS location after consent checkbox is checked
  const handleShareLocation = () => {
    if (!consentChecked) return;
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setSharingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        setSharedCoords({ lat, lng, accuracy });

        try {
          // Update the same track log in Firestore: consentGiven = true, lat, lng, accuracy, gpsTimestamp
          // and notify owner via SMS (Termii)
          await updateTrackLogWithGpsConsent({
            logId: logDocId || undefined,
            imei,
            lat,
            lng,
            accuracy,
            consentGiven: true,
            city: ipData.city,
            region: ipData.region
          });

          setLocationShared(true);
        } catch (err) {
          console.warn('Consent GPS update error:', err);
        } finally {
          setSharingLocation(false);
        }
      },
      async (err) => {
        setSharingLocation(false);

        // Record consentGiven: false if denied
        try {
          await updateTrackLogWithGpsConsent({
            logId: logDocId || undefined,
            imei,
            lat: 0,
            lng: 0,
            accuracy: 0,
            consentGiven: false,
            city: ipData.city,
            region: ipData.region
          });
        } catch {
          // Ignore
        }

        if (err.code === 1) {
          setLocationError('GPS permission was denied in your browser. If you wish to assist, please click the lock/settings icon in your browser address bar, set Location to "Allow", and try again.');
        } else {
          setLocationError('Unable to retrieve high-accuracy GPS coordinates. Please ensure device Location/GPS is turned ON and retry.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-3">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm text-center">
        {/* Brand Icon Header */}
        <div className="w-16 h-16 bg-emerald-100 text-[#008000] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <ShieldCheck className="w-9 h-9" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#008000] border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>NaijaMart Verified Device Network</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-2">
          NaijaMart Phone Recovery - Location Sharing
        </h1>

        {/* Explanation Text */}
        <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
          This mobile device has been reported as lost or missing by its verified owner on the <strong>NaijaMart National Device Registry</strong>. If you have found or are currently holding this phone, please share its location so the owner and NaijaMart recovery support can coordinate its safe return.
        </p>

        {/* Device Information Card */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left mb-5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Device IMEI:</span>
            <span className="font-mono font-black text-gray-900">{imei}</span>
          </div>
          {phone?.model && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Model:</span>
              <span className="font-bold text-gray-900">{phone.model}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Status:</span>
            <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] uppercase">
              Registered Missing / Lost
            </span>
          </div>
          {ipData.city && (
            <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
              <span className="text-gray-500 font-medium">Approximate Area (IP):</span>
              <span className="font-bold text-gray-800">{ipData.city}{ipData.region ? `, ${ipData.region}` : ''}</span>
            </div>
          )}
        </div>

        {/* Transparent Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left mb-6 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-1.5 font-black text-blue-950">
            <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>Privacy Notice & Consent</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-900/90">
            Upon opening this link, your approximate network connection area was automatically recorded for security verification. 
            <strong> Your high-accuracy GPS coordinates are NEVER accessed or saved without your explicit permission.</strong>
          </p>
          <p className="text-[11px] leading-relaxed text-blue-900/90">
            By checking the box and clicking below, you grant one-time permission for your browser to share GPS coordinates exclusively to help return this device to its registered owner.
          </p>
        </div>

        {locationError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{locationError}</span>
          </div>
        )}

        {locationShared ? (
          /* THANK YOU STATE */
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-300 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#008000] text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-gray-900">
                  Thank You for Helping!
                </h3>
                <p className="text-xs text-gray-600">
                  Your location has been securely transmitted to the verified device owner.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 text-xs text-gray-700 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <MapPin className="w-4 h-4 text-[#008000]" />
                <span>Transmitted Coordinates:</span>
              </div>
              <p className="font-mono text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg font-bold">
                {sharedCoords?.lat.toFixed(6)}, {sharedCoords?.lng.toFixed(6)} (Accuracy: ~{Math.round(sharedCoords?.accuracy || 10)}m)
              </p>
              <p className="text-[11px] text-gray-500">
                A notification SMS has been dispatched with recovery instructions to coordinate handover.
              </p>
            </div>

            {phone?.ownerPhone && (
              <div className="pt-2">
                <a
                  href={`tel:${phone.ownerPhone}`}
                  className="w-full py-3.5 bg-[#008000] hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Verified Owner Directly ({phone.ownerPhone})</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          /* CONSENT FORM & ACTION BUTTON */
          <div className="space-y-4 text-left">
            {/* Required Consent Checkbox */}
            <label 
              onClick={() => setConsentChecked(!consentChecked)}
              className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#008000] focus:ring-[#008000]"
              />
              <span className="text-xs text-gray-800 font-semibold leading-relaxed select-none">
                I agree to share my current GPS location to assist in returning this registered lost phone to its rightful owner.
              </span>
            </label>

            {/* Action Button */}
            <button
              onClick={handleShareLocation}
              disabled={!consentChecked || sharingLocation}
              className={`w-full py-4 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                consentChecked && !sharingLocation
                  ? 'bg-[#008000] hover:bg-emerald-700 cursor-pointer active:scale-98'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              {sharingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Requesting GPS & Transmitting Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Share My Location to Help Return Phone</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Your browser will ask for location permission once you click this button.
            </p>
          </div>
        )}

        {/* Back to Marketplace */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onNavigateHome}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Go to NaijaMart Marketplace Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
