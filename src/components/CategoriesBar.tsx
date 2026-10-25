import React from 'react';
import { 
  Bike, 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Car, 
  Sparkles, 
  Briefcase, 
  Layers
} from 'lucide-react';
import { CATEGORIES } from '../data/constants';

interface CategoriesBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectSquatterBoard?: () => void;
  onSelectFindMyPhone?: () => void;
  onSelectProtectPhone?: () => void;
  onSelectChatSpace?: () => void;
  isChatSpaceActive?: boolean;
}

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectSquatterBoard,
  onSelectFindMyPhone,
  onSelectProtectPhone,
  onSelectChatSpace,
  isChatSpaceActive = false,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Bike':
        return <Bike className="w-4 h-4" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-2.5 px-3 sm:px-4 shadow-2xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {/* First Category: Big Green Button linking to /squatter */}
          <a
            href="/squatter"
            onClick={(e) => {
              if (onSelectSquatterBoard) {
                e.preventDefault();
                onSelectSquatterBoard();
              }
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex-shrink-0 shadow-sm border border-emerald-500 bg-gradient-to-r from-[#008751] via-[#049b5d] to-[#008751] text-white hover:brightness-110 active:scale-95 ring-2 ring-emerald-300"
          >
            <span className="text-sm sm:text-base">🏠</span>
            <span>FUW Squatter Board - Find Bedspace FREE</span>
            <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-md font-black tracking-wider uppercase shadow-2xs">
              HOT
            </span>
          </a>

          {/* Find My Phone - Phone Recovery Link */}
          <a
            href="/find-my-phone"
            onClick={(e) => {
              if (onSelectFindMyPhone) {
                e.preventDefault();
                onSelectFindMyPhone();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex-shrink-0 shadow-sm border border-emerald-700 bg-gray-900 text-white hover:bg-black active:scale-95"
          >
            <span className="text-sm">🛡️</span>
            <span>Find My Phone & IMEI Checker</span>
            <span className="text-[10px] bg-[#008751] text-white px-1.5 py-0.2 rounded-md font-black uppercase">
              Free
            </span>
          </a>

          {/* Protect Phone Link */}
          <a
            href="/protect"
            onClick={(e) => {
              if (onSelectProtectPhone) {
                e.preventDefault();
                onSelectProtectPhone();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 bg-emerald-50 text-[#008751] border border-emerald-200 hover:bg-emerald-100"
          >
            <span className="text-sm">📱</span>
            <span>Protect Phone (Pre-Theft)</span>
          </a>

          {/* Real Chat & Friends Space Link */}
          <a
            href="/chat"
            onClick={(e) => {
              if (onSelectChatSpace) {
                e.preventDefault();
                onSelectChatSpace();
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex-shrink-0 border cursor-pointer ${
              isChatSpaceActive
                ? 'bg-[#008751] text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-[#008751] border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="text-sm">💬</span>
            <span>Real Chat & Friends</span>
            <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-md font-black">
              LIVE
            </span>
          </a>

          {/* All Categories Option */}
          <button
            onClick={() => onSelectCategory('')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === ''
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Ads</span>
          </button>

          {/* Individual Categories - Okada first with orange Temu background! */}
          {CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.id.toLowerCase();

            if (cat.isOkada) {
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex-shrink-0 shadow-xs border ${
                    isSelected
                      ? 'bg-[#fb6514] text-white border-[#e8590c] ring-2 ring-orange-300'
                      : 'bg-gradient-to-r from-orange-500 to-[#fb6514] text-white border-orange-600 hover:brightness-110 animate-pulse'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>{cat.name}</span>
                  <span className="text-[10px] bg-white text-[#fb6514] px-1.5 py-0.2 rounded-full font-black">
                    HOT
                  </span>
                </button>
              );
            }

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                  isSelected
                    ? 'bg-[#008751] text-white border-[#007043] shadow-xs'
                    : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-[#008751]'}>
                  {getIcon(cat.iconName)}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
