import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Smartphone, 
  ArrowRight, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Compass, 
  Radio, 
  ShieldAlert, 
  PhoneCall,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SelfTrackingHomeProps {
  onNavigate: (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => void;
}

export const SelfTrackingHome: React.FC<SelfTrackingHomeProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#168447] via-emerald-800 to-[#126b39] text-white rounded-3xl p-6 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Protect Your Phone Today. Find It Yourself Tomorrow.</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Protect Your Phone Now — Track It Yourself If Stolen
          </h1>

          {/* Subheading / Description */}
          <p className="text-sm sm:text-lg text-emerald-100 font-medium leading-relaxed mb-8">
            Register your device, enable location sharing, and learn how to locate it if it goes missing. Access your last reported location from another phone or computer.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Protect My Phone Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="px-6 py-4 bg-white/15 hover:bg-white/25 text-white font-black text-sm rounded-2xl backdrop-blur-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Track My Lost Phone</span>
            </button>

            <button
              onClick={() => onNavigate('how-it-works')}
              className="px-5 py-4 text-emerald-100 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>How It Works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Honest Privacy Notice Callout */}
      <section className="bg-amber-50 border-2 border-amber-200/80 rounded-3xl p-5 sm:p-6 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed">
          <h4 className="font-black text-amber-900 text-sm mb-1">
            Important Legal & Technical Privacy Notice
          </h4>
          <p className="text-amber-900/90">
            Device registration does <strong>not</strong> grant direct access to cellular mobile network carrier tower triangulation. Location reports are generated strictly through user consent when device location protection is active in your browser. We never sell your personal data or provide secret surveillance.
          </p>
        </div>
      </section>

      {/* 3 Core Feature Cards */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Three Simple Steps to Self-Service Recovery
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Built for Nigerian phone owners. Protect your iPhone, Samsung, Tecno, Infinix, or Xiaomi device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#168447] flex items-center justify-center font-black text-lg mb-5 shadow-2xs">
                1
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                Register & Protect Your Device
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Log your 15-digit IMEI (verified with the official Luhn checksum algorithm), device model, and Nigerian phone number into your private authenticated account.
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-6 text-xs font-black text-[#168447] flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Start Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg mb-5 shadow-2xs">
                2
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                View Last Reported Location
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                If your phone goes missing, log into your account from any other phone, tablet, or computer to view the last recorded GPS coordinates, accuracy radius, and map view.
              </p>
            </div>
            <button
              onClick={() => onNavigate('track')}
              className="mt-6 text-xs font-black text-blue-700 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Open Recovery Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg mb-5 shadow-2xs">
                3
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                Generate Official Police Report
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Generate and 1-click copy a certified device recovery extract with GPS coordinates, IMEI, and timestamp to submit to the Nigerian Police Force (NPF) or market security.
              </p>
            </div>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="mt-6 text-xs font-black text-amber-800 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Learn About Police Extracts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Official Recovery Links Section (Google & Apple) */}
      <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              Official Platform Find Tools
            </h3>
            <p className="text-xs text-gray-500">
              Never share your Google or Apple credentials on third-party sites. Use official portals:
            </p>
          </div>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Zero Password Phishing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://www.google.com/android/find"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-200 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="text-sm font-black text-gray-900 group-hover:text-[#168447]">
                  Google Find My Device
                </h4>
                <p className="text-xs text-gray-500">Official Android locate & ring portal</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#168447]" />
          </a>

          <a
            href="https://www.icloud.com/find"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-200 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍏</span>
              <div>
                <h4 className="text-sm font-black text-gray-900 group-hover:text-[#168447]">
                  Apple iCloud Find
                </h4>
                <p className="text-xs text-gray-500">Official iPhone & iPad Lost Mode</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#168447]" />
          </a>
        </div>
      </section>
    </div>
  );
};
