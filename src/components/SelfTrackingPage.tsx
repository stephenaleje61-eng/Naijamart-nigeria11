import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  Lock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Info, 
  Search,
  Navigation,
  ArrowRight,
  RefreshCw,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SelfTrackingTrack } from './SelfTrackingTrack';
import { SelfTrackingRegister } from './SelfTrackingRegister';
import { SelfTrackingProtect } from './SelfTrackingProtect';

interface SelfTrackingPageProps {
  onNavigate: (route: string) => void;
}

export const SelfTrackingPage: React.FC<SelfTrackingPageProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'how-it-works' | 'console' | 'register' | 'protect'>('how-it-works');

  const steps = [
    {
      num: '1',
      title: 'Step 1: Register Your Device',
      subtitle: 'Dial *#06# to get your 15-digit IMEI',
      description: 'Dial *#06# on your device keypad to view your authentic IMEI number. Register it with your Nigerian phone number. Our system validates the IMEI using the international Luhn algorithm checksum to protect against typographical errors.',
      actionLabel: 'Register Device Now',
      actionTab: 'register' as const,
      color: 'bg-emerald-50 text-[#008751] border-emerald-200',
    },
    {
      num: '2',
      title: 'Step 2: Enable Location Protection',
      subtitle: 'Grant GPS permissions on your device',
      description: 'Open the protection console directly on your phone browser. Grant location permission and click Start Protection. While active, the browser securely reports GPS coordinates to your private cloud record, throttled to preserve battery.',
      actionLabel: 'Open Protection Console',
      actionTab: 'protect' as const,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      num: '3',
      title: 'Step 3: Track From Any Other Device',
      subtitle: 'Instant coordinates & live interactive map',
      description: 'If your phone is lost or misplaced, log in to NaijaMart Hub from any friend\'s phone, tablet, or laptop. Go to the Recovery Console to instantly view the last known GPS location, coordinates, accuracy radius, and time of update.',
      actionLabel: 'Launch Recovery Tracker',
      actionTab: 'console' as const,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      num: '4',
      title: 'Step 4: Prepare Official Police Report',
      subtitle: 'One-click timestamped legal documentation',
      description: 'Never confront thieves alone. Generate an authenticated, timestamped police report containing your IMEI, device model, owner phone, and precise GPS coordinates to present to law enforcement officers in Wukari or across Nigeria.',
      actionLabel: 'View Report Generator',
      actionTab: 'console' as const,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#008751] to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-emerald-100 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>NaijaMart Hub Self-Tracking System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Protect Your Phone Today. <br className="hidden sm:inline" />
            Find It Yourself Tomorrow.
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            A self-service, consent-based phone protection system. Register your IMEI, start browser-based location protection, and access your last reported coordinates from any device.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveSubTab('console')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                activeSubTab === 'console'
                  ? 'bg-white text-[#008751]'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              📍 Recovery Tracker Console
            </button>
            <button
              onClick={() => setActiveSubTab('how-it-works')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'how-it-works'
                  ? 'bg-white text-[#008751]'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              📖 Steps 1-4 Guide
            </button>
            <button
              onClick={() => setActiveSubTab('register')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'register'
                  ? 'bg-white text-[#008751]'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              ➕ Register Device
            </button>
            <button
              onClick={() => setActiveSubTab('protect')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'protect'
                  ? 'bg-white text-[#008751]'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              🛡️ Start GPS Sync
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-20 top-[-20px] w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Subtab 1: Steps 1-4 How to Protect Phone */}
      {activeSubTab === 'how-it-works' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              4 Steps to Protect & Recover Your Phone
            </h2>
            <button
              onClick={() => setActiveSubTab('console')}
              className="text-xs font-bold text-[#008751] hover:underline flex items-center gap-1"
            >
              <span>Go to Live Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#008751]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#008751] font-black text-base flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-semibold">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                <button
                  onClick={() => setActiveSubTab(step.actionTab)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-gray-100 hover:bg-[#008751] hover:text-white text-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Legal / Telecom Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-amber-900 leading-relaxed">
            <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-1">
                Zero Marketing False Promises & Honest Transparency:
              </p>
              <p className="text-amber-800">
                Registering an IMEI on this web platform does <strong>not</strong> grant telecommunication carrier-level cell tower access or live triangulation without browser GPS permission. Coordinates are updated when your device has granted location permission and protection is running. Always report stolen equipment to the Nigeria Police Force.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Live Recovery Tracker Console */}
      {activeSubTab === 'console' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Live Recovery Tracker Console
            </h2>
            <button
              onClick={() => setActiveSubTab('how-it-works')}
              className="text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              ← Back to 4-Step Guide
            </button>
          </div>
          <SelfTrackingTrack onNavigate={(target) => {
            if (target === 'register') setActiveSubTab('register');
            else if (target === 'protect') setActiveSubTab('protect');
            else if (target === 'how-it-works') setActiveSubTab('how-it-works');
            else onNavigate(target);
          }} />
        </div>
      )}

      {/* Subtab 3: Device Registration */}
      {activeSubTab === 'register' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Register New Device
            </h2>
            <button
              onClick={() => setActiveSubTab('how-it-works')}
              className="text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              ← Back to 4-Step Guide
            </button>
          </div>
          <SelfTrackingRegister onNavigate={(target) => {
            if (target === 'protect') setActiveSubTab('protect');
            else if (target === 'track') setActiveSubTab('console');
            else onNavigate(target);
          }} />
        </div>
      )}

      {/* Subtab 4: Device Location Protection */}
      {activeSubTab === 'protect' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Active Location Protection
            </h2>
            <button
              onClick={() => setActiveSubTab('how-it-works')}
              className="text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              ← Back to 4-Step Guide
            </button>
          </div>
          <SelfTrackingProtect onNavigate={(target) => {
            if (target === 'track') setActiveSubTab('console');
            else if (target === 'register') setActiveSubTab('register');
            else onNavigate(target);
          }} />
        </div>
      )}
    </div>
  );
};
