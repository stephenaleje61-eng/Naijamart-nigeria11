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
    { id: 'my-products', label: 'My Goods', icon: Package },
    { id: 'hubs', label: 'Africa Chat', icon: MessageSquare },
    { id: 'track', label: 'Track Phone', icon: MapPin },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#151515]/95 backdrop-blur-md border-t border-[#2A2A2A] px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'hubs' && currentPage === 'houses');
          return (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer ${
                isActive ? 'text-[#10B981] font-black scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight truncate ${isActive ? 'font-black text-[#10B981]' : 'font-medium'}`}>
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
