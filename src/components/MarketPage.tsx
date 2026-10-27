import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Search, PlusCircle, Phone, MessageSquare, ShoppingBag, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function MarketPage({ onNavigate }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Timer to guarantee "Checking database..." shows during first 3 seconds instead of flash empty
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("MarketPage Loaded - initializing dual fallback query for collection 'products'");

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
          title: "Test Product - NaijaMart Live",
          price: 5000,
          category: "Phones & Tablets",
          condition: "New",
          state: "FUWukari",
          location: "FUWukari Campus, Taraba",
          description: "Official NaijaMart Live Item. Verified seller and active campus listing.",
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

        const timeA = a.createdAt?.seconds 
          ? a.createdAt.seconds * 1000 
          : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.seconds 
          ? b.createdAt.seconds * 1000 
          : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      setProducts(unique);
      setIsInitialLoading(false);
    };

    // Immediate initial sync from localStorage
    processAndSet([]);

    let unsubSecondary: (() => void) | null = null;

    // 1. Try first: get all products ordered by createdAt desc (NO WHERE status filter)
    const qOrdered = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubPrimary = onSnapshot(
      qOrdered,
      (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        processAndSet(items);
      },
      (err) => {
        console.warn("Ordered query notice (fallback to plain collection 'products'):", err);
        // 2. Catch: get all products without orderBy (in case index is missing or building)
        const qPlain = collection(db, "products");
        unsubSecondary = onSnapshot(
          qPlain,
          (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            processAndSet(items);
          },
          (err2) => {
            console.warn("Plain query notice (fallback to localStorage products):", err2);
            // 3. Catch both: show products from localStorage if any
            processAndSet([]);
          }
        );
      }
    );

    // Instant cross-component event listener for zero-delay posting
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

  const filtered = products.filter(p => {
    const titleMatch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const catMatch = selectedCategory === "All" || !p.category || p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.title?.toLowerCase().includes(selectedCategory.toLowerCase());
    return titleMatch && catMatch;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#075B43] via-[#0B8751] to-[#151515] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#2A2A2A]">
        <span className="inline-block px-3 py-1 bg-black/40 border border-white/10 text-emerald-300 rounded-full text-xs font-black mb-2 uppercase tracking-wide">
          Verified Campus Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">NAIJAMART MARKET</h1>
        <p className="text-emerald-100/80 text-sm mt-1">Buy and Sell in FUWukari & Nationwide</p>
      </div>

      {/* Debug & Status Bar: "Found X products" badge */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#151515] border border-[#2A2A2A] text-[#10B981] rounded-full text-xs font-black shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span>Found {products.length} products</span>
        </div>

        <button 
          onClick={() => onNavigate("sell")} 
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer border border-emerald-600/40"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Sell Product</span>
        </button>
      </div>

      {/* Free CGPA Calculator Viral Banner */}
      <div 
        onClick={() => {
          if (onNavigate) onNavigate("cgpa-calculator");
          if (typeof window !== 'undefined' && window.history.pushState) {
            window.history.pushState({}, '', '/cgpa-calculator');
          }
        }}
        className="bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-3xl p-4 sm:p-5 text-gray-950 shadow-md flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all border border-amber-300/30"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Viral Student Tool
              </span>
              <span className="text-[11px] font-black text-amber-950 hidden sm:inline">
                5.0 & 4.0 Scale
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-950 mt-0.5">
              Free CGPA Calculator - Calculate in 30 Seconds 🎓
            </h3>
            <p className="text-xs text-gray-800 font-semibold line-clamp-1">
              FUWukari, UNILAG, FUTO, UNILORIN, ABU, and all Nigerian universities. No login required.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gray-950 text-white text-xs font-black shrink-0 shadow-md transition-all hover:bg-gray-800"
        >
          <span>Calculate Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar & Categories */}
      <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search phones, clothes, okada, hostels..."
            className="w-full pl-11 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#0B8751] focus:ring-1 focus:ring-[#0B8751] transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0B8751] text-white shadow-xs"
                  : "bg-[#0A0A0A] border border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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
            <h3 className="font-black text-white text-base mb-1">No products yet - Be first to post</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">Post your phone, gadget, fashion, or bedspace and reach verified buyers.</p>
            <button 
              onClick={() => onNavigate("sell")} 
              className="px-6 py-3 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2 border border-emerald-600/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Product</span>
            </button>
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

            return (
              <div key={p.id} className="bg-[#151515] rounded-2xl border border-[#2A2A2A] hover:border-gray-600 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between p-3">
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A]/50 mb-2.5">
                    <img 
                      src={p.images?.[0] || p.imageUrl || p.coverImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"} 
                      alt={p.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy" 
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="bg-black/80 border border-white/10 backdrop-blur-xs text-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.condition || "Used"}
                      </span>
                      {isStephen && (
                        <span className="bg-[#0B8751] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-emerald-400/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Admin / Featured</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-100 text-xs sm:text-sm line-clamp-2 leading-snug mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[#10B981] font-black text-base sm:text-lg">
                    ₦{Number(p.price || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    📍 {p.state || p.location || "FUWukari Campus"}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#2A2A2A] grid grid-cols-2 gap-2">
                  {rawPhone ? (
                    <>
                      <a 
                        href={`tel:${rawPhone}`}
                        className="py-2 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-200 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                      >
                        <Phone className="w-3 h-3 text-gray-300" />
                        <span>Call</span>
                      </a>
                      <a 
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello, I'm interested in your item "${p.title}" on NaijaMart Hub.`)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="py-2 bg-[#0B8751] hover:bg-[#096e42] text-white text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  ) : (
                    <button 
                      onClick={() => onNavigate?.("hubs")}
                      className="col-span-2 py-2 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-300 text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors border border-[#2A2A2A]"
                    >
                      <MessageSquare className="w-3 h-3 text-[#10B981]" />
                      <span>Contact on Community Hub</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { MarketPage };
