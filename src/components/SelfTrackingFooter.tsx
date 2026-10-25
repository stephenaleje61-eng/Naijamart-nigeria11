import React from 'react';
import { ShieldCheck, PhoneCall, Mail, ExternalLink, Heart } from 'lucide-react';

interface SelfTrackingFooterProps {
  onNavigate: (page: string) => void;
}

export const SelfTrackingFooter: React.FC<SelfTrackingFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 py-10 sm:py-14 text-xs text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#168447] text-white flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-black text-gray-900 text-base">
                NaijaMart Hub Self-Tracking
              </span>
            </div>
            <p className="text-gray-500 max-w-md text-xs leading-relaxed">
              Protect Your Phone Today. Find It Yourself Tomorrow. Built for Nigerian phone owners to register device ownership, verify IMEI authenticity via Luhn algorithms, monitor consent-based location telemetry, and generate certified police recovery extracts.
            </p>
            <div className="pt-1">
              <span className="font-bold text-gray-900">
                NaijaMart Hub Self-Tracking — Protect your device. Respect privacy.
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('market')}
                  className="hover:text-[#008751] transition-colors cursor-pointer font-bold text-gray-800"
                >
                  Marketplace (/market)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sell')}
                  className="hover:text-[#008751] transition-colors cursor-pointer font-bold text-gray-800"
                >
                  Sell an Item (/sell)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-products')}
                  className="hover:text-[#008751] transition-colors cursor-pointer font-bold text-gray-800"
                >
                  My Posted Goods (/my-products)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-[#008751] transition-colors cursor-pointer"
                >
                  Phone Self-Tracking (/track)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('hubs')}
                  className="hover:text-[#008751] transition-colors cursor-pointer"
                >
                  Campus Hubs & Chat (/hubs)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Verified Support */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">
              Support & Verification
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#168447] flex-shrink-0" />
                <a 
                  href="tel:+2348167258121" 
                  className="font-bold text-gray-900 hover:text-[#168447] transition-colors"
                >
                  +2348167258121
                </a>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                NaijaMart Hub Verification Desk. Support lines available Monday – Saturday, 8am – 7pm WAT.
              </p>
              <div className="pt-2">
                <a
                  href="/apk/naijamart-protector.apk"
                  download="naijamart-protector.apk"
                  className="inline-flex items-center gap-1.5 text-[#168447] font-bold text-[11px] hover:underline"
                >
                  <span>Download Android Companion APK</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} NaijaMart Hub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Nigeria with security, real consent, and privacy integrity.
          </p>
        </div>
      </div>
    </footer>
  );
};
