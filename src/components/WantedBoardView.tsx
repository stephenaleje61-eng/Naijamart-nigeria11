import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  GraduationCap, 
  Plus, 
  PlusCircle, 
  SlidersHorizontal, 
  RotateCcw, 
  AlertCircle, 
  Handshake, 
  MapPin, 
  Wallet, 
  Clock, 
  Layers, 
  CheckCircle2,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { WantedItem, WantedFilterState } from '../types';
import { CAMPUSES, WANTED_CATEGORIES } from '../data/constants';
import { WantedCard } from './WantedCard';
import { formatNaira } from '../utils/formatters';

interface WantedBoardViewProps {
  wantedItems: WantedItem[];
  loading: boolean;
  onOpenPostModal: () => void;
  onIHaveThis: (item: WantedItem) => void;
  onSeedSampleRequests?: () => void;
}

export const WantedBoardView: React.FC<WantedBoardViewProps> = ({
  wantedItems,
  loading,
  onOpenPostModal,
  onIHaveThis,
  onSeedSampleRequests,
}) => {
  // Filter state
  const [filters, setFilters] = useState<WantedFilterState>({
    searchQuery: '',
    campus: 'All Campuses',
    category: 'All Categories',
    budgetRange: 'all',
    urgency: 'all',
    sortBy: 'newest',
  });

  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return wantedItems.filter((item) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.itemWanted?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesBuyer = item.buyerName?.toLowerCase().includes(q);
        const matchesLocation = item.location?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBuyer && !matchesLocation && !matchesCategory) {
          return false;
        }
      }

      // 2. Campus
      if (filters.campus && filters.campus !== 'All Campuses') {
        const itemSchool = item.school?.toLowerCase() || '';
        const selectedSchool = filters.campus.toLowerCase();
        // check abbreviation like FU Wukari or FUW
        if (selectedSchool.includes('wukari') && (itemSchool.includes('wukari') || itemSchool.includes('fuw'))) {
          // match
        } else if (!itemSchool.includes(selectedSchool) && !selectedSchool.includes(itemSchool)) {
          return false;
        }
      }

      // 3. Category
      if (filters.category && filters.category !== 'All Categories') {
        if (item.category?.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
      }

      // 4. Urgency
      if (filters.urgency && filters.urgency !== 'all') {
        if (item.urgency !== filters.urgency) {
          return false;
        }
      }

      // 5. Budget Range
      if (filters.budgetRange && filters.budgetRange !== 'all') {
        const b = item.budget || 0;
        if (filters.budgetRange === 'under-10k' && b > 10000) return false;
        if (filters.budgetRange === '10k-50k' && (b < 10000 || b > 50000)) return false;
        if (filters.budgetRange === '50k-150k' && (b < 50000 || b > 150000)) return false;
        if (filters.budgetRange === '150k-plus' && b < 150000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'budget-desc') {
        return (b.budget || 0) - (a.budget || 0);
      }
      if (filters.sortBy === 'budget-asc') {
        return (a.budget || 0) - (b.budget || 0);
      }
      if (filters.sortBy === 'urgent') {
        const weight = { 'Urgent': 3, 'This Week': 2, 'Flexible': 1 };
        return (weight[b.urgency] || 0) - (weight[a.urgency] || 0);
      }
      // default newest
      const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return tB - tA;
    });
  }, [wantedItems, filters]);

  // Aggregate stats
  const totalBudgetReady = useMemo(() => {
    return wantedItems.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  }, [wantedItems]);

  const urgentCount = useMemo(() => {
    return wantedItems.filter((i) => i.urgency === 'Urgent').length;
  }, [wantedItems]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      campus: 'All Campuses',
      category: 'All Categories',
      budgetRange: 'all',
      urgency: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="relative pb-24 sm:pb-16 animate-fade-in">
      {/* Hero / Header Banner for Wanted Board */}
      <section className="bg-gradient-to-br from-[#008751] via-[#007043] to-[#044c2e] text-white rounded-3xl p-4 sm:p-7 shadow-lg mb-4 sm:mb-6 border border-emerald-400/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black mb-2 shadow-xs uppercase tracking-wider">
              <span>🎯 Student Wanted Board</span>
              <span className="text-[10px] bg-black text-yellow-300 px-1.5 py-0.2 rounded font-extrabold">
                NEW
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight mb-1.5">
              Buyers Post What They NEED. <br className="hidden sm:block" />
              Sellers Deliver to Campus!
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Don't spend hours searching. Post the gadget, textbook, fan, or hostel item you want with your ready budget. Campus sellers will click <strong>"I Have This"</strong> to call or WhatsApp you directly.
            </p>

            {/* Quick Stats Pill Row */}
            <div className="flex items-center gap-3 sm:gap-4 mt-3 flex-wrap text-xs">
              <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-xl backdrop-blur-xs border border-white/10">
                <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-bold text-white">FU Wukari & Campuses</span>
              </div>

              <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-xl backdrop-blur-xs border border-white/10">
                <Wallet className="w-3.5 h-3.5 text-emerald-300" />
                <span className="font-bold text-emerald-200">
                  {formatNaira(totalBudgetReady)} Buyer Demand
                </span>
              </div>

              {urgentCount > 0 && (
                <div className="flex items-center gap-1 bg-red-500/80 text-white px-2.5 py-1 rounded-xl font-bold text-[11px]">
                  <span>🚨 {urgentCount} Urgent Requests</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Post CTA */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={onOpenPostModal}
              className="bg-white hover:bg-emerald-50 text-[#008751] px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-[#008751]" />
              <span>Post What You Need</span>
            </button>
            <p className="text-[11px] text-center text-emerald-200 font-medium">
              100% Free • No Account Required
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar Row */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-3 sm:p-4 mb-4">
        {/* Search input + Campus Quick Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search student requests: iPhone, 4.5x6 mattress, fridge, MTH 101..."
              className="w-full pl-10 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all text-gray-900"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-3 text-[11px] text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Campus Selector */}
          <div className="sm:col-span-3">
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-[#008751] absolute left-3 top-3 pointer-events-none" />
              <select
                value={filters.campus}
                onChange={(e) => setFilters((prev) => ({ ...prev, campus: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
              >
                <option value="All Campuses">All Nigerian Campuses</option>
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Filter */}
          <div className="sm:col-span-3">
            <div className="relative">
              <Wallet className="w-4 h-4 text-[#008751] absolute left-3 top-3 pointer-events-none" />
              <select
                value={filters.budgetRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, budgetRange: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
              >
                <option value="all">Any Budget</option>
                <option value="under-10k">Under ₦10,000</option>
                <option value="10k-50k">₦10,000 - ₦50,000</option>
                <option value="50k-150k">₦50,000 - ₦150,000</option>
                <option value="150k-plus">₦150,000+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Second Row: Category Chips & Urgency Tabs */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 max-w-full">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: 'All Categories' }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filters.category === 'All Categories'
                  ? 'bg-[#008751] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>

            {WANTED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filters.category === cat
                    ? 'bg-[#008751] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Urgency Toggles */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setFilters((prev) => ({ 
                ...prev, 
                urgency: prev.urgency === 'Urgent' ? 'all' : 'Urgent' 
              }))}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
                filters.urgency === 'Urgent'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              }`}
            >
              <span>🚨 Urgent</span>
            </button>

            <button
              onClick={() => setFilters((prev) => ({ 
                ...prev, 
                urgency: prev.urgency === 'This Week' ? 'all' : 'This Week' 
              }))}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                filters.urgency === 'This Week'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>📅 This Week</span>
            </button>

            {(filters.searchQuery || filters.campus !== 'All Campuses' || filters.category !== 'All Categories' || filters.budgetRange !== 'all' || filters.urgency !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center gap-1 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feed Results Count & Sorting */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900 text-sm">
            {filteredItems.length} Student {filteredItems.length === 1 ? 'Request' : 'Requests'}
          </span>
          {filters.campus !== 'All Campuses' && (
            <span className="bg-emerald-50 text-[#008751] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
              {filters.campus}
            </span>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1 text-xs">
          <span className="hidden sm:inline">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="urgent">Most Urgent</option>
            <option value="budget-desc">Highest Budget</option>
            <option value="budget-asc">Lowest Budget</option>
          </select>
        </div>
      </div>

      {/* Main Feed Grid (Twitter + Jiji style) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-100 rounded" />
              <div className="h-10 bg-emerald-50 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs my-6">
          <div className="w-20 h-20 bg-emerald-50 text-[#008751] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
            No Student Requests Found
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            {filters.searchQuery || filters.campus !== 'All Campuses' || filters.category !== 'All Categories'
              ? 'No active requests matching your search or filters. Try resetting filters to see requests across all campuses.'
              : 'Be the first student to post what you need on campus! State your budget and sellers will reach out.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {filters.searchQuery || filters.campus !== 'All Campuses' || filters.category !== 'All Categories' ? (
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
              >
                Clear Filters
              </button>
            ) : null}

            <button
              onClick={onOpenPostModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post What You Need</span>
            </button>
          </div>
        </div>
      ) : (
        /* The Feed */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <WantedCard
              key={item.id}
              item={item}
              onIHaveThis={onIHaveThis}
            />
          ))}
        </div>
      )}

      {/* BIG FLOATING "+" BUTTON: "Post What You Need" */}
      <div className="fixed bottom-16 sm:bottom-8 right-4 sm:right-8 z-40">
        <button
          onClick={onOpenPostModal}
          className="group bg-gradient-to-r from-[#008751] to-emerald-600 hover:from-[#007043] hover:to-emerald-700 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform active:scale-95 border-2 border-white ring-4 ring-[#008751]/20"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span className="tracking-tight">Post What You Need</span>
          <span className="hidden sm:inline bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
            FREE
          </span>
        </button>
      </div>
    </div>
  );
};
