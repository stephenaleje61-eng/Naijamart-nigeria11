import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Search, 
  PlusCircle, 
  Phone, 
  MessageSquare, 
  ShoppingBag, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Heart, 
  MoreVertical, 
  Star, 
  ShieldCheck, 
  Flag, 
  MapPin, 
  Tag, 
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  X,
  ShieldAlert
} from "lucide-react";
import { SafeImage } from "./SafeImage";
import { WelcomeAnnouncementMarquee } from "./WelcomeAnnouncement";
import { sanitizeStoredProductImages, getCategoryFallback } from "../utils/imageUtils";
import { isProductSaved, toggleSavedProduct } from "../services/favoritesService";
import { getSellerReputation } from "../services/reputationService";
import { ReportProductModal } from "./ReportProductModal";
import { RateSellerModal } from "./RateSellerModal";
import { ProductDetailsModal } from "./ProductDetailsModal";
import { useToast } from "../context/ToastContext";
import { useMessaging } from "../context/MessagingContext";
import { formatNaira } from "../utils/formatters";

export const FUW_LOCATIONS = [
  'All',
  'Rafin Kada',
  'Behind School',
  'Wukari Town'
] as const;

export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_5k', label: 'Under ₦5k' },
  { id: '5k_20k', label: '₦5k - ₦20k' },
  { id: '20k_50k', label: '₦20k - ₦50k' },
  { id: 'above_50k', label: 'Above ₦50k' },
] as const;

export default function MarketPage({ onNavigate }: any) {
  const { showToast } = useToast();
  const { openChatWithSeller } = useMessaging();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modals state
  const [reportingProduct, setReportingProduct] = useState<any | null>(null);
  const [ratingProduct, setRatingProduct] = useState<any | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Update saved state across changes
  useEffect(() => {
    const handleSavedChange = () => {
      // triggers re-render
      setSavedIds([...(JSON.parse(localStorage.getItem('naijamart_saved_products') || '[]'))]);
    };
    handleSavedChange();
    window.addEventListener('savedProductsChanged', handleSavedChange);
    return () => window.removeEventListener('savedProductsChanged', handleSavedChange);
  }, []);

  // Timer to guarantee "Checking database..." shows during first 3 seconds instead of flash empty
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadLocalProducts = () => {
      try {
        const myItems = JSON.parse(localStorage.getItem("my_products") || "[]");
        const cachedItems = JSON.parse(localStorage.getItem("cached_products") || "[]");
        return [...myItems, ...cachedItems];
      } catch (err) {
        console.warn("Local products load error:", err);
        return [];
      }
    };

    const processAndSet = (firestoreItems: any[]) => {
      const local = loadLocalProducts();
      const combined = [...local, ...firestoreItems];

      // Remove duplicates by ID
      const uniqueMap = new Map();
      for (const item of combined) {
        if (item && item.id) {
          uniqueMap.set(item.id, item);
        }
      }
      let unique = Array.from(uniqueMap.values());

      // Auto-seed test product if empty so user NEVER sees blank screen
      if (unique.length === 0) {
        const seedProduct = {
          id: "prod_live_seed_001",
          title: "Test Product - FU MARKET Live",
          price: 5000,
          category: "Phones & Tablets",
          condition: "New",
          state: "FUWukari",
          location: "Rafin Kada, FUWukari",
          description: "Official FU MARKET Live Item. Verified seller and active campus listing.",
          phone: "+2348167258121",
          ownerPhone: "+2348167258121",
          phoneNumber: "+2348167258121",
          whatsappNumber: "+2348167258121",
          images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02526?w=600&auto=format&fit=crop&q=80"],
          imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02526?w=600&auto=format&fit=crop&q=80",
          coverImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02526?w=600&auto=format&fit=crop&q=80",
          userId: "stephenaleje61",
          username: "stephenaleje61",
          sellerName: "stephenaleje61",
          ownerUid: "stephenaleje61",
          status: "approved",
          isApproved: true,
          active: true,
          createdAt: new Date().toISOString()
        };
        unique = [seedProduct];
        try {
          localStorage.setItem("my_products", JSON.stringify([seedProduct]));
          localStorage.setItem("cached_products", JSON.stringify([seedProduct]));
          addDoc(collection(db, "products"), {
            ...seedProduct,
            createdAt: serverTimestamp()
          }).catch(err => console.log("Background seed notice:", err));
        } catch (e) {
          console.warn("LocalStorage seed notice:", e);
        }
      }

      // Hardcoded priority: stephenaleje61 products show at the very top!
      unique.sort((a: any, b: any) => {
        const isAStephen = 
          a.userId === "stephenaleje61" || 
          a.username === "stephenaleje61" || 
          a.sellerName === "stephenaleje61" || 
          a.ownerUid === "stephenaleje61";
        const isBStephen = 
          b.userId === "stephenaleje61" || 
          b.username === "stephenaleje61" || 
          b.sellerName === "stephenaleje61" || 
          b.ownerUid === "stephenaleje61";

        if (isAStephen && !isBStephen) return -1;
        if (!isAStephen && isBStephen) return 1;

        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setProducts(unique);
      setIsInitialLoading(false);
    };

    let unsubSecondary: any = null;

    const primaryQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubPrimary = onSnapshot(
      primaryQuery,
      (snapshot) => {
        const firestoreList: any[] = [];
        snapshot.forEach((doc) => {
          firestoreList.push({ id: doc.id, ...doc.data() });
        });
        processAndSet(firestoreList);
      },
      (primaryErr) => {
        console.warn("Primary query with orderBy failed, attempting secondary without orderBy:", primaryErr);
        const secondaryQuery = collection(db, "products");
        unsubSecondary = onSnapshot(
          secondaryQuery,
          (snapshot) => {
            const firestoreList: any[] = [];
            snapshot.forEach((doc) => {
              firestoreList.push({ id: doc.id, ...doc.data() });
            });
            processAndSet(firestoreList);
          },
          (secErr) => {
            console.warn("Secondary query also failed, using purely local products:", secErr);
            processAndSet([]);
          }
        );
      }
    );

    const handleLocalProductEvent = (e: any) => {
      if (e?.detail) {
        setProducts(prev => {
          const updated = [e.detail, ...prev.filter(p => p.id !== e.detail.id)];
          return updated;
        });
        setIsInitialLoading(false);
      }
    };
    window.addEventListener("localProductAdded", handleLocalProductEvent);

    return () => {
      unsubPrimary();
      if (unsubSecondary) unsubSecondary();
      window.removeEventListener("localProductAdded", handleLocalProductEvent);
    };
  }, []);

  const categories = ["All", "Phones & Tablets", "Fashion", "Electronics", "Hostels", "Okada"];

  // Filter products by Search, Category, Price Range, and Campus Location simultaneously
  const filtered = products.filter(p => {
    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const locMatch = p.location?.toLowerCase().includes(q);
      const sellerMatch = p.sellerName?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !locMatch && !sellerMatch) return false;
    }

    // 2. Category
    if (selectedCategory !== "All") {
      const catMatch = !p.category || p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.title?.toLowerCase().includes(selectedCategory.toLowerCase());
      if (!catMatch) return false;
    }

    // 3. Price Filter
    const price = Number(p.price || 0);
    if (priceFilter === 'under_5k' && price >= 5000) return false;
    if (priceFilter === '5k_20k' && (price < 5000 || price > 20000)) return false;
    if (priceFilter === '20k_50k' && (price < 20000 || price > 50000)) return false;
    if (priceFilter === 'above_50k' && price <= 50000) return false;

    // 4. Location Filter (Rafin Kada, Behind School, Wukari Town)
    if (locationFilter !== "All") {
      const itemLoc = (p.location || p.state || '').toLowerCase();
      const targetLoc = locationFilter.toLowerCase();
      if (!itemLoc.includes(targetLoc)) return false;
    }

    return true;
  });

  const hasActiveFilters = selectedCategory !== 'All' || priceFilter !== 'all' || locationFilter !== 'All' || search.trim() !== '';

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setPriceFilter('all');
    setLocationFilter('All');
    setSearch('');
  };

  const handleToggleSave = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const isSaved = await toggleSavedProduct(productId);
    showToast(isSaved ? 'Saved to your Wishlist ❤️' : 'Removed from Saved items', isSaved ? 'success' : 'info');
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-6 pb-16">
      {/* Continuous Scrolling Announcement Banner */}
      <WelcomeAnnouncementMarquee />

      {/* Top Welcome & Buyer Safety Banner */}
      <div className="bg-gradient-to-r from-[#075B43] via-[#0B8751] to-[#151515] text-white rounded-3xl p-5 sm:p-8 shadow-md border border-[#2A2A2A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-black/40 border border-white/10 text-emerald-300 rounded-full text-xs font-black mb-2 uppercase tracking-wide">
              Buy. Sell. Connect.
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
              WELCOME TO FU MARKET
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1">
              Buy. Sell. Connect. Phones, Hostels, Okada & Gadgets across Rafin Kada, Behind School & Wukari Town
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate?.("saved")}
              className="px-4 py-2.5 bg-[#151515] hover:bg-[#2A2A2A] text-red-400 font-bold text-xs rounded-2xl border border-[#2A2A2A] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>Saved ❤️</span>
            </button>
            <button 
              onClick={() => onNavigate("sell")} 
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-gray-950 font-black text-xs rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border border-white/20"
            >
              <PlusCircle className="w-4 h-4 text-gray-950" />
              <span>+ Post Product</span>
            </button>
          </div>
        </div>

        {/* Important Buyer Safety Notice */}
        <div className="bg-black/45 border border-amber-400/50 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase leading-snug">
              MAKE SURE YOU SEE YOUR GOODS BEFORE MAKING PAYMENT.
            </p>
            <p className="text-[11px] sm:text-xs text-gray-200 leading-relaxed">
              Always inspect your goods and confirm that the product meets your expectations before completing payment. Be careful when dealing with unknown sellers.
            </p>
          </div>
        </div>
      </div>

      {/* Wanted Board Banner Direct Hook */}
      <div 
        onClick={() => onNavigate?.("wanted")}
        className="bg-gradient-to-r from-emerald-950/80 via-[#151515] to-[#151515] border border-emerald-500/40 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-[#10B981] transition-all shadow-xs group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0B8751] text-white flex items-center justify-center text-xl shrink-0 font-black shadow-xs">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0B8751] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                New Feature
              </span>
              <span className="text-xs font-bold text-gray-300">
                Can't find what you're looking for?
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[#10B981] transition-colors mt-0.5">
              FUWUKARI Wanted Board — Post What You Need & Get Sellers on WhatsApp
            </h3>
          </div>
        </div>

        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-gray-950 text-xs font-black shrink-0 shadow-sm"
        >
          <span>Open Wanted Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar & Categories */}
      <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search phones, clothes, okada, hostels in FUWukari..."
            className="w-full pl-11 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-sm font-medium text-white placeholder-gray-500 focus:outline-hidden focus:border-[#0B8751] focus:ring-1 focus:ring-[#0B8751] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 1. PRICE FILTER BAR (Required: All, Under ₦5k, ₦5k - ₦20k, ₦20k - ₦50k, Above ₦50k) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Price Filter:</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#10B981] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => setPriceFilter(range.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  priceFilter === range.id
                    ? "bg-[#0B8751] text-white shadow-xs font-black"
                    : "bg-[#0A0A0A] border border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. LOCATION FILTER BAR (Required: All, Rafin Kada, Behind School, Wukari Town) */}
        <div>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Campus Location Filter:</span>
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FUW_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  locationFilter === loc
                    ? "bg-[#075E54] text-white shadow-xs font-black border border-emerald-400/30"
                    : "bg-[#0A0A0A] border border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                }`}
              >
                {loc === 'All' ? 'All Locations' : loc}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white text-gray-950 font-black shadow-xs"
                    : "bg-[#0A0A0A] border border-[#2A2A2A] text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Active Filter Indicator */}
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-gray-400">
        <span className="font-bold text-gray-300">
          Showing <span className="text-[#10B981] font-black">{filtered.length}</span> goods in FUWukari
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
            Active Filters Applied
          </span>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {isInitialLoading && filtered.length === 0 ? (
          <div className="col-span-full bg-[#151515] rounded-3xl border border-[#2A2A2A] text-center py-12 px-4 shadow-xs">
            <div className="w-12 h-12 border-3 border-[#0B8751] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <h3 className="font-black text-white text-base mb-1">Checking database...</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Connecting to verified campus listings in FUWukari & Nigeria.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full bg-[#151515] rounded-3xl border border-[#2A2A2A] text-center py-12 px-4 shadow-xs">
            <div className="w-16 h-16 bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-black text-white text-base mb-1">
              {hasActiveFilters ? "No products match your filters" : "No products yet - Be first to post"}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              {hasActiveFilters 
                ? "Try clearing your price or location filters to see more student goods."
                : "Post your phone, gadget, fashion, or bedspace and reach verified buyers."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2 border border-emerald-600/40"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate("sell")} 
                className="px-6 py-3 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2 border border-emerald-600/40"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Product</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map((p: any) => {
            const rawPhone = p.ownerPhone || p.phoneNumber || p.whatsappNumber || p.phone || "";
            const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
            const waNumber = cleanDigits.startsWith("0") 
              ? "234" + cleanDigits.slice(1) 
              : cleanDigits.startsWith("234") 
              ? cleanDigits 
              : cleanDigits ? "234" + cleanDigits : "";

            const isStephen = 
              p.userId === "stephenaleje61" || 
              p.username === "stephenaleje61" || 
              p.sellerName === "stephenaleje61" || 
              p.ownerUid === "stephenaleje61";

            const reputation = getSellerReputation(p.userId || p.ownerUid, p.sellerName);
            const isSaved = isProductSaved(p.id);

            return (
              <div 
                key={p.id} 
                onClick={() => setSelectedProductDetails(p)}
                className="bg-[#151515] rounded-2xl border border-[#2A2A2A] hover:border-[#10B981] overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between p-3 relative cursor-pointer group text-[#EDEDED]"
              >
                <div>
                  {/* Photo Container with Heart ❤️ and 3-Dot (...) Menu */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A]/50 mb-2.5">
                    <SafeImage 
                      src={p.images?.[0] || p.imageUrl || p.coverImage} 
                      alt={p.title} 
                      fallbackCategory={p.category}
                      aspectRatio="aspect-square"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Heart ❤️ Button (Turns Red When Clicked) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(e, p.id)}
                      title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
                      className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xs transition-all cursor-pointer border border-white/10 active:scale-90"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isSaved ? 'fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : 'text-white/80 hover:text-red-400'
                        }`}
                      />
                    </button>

                    {/* 3-Dot (...) Menu Button */}
                    <div className="absolute top-2 right-10 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === p.id ? null : p.id);
                        }}
                        title="Options"
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xs text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown for Report / Rate */}
                      {activeMenuId === p.id && (
                        <div 
                          className="absolute right-0 top-8 w-40 bg-[#1E1E1E] border border-[#333] rounded-2xl shadow-2xl py-1 z-30 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setRatingProduct(p);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-bold text-amber-300 hover:bg-[#2A2A2A] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Rate Seller</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setReportingProduct(p);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-bold text-red-400 hover:bg-[#2A2A2A] flex items-center gap-2 cursor-pointer transition-colors border-t border-[#2A2A2A]"
                          >
                            <Flag className="w-3.5 h-3.5 text-red-400" />
                            <span>Report This Post</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      <span className="bg-black/80 border border-white/10 backdrop-blur-xs text-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.condition || "Used"}
                      </span>
                      {isStephen && (
                        <span className="bg-[#0B8751] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-emerald-400/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Admin / Verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Title */}
                  <h3 className="font-bold text-gray-100 text-xs sm:text-sm line-clamp-2 leading-snug mb-1">
                    {p.title}
                  </h3>

                  {/* Price */}
                  <p className="text-[#10B981] font-black text-base sm:text-lg">
                    {formatNaira(p.price)}
                  </p>

                  {/* Seller Rating & Reputation Display (Required) */}
                  <div className="flex items-center justify-between text-[11px] py-1 border-t border-[#2A2A2A]/80 my-1">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{reputation.averageRating} ★</span>
                      <span className="text-gray-400 font-normal text-[10px]">({reputation.totalRatings})</span>
                    </div>

                    {reputation.isVerifiedSeller && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black text-[#10B981] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified Seller</span>
                      </span>
                    )}
                  </div>

                  {/* Location & Area Display */}
                  <p className="text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#10B981] shrink-0" />
                    <span className="truncate">{p.state || p.location || "FUWukari Campus"}</span>
                  </p>
                </div>

                {/* Chat with Seller & Contact Buttons */}
                <div className="pt-2.5 mt-2 border-t border-[#2A2A2A] space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChatWithSeller(p, () => onNavigate?.("messages"));
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
                          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello, I saw your product "${p.title}" on FU MARKET. Is it still available?`)}`} 
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
                          setSelectedProductDetails(p);
                        }}
                        className="col-span-2 py-2 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-300 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                      >
                        <MessageSquare className="w-3 h-3 text-[#10B981]" />
                        <span>View Details</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {reportingProduct && (
        <ReportProductModal
          isOpen={true}
          onClose={() => setReportingProduct(null)}
          productId={reportingProduct.id}
          productTitle={reportingProduct.title}
          sellerId={reportingProduct.userId || reportingProduct.ownerUid}
          sellerName={reportingProduct.sellerName}
        />
      )}

      {ratingProduct && (
        <RateSellerModal
          isOpen={true}
          onClose={() => setRatingProduct(null)}
          sellerId={ratingProduct.userId || ratingProduct.ownerUid || 'seller'}
          sellerName={ratingProduct.sellerName || 'Seller'}
          productId={ratingProduct.id}
          productTitle={ratingProduct.title}
          onRatingSubmitted={() => {
            // refresh
          }}
        />
      )}

      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onSelectRelatedProduct={(rel) => setSelectedProductDetails(rel)}
          allProducts={products}
        />
      )}
    </div>
  );
}

export { MarketPage };
