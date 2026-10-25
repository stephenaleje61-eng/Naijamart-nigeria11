import React from 'react';
import { ShoppingBag, PlusCircle, Package, MapPin, MessageSquare } from 'lucide-react';

interface SelfTrackingBottomNavProps {
  currentPage?: string;
  onNavigate: (route: string) => void;
}

export const SelfTrackingBottomNav: React.FC<SelfTrackingBottomNavProps> = ({
  currentPage = 'market',
  onNavigate,
}) => {
  const navItems = [
    { route: 'market', label: 'Market', icon: ShoppingBag },
    { route: 'sell', label: 'Sell', icon: PlusCircle },
    { route: 'my-products', label: 'My Products', icon: Package },
    { route: 'track', label: 'Track Phone', icon: MapPin },
    { route: 'hubs', label: 'Hubs', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer ${
                isActive ? 'text-[#008751] font-black scale-105' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-[#008751]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight truncate max-w-full ${isActive ? 'font-black text-[#008751]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
