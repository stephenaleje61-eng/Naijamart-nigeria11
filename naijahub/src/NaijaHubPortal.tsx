import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NIGERIAN_STATES } from './types';
import { NaijaBusinessModule } from './modules/NaijaBusinessModule';
import { FarmLinkModule } from './modules/FarmLinkModule';
import { SkillBridgeModule } from './modules/SkillBridgeModule';
import { SolveAIModule } from './modules/SolveAIModule';
import { PublishModal } from './components/PublishModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Globe, 
  Search, 
  MapPin, 
  Compass, 
  PlusCircle, 
  Store, 
  Sprout, 
  Briefcase, 
  Lightbulb, 
  Menu, 
  X, 
  LogIn, 
  User, 
  ArrowLeft,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';

interface NaijaHubPortalProps {
  onBackToCampus?: () => void;
}

export const NaijaHubPortal: React.FC<NaijaHubPortalProps> = ({ onBackToCampus }) => {
  const { user, openAuthModal } = useAuth();

  // Navigation & Filter State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All Nigeria');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Geolocation & Distance Calculation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Haversine formula calculation for Near Me (in km)
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Trigger geolocation ONLY on explicit user click
  const handleExploreNearMe = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      setGeoNotice('Geolocation is not supported by your browser. Showing all Nigeria.');
      return;
    }

    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus('granted');
        setGeoNotice('Location detected! Sorting items with distance badges.');
      },
      (error) => {
        console.warn('Geolocation denied or unavailable:', error.message);
        setGeoStatus('denied');
        setGeoNotice('Location access not granted. Showing all Nigerian states.');
      },
      { timeout: 8000 }
    );
  };

  const handleOpenPublish = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsPublishModalOpen(true);
  };

  const categories = [
    { id: 'All', label: 'All Categories', icon: Globe },
    { id: 'Businesses', label: 'Businesses', icon: Store },
    { id: 'Products', label: 'Products & Stores', icon: Store },
    { id: 'Farm Produce', label: 'FarmLink Africa', icon: Sprout },
    { id: 'Jobs', label: 'Jobs & Careers', icon: Briefcase },
    { id: 'Services', label: 'Freelancers', icon: Briefcase },
    { id: 'Learning', label: 'SolveAI Learning', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#17231F] font-sans antialiased selection:bg-[#0D9B72] selection:text-white pb-16">
      {/* TOP RESPONSIVE NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => { setActiveCategory('All'); setGlobalSearch(''); }}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#075B43] text-white flex items-center justify-center font-black text-xl shadow-sm border border-emerald-700">
                🌍
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#17231F] flex items-center gap-1">
                  NaijaHub <span className="text-[#0D9B72]">Africa</span>
                </span>
                <p className="text-[10px] text-gray-500 font-semibold truncate hidden sm:block">
                  Discover Opportunities. Grow Businesses. Learn Skills.
                </p>
              </div>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search businesses, products, jobs, farm produce or skills..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100/90 border border-transparent rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:bg-white focus:border-gray-300 transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: State Selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 36 States + FCT Selector */}
            <div className="relative hidden lg:block">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#17231F] text-xs font-bold py-2 pl-7 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#075B43] cursor-pointer"
              >
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Admin Console Button */}
            <button
              onClick={() => setIsAdminDashboardOpen(true)}
              title="Admin & Verification Console"
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#075B43] rounded-xl text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D9B72]" />
              <span className="hidden xl:inline">Trust & Admin</span>
            </button>

            {/* Back to Campus Link */}
            {onBackToCampus && (
              <button
                onClick={onBackToCampus}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">NaijaMart Campus</span>
              </button>
            )}

            {/* User Dashboard / Join / Publish Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUserDashboardOpen(true)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#075B43]" />
                  <span className="hidden sm:inline">My Dashboard</span>
                </button>

                <button
                  onClick={handleOpenPublish}
                  className="px-3.5 py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#F5B942]" />
                  <span className="hidden sm:inline">Publish</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-4 py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Join Free</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden hover:bg-gray-100 rounded-xl text-gray-600 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & State Bar */}
        <div className="md:hidden px-4 pb-3 pt-1 space-y-2 border-t border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search businesses, jobs, produce..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs font-bold py-1.5 px-3 rounded-xl"
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Expanded Menu Items */}
          {isMobileMenuOpen && (
            <div className="pt-2 pb-1 space-y-1.5 border-t border-gray-100 animate-in fade-in">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (user) setIsUserDashboardOpen(true);
                  else openAuthModal('signin');
                }}
                className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-[#075B43]" />
                <span>{user ? 'My User Dashboard' : 'Sign In / Account'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAdminDashboardOpen(true);
                }}
                className="w-full py-2 px-3 text-left bg-emerald-50/70 hover:bg-emerald-100 rounded-xl text-xs font-bold text-[#075B43] flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#0D9B72]" />
                <span>Trust & Verification Console</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenPublish();
                }}
                className="w-full py-2 px-3 text-left bg-[#075B43] text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#F5B942]" />
                <span>Publish Listing</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-white via-white to-[#F8F7F2] border-b border-gray-200/60 pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#075B43] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#0D9B72]" />
            <span>Discover Opportunities. Grow Businesses. Learn Skills. Connect Africa.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#17231F] tracking-tight leading-tight max-w-3xl mx-auto">
            Everything You Need to Grow, Learn, Work and Trade — In One Place.
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Publicly browse verified Nigerian SMEs, farm-to-buyer direct commodities, talent directory, and practical STEM calculators. No login wall.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleExploreNearMe}
              disabled={geoStatus === 'locating'}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Compass className="w-4 h-4 text-gray-950" />
              <span>
                {geoStatus === 'locating'
                  ? 'Detecting Location...'
                  : geoStatus === 'granted'
                  ? 'Location Active ✓'
                  : 'Explore Near Me'}
              </span>
            </button>

            <button
              onClick={handleOpenPublish}
              className="px-5 py-3 bg-[#075B43] hover:bg-[#0D9B72] text-white font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Publish Listing</span>
            </button>
          </div>

          {/* Location Toast Notice */}
          {geoNotice && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-[#075B43] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#0D9B72]" />
              <span>{geoNotice}</span>
              <button onClick={() => setGeoNotice(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
          )}

          {/* CATEGORY CHIPS SCROLLER */}
          <div className="pt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#075B43] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F5B942]' : 'text-gray-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN MODULE SECTIONS RENDERED BASED ON FILTER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* MODULE 1: NAIJABUSINESS */}
        {(activeCategory === 'All' || activeCategory === 'Businesses' || activeCategory === 'Products') && (
          <section id="businesses">
            <NaijaBusinessModule
              selectedState={selectedState}
              searchQuery={globalSearch}
              onOpenAuth={() => openAuthModal('signin')}
              userCoords={userCoords}
              haversineDistance={calculateHaversine}
            />
          </section>
        )}

        {/* MODULE 2: FARMLINK AFRICA */}
        {(activeCategory === 'All' || activeCategory === 'Farm Produce') && (
          <section id="farmlink">
            <FarmLinkModule
              selectedState={selectedState}
              searchQuery={globalSearch}
              onOpenAuth={() => openAuthModal('signin')}
              userCoords={userCoords}
              haversineDistance={calculateHaversine}
            />
          </section>
        )}

        {/* MODULE 3: SKILLBRIDGE AFRICA */}
        {(activeCategory === 'All' || activeCategory === 'Jobs' || activeCategory === 'Services') && (
          <section id="skillbridge">
            <SkillBridgeModule
              selectedState={selectedState}
              searchQuery={globalSearch}
              onOpenAuth={() => openAuthModal('signin')}
              userCoords={userCoords}
              haversineDistance={calculateHaversine}
            />
          </section>
        )}

        {/* MODULE 4: SOLVEAI LEARNING */}
        {(activeCategory === 'All' || activeCategory === 'Learning') && (
          <section id="solveai">
            <SolveAIModule />
          </section>
        )}
      </main>

      {/* PUBLISH MODAL */}
      <PublishModal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} />

      {/* USER DASHBOARD MODAL */}
      <UserDashboard
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
      />

      {/* ADMIN CONSOLE MODAL */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />
    </div>
  );
};

export default NaijaHubPortal;
