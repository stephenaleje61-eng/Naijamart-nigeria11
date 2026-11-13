import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Phone, 
  MessageSquare, 
  Trash2, 
  ArrowRight, 
  MapPin, 
  Star, 
  ShieldCheck, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { getSavedProductIds, toggleSavedProduct } from '../services/favoritesService';
import { getSellerReputation } from '../services/reputationService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { formatNaira } from '../utils/formatters';
import { SafeImage } from './SafeImage';
import { useToast } from '../context/ToastContext';
import { useMessaging } from '../context/MessagingContext';

interface SavedProductsPageProps {
  onNavigate: (route: string) => void;
  onSelectProduct?: (product: any) => void;
  onOpenReport?: (product: any) => void;
  onOpenRate?: (product: any) => void;
}

export const SavedProductsPage: React.FC<SavedProductsPageProps> = ({
  onNavigate,
  onSelectProduct,
  onOpenReport,
  onOpenRate
}) => {
  const { showToast } = useToast();
  const { openChatWithSeller } = useMessaging();
  const [savedIds, setSavedIds] = useState<string[]>(getSavedProductIds());
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved products from local storage + firestore products
  const loadProducts = async () => {
    setLoading(true);
    const ids = getSavedProductIds();
    setSavedIds(ids);

    if (ids.length === 0) {
      setSavedProducts([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Gather all local products
      const localMy = JSON.parse(localStorage.getItem('my_products') || '[]');
      const localCached = JSON.parse(localStorage.getItem('cached_products') || '[]');
      const allLocal = [...localMy, ...localCached];

      // 2. Fetch from Firestore collection 'products'
      const snap = await getDocs(collection(db, 'products'));
      const firestoreItems: any[] = [];
      snap.forEach((d) => firestoreItems.push({ id: d.id, ...d.data() }));

      const all = [...allLocal, ...firestoreItems];
      const uniqueMap = new Map();
      for (const item of all) {
        if (item && item.id && ids.includes(item.id)) {
          uniqueMap.set(item.id, item);
        }
      }

      setSavedProducts(Array.from(uniqueMap.values()));
    } catch (err) {
      console.warn('Error loading saved products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleSavedChange = () => {
      loadProducts();
    };

    window.addEventListener('savedProductsChanged', handleSavedChange);
    return () => window.removeEventListener('savedProductsChanged', handleSavedChange);
  }, []);

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSavedProduct(productId);
    showToast('Removed from Saved items', 'info');
    loadProducts();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#151515] rounded-3xl p-5 sm:p-8 text-white shadow-md border border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-red-300 text-xs font-black uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            <span>My Favourites & Wishlist</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            SAVED PRODUCTS ❤️
          </h1>
          <p className="text-xs sm:text-sm text-red-100/90 mt-1 max-w-xl">
            Items you have bookmarked for easy contact with campus sellers. Tap any card to review details or chat directly on WhatsApp.
          </p>
        </div>

        <button
          onClick={() => onNavigate('market')}
          className="px-5 py-3 bg-[#008751] hover:bg-[#007043] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-white/20"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse More Goods</span>
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] text-center py-12 px-4 shadow-xs">
          <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-300">Loading your saved items...</p>
        </div>
      ) : savedProducts.length === 0 ? (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] text-center py-12 px-4 shadow-xs">
          <div className="w-16 h-16 bg-[#0A0A0A] border border-[#2A2A2A] text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8 fill-red-500/20" />
          </div>
          <h3 className="font-black text-white text-base mb-1">
            No saved products yet
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Tap the heart (❤️) icon on any product in the Market to save items you want to buy later.
          </p>
          <button
            onClick={() => onNavigate('market')}
            className="px-6 py-3 bg-[#008751] hover:bg-[#007043] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2 border border-emerald-600/40"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Go to Market</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {savedProducts.map((p) => {
            const rawPhone = p.ownerPhone || p.phoneNumber || p.whatsappNumber || p.phone || '';
            const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
            const waNumber = cleanDigits.startsWith('0')
              ? '234' + cleanDigits.slice(1)
              : cleanDigits.startsWith('234')
              ? cleanDigits
              : cleanDigits ? '234' + cleanDigits : '';

            const reputation = getSellerReputation(p.userId || p.ownerUid, p.sellerName);

            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct && onSelectProduct(p)}
                className="bg-[#151515] rounded-2xl border border-[#2A2A2A] hover:border-red-500/50 p-3.5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group text-[#EDEDED]"
              >
                <div>
                  {/* Photo with Remove Button */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A]/50 mb-2.5">
                    <SafeImage
                      src={p.images?.[0] || p.imageUrl || p.coverImage}
                      alt={p.title}
                      fallbackCategory={p.category}
                      aspectRatio="aspect-square"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Un-favourite button */}
                    <button
                      onClick={(e) => handleRemove(p.id, e)}
                      title="Remove from saved"
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/75 hover:bg-red-600 text-red-500 hover:text-white transition-all shadow-md cursor-pointer border border-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Condition badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/80 border border-white/10 backdrop-blur-xs text-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.condition || 'Used'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-bold text-gray-100 text-xs sm:text-sm line-clamp-2 leading-snug mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[#10B981] font-black text-base sm:text-lg">
                    {formatNaira(p.price)}
                  </p>

                  {/* Location & Seller Rating */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1.5 mt-1 border-t border-[#2A2A2A]">
                    <span className="truncate max-w-[130px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#10B981] shrink-0" />
                      <span className="truncate">{p.state || p.location || 'FUWukari'}</span>
                    </span>

                    {/* Seller Rating Badge */}
                    <div className="flex items-center gap-1 shrink-0 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{reputation.averageRating} ★</span>
                    </div>
                  </div>

                  {/* Seller Verified Badge */}
                  {reputation.isVerifiedSeller && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Campus Seller</span>
                    </div>
                  )}
                </div>

                {/* Chat with Seller & Direct Action Buttons */}
                <div className="pt-3 mt-2 border-t border-[#2A2A2A] space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChatWithSeller(p, () => onNavigate('messages'));
                    }}
                    className="w-full py-2 px-2 bg-[#008751] hover:bg-[#007043] text-white text-[11px] font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs border border-emerald-500/30 cursor-pointer"
                  >
                    <span>💬 Chat with Seller</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {rawPhone ? (
                      <>
                        <a
                          href={`tel:${rawPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="py-2 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-200 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                        >
                          <Phone className="w-3 h-3 text-gray-300" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello, I saved your product "${p.title}" on FU MARKET. Is it still available?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-gray-950 font-black text-[11px] rounded-xl text-center flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3 fill-gray-950 text-gray-950" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectProduct) onSelectProduct(p);
                        }}
                        className="col-span-2 py-2 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-300 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                      >
                        <span>View Details</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
