import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  ArrowRight, 
  HelpCircle, 
  Info,
  Phone,
  Mail,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerNewDevice } from '../services/registeredPhoneService';
import { validateImei, normalizeImei, formatNigerianPhoneForAuth } from '../utils/imei';
import { RegisteredPhone } from '../types';

interface SelfTrackingRegisterProps {
  onNavigate: (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => void;
}

export const SelfTrackingRegister: React.FC<SelfTrackingRegisterProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();

  // Form State
  const [imei, setImei] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [carrier, setCarrier] = useState('MTN Nigeria');
  const [consent, setConsent] = useState(false);

  // Validation & UI State
  const [luhnFeedback, setLuhnFeedback] = useState<{
    isValid?: boolean;
    error?: string;
    checkDigit?: number;
    expectedCheckDigit?: number;
  }>({});
  const [showImeiHelp, setShowImeiHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredPhone, setRegisteredPhone] = useState<RegisteredPhone | null>(null);

  // Auto-fill user email and phone if available
  useEffect(() => {
    if (user?.email && !ownerEmail) {
      setOwnerEmail(user.email);
    }
    if (user?.phoneNumber && !ownerPhone) {
      setOwnerPhone(user.phoneNumber);
    }
  }, [user]);

  // Real-time Luhn checksum validation as user types IMEI
  useEffect(() => {
    const clean = normalizeImei(imei);
    if (!clean) {
      setLuhnFeedback({});
      return;
    }
    if (clean.length < 14) {
      setLuhnFeedback({
        isValid: false,
        error: `Entered ${clean.length} of 15 digits...`
      });
      return;
    }
    const result = validateImei(clean);
    setLuhnFeedback(result);
  }, [imei]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Verify User Authentication
    if (!user) {
      setError('Please sign in or create an account to securely link this device.');
      openAuthModal('signup');
      return;
    }

    const cleanImei = normalizeImei(imei);

    // 2. Validate IMEI with Luhn Algorithm
    const luhnResult = validateImei(cleanImei);
    if (!luhnResult.isValid) {
      setError(luhnResult.error || 'The entered IMEI failed the 15-digit Luhn algorithm verification.');
      return;
    }

    // 3. Validate Phone Number
    const formattedPhone = formatNigerianPhoneForAuth(ownerPhone);
    if (!formattedPhone || formattedPhone.length < 13) {
      setError('Please provide a valid Nigerian phone number (e.g., 08012345678 or +2348012345678).');
      return;
    }

    // 4. Validate Email
    if (!ownerEmail || !ownerEmail.includes('@')) {
      setError('Please provide a valid contact email address.');
      return;
    }

    // 5. Validate Device Model
    if (!deviceModel.trim()) {
      setError('Please specify your device brand and model (e.g. Samsung Galaxy A14, iPhone 12, Tecno Camon 20).');
      return;
    }

    // 6. Check Consent
    if (!consent) {
      setError('You must consent to device location collection to enable recovery tracking.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerNewDevice({
        ownerUid: user.uid,
        imei: cleanImei,
        ownerPhone: formattedPhone,
        ownerEmail,
        deviceModel,
        carrier
      });

      if (!res.success || !res.device) {
        setError(res.error || 'Failed to register device. Please try again.');
      } else {
        setRegisteredPhone(res.device);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-6">
      {/* SUCCESS STATE */}
      {registeredPhone ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#168447] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div>
            <span className="bg-emerald-100 text-[#168447] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Registration Successful
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
              Device Registered Successfully
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
              <strong>{registeredPhone.deviceModel}</strong> (IMEI: {registeredPhone.imei}) is now linked to your account.
            </p>
          </div>

          {/* Important Explanation Note */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 text-left text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
              <Info className="w-4 h-4 text-[#168447]" />
              <span>Next Step: Start Location Protection</span>
            </div>
            <p className="text-emerald-900/90 leading-relaxed">
              <strong>Notice:</strong> Location reporting begins only after you grant browser location permission on this device and tap <strong>Start Protection</strong>. A registered device that has not run protection will show no reported location.
            </p>
          </div>

          {/* Device Summary Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500 font-sans">Device ID:</span>
              <span className="font-bold text-gray-900">{registeredPhone.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-sans">IMEI:</span>
              <span className="font-bold text-gray-900">{registeredPhone.imei}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-sans">Owner Contact:</span>
              <span className="font-bold text-gray-900">{registeredPhone.ownerPhone}</span>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('protect')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#168447] hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Start Location Protection on This Phone</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              <span>Go to Tracker Dashboard</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm">
          {/* Form Header */}
          <div className="border-b border-gray-100 pb-5 mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168447] bg-emerald-50 px-3 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Real Device Registration • Free</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Register Your Phone on NaijaMart Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Securely bind your phone's IMEI to your account so you can monitor coordinates and generate certified police reports.
            </p>
          </div>

          {/* Authentication Status Badge */}
          {!user ? (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>You must sign in to secure ownership of this device.</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="bg-[#168447] text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer flex-shrink-0"
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#168447]" />
                <span>Authenticated as <strong>{user.email || user.phoneNumber || 'Verified Account'}</strong></span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700">UID: {user.uid.substring(0, 8)}...</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Device IMEI Input with Luhn Verification */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Device 15-Digit IMEI <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowImeiHelp(!showImeiHelp)}
                  className="text-[11px] text-[#168447] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>How to find IMEI (*#06#)</span>
                </button>
              </div>

              {showImeiHelp && (
                <div className="mb-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1.5 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>How to find your phone's IMEI in Nigeria:</span>
                  </div>
                  <ol className="list-decimal ml-4 space-y-1 text-[11px] text-blue-900/90">
                    <li>Open your Phone dialer app and dial <strong>*#06#</strong>.</li>
                    <li>A 15-digit code will display immediately on your screen.</li>
                    <li>Or go to <strong>Settings &gt; About Phone &gt; Status &gt; IMEI</strong>.</li>
                  </ol>
                </div>
              )}

              <input
                type="text"
                required
                maxLength={17}
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="e.g. 358249102847598"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  luhnFeedback.isValid === true
                    ? 'border-emerald-500 focus:ring-emerald-500'
                    : luhnFeedback.isValid === false && imei.trim().length >= 14
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-[#168447]'
                }`}
              />

              {/* Real-time Luhn verification message */}
              {imei.trim().length > 0 && (
                <div className="mt-1.5 text-[11px]">
                  {luhnFeedback.isValid ? (
                    <span className="text-[#168447] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid 15-Digit IMEI (Passed Luhn Checksum Formula)</span>
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {luhnFeedback.error || 'Enter complete 15-digit IMEI.'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Device Brand & Model */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Device Brand & Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g. Samsung Galaxy A14 5G, Apple iPhone 12, Tecno Camon 20"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#168447] font-medium"
              />
            </div>

            {/* 3. Owner Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Owner Phone (+234) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="08023456789"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#168447] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Owner Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#168447] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 4. Network Operator / Carrier */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Primary Network Carrier (Nigeria)
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#168447] font-medium"
              >
                <option value="MTN Nigeria">MTN Nigeria</option>
                <option value="Airtel Nigeria">Airtel Nigeria</option>
                <option value="Globacom (Glo)">Globacom (Glo)</option>
                <option value="9mobile">9mobile</option>
                <option value="Other / Multi-SIM">Other / Multi-SIM</option>
              </select>
            </div>

            {/* 5. Mandatory Consent Checkbox */}
            <div className="pt-2">
              <label 
                onClick={() => setConsent(!consent)}
                className="flex items-start gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#168447] focus:ring-[#168447]"
                />
                <span className="text-xs text-gray-700 leading-relaxed select-none">
                  I consent to the collection and private storage of this device's location reports for recovery purposes. I understand that web registration does not grant direct mobile carrier cell tower access, and tracking occurs only with browser permission on the active device.
                </span>
              </label>
            </div>

            {/* Privacy Policy Link */}
            <div className="text-[11px] text-gray-400">
              Read our{' '}
              <button
                type="button"
                onClick={() => onNavigate('how-it-works')}
                className="text-[#168447] font-bold hover:underline"
              >
                Privacy & Recovery Guidelines
              </button>
              . We never sell your personal contact info or share coordinates with unauthorized third parties.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#168447] hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording Device Registration in Firestore...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Register & Protect Device</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
