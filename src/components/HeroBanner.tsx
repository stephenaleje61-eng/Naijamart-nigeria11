import React from 'react';
import { Zap, Bike, Phone, MessageSquare, ShieldCheck, Flame, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onOpenPublish: (isOkada?: boolean) => void;
  onSelectOkada: () => void;
  onSearchChange: (query: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenPublish,
  onSelectOkada,
  onSearchChange,
}) => {
  return (
    <div className="mb-4 space-y-3">
      {/* Temu-style Orange Flash Deals Banner */}
      <div className="bg-gradient-to-r from-[#fb6514] via-[#f76707] to-[#e8590c] text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        {/* Glow & lightning decor */}
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center pr-4">
          <Bike className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-yellow-300 border border-white/20 mb-2">
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-bounce" />
              <span>OKADA DEALS TODAY • DIRECT SELLER CONTACT</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Buy & Sell Okada Motorcycles & Goods in Nigeria
            </h1>

            <p className="text-orange-100 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
              Bajaj Boxer, TVS HLX, Honda Ace, Haujue in Wukari, Taraba & Nationwide. Call or WhatsApp sellers directly. No signup needed!
            </p>

            {/* Quick popular Okada tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-[11px] font-bold text-yellow-200">Popular Okada:</span>
              {['Bajaj Boxer', 'TVS HLX', 'Honda Ace', 'Haujue Lucky', 'Daylong'].map((model) => (
                <button
                  key={model}
                  onClick={() => onSearchChange(model)}
                  className="bg-white/20 hover:bg-white/35 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-white/25 transition-colors"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={() => onOpenPublish(true)}
              className="bg-white hover:bg-orange-50 text-[#fb6514] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Bike className="w-4 h-4 text-[#fb6514]" />
              <span>Post Okada for Sale 🏍️</span>
            </button>
            <button
              onClick={onSelectOkada}
              className="bg-black/30 hover:bg-black/40 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-white/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Okada Market</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-4 text-[11px] text-orange-100 font-semibold">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-yellow-300" /> Direct Phone Calls
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300" /> Direct WhatsApp Chat
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Verify Bike Papers First
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> 7-Day Live Listings
          </span>
        </div>
      </div>
    </div>
  );
};
