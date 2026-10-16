import React, { useState, useMemo } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Filter 
} from 'lucide-react';
import { OkadaRider } from '../types';
import { WUKARI_AREAS } from '../data/constants';
import { RiderCard } from './RiderCard';

interface WukariRidersViewProps {
  riders: OkadaRider[];
  loading: boolean;
  onOpenRegisterModal: () => void;
}

export const WukariRidersView: React.FC<WukariRidersViewProps> = ({
  riders,
  loading,
  onOpenRegisterModal,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      if (selectedArea && selectedArea !== 'All Wukari') {
        if (!r.location.toLowerCase().includes(selectedArea.toLowerCase())) {
          return false;
        }
      }

      if (availableOnly && !r.isAvailable) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesLoc = r.location?.toLowerCase().includes(q);
        const matchesBike = r.bikeNumber?.toLowerCase().includes(q);
        const matchesPhone = r.phoneNumber?.includes(q);
        if (!matchesName && !matchesLoc && !matchesBike && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [riders, selectedArea, searchQuery, availableOnly]);

  const activeCount = riders.filter((r) => r.isAvailable).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Hero Banner for Wukari Okada Riders */}
      <div className="bg-gradient-to-r from-orange-600 via-[#fb6514] to-amber-600 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center pr-6">
          <Bike className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-300 border border-white/20 mb-2.5">
            <Bike className="w-4 h-4 text-yellow-300" />
            <span>WUKARI OKADA RIDERS • NO LOGIN NEEDED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Call Trusted Okada Riders in Wukari Directly
          </h2>

          <p className="text-orange-100 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            Need a bike ride from Wukari Junction, Hospital Road, Kwararafa, New Market or FUW? Call or WhatsApp verified local riders right now with zero booking fee.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={onOpenRegisterModal}
              className="bg-white hover:bg-orange-50 text-[#fb6514] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#fb6514]" />
              <span>Register as Wukari Rider 🏍️</span>
            </button>

            <span className="text-xs bg-black/25 px-3 py-1.5 rounded-xl text-yellow-200 font-bold border border-white/20">
              🟢 {activeCount} Riders Currently Available
            </span>
          </div>
        </div>
      </div>

      {/* Area Pills & Controls Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs space-y-3">
        {/* Search bar & Available Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rider by name, plate number (e.g. TAR-123-WK) or street..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#fb6514]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                availableOnly
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              🟢 Available Only
            </button>

            <button
              onClick={onOpenRegisterModal}
              className="bg-[#fb6514] hover:bg-[#e8590c] text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Profile</span>
            </button>
          </div>
        </div>

        {/* Wukari Spot Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-black text-gray-500 flex items-center gap-1 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#fb6514]" /> Wukari Spots:
          </span>
          <button
            onClick={() => setSelectedArea('')}
            className={`text-xs px-3 py-1 rounded-xl font-bold flex-shrink-0 transition-all ${
              selectedArea === ''
                ? 'bg-[#fb6514] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Wukari
          </button>
          {WUKARI_AREAS.slice(0, 8).map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(selectedArea === area ? '' : area)}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold flex-shrink-0 border transition-all ${
                selectedArea === area
                  ? 'bg-[#fb6514] text-white border-[#e8590c] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Wukari Okada Riders (2 cols mobile, 4 desktop) */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-orange-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRiders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs my-6">
          <div className="w-16 h-16 bg-orange-50 text-[#fb6514] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Bike className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">
            No Riders Found
          </h3>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            {selectedArea || searchQuery
              ? `No registered riders in "${selectedArea || searchQuery}" right now.`
              : 'Be the first registered Okada rider in Wukari! Get passengers calling you directly every day.'}
          </p>

          <button
            onClick={onOpenRegisterModal}
            className="bg-[#fb6514] hover:bg-[#e8590c] text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 mx-auto shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register as Wukari Rider 🏍️</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredRiders.map((rider) => (
            <RiderCard key={rider.id} rider={rider} />
          ))}
        </div>
      )}
    </div>
  );
};
