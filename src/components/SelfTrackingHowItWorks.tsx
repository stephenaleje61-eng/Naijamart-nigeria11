import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Smartphone, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface SelfTrackingHowItWorksProps {
  onNavigate: (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => void;
}

export const SelfTrackingHowItWorks: React.FC<SelfTrackingHowItWorksProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168447] bg-emerald-50 px-3 py-1 rounded-full mb-3">
          <Info className="w-3.5 h-3.5" />
          <span>Transparent Guide • Zero Marketing Hype</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          How NaijaMart Hub Self-Tracking Works
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Learn how to protect your device before theft, view coordinates when lost, and generate authentic documentation for legal recovery.
        </p>
      </div>

      {/* 4 Step Workflow */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#168447] flex items-center justify-center font-black flex-shrink-0 text-base">
            1
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <h3 className="text-base font-black text-gray-900">
              Step 1: Register Your Device Before It Goes Missing
            </h3>
            <p className="leading-relaxed">
              Dial <strong>*#06#</strong> on your phone to obtain your 15-digit International Mobile Equipment Identity (IMEI). Enter it along with your Nigerian phone number and model on <strong className="text-[#168447]">/register</strong>.
            </p>
            <p className="text-gray-500 text-[11px]">
              Our system runs the official <strong>Luhn algorithm checksum</strong> to ensure the IMEI is authentic and not mistyped.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black flex-shrink-0 text-base">
            2
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <h3 className="text-base font-black text-gray-900">
              Step 2: Start Location Protection on Your Device
            </h3>
            <p className="leading-relaxed">
              Open <strong className="text-blue-700">/protect</strong> on your mobile phone and grant browser location access. Tap <strong>Start Protection</strong>. While this page is active, your browser periodically syncs GPS coordinates (throttled to every 2 minutes) to your secure Firestore cloud record.
            </p>
            <p className="text-gray-500 text-[11px]">
              We also offer an optional Android companion APK for users who desire background autostart upon phone reboot.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black flex-shrink-0 text-base">
            3
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <h3 className="text-base font-black text-gray-900">
              Step 3: Access Recovery from Another Device
            </h3>
            <p className="leading-relaxed">
              If your phone is lost or stolen, borrow a friend's phone or use a computer. Go to <strong className="text-amber-800">/track</strong> and log into your authenticated account.
            </p>
            <p className="leading-relaxed">
              You will immediately see the last reported GPS coordinates, estimated accuracy radius in meters, timestamp, and a map view.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black flex-shrink-0 text-base">
            4
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <h3 className="text-base font-black text-gray-900">
              Step 4: Prepare an Official Police Recovery Report
            </h3>
            <p className="leading-relaxed">
              Tap <strong>Copy Recovery Report</strong> on the tracker page. This generates a standardized legal extract containing your IMEI, device model, owner contact info, and exact GPS coordinates with a Google Maps link.
            </p>
            <p className="leading-relaxed">
              Submit this document to your nearest <strong>Divisional Police Officer (DPO)</strong>, Area Command, or market security task force (e.g. Computer Village Ikeja or Wukari Main Market) to initiate lawful recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Technical Reality Section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 font-black text-gray-900 text-base">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Honest Technical Limitations & Privacy Boundaries</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
            <span className="font-black text-[#168447] block text-sm">
              ✅ What This System Does
            </span>
            <ul className="list-disc ml-4 space-y-1 text-emerald-950 text-[11px] leading-relaxed">
              <li>Stores certified proof of device ownership and 15-digit IMEI.</li>
              <li>Records legitimate browser GPS coordinates with explicit consent.</li>
              <li>Allows cross-device access to your last reported location.</li>
              <li>Prepares structured legal extracts for law enforcement.</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1.5">
            <span className="font-black text-red-700 block text-sm">
              ❌ What No Web App Can Do
            </span>
            <ul className="list-disc ml-4 space-y-1 text-red-950 text-[11px] leading-relaxed">
              <li>Cannot track a phone that is powered off or has no battery.</li>
              <li>Cannot secretly access GSM telecom carrier cell towers without a court warrant.</li>
              <li>Cannot remotely turn on device GPS if turned off by a thief.</li>
              <li>Cannot wipe or ring an offline phone without browser connectivity.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Anti-Phishing Warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 text-xs text-blue-950 space-y-2">
        <span className="font-black text-blue-900 text-sm block">
          Anti-Scam Reminder
        </span>
        <p className="leading-relaxed">
          NaijaMart Hub <strong>never</strong> asks for your Google Account password, Apple ID password, or bank ATM PIN. If someone contacts you claiming they can trace your lost phone if you give them your Gmail password, block them immediately.
        </p>
      </div>

      {/* Quick Action Button */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => onNavigate('register')}
          className="px-6 py-3.5 bg-[#168447] hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Protect My Phone Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
