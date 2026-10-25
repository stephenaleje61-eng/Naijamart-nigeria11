import React from 'react';
import { ShoppingBag, PlusCircle, Package, MapPin, MessageSquare } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setPage }) => {
  const navItems = [
    { id: 'market', label: 'Market', icon: ShoppingBag },
    { id: 'sell', label: 'Sell', icon: PlusCircle },
    { id: 'my-products', label: 'My Products', icon: Package },
    { id: 'track', label: 'Track Phone', icon: MapPin },
    { id: 'hubs', label: 'Hubs', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer ${
                isActive ? 'text-[#008751] font-black scale-105' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-[#008751]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight truncate ${isActive ? 'font-black text-[#008751]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
