import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  ChevronDown, 
  ShieldCheck, 
  Package, 
  Zap, 
  Bike, 
  Users, 
  UserPlus,
  MessageSquare,
  GraduationCap,
  X 
} from 'lucide-react';
import { NIGERIAN_LOCATIONS } from '../data/constants';
import { useStudent } from '../context/StudentContext';

interface HeaderProps {
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPublish: () => void;
  onOpenMyAds: () => void;
  onSelectOkadaCategory: () => void;
  onSelectWukariRiders: () => void;
  onSelectWantedBoard: () => void;
  onSelectSquatterBoard?: () => void;
  onSelectFindMyPhone?: () => void;
  onSelectProtectPhone?: () => void;
  onSelectChatSpace?: () => void;
  isWukariRidersActive?: boolean;
  isWantedBoardActive?: boolean;
  isSquatterBoardActive?: boolean;
  isFindMyPhoneActive?: boolean;
  isProtectPhoneActive?: boolean;
  isChatSpaceActive?: boolean;
  myAdsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  searchQuery,
  onSearchChange,
  onOpenPublish,
  onOpenMyAds,
  onSelectOkadaCategory,
  onSelectWukariRiders,
  onSelectWantedBoard,
  onSelectSquatterBoard,
  onSelectFindMyPhone,
  onSelectProtectPhone,
  onSelectChatSpace,
  isWukariRidersActive = false,
  isWantedBoardActive = false,
  isSquatterBoardActive = false,
  isFindMyPhoneActive = false,
  isProtectPhoneActive = false,
  isChatSpaceActive = false,
  myAdsCount,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { profile, setIsFriendsModalOpen, setIsProfileModalOpen, pendingRequestsCount, unreadChatsCount } = useStudent();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top flash marquee strip */}
      <div className="bg-gradient-to-r from-[#fb6514] via-[#e8590c] to-[#008751] text-white text-[11px] sm:text-xs py-1.5 px-3 font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onSelectWantedBoard}
              className="bg-yellow-400 text-black hover:bg-yellow-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Zap className="w-3 h-3 text-black fill-black" /> 🎯 Student Wanted Board
            </button>
            <span className="truncate hidden sm:inline">Buyers post what they need • Sellers call & WhatsApp direct</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <button 
              onClick={onSelectFindMyPhone}
              className={`px-2 py-0.5 rounded-md font-black flex items-center gap-1 transition-colors ${
                isFindMyPhoneActive
                  ? 'bg-white text-[#008751]'
                  : 'bg-emerald-950 text-yellow-300 hover:bg-emerald-900 border border-yellow-400/40'
              }`}
            >
              <span>🛡️ Find Phone</span>
            </button>
            <button 
              onClick={onSelectSquatterBoard}
              className={`px-2 py-0.5 rounded-md font-black flex items-center gap-1 transition-colors ${
                isSquatterBoardActive
                  ? 'bg-white text-[#008751]'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <span>🏠 Squatter</span>
            </button>
            <button 
              onClick={onSelectWantedBoard}
              className={`px-2 py-0.5 rounded-md font-black flex items-center gap-1 transition-colors ${
                isWantedBoardActive
                  ? 'bg-white text-[#008751]'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <span>🎯 Wanted Board</span>
            </button>
            <button 
              onClick={onSelectWukariRiders}
              className="bg-yellow-400 text-black hover:bg-yellow-300 px-2 py-0.5 rounded-md font-black flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Users className="w-3 h-3 text-black" /> 🏍️ Riders
            </button>
            <button 
              onClick={onSelectOkadaCategory}
              className="hidden md:flex bg-white text-[#fb6514] hover:bg-orange-50 px-2 py-0.5 rounded-md font-black items-center gap-1 transition-colors"
            >
              <Bike className="w-3 h-3" /> Okadas
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer" 
          onClick={() => {
            onSearchChange('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img 
            src="/icon.png" 
            alt="NaijaMarket Hub" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs bg-[#008751]" 
          />
          <div>
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-black text-[#1a1a1a] tracking-tight">NaijaMarket</span>
              <span className="text-xl sm:text-2xl font-black text-[#008751] tracking-tight ml-1">Hub</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium hidden sm:block -mt-1">
              Buy & Sell Across Nigeria | Wukari & Taraba
            </p>
          </div>
        </div>

        {/* Location selector */}
        <div className="relative hidden md:block flex-shrink-0">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-xl border border-gray-200 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#008751]" />
            <span className="truncate max-w-[130px]">{selectedLocation || 'Wukari'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showLocationDropdown && (
            <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto py-1">
              <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                Select Nigerian City / Hub
              </div>
              {NIGERIAN_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    onSelectLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    selectedLocation === loc ? 'text-[#008751] font-bold bg-emerald-50' : 'text-gray-700'
                  }`}
                >
                  <span>{loc}</span>
                  {selectedLocation === loc && <span className="text-xs text-[#008751]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-xl relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Bajaj Boxer, TVS, Wukari riders, iPhone, generators..."
              className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all text-gray-900 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-16 top-3 text-xs text-gray-400 hover:text-gray-600 px-1 font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {}}
              className="absolute right-1.5 top-1.5 bg-[#008751] hover:bg-[#007043] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-2 text-gray-600 hover:text-[#008751] hover:bg-gray-100 rounded-xl"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Find My Phone Button */}
          <button
            onClick={onSelectFindMyPhone}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-colors border ${
              isFindMyPhoneActive
                ? 'bg-gray-900 text-white border-black ring-2 ring-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#008751] border-emerald-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#008751]" />
            <span>Find My Phone</span>
          </button>

          {/* Squatter Board Button */}
          <button
            onClick={onSelectSquatterBoard}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-colors border ${
              isSquatterBoardActive
                ? 'bg-[#008751] text-white border-emerald-600 ring-2 ring-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#008751] border-emerald-200'
            }`}
          >
            <span className="text-sm">🏠</span>
            <span>Squatter Board</span>
          </button>

          {/* Wanted Board Button */}
          <button
            onClick={onSelectWantedBoard}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-colors border ${
              isWantedBoardActive
                ? 'bg-[#008751] text-white border-emerald-600 ring-2 ring-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#008751] border-emerald-200'
            }`}
          >
            <span className="text-sm">🎯</span>
            <span>Wanted Board</span>
          </button>

          {/* Wukari Okada Riders Button */}
          <button
            onClick={onSelectWukariRiders}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-colors border ${
              isWukariRidersActive
                ? 'bg-yellow-400 text-black border-yellow-500 ring-2 ring-yellow-200'
                : 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Wukari Riders 🏍️</span>
          </button>

          {/* Real Chatting Space & Friends Button */}
          <button
            onClick={() => onSelectChatSpace ? onSelectChatSpace() : setIsFriendsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl transition-all relative border shadow-xs cursor-pointer ${
              isChatSpaceActive
                ? 'bg-[#008751] text-white border-emerald-600 ring-2 ring-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#008751] border-emerald-300'
            }`}
            title="Real-Time Student Chat & Friends Network"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Real Chat</span>
            {(pendingRequestsCount > 0 || unreadChatsCount > 0) && (
              <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">
                {pendingRequestsCount + unreadChatsCount}
              </span>
            )}
          </button>

          {/* Student Profile Quick Pill */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
            title="My Campus Student Profile"
          >
            <div className="w-6 h-6 rounded-full bg-[#008751] text-white flex items-center justify-center text-[10px] font-black">
              {profile?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden lg:inline max-w-[80px] truncate">
              {profile?.fullName ? profile.fullName.split(' ')[0] : 'Profile'}
            </span>
          </button>

          {/* My Ads */}
          <button
            onClick={onOpenMyAds}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-bold text-gray-700 hover:text-[#008751] hover:bg-gray-100 rounded-xl transition-colors relative"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">My Ads</span>
            {myAdsCount > 0 && (
              <span className="bg-[#fb6514] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {myAdsCount}
              </span>
            )}
          </button>

          {/* Post Ad Button */}
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-1.5 bg-[#008751] hover:bg-[#007043] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm hover:shadow transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Free Ad</span>
          </button>
        </div>
      </div>

      {/* Mobile search expandable */}
      {showMobileSearch && (
        <div className="sm:hidden px-3 pb-3 border-t border-gray-100 pt-2 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Bajaj, Wukari riders, iPhone..."
              className="w-full pl-9 pr-10 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#008751]"
              autoFocus
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
