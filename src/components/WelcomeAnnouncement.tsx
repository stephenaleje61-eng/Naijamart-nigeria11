import React from 'react';
import { Megaphone } from 'lucide-react';

const ANNOUNCEMENTS = [
  'WELCOME TO FU MARKET!',
  'BUY. SELL. CONNECT.',
  'MAKE SURE YOU SEE YOUR GOODS BEFORE MAKING PAYMENT.',
  'CONNECT DIRECTLY WITH SELLERS.',
  'SHOP SMART AND TRADE SAFELY.',
  'FU MARKET — YOUR CAMPUS MARKETPLACE.',
];

export const WelcomeAnnouncementMarquee: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="FU MARKET Announcements"
      className="w-full rounded-2xl bg-[#111815] border border-[#008751]/50 shadow-sm overflow-hidden flex items-stretch"
    >
      {/* Static Left Label */}
      <div className="bg-[#008751] text-white px-3 sm:px-4 py-2.5 flex items-center gap-1.5 shrink-0 z-10 border-r border-emerald-400/20">
        <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap">
          Notice
        </span>
      </div>

      {/* Seamless Right-to-Left Scrolling Track */}
      <div className="fu-marquee-wrapper flex-1 overflow-hidden flex items-center py-2.5 select-none">
        <div className="fu-marquee-track items-center">
          {/* Primary track */}
          <div className="flex items-center shrink-0">
            {ANNOUNCEMENTS.map((item, idx) => (
              <span
                key={`a-${idx}`}
                className="inline-flex items-center text-xs sm:text-sm font-black tracking-wide whitespace-nowrap text-emerald-100"
              >
                <span className="px-4 sm:px-6">{item}</span>
                <span className="text-[#25D366] font-black" aria-hidden="true">
                  •
                </span>
              </span>
            ))}
          </div>

          {/* Duplicate track for seamless zero-gap infinite repeat */}
          <div className="fu-marquee-duplicate flex items-center shrink-0" aria-hidden="true">
            {ANNOUNCEMENTS.map((item, idx) => (
              <span
                key={`b-${idx}`}
                className="inline-flex items-center text-xs sm:text-sm font-black tracking-wide whitespace-nowrap text-emerald-100"
              >
                <span className="px-4 sm:px-6">{item}</span>
                <span className="text-[#25D366] font-black">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
