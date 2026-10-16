import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, X, Bike } from 'lucide-react';
import { CATEGORIES, NIGERIAN_LOCATIONS, OKADA_MODELS } from '../data/constants';
import { FilterState } from '../types';

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const isOkadaActive =
    filters.category?.toLowerCase().includes('okada') ||
    filters.category?.toLowerCase().includes('motorcycle');

  const conditions = ['All', 'New', 'Fairly Used', 'Used'];
  const sortOptions = [
    { id: 'newest', label: 'Newest Ads' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'popular', label: 'Most Viewed' },
  ];

  const hasActiveFilters =
    filters.category !== '' ||
    filters.location !== '' ||
    (filters.condition !== '' && filters.condition !== 'All') ||
    filters.papers !== '' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '';

  return (
    <div className="mb-4">
      {/* Top Filter Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpenMobile(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#008751]" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#fb6514]" />
            )}
          </button>

          <span className="text-xs text-gray-600 font-medium">
            <strong className="text-gray-900 font-extrabold">{totalResults}</strong> ads
            {filters.category ? ` in ${filters.category}` : ''}
            {filters.location ? ` • ${filters.location}` : ''}
          </span>
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="filter-sort-select" className="text-xs text-gray-400 font-medium hidden sm:inline">Sort:</label>
          <select
            id="filter-sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
            }
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-800 font-semibold focus:outline-none focus:border-[#008751]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors font-bold"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Okada Quick Brands Filter Strip (when in Okada category or search) */}
      {isOkadaActive && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 mt-1">
          <span className="text-[11px] font-black text-[#fb6514] flex items-center gap-1 flex-shrink-0">
            <Bike className="w-3.5 h-3.5" /> Okada Brands:
          </span>
          {['Bajaj', 'TVS', 'Honda', 'Haujue', 'Daylong', 'Qlink'].map((brand) => (
            <button
              key={brand}
              onClick={() =>
                onChange({
                  ...filters,
                  searchQuery: filters.searchQuery === brand ? '' : brand,
                })
              }
              className={`text-xs px-2.5 py-1 rounded-xl font-bold flex-shrink-0 border transition-all ${
                filters.searchQuery === brand
                  ? 'bg-[#fb6514] text-white border-[#e8590c] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
              }`}
            >
              {brand}
            </button>
          ))}
          {/* Papers toggle */}
          <button
            onClick={() =>
              onChange({
                ...filters,
                papers: filters.papers === 'Complete' ? '' : 'Complete',
              })
            }
            className={`text-xs px-2.5 py-1 rounded-xl font-bold flex-shrink-0 border transition-all ${
              filters.papers === 'Complete'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
            }`}
          >
            ✓ Complete Papers Only
          </button>
        </div>
      )}

      {/* Desktop Filter Strip */}
      <div className="hidden md:flex items-center gap-3 bg-gray-50/90 p-2.5 rounded-2xl border border-gray-200 mt-2 text-xs">
        {/* Condition Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-semibold">Condition:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200">
            {conditions.map((cond) => {
              const active = filters.condition === cond || (!filters.condition && cond === 'All');
              return (
                <button
                  key={cond}
                  onClick={() => onChange({ ...filters, condition: cond === 'All' ? '' : cond })}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                    active ? 'bg-[#008751] text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-location-select" className="text-gray-500 font-semibold">Location:</label>
          <select
            id="filter-location-select"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800 font-semibold focus:outline-none focus:border-[#008751] max-w-[170px]"
          >
            <option value="">All Nigeria</option>
            {NIGERIAN_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-gray-500 font-semibold">Price (₦):</span>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800 focus:outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile Modal Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#008751]" />
                <h3 className="font-extrabold text-gray-900 text-sm">Filter Ads</h3>
              </div>
              <button
                onClick={() => setIsOpenMobile(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Category */}
              <div>
                <label htmlFor="filter-mobile-category-select" className="font-bold text-gray-800 block mb-1">Category</label>
                <select
                  id="filter-mobile-category-select"
                  value={filters.category}
                  onChange={(e) => onChange({ ...filters, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 font-medium"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="filter-mobile-location-select" className="font-bold text-gray-800 block mb-1">Location</label>
                <select
                  id="filter-mobile-location-select"
                  value={filters.location}
                  onChange={(e) => onChange({ ...filters, location: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 font-medium"
                >
                  <option value="">All Nigeria</option>
                  {NIGERIAN_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <span className="font-bold text-gray-800 block mb-1">Condition</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {conditions.map((cond) => {
                    const active = filters.condition === cond || (!filters.condition && cond === 'All');
                    return (
                      <button
                        key={cond}
                        onClick={() => onChange({ ...filters, condition: cond === 'All' ? '' : cond })}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          active
                            ? 'bg-[#008751] text-white border-[#008751]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <span className="font-bold text-gray-800 block mb-1">Price Range (₦)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₦"
                    value={filters.minPrice}
                    onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max ₦"
                    value={filters.maxPrice}
                    onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={onReset}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpenMobile(false)}
                className="flex-1 py-2.5 bg-[#008751] text-white font-bold rounded-xl text-xs"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
