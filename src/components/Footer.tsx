import React from 'react';
import { ShieldCheck, Bike, Phone, MessageSquare } from 'lucide-react';
import { CATEGORIES } from '../data/constants';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onSelectLocation: (loc: string) => void;
  onOpenPublish: (isOkada?: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectLocation,
  onOpenPublish,
}) => {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-10 pb-20 sm:pb-10 border-t border-gray-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Okada focus */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img 
                src="/icon.png" 
                alt="NaijaMarket Hub" 
                className="w-8 h-8 rounded-lg object-contain bg-[#008751]" 
              />
              <span className="text-xl font-black text-white tracking-tight">
                NaijaMarket <span className="text-[#008751]">Hub</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              Nigeria's #1 Marketplace combining Jumia reliability, Temu flash deals, and the biggest Okada Motorcycle Market across Wukari, Taraba, and Nigeria.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
              <Bike className="w-4 h-4 text-[#fb6514]" />
              <span>Okada Deals • 100% Free Ads</span>
            </div>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Popular Categories</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.name);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`hover:text-white transition-colors ${
                      cat.isOkada ? 'text-orange-400 font-bold' : ''
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Direct Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Direct Contact & Safety</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Call sellers directly using the button on each listing.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Chat instantly on WhatsApp with 1 click.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#008751] flex-shrink-0 mt-0.5" />
                <span>Always inspect Okada or goods before paying any cash.</span>
              </li>
            </ul>
          </div>

          {/* Popular Hubs */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Popular Hubs</h4>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['Wukari', 'Jalingo', 'Takum', 'Lagos', 'Abuja', 'Kano', 'Port Harcourt'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onSelectLocation(city);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-zinc-800 hover:bg-[#008751] hover:text-white text-gray-300 text-[11px] px-2.5 py-1 rounded-md transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenPublish(true)}
              className="w-full bg-[#fb6514] hover:bg-[#e8590c] text-white py-2.5 rounded-xl font-black text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Bike className="w-4 h-4" />
              <span>Post Okada for Sale 🏍️</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} NaijaMarket Hub • 100% Free Ads</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-semibold">
            <a href="/squatter" className="hover:text-emerald-400 transition-colors">🏠 FUW Squatter Board</a>
            <span>•</span>
            <a href="/find-my-phone" className="hover:text-emerald-400 transition-colors">🛡️ Find My Phone</a>
            <span>•</span>
            <a href="/protect" className="hover:text-emerald-400 transition-colors">📱 Protect Phone</a>
            <span>•</span>
            <a href="/wanted" className="hover:text-emerald-400 transition-colors">🎯 Wanted Board</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
