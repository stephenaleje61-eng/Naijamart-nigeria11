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
}

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  selectedCategory,
  onSelectCategory,
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
