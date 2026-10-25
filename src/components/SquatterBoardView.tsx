import React, { useState, useMemo } from 'react';
import { 
  Home, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  ChevronRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { SquatterItem } from '../types';
import { SQUATTER_LOCATIONS } from '../data/constants';
import { SquatterCard } from './SquatterCard';
import { formatNaira } from '../utils/formatters';

interface SquatterBoardViewProps {
  items: SquatterItem[];
  loading: boolean;
  onOpenPostModal: () => void;
  onNavigateHome: () => void;
}

export const SquatterBoardView: React.FC<SquatterBoardViewProps> = ({
  items,
  loading,
  onOpenPostModal,
  onNavigateHome,
}) => {
  // Main Tab: 'all' | 'have_space' | 'need_space'
  const [activeTab, setActiveTab] = useState<'have_space' | 'need_space' | 'all'>('have_space');

  // Filters state
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Tab filter
      if (activeTab !== 'all' && item.type !== activeTab) {
        return false;
      }

      // 2. Location filter
      if (selectedLocation !== 'All') {
        if (!item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 3. Gender filter
      if (selectedGender !== 'All') {
        if (selectedGender === 'male' && item.gender === 'female') return false;
        if (selectedGender === 'female' && item.gender === 'male') return false;
      }

      // 4. Price filter
      if (priceRange !== 'all') {
        const p = item.price;
        if (priceRange === 'under_40k' && p >= 40000) return false;
        if (priceRange === '40k_70k' && (p < 40000 || p > 70000)) return false;
        if (priceRange === '70k_100k' && (p < 70000 || p > 100000)) return false;
        if (priceRange === 'above_100k' && p <= 100000) return false;
      }

      // 5. Search keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesRoom = String(item.people_in_room || '').toLowerCase().includes(q);
        if (!matchesLoc && !matchesDesc && !matchesRoom) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, selectedLocation, selectedGender, priceRange, searchQuery]);

  const resetFilters = () => {
    setSelectedLocation('All');
    setSelectedGender('All');
    setPriceRange('all');
    setSearchQuery('');
  };

  const haveSpaceCount = items.filter((i) => i.type === 'have_space').length;
  const needSpaceCount = items.filter((i) => i.type === 'need_space').length;

  return (
    <div className="relative pb-24 animate-fade-in">
      {/* Hero Header Banner */}
      <section className="bg-gradient-to-br from-[#008751] via-emerald-700 to-[#005a36] text-white py-6 sm:py-9 px-4 rounded-3xl shadow-md mb-6 relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <span className="text-sm">🏠</span>
            <span>FUW Wukari Squatter Board - 100% FREE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 leading-tight">
            Find Hostel Bedspace & Roommates in FU Wukari
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed mb-4">
            Connect directly with verified students subletting bedspaces in Hostel A, Hostel B, New Site & Wukari Town. Zero agent fees, direct student WhatsApp.
          </p>

          {/* Quick Stats Strip */}
          <div className="inline-flex items-center justify-center gap-4 sm:gap-6 bg-black/25 backdrop-blur-xs py-2 px-4 rounded-2xl border border-white/10 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{haveSpaceCount} Spaces Available</span>
            </div>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-1.5">
              <span>🙋 {needSpaceCount} Students Looking</span>
            </div>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-1 text-yellow-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Free Forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two Tabs: "I HAVE SPACE" and "I NEED SPACE" */}
      <div className="bg-white rounded-2xl border border-gray-200 p-1.5 shadow-xs mb-4 flex items-center justify-between gap-1.5 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab('have_space')}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'have_space'
              ? 'bg-[#008751] text-white shadow-sm ring-2 ring-emerald-300'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>I HAVE SPACE</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'have_space' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
          }`}>
            {haveSpaceCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('need_space')}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'need_space'
              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>I NEED SPACE</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'need_space' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
          }`}>
            {needSpaceCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'all'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All
        </button>
      </div>

      {/* Filters Bar: Location, Price (30k-150k), Gender */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 shadow-xs mb-6 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#008751]" />
            <span>Filter Bedspaces</span>
          </div>

          {(selectedLocation !== 'All' || selectedGender !== 'All' || priceRange !== 'all' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Filter 1: Location */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-[#008751]"
            >
              <option value="All">All Locations (FUW)</option>
              {SQUATTER_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Price (30k-150k) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Price Range (₦)
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-[#008751]"
            >
              <option value="all">Any Price</option>
              <option value="under_40k">Under ₦40,000</option>
              <option value="40k_70k">₦40,000 – ₦70,000</option>
              <option value="70k_100k">₦70,000 – ₦100,000</option>
              <option value="above_100k">Above ₦100,000 (Self-contain)</option>
            </select>
          </div>

          {/* Filter 3: Gender */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-[#008751]"
            >
              <option value="All">All Genders</option>
              <option value="male">Male Only (♂)</option>
              <option value="female">Female Only (♀)</option>
            </select>
          </div>

          {/* Filter 4: Keyword Search */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Block, tiles, water..."
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-[#008751]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-900">
            {activeTab === 'have_space' 
              ? 'Available Bedspaces to Sublet' 
              : activeTab === 'need_space' 
              ? 'Students Looking for Bedspace' 
              : 'All Bedspace Listings'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Showing {filteredItems.length} listing(s) in FUW Wukari
          </p>
        </div>

        <button
          onClick={onOpenPostModal}
          className="hidden sm:flex items-center gap-1.5 bg-[#008751] hover:bg-[#007043] active:scale-95 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Post Free Bedspace</span>
        </button>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs animate-pulse">
              <div className="aspect-[16/10] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-emerald-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs my-6">
          <div className="w-16 h-16 bg-emerald-50 text-[#008751] rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl">
            🏠
          </div>
          <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">
            No Bedspaces Found
          </h3>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            No listings currently match your selected filters. Try adjusting price or location, or be the first to post!
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={onOpenPostModal}
              className="px-5 py-2 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-black shadow-xs transition-all"
            >
              + Post Free Bedspace
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <SquatterCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Campus Safety Warning Card */}
      <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-[#008751] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-black text-emerald-950 mb-0.5">
            FUW Campus Squatting & Bedspace Safety Protocol
          </h4>
          <p className="leading-relaxed text-emerald-900">
            Never make payment to anyone before physically inspecting the room inside FUW Hostel A, Hostel B, or off-campus house in Wukari. Agree with the main tenant on hostel rules, electricity contribution, and study hours.
          </p>
        </div>
      </div>

      {/* Floating Action Button: "+ Post Free Bedspace" (Prompt Requirement 3) */}
      <button
        onClick={onOpenPostModal}
        className="fixed bottom-18 sm:bottom-8 right-4 sm:right-8 z-40 bg-gradient-to-r from-[#008751] via-[#049b5d] to-[#008751] hover:brightness-110 active:scale-95 text-white py-3.5 px-5 sm:px-6 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border-2 border-white ring-4 ring-emerald-500/20 transition-all hover:shadow-emerald-500/30"
        title="Post Free Bedspace"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>Post Free Bedspace</span>
      </button>
    </div>
  );
};
