import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  Compass, 
  HelpCircle, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SelfTrackingHeaderProps {
  currentPage: 'home' | 'register' | 'protect' | 'track' | 'how-it-works';
  onNavigate: (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => void;
}

export const SelfTrackingHeader: React.FC<SelfTrackingHeaderProps> = ({
  currentPage,
  onNavigate
}) => {
  const { user, openAuthModal, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: 'home' | 'register' | 'protect' | 'track' | 'how-it-works') => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#168447] text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-gray-900 tracking-tight leading-none">
                  NaijaMart Hub
                </span>
                <span className="bg-[#168447] text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  Self-Tracking
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block mt-0.5">
                Protect Your Phone Today. Find It Yourself Tomorrow.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentPage === 'home' 
                  ? 'bg-emerald-50 text-[#168447]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('register')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentPage === 'register' 
                  ? 'bg-emerald-50 text-[#168447]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Register Phone
            </button>

            <button
              onClick={() => handleNav('protect')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentPage === 'protect' 
                  ? 'bg-emerald-50 text-[#168447]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Location Protection
            </button>

            <button
              onClick={() => handleNav('track')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentPage === 'track' 
                  ? 'bg-emerald-50 text-[#168447]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Recovery Tracker
            </button>

            <button
              onClick={() => handleNav('how-it-works')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentPage === 'how-it-works' 
                  ? 'bg-emerald-50 text-[#168447]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              How It Works
            </button>
          </nav>

          {/* User Account / Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-gray-50 py-1.5 px-3 rounded-2xl border border-gray-200">
                <div className="w-7 h-7 rounded-full bg-[#168447] text-white flex items-center justify-center font-bold text-xs">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs pr-1">
                  <span className="font-bold text-gray-800 block leading-tight truncate max-w-[120px]">
                    {user.email || user.phoneNumber || 'Owner Account'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Active Session</span>
                </div>
                <button
                  onClick={signOutUser}
                  title="Sign Out"
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-4 py-2 bg-[#168447] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3 py-1.5 bg-[#168447] text-white rounded-xl text-xs font-bold"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
              currentPage === 'home' ? 'bg-emerald-50 text-[#168447]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('register')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
              currentPage === 'register' ? 'bg-emerald-50 text-[#168447]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Register Phone (/register)
          </button>
          <button
            onClick={() => handleNav('protect')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
              currentPage === 'protect' ? 'bg-emerald-50 text-[#168447]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Location Protection (/protect)
          </button>
          <button
            onClick={() => handleNav('track')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
              currentPage === 'track' ? 'bg-emerald-50 text-[#168447]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Recovery Tracker (/track)
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
              currentPage === 'how-it-works' ? 'bg-emerald-50 text-[#168447]' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            How It Works & Police Report Guide
          </button>

          {user && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 px-4">
              <span className="truncate">{user.email || user.phoneNumber}</span>
              <button
                onClick={signOutUser}
                className="text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
