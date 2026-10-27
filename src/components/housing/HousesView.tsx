import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Home, 
  Users, 
  Search, 
  MapPin, 
  PlusCircle, 
  Phone, 
  MessageSquare, 
  Heart, 
  ShieldCheck, 
  SlidersHorizontal, 
  Bed, 
  Bath, 
  Sparkles, 
  Check, 
  Camera, 
  Filter, 
  X,
  AlertCircle,
  Shield,
  ArrowRight
} from 'lucide-react';
import { 
  HouseListing, 
  RoommateListing, 
  HouseType, 
  HOUSE_TYPES, 
  POPULAR_NIGERIAN_STATES 
} from '../../types/housing';
import { 
  subscribeHouses, 
  subscribeRoommates, 
  getFavorites, 
  toggleFavorite 
} from '../../services/housingService';
import { PostHouseModal } from './PostHouseModal';
import { PostRoommateModal } from './PostRoommateModal';
import { HouseDetailModal } from './HouseDetailModal';
import { RoommateDetailModal } from './RoommateDetailModal';
import { AdminHousingModal } from './AdminHousingModal';

interface HousesViewProps {
  onStartChat?: (agent: { uid: string; name: string; phone?: string; photo?: string }) => void;
}

export const HousesView: React.FC<HousesViewProps> = ({ onStartChat }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  // Sub-tabs: Houses For Rent vs Roommates Needed
  const [subTab, setSubTab] = useState<'houses' | 'roommates'>('houses');

  // Real data state from Firestore
  const [houses, setHouses] = useState<HouseListing[]>([]);
  const [roommates, setRoommates] = useState<RoommateListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isPostHouseOpen, setIsPostHouseOpen] = useState(false);
  const [isPostRoommateOpen, setIsPostRoommateOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<HouseListing | null>(null);
  const [selectedRoommate, setSelectedRoommate] = useState<RoommateListing | null>(null);

  // Favorites tracking
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavorites());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMyListingsOnly, setShowMyListingsOnly] = useState(false);

  // House Filters
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedState, setSelectedState] = useState('All Nigeria');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [bedroomsFilter, setBedroomsFilter] = useState<string>('all');
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Roommate Filters
  const [roommateGenderFilter, setRoommateGenderFilter] = useState('All');
  const [roommateMaxBudget, setRoommateMaxBudget] = useState<number>(2000000);

  // 1. Subscribe to real Firestore data
  useEffect(() => {
    setIsLoading(true);
    const unsubH = subscribeHouses((data) => {
      setHouses(data);
      setIsLoading(false);
    });

    const unsubR = subscribeRoommates((data) => {
      setRoommates(data);
    });

    return () => {
      unsubH();
      unsubR();
    };
  }, []);

  const handleToggleFav = (e: React.MouseEvent, houseId: string) => {
    e.stopPropagation();
    const isNowFav = toggleFavorite(houseId);
    setFavoriteIds(getFavorites());
    showToast(isNowFav ? 'Added to favorites' : 'Removed from favorites', 'info');
  };

  const handleOpenPostHouse = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsPostHouseOpen(true);
  };

  const handleOpenPostRoommate = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsPostRoommateOpen(true);
  };

  // Filter Houses
  const filteredHouses = houses.filter((h) => {
    if (showFavoritesOnly && !favoriteIds.includes(h.id)) return false;
    if (showMyListingsOnly && h.agentUid !== user?.uid) return false;

    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      const match =
        h.title.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedState !== 'All Nigeria' && h.state !== selectedState) {
      return false;
    }

    if (selectedType !== 'All' && h.type !== selectedType) {
      return false;
    }

    if (h.price > maxPrice) {
      return false;
    }

    if (bedroomsFilter !== 'all') {
      const b = Number(bedroomsFilter);
      if (h.bedrooms !== b) return false;
    }

    if (furnishedOnly && !h.furnished) {
      return false;
    }

    if (verifiedOnly && !h.verified) {
      return false;
    }

    return true;
  });

  // Filter Roommates
  const filteredRoommates = roommates.filter((r) => {
    if (showMyListingsOnly && r.posterUid !== user?.uid) return false;

    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      const match =
        r.location.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedState !== 'All Nigeria' && r.state !== selectedState) {
      return false;
    }

    if (roommateGenderFilter !== 'All' && r.genderPref !== roommateGenderFilter && r.genderPref !== 'Any') {
      return false;
    }

    if (r.budget > roommateMaxBudget) {
      return false;
    }

    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & Sub-Tabs Navigation */}
      <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#075E54] rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-gray-950 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Africa Chat Real Housing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Houses For Rent & Roommates
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mt-1">
              Connect directly with genuine agents, landlords & fellow room-seekers with zero middleman fraud.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenPostHouse}
              className="px-4 py-2.5 rounded-2xl bg-white text-[#075E54] hover:bg-emerald-50 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#075E54]" />
              <span>➕ Post House</span>
            </button>
            <button
              onClick={handleOpenPostRoommate}
              className="px-4 py-2.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-950/80 text-white text-xs font-black border border-emerald-400/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>➕ Find Roommate</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              title="Admin Moderation & Verification"
              className="p-2.5 rounded-2xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* 2 Sub-Tabs: Houses For Rent | Roommates Needed */}
        <div className="mt-5 pt-4 border-t border-emerald-600/60 flex items-center justify-between gap-2">
          <div className="flex items-center bg-black/25 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setSubTab('houses')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                subTab === 'houses'
                  ? 'bg-white text-[#075E54] shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>🏠 Houses For Rent ({houses.length})</span>
            </button>
            <button
              onClick={() => setSubTab('roommates')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                subTab === 'roommates'
                  ? 'bg-white text-[#075E54] shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Roommates Needed ({roommates.length})</span>
            </button>
          </div>

          {/* Quick filter pills */}
          <div className="hidden sm:flex items-center gap-2">
            {subTab === 'houses' && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showFavoritesOnly
                    ? 'bg-red-500 text-white'
                    : 'bg-black/20 text-emerald-100 hover:bg-black/30'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span>Favorites ({favoriteIds.length})</span>
              </button>
            )}
            {user && (
              <button
                onClick={() => setShowMyListingsOnly(!showMyListingsOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showMyListingsOnly
                    ? 'bg-amber-400 text-gray-950'
                    : 'bg-black/20 text-emerald-100 hover:bg-black/30'
                }`}
              >
                <span>My Listings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Search & Filter Bar */}
      <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Location / Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder={
                subTab === 'houses'
                  ? 'Search area, city or house type (e.g. Wuse 2, Wukari, 2-Bed)...'
                  : 'Search location or campus area for roommates...'
              }
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-[#2A2A2A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-[#0A0A0A] text-white placeholder-gray-500 outline-hidden"
            />
            {searchLocation && (
              <button
                onClick={() => setSearchLocation('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* State Selector */}
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-2xl border border-[#2A2A2A] focus:border-[#10B981] bg-[#0A0A0A] text-white outline-hidden cursor-pointer"
            >
              {POPULAR_NIGERIAN_STATES.map((st) => (
                <option key={st} value={st} className="bg-[#151515] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle advanced filter button */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              isFilterDrawerOpen || verifiedOnly || furnishedOnly || selectedType !== 'All'
                ? 'bg-[#10B981]/20 border-emerald-500 text-emerald-400'
                : 'border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(verifiedOnly || furnishedOnly || selectedType !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            )}
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {isFilterDrawerOpen && (
          <div className="pt-3 border-t border-[#2A2A2A] grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0A0A0A] p-3.5 rounded-2xl border border-[#2A2A2A]">
            {subTab === 'houses' ? (
              <>
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Property Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white"
                  >
                    <option value="All">All Types</option>
                    {HOUSE_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-[#151515] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={bedroomsFilter}
                    onChange={(e) => setBedroomsFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white"
                  >
                    <option value="all">Any Bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-300 mb-1">
                    <span>Max Price:</span>
                    <span className="text-[#10B981]">₦{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="50000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#10B981] cursor-pointer"
                  />
                </div>

                <div className="flex flex-col justify-end gap-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={furnishedOnly}
                      onChange={(e) => setFurnishedOnly(e.target.checked)}
                      className="rounded-sm text-[#10B981] accent-[#10B981]"
                    />
                    <span>Furnished Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded-sm text-[#10B981] accent-[#10B981]"
                    />
                    <span>Verified Agents Only</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Gender Preference
                  </label>
                  <select
                    value={roommateGenderFilter}
                    onChange={(e) => setRoommateGenderFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white"
                  >
                    <option value="All">All Genders</option>
                    <option value="Female">Female Only</option>
                    <option value="Male">Male Only</option>
                    <option value="Any">Open to Any</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-300 mb-1">
                    <span>Budget / Person:</span>
                    <span className="text-[#10B981]">₦{roommateMaxBudget.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="2000000"
                    step="20000"
                    value={roommateMaxBudget}
                    onChange={(e) => setRoommateMaxBudget(Number(e.target.value))}
                    className="w-full accent-[#10B981] cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Listing Content: Houses vs Roommates */}
      {subTab === 'houses' ? (
        <div>
          {filteredHouses.length === 0 ? (
            <div className="bg-[#151515] rounded-3xl border border-dashed border-[#2A2A2A] p-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981] flex items-center justify-center mx-auto">
                <Home className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-black text-white">
                {houses.length === 0
                  ? 'No houses yet - Be the first agent to post!'
                  : 'No properties found matching your filter'}
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {houses.length === 0
                  ? 'Genuine properties uploaded by verified landlords and agents will appear here in real time.'
                  : 'Try adjusting your location search or price range to discover more listings.'}
              </p>
              <button
                onClick={handleOpenPostHouse}
                className="px-5 py-2.5 rounded-2xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-black shadow-md inline-flex items-center gap-2 cursor-pointer transition-all border border-emerald-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post A House For Rent</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHouses.map((house) => {
                const isFav = favoriteIds.includes(house.id);
                const hasPhotos = house.photos && house.photos.length > 0;
                const coverPhoto = hasPhotos ? house.photos[0] : null;

                // WhatsApp link
                const cleanPhone = house.agentPhone.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('0')
                  ? '234' + cleanPhone.slice(1)
                  : cleanPhone.startsWith('234')
                  ? cleanPhone
                  : '234' + cleanPhone;
                const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                  `Hi, I saw your listing for "${house.title}" on Africa Chat Housing. Is it still available?`
                )}`;

                return (
                  <div
                    key={house.id}
                    onClick={() => setSelectedHouse(house)}
                    className="bg-[#151515] rounded-3xl border border-[#2A2A2A] hover:border-[#10B981] transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col cursor-pointer group text-[#EDEDED]"
                  >
                    {/* Cover Photo & Badges */}
                    <div className="relative aspect-16/10 bg-[#0A0A0A] overflow-hidden">
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt={house.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#0A0A0A]">
                          <Home className="w-10 h-10 stroke-[1.5]" />
                          <span className="text-[10px] mt-1">Photo pending</span>
                        </div>
                      )}

                      {/* Photo count badge */}
                      {hasPhotos && (
                        <div className="absolute bottom-2 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-[#2A2A2A]">
                          <Camera className="w-3 h-3" />
                          <span>📸 {house.photos.length} photo{house.photos.length > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {/* House Type Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-[#008751] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-xs">
                          {house.type}
                        </span>
                      </div>

                      {/* Verified Badge */}
                      {house.verified && (
                        <div className="absolute top-2.5 right-11">
                          <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFav(e, house.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#151515]/90 hover:bg-[#2A2A2A] text-gray-300 flex items-center justify-center shadow-md transition-colors cursor-pointer border border-[#2A2A2A]"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'
                          }`}
                        />
                      </button>

                      {/* Rented Out Overlay */}
                      {house.status === 'rented' && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                          <span className="bg-amber-400 text-black text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider">
                            Rented Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Price in Green */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-black text-[#10B981]">
                            ₦{house.price.toLocaleString()}
                            <span className="text-xs font-medium text-gray-400">
                              /{house.pricePer}
                            </span>
                          </span>
                          <span className="text-[11px] text-gray-400 capitalize">
                            {house.furnished ? 'Furnished' : 'Unfurnished'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-bold text-white line-clamp-1 mt-1 group-hover:text-[#10B981] transition-colors">
                          {house.title}
                        </h3>

                        {/* Location with Pin */}
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1 line-clamp-1">
                          <MapPin className="w-3 h-3 text-[#10B981] shrink-0" />
                          <span className="truncate">{house.location}</span>
                        </div>

                        {/* Bed / Bath count icons */}
                        <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-gray-300 bg-[#0A0A0A] py-1.5 px-2.5 rounded-xl border border-[#2A2A2A]">
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-[#10B981]" />
                            {house.bedrooms} Bed
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5 text-[#10B981]" />
                            {house.bathrooms} Bath
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-emerald-400">
                            {house.available ? 'Ready' : 'Occupied'}
                          </span>
                        </div>

                        {/* Facilities preview (first 3 chips) */}
                        {house.facilities && house.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {house.facilities.slice(0, 3).map((f) => (
                              <span
                                key={f}
                                className="text-[10px] bg-[#0A0A0A] text-emerald-400 border border-[#2A2A2A] px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]"
                              >
                                {f}
                              </span>
                            ))}
                            {house.facilities.length > 3 && (
                              <span className="text-[10px] text-gray-500 self-center">
                                +{house.facilities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Agent Info & Quick Action Buttons */}
                      <div className="pt-2.5 border-t border-[#2A2A2A] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-medium truncate max-w-[150px]">
                            Agent: <strong className="text-white">{house.agentName}</strong>
                          </span>
                          <span className="text-gray-500 text-[10px]">{house.agentPhone}</span>
                        </div>

                        {/* Quick action buttons: Call, WhatsApp, Chat */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <a
                            href={`tel:${house.agentPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 rounded-xl bg-[#0A0A0A] hover:bg-[#2A2A2A] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                          >
                            <Phone className="w-3 h-3 text-[#10B981]" />
                            <span>Call</span>
                          </a>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStartChat) {
                                onStartChat({
                                  uid: house.agentUid,
                                  name: house.agentName,
                                  phone: house.agentPhone,
                                  photo: house.agentPhoto,
                                });
                              }
                            }}
                            className="py-1.5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer border border-emerald-600/30"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Roommates Feed */
        <div>
          {filteredRoommates.length === 0 ? (
            <div className="bg-[#151515] rounded-3xl border border-dashed border-[#2A2A2A] p-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981] flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-black text-white">
                {roommates.length === 0
                  ? 'No roommate requests yet - Be the first to post!'
                  : 'No roommates found matching your criteria'}
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Looking to split rent or have an extra room in your flat? Post your roommate requirement now.
              </p>
              <button
                onClick={handleOpenPostRoommate}
                className="px-5 py-2.5 rounded-2xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-black shadow-md inline-flex items-center gap-2 cursor-pointer transition-all border border-emerald-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Roommate Request</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoommates.map((item) => {
                const hasPhoto = item.photos && item.photos.length > 0;
                const cleanPhone = item.posterPhone.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('0')
                  ? '234' + cleanPhone.slice(1)
                  : cleanPhone.startsWith('234')
                  ? cleanPhone
                  : '234' + cleanPhone;
                const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                  `Hi ${item.posterName}, I saw your Roommate post on Africa Chat Housing (Budget ₦${item.budget.toLocaleString()} in ${item.location}). Can we chat about sharing?`
                )}`;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRoommate(item)}
                    className="bg-[#151515] rounded-3xl border border-[#2A2A2A] hover:border-[#10B981] transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col cursor-pointer group text-[#EDEDED]"
                  >
                    {/* Room Photo / Graphic */}
                    <div className="relative aspect-16/10 bg-[#0A0A0A] overflow-hidden">
                      {hasPhoto ? (
                        <img
                          src={item.photos[0]}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#0A0A0A]">
                          <Users className="w-10 h-10 stroke-[1.5] text-emerald-600/50" />
                          <span className="text-[10px] text-gray-400 mt-1">Roommate Search</span>
                        </div>
                      )}

                      {/* Gender Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-[#008751] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-xs">
                          {item.genderPref === 'Any' ? 'Any Gender' : `${item.genderPref} Roommate`}
                        </span>
                      </div>

                      {/* Looking For */}
                      <div className="absolute bottom-2 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#2A2A2A]">
                        Seeking {item.lookingFor}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Budget */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-black text-[#10B981]">
                            ₦{item.budget.toLocaleString()}
                            <span className="text-xs font-medium text-gray-400"> /person</span>
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Move-in: {item.moveInDate}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1 line-clamp-1">
                          <MapPin className="w-3 h-3 text-[#10B981] shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>

                        {/* Room Type */}
                        <div className="text-[11px] text-gray-400 mt-1">
                          Room: <strong className="text-white">{item.roomType}</strong>
                        </div>

                        {/* About Me preview */}
                        {item.aboutMe && (
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-2 bg-[#0A0A0A] p-2 rounded-xl border border-[#2A2A2A]">
                            "{item.aboutMe}"
                          </p>
                        )}
                      </div>

                      {/* Poster Info & Connect buttons */}
                      <div className="pt-2.5 border-t border-[#2A2A2A] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-gray-300 truncate">
                            {item.posterName}
                          </span>
                          <span className="text-gray-500 text-[10px]">{item.posterPhone}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <a
                            href={`tel:${item.posterPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 rounded-xl bg-[#0A0A0A] hover:bg-[#2A2A2A] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                          >
                            <Phone className="w-3 h-3 text-[#10B981]" />
                            <span>Call</span>
                          </a>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStartChat) {
                                onStartChat({
                                  uid: item.posterUid,
                                  name: item.posterName,
                                  phone: item.posterPhone,
                                });
                              }
                            }}
                            className="py-1.5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer border border-emerald-600/30"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Post House Modal */}
      <PostHouseModal
        isOpen={isPostHouseOpen}
        onClose={() => setIsPostHouseOpen(false)}
      />

      {/* Post Roommate Modal */}
      <PostRoommateModal
        isOpen={isPostRoommateOpen}
        onClose={() => setIsPostRoommateOpen(false)}
      />

      {/* House Detail Modal */}
      <HouseDetailModal
        house={selectedHouse}
        isOpen={Boolean(selectedHouse)}
        onClose={() => setSelectedHouse(null)}
        onStartChat={onStartChat}
      />

      {/* Roommate Detail Modal */}
      <RoommateDetailModal
        roommate={selectedRoommate}
        isOpen={Boolean(selectedRoommate)}
        onClose={() => setSelectedRoommate(null)}
        onStartChat={onStartChat}
      />

      {/* Admin Housing Modal */}
      <AdminHousingModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
};
