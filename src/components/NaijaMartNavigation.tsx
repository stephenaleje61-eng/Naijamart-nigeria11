import React from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  Package, 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User, 
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AppNavRoute = 'market' | 'sell' | 'my-products' | 'track' | 'hubs';

interface NaijaMartNavigationProps {
  currentRoute: AppNavRoute;
  onNavigate: (route: AppNavRoute) => void;
  onOpenAuth: () => void;
}

export const NaijaMartNavigation: React.FC<NaijaMartNavigationProps> = ({
  currentRoute,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { route: AppNavRoute; label: string; icon: React.FC<{ className?: string }> }[] = [
    { route: 'market', label: 'Market', icon: ShoppingBag },
    { route: 'sell', label: 'Sell', icon: PlusCircle },
    { route: 'my-products', label: 'My Products', icon: Package },
    { route: 'track', label: 'Track Phone', icon: MapPin },
    { route: 'hubs', label: 'Hubs', icon: MessageSquare },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div 
            onClick={() => onNavigate('market')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#008751] to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-gray-900 group-hover:text-[#008751] transition-colors">
                  NaijaMart <span className="text-[#008751]">Hub</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-[#008751]">
                  MARKET & RECOVERY
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium -mt-0.5 hidden sm:block">
                Nigeria's #1 Campus & Verified Goods Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-50/80 p-1 rounded-2xl border border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#008751] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right User / Auth Controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => onNavigate('my-products')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-bold text-gray-800 max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'My Account'}
                  </span>
                </div>
                <button
                  onClick={signOutUser}
                  title="Sign Out"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-[#008751] hover:bg-[#007043] text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger toggle (for quick access to extra features) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu if opened */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    onNavigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-[#008751]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#008751]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* BOTTOM NAVIGATION (Mobile-First, Strictly 5 Exact Icons) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden">
        <div className="grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
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
    </>
  );
};
