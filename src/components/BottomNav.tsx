import React from 'react';
import { ShoppingBag, PlusCircle, Package, Sparkles, Heart, MessageSquare } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';

interface BottomNavProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setPage }) => {
  const { totalUnreadCount } = useMessaging();

  const navItems = [
    { id: 'market', label: 'Market', icon: ShoppingBag },
    { id: 'wanted', label: 'Wanted', icon: Sparkles },
    { id: 'sell', label: 'Sell', icon: PlusCircle },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: totalUnreadCount },
    { id: 'saved', label: 'Saved ❤️', icon: Heart },
    { id: 'my-products', label: 'My Goods', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#151515]/95 backdrop-blur-md border-t border-[#2A2A2A] px-1.5 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
      <div className="max-w-lg mx-auto grid grid-cols-6 items-center">
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
              className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all cursor-pointer relative ${
                isActive ? 'text-[#10B981] font-black scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors relative ${isActive ? 'bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 bg-[#25D366] text-gray-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight truncate max-w-full ${isActive ? 'font-black text-[#10B981]' : 'font-medium'}`}>
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
