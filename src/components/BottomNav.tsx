import React from 'react';
import { Home, Bike, PlusCircle, Package, Users } from 'lucide-react';

interface BottomNavProps {
  onHomeClick: () => void;
  onWukariRidersClick: () => void;
  onOkadaClick: () => void;
  onPostAdClick: () => void;
  onMyAdsClick: () => void;
  myAdsCount?: number;
  activeTab?: 'home' | 'riders' | 'okada' | 'my-ads';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onHomeClick,
  onWukariRidersClick,
  onOkadaClick,
  onPostAdClick,
  onMyAdsClick,
  myAdsCount = 0,
  activeTab = 'home',
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={onHomeClick}
          className={`flex flex-col items-center py-1 px-1.5 transition-colors ${
            activeTab === 'home' ? 'text-[#008751] font-bold' : 'text-gray-500'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Home</span>
        </button>

        {/* Wukari Riders */}
        <button
          onClick={onWukariRidersClick}
          className={`flex flex-col items-center py-1 px-1.5 transition-colors ${
            activeTab === 'riders' ? 'text-[#fb6514] font-black' : 'text-gray-600'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4 text-[#fb6514]" />
            <span className="absolute -top-1 -right-2 bg-yellow-400 text-black text-[7px] font-black px-1 rounded-full">
              WKR
            </span>
          </div>
          <span className="text-[9px] mt-0.5 font-bold text-[#fb6514]">Riders</span>
        </button>

        {/* Post Ad (Center Prominent) */}
        <button
          onClick={onPostAdClick}
          className="flex flex-col items-center -mt-4 group px-1"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#008751] to-[#049b5d] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-all border-2 border-white">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-extrabold text-[#008751] mt-0.5">Post Ad</span>
        </button>

        {/* Okada Market */}
        <button
          onClick={onOkadaClick}
          className={`flex flex-col items-center py-1 px-1.5 transition-colors ${
            activeTab === 'okada' ? 'text-[#fb6514] font-black' : 'text-gray-500'
          }`}
        >
          <Bike className="w-4 h-4 text-orange-500" />
          <span className="text-[9px] mt-0.5">Okadas</span>
        </button>

        {/* My Ads */}
        <button
          onClick={onMyAdsClick}
          className={`flex flex-col items-center py-1 px-1.5 transition-colors relative ${
            activeTab === 'my-ads' ? 'text-[#008751] font-bold' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Package className="w-4 h-4" />
            {myAdsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#fb6514] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {myAdsCount}
              </span>
            )}
          </div>
          <span className="text-[9px] mt-0.5">My Ads</span>
        </button>
      </div>
    </nav>
  );
};
