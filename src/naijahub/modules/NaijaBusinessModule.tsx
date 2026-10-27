import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { BusinessProfile, BusinessProduct, BusinessReview } from '../types';
import { 
  Store, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Star, 
  ChevronRight, 
  Tag, 
  Layers, 
  X,
  ExternalLink,
  Plus
} from 'lucide-react';

interface Props {
  selectedState: string;
  searchQuery: string;
  onOpenAuth: () => void;
  userCoords: { lat: number; lng: number } | null;
  haversineDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export const NaijaBusinessModule: React.FC<Props> = ({
  selectedState,
  searchQuery,
  onOpenAuth,
  userCoords,
  haversineDistance
}) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, BusinessProduct[]>>({});
  const [reviewsMap, setReviewsMap] = useState<Record<string, BusinessReview[]>>({});
  const [loading, setLoading] = useState(true);

  // Selected Business for Detail Showcase
  const [activeBusiness, setActiveBusiness] = useState<BusinessProfile | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 1. Live subscribe to businessProfiles
  useEffect(() => {
    const busRef = collection(db, 'businessProfiles');
    const q = query(busRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: BusinessProfile[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as BusinessProfile);
        });
        setBusinesses(list);
        setLoading(false);
      },
      (err) => {
        console.warn('businessProfiles live query note:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Live subscribe to productListings
  useEffect(() => {
    const prodRef = collection(db, 'productListings');
    const unsubscribe = onSnapshot(prodRef, (snapshot) => {
      const map: Record<string, BusinessProduct[]> = {};
      snapshot.forEach((d) => {
        const p = { id: d.id, ...d.data() } as BusinessProduct;
        if (!map[p.businessId]) map[p.businessId] = [];
        map[p.businessId].push(p);
      });
      setProductsMap(map);
    });
    return () => unsubscribe();
  }, []);

  // Check if business is currently open in Africa/Lagos (UTC+1)
  const isBusinessOpenNow = (openTime?: string, closeTime?: string) => {
    if (!openTime || !closeTime) return true; // default open
    try {
      const lagosNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
      const currentMinutes = lagosNow.getHours() * 60 + lagosNow.getMinutes();

      const [oH, oM] = openTime.split(':').map(Number);
      const [cH, cM] = closeTime.split(':').map(Number);
      const openMinutes = oH * 60 + (oM || 0);
      const closeMinutes = cH * 60 + (cM || 0);

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } catch {
      return true;
    }
  };

  // WhatsApp click handler with prefilled text
  const getWhatsAppUrl = (phone: string, bName: string, itemTitle?: string) => {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const intl = cleanDigits.startsWith('0') 
      ? '234' + cleanDigits.slice(1) 
      : cleanDigits.startsWith('234') 
      ? cleanDigits 
      : '234' + cleanDigits;
    const msg = encodeURIComponent(
      `Hello ${bName}, I saw your listing on NaijaHub Africa and I am interested in ${itemTitle ? `your product "${itemTitle}"` : 'your business offerings'}.`
    );
    return `https://wa.me/${intl}?text=${msg}`;
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness || !reviewComment.trim()) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    setIsSubmittingReview(true);
    try {
      const revRef = collection(db, 'businessProfiles', activeBusiness.id, 'reviews');
      await addDoc(revRef, {
        businessId: activeBusiness.id,
        authorName: user.displayName || user.email?.split('@')[0] || 'Verified Buyer',
        authorUid: user.uid,
        rating: reviewRating,
        comment: reviewComment.trim(),
        isVerifiedBuyer: true,
        createdAt: serverTimestamp(),
      });

      setReviewComment('');
      setIsReviewModalOpen(false);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filtering
  const filteredBusinesses = businesses.filter((b) => {
    const matchState = selectedState === 'All Nigeria' || b.state?.toLowerCase() === selectedState.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !query ||
      b.name?.toLowerCase().includes(query) ||
      b.category?.toLowerCase().includes(query) ||
      b.description?.toLowerCase().includes(query) ||
      b.address?.toLowerCase().includes(query);
    return matchState && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Subhead Banner */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#075B43] text-xs font-black mb-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0D9B72]" />
            <span>NaijaBusiness Enterprise Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            Verified African Businesses & Stores
          </h2>
          <p className="text-xs text-gray-500">
            Browse CAC-registered SMEs, real opening hours, product catalogues, and direct WhatsApp trade.
          </p>
        </div>
        <div className="text-xs font-bold text-gray-500 bg-[#F8F7F2] px-4 py-2 rounded-2xl border border-gray-200/60 self-start sm:self-auto">
          Showing <span className="text-[#075B43] font-black">{filteredBusinesses.length}</span> Businesses
        </div>
      </div>

      {/* Grid of Business Cards */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 shadow-xs">
          <Store className="w-12 h-12 text-[#0D9B72] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-black text-gray-900 mb-1">No businesses found in this selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
            Be the first enterprise to register your store or business in {selectedState}. No fees to list!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredBusinesses.map((b) => {
            const isOpen = isBusinessOpenNow(b.openTime, b.closeTime);
            const prods = productsMap[b.id] || [];
            const waUrl = getWhatsAppUrl(b.whatsapp || b.phone || '08167258121', b.name);

            // Haversine distance
            let distKm: number | null = null;
            if (userCoords && b.lat && b.lng) {
              distKm = haversineDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
            }

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden hover:border-[#0D9B72] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Banner/Category */}
                  <div className="h-28 bg-gradient-to-br from-[#075B43] to-[#0D9B72] p-4 relative flex items-start justify-between text-white">
                    <span className="px-2.5 py-1 bg-black/30 backdrop-blur-xs rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {b.category || 'Retail & Trade'}
                    </span>

                    {/* Open/Closed status pill */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs ${
                          isOpen ? 'bg-emerald-400 text-emerald-950' : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>

                    {distKm !== null && (
                      <span className="absolute bottom-2 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-xs text-[10px] text-amber-300 font-bold rounded-lg">
                        {distKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  {/* Business Information */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-base text-[#17231F] group-hover:text-[#075B43] transition-colors leading-tight">
                          {b.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{b.address || `${b.state}, Nigeria`}</span>
                        </p>
                      </div>

                      {/* Verified Badge */}
                      {b.verifiedType === 'cac' ? (
                        <div
                          title="CAC Verified Enterprise"
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-[#17231F] text-[10px] font-black shrink-0"
                        >
                          <span className="text-[#F5B942]">✓</span>
                          <span>CAC Verified</span>
                        </div>
                      ) : (
                        <div
                          title="Community Verified"
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#075B43] text-[10px] font-black shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#0D9B72]" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {b.description || 'Quality African goods, reliable customer service, and fast nationwide delivery.'}
                    </p>

                    {/* Operating hours & Rating */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{b.openTime || '08:00'} - {b.closeTime || '18:00'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#17231F] font-black">
                        <Star className="w-3.5 h-3.5 fill-[#F5B942] text-[#F5B942]" />
                        <span>{b.rating ? b.rating.toFixed(1) : '5.0'}</span>
                        <span className="text-gray-400 font-normal">({b.reviewCount || 12})</span>
                      </div>
                    </div>

                    {/* Products Sneak Peek */}
                    {prods.length > 0 && (
                      <div className="bg-[#F8F7F2] p-2.5 rounded-2xl border border-gray-200/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#0D9B72]" /> Featured Products
                          </span>
                          <span className="text-[10px] text-gray-500">{prods.length} in catalogue</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {prods.slice(0, 3).map((p) => (
                            <div
                              key={p.id}
                              className="bg-white border border-gray-200 rounded-xl p-1.5 shrink-0 w-28 text-left"
                            >
                              <p className="text-[10px] font-bold text-gray-900 truncate">{p.title}</p>
                              <p className="text-[11px] font-black text-[#075B43]">
                                ₦{Number(p.price).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveBusiness(b)}
                    className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>View Store</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black transition-all shadow-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Business Details Showcase Modal */}
      {activeBusiness && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="bg-[#075B43] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg">{activeBusiness.name}</h3>
                  {activeBusiness.verifiedType === 'cac' && (
                    <span className="px-2 py-0.5 bg-[#F5B942] text-gray-950 font-black text-[10px] rounded-lg">
                      CAC Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeBusiness.address || activeBusiness.state}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveBusiness(null)}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#FBFBFA]">
              {/* About Section */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">About Business</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{activeBusiness.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <span>
                    ⏰ Hours: <strong className="text-gray-900">{activeBusiness.openTime} - {activeBusiness.closeTime}</strong>
                  </span>
                  <span>
                    📍 State: <strong className="text-gray-900">{activeBusiness.state}</strong>
                  </span>
                </div>
              </div>

              {/* Product Showcase Under Business */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Product Catalogue ({(productsMap[activeBusiness.id] || []).length})
                  </h4>
                </div>

                {(productsMap[activeBusiness.id] || []).length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-gray-400">
                    <p className="text-xs">No individual products listed yet. Contact business on WhatsApp directly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productsMap[activeBusiness.id].map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-xs text-gray-900">{prod.title}</h5>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              prod.stockStatus === 'In Stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prod.stockStatus === 'Pre-order'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {prod.stockStatus}
                          </span>
                        </div>
                        <p className="font-black text-sm text-[#075B43]">
                          ₦{Number(prod.price).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{prod.description}</p>
                        <a
                          href={getWhatsAppUrl(
                            activeBusiness.whatsapp || activeBusiness.phone || '08167258121',
                            activeBusiness.name,
                            prod.title
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Buy via WhatsApp</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Section */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Customer Reviews</h4>
                  <button
                    onClick={() => {
                      if (!user) {
                        onOpenAuth();
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#075B43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Write Review
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  ⭐ Rated <strong>{activeBusiness.rating ? activeBusiness.rating.toFixed(1) : '5.0'} / 5.0</strong> by verified buyers across Nigeria.
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
              <a
                href={getWhatsAppUrl(activeBusiness.whatsapp || activeBusiness.phone || '08167258121', activeBusiness.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Directly on WhatsApp</span>
              </a>
              <a
                href={`tel:${activeBusiness.phone || '08167258121'}`}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call Phone</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && activeBusiness && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="font-black text-sm text-gray-900 mb-1">Write a Review for {activeBusiness.name}</h4>
            <p className="text-xs text-gray-500 mb-4">Share your trade experience with the community.</p>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-[#F5B942] text-[#F5B942]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review Details</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Prompt delivery, high quality fabric, and accurate description."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs"
                >
                  {isSubmittingReview ? 'Publishing...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
