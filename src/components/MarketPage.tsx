import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Search, PlusCircle, Phone, MessageSquare, ShoppingBag } from "lucide-react";

export default function MarketPage({ onNavigate }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    console.log("MarketPage Loaded");
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q, 
      (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.warn("Firestore products error:", err);
      }
    );
    return () => unsub();
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
      <div className="bg-[#0B8751] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black mb-2 uppercase tracking-wide">
          Verified Campus Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">NAIJAMART MARKET</h1>
        <p className="text-emerald-100 text-sm mt-1">Buy and Sell in FUWukari & Nationwide</p>
      </div>

      {/* Search Bar & Categories */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input 
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search phones, clothes, okada, hostels..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B8751] focus:bg-white transition-all"
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
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-gray-200 text-center py-12 px-4 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-[#0B8751] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-black text-gray-900 text-base mb-1">No products yet - Be first to post</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">Post your phone, gadget, fashion, or bedspace and reach verified buyers.</p>
            <button 
              onClick={()=>onNavigate("sell")} 
              className="px-6 py-3 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Product</span>
            </button>
          </div>
        ) : (
          filtered.map((p: any) => {
            const rawPhone = p.ownerPhone || p.phoneNumber || "08167258121";
            const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
            const waNumber = cleanDigits.startsWith("0") 
              ? "234" + cleanDigits.slice(1) 
              : cleanDigits.startsWith("234") 
              ? cleanDigits 
              : "234" + cleanDigits;

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between p-3">
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                    <img 
                      src={p.images?.[0] || p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"} 
                      alt={p.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy" 
                    />
                    <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {p.condition || "Used"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[#0B8751] font-black text-base sm:text-lg">
                    ₦{Number(p.price || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    📍 {p.state || p.location || "FUWukari Campus"}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <a 
                    href={`tel:${rawPhone}`}
                    className="py-2 bg-gray-900 hover:bg-black text-white text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <a 
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello, I'm interested in your item "${p.title}" on NaijaMart Hub.`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="py-2 bg-[#0B8751] hover:bg-[#096e42] text-white text-[11px] font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
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
