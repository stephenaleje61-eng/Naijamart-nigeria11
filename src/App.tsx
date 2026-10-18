import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { ToastProvider, useToast } from './context/ToastContext';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Header } from './components/Header';
import { CategoriesBar } from './components/CategoriesBar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilters } from './components/ProductFilters';
import { ProductCard } from './components/ProductCard';
import { PublishModal } from './components/PublishModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { MyAdsModal } from './components/MyAdsModal';
import { PostRiderModal } from './components/PostRiderModal';
import { WukariRidersView } from './components/WukariRidersView';
import { WantedBoardView } from './components/WantedBoardView';
import { PostWantedModal } from './components/PostWantedModal';
import { IHaveThisModal } from './components/IHaveThisModal';
import { BargainChatModal } from './components/BargainChatModal';
import { FriendsModal } from './components/FriendsModal';
import { PrivateChatModal } from './components/PrivateChatModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SquatterBoardView } from './components/SquatterBoardView';
import { PostSquatterModal } from './components/PostSquatterModal';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { Product, FilterState, OkadaRider, WantedItem, SquatterItem } from './types';
import { INITIAL_WANTED_REQUESTS, INITIAL_SQUATTER_ITEMS } from './data/constants';
import { subscribeToSquatterBoard } from './services/squatterService';
import { ShoppingBag, PlusCircle, Bike, Users, Sparkles, ArrowRight, MessageSquare, X, Home } from 'lucide-react';

function MarketplaceApp() {
  const { showToast } = useToast();
  const { latestIncomingMessage, clearLatestIncomingMessage, openPrivateChatWith } = useStudent();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Wukari Riders state
  const [riders, setRiders] = useState<OkadaRider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(true);

  // Wanted Board state
  const [wantedItems, setWantedItems] = useState<WantedItem[]>(INITIAL_WANTED_REQUESTS);
  const [loadingWanted, setLoadingWanted] = useState(false);
  const [isPostWantedOpen, setIsPostWantedOpen] = useState(false);
  const [selectedWantedItem, setSelectedWantedItem] = useState<WantedItem | null>(null);

  // Squatter Board state (FUW Wukari Bedspaces)
  const [squatterItems, setSquatterItems] = useState<SquatterItem[]>(INITIAL_SQUATTER_ITEMS as SquatterItem[]);
  const [loadingSquatter, setLoadingSquatter] = useState(false);
  const [isPostSquatterOpen, setIsPostSquatterOpen] = useState(false);

  // Active page view mode: 'marketplace' | 'wukari-riders' | 'wanted-board' | 'squatter-board'
  const [viewMode, setViewMode] = useState<'marketplace' | 'wukari-riders' | 'wanted-board' | 'squatter-board'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/squatter' || p.startsWith('/squatter')) return 'squatter-board';
      if (p === '/wanted' || p.startsWith('/wanted')) return 'wanted-board';
      if (p === '/riders' || p.startsWith('/riders')) return 'wukari-riders';
    }
    return 'marketplace';
  });

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    location: '',
    condition: '',
    papers: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });

  // Selected default location (Wukari default)
  const [selectedLocation, setSelectedLocation] = useState<string>('Wukari, Taraba State');

  // Local storage for user's posted ads
  const [myAdIds, setMyAdIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('naijamart_my_ad_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishIsOkada, setPublishIsOkada] = useState(false);
  const [isPostRiderOpen, setIsPostRiderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bargainProduct, setBargainProduct] = useState<Product | null>(null);
  const [isMyAdsOpen, setIsMyAdsOpen] = useState(false);
  const [bottomNavTab, setBottomNavTab] = useState<'home' | 'wanted' | 'riders' | 'okada' | 'my-ads'>('home');

  // Live Query from Firestore collection "products"
  useEffect(() => {
    setLoadingProducts(true);

    const productsRef = collection(db, 'products');
    let q;

    try {
      q = query(
        productsRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    } catch (e) {
      q = query(productsRef, where('status', '==', 'approved'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Product[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            ...data,
          } as Product);
        });

        fetched.sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return tB - tA;
        });

        setProducts(fetched);
        setLoadingProducts(false);
      },
      (error) => {
        console.warn('Fallback products query:', error.message);
        const fallbackQ = query(productsRef, where('status', '==', 'approved'));
        onSnapshot(fallbackQ, (snap) => {
          const fetched: Product[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({ id: docSnap.id, ...data } as Product);
          });
          setProducts(fetched);
          setLoadingProducts(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Live Query from Firestore collection "okada_riders" for Wukari only
  useEffect(() => {
    setLoadingRiders(true);

    const ridersRef = collection(db, 'okada_riders');
    let q;

    try {
      q = query(
        ridersRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    } catch (e) {
      q = query(ridersRef, where('status', '==', 'approved'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: OkadaRider[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            ...data,
          } as OkadaRider);
        });

        fetched.sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return tB - tA;
        });

        setRiders(fetched);
        setLoadingRiders(false);
      },
      (error) => {
        console.warn('Fallback riders query:', error.message);
        const fallbackQ = query(ridersRef, where('status', '==', 'approved'));
        onSnapshot(fallbackQ, (snap) => {
          const fetched: OkadaRider[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({ id: docSnap.id, ...data } as OkadaRider);
          });
          setRiders(fetched);
          setLoadingRiders(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Live Query from Firestore collection "wanted_items" for Student Wanted Board
  useEffect(() => {
    setLoadingWanted(true);

    const wantedRef = collection(db, 'wanted_items');
    let q;

    try {
      q = query(
        wantedRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    } catch (e) {
      q = query(wantedRef, where('status', '==', 'approved'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: WantedItem[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            ...data,
          } as WantedItem);
        });

        if (fetched.length > 0) {
          fetched.sort((a, b) => {
            const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return tB - tA;
          });
          setWantedItems(fetched);
        } else {
          // If fresh collection, populate with realistic authentic student requests
          setWantedItems(INITIAL_WANTED_REQUESTS);
        }
        setLoadingWanted(false);
      },
      (error) => {
        console.warn('Fallback wanted items query:', error.message);
        setWantedItems(INITIAL_WANTED_REQUESTS);
        setLoadingWanted(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Live Query / Subscription for Squatter Board (Bedspaces)
  useEffect(() => {
    setLoadingSquatter(true);
    const unsubscribe = subscribeToSquatterBoard((data) => {
      setSquatterItems(data);
      setLoadingSquatter(false);
    });
    return () => unsubscribe();
  }, []);

  // Browser Route / URL synchronization (/squatter, /wanted, /riders, /)
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      if (path === '/squatter' || path.startsWith('/squatter')) {
        setViewMode('squatter-board');
        setBottomNavTab('squatter');
      } else if (path === '/wanted' || path.startsWith('/wanted')) {
        setViewMode('wanted-board');
        setBottomNavTab('wanted');
      } else if (path === '/riders' || path.startsWith('/riders')) {
        setViewMode('wukari-riders');
        setBottomNavTab('riders');
      } else {
        setViewMode('marketplace');
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  // Filter products for marketplace view
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Exclude riders from regular marketplace feed
      if (viewMode === 'marketplace' && prod.category === 'Okada Riders Wukari 🏍️') {
        return false;
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = prod.title?.toLowerCase().includes(query);
        const matchesDesc = prod.description?.toLowerCase().includes(query);
        const matchesCat = prod.category?.toLowerCase().includes(query);
        const matchesModel = prod.model?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesModel) {
          return false;
        }
      }

      if (filters.category) {
        if (filters.category.toLowerCase().includes('okada riders')) {
          return prod.category === 'Okada Riders Wukari 🏍️';
        }
        if (filters.category.toLowerCase().includes('okada')) {
          const isOkadaProd = 
            prod.isOkada ||
            prod.category?.toLowerCase().includes('okada') ||
            prod.category?.toLowerCase().includes('motorcycle');
          if (!isOkadaProd) return false;
        } else {
          if (prod.category?.toLowerCase() !== filters.category.toLowerCase()) {
            return false;
          }
        }
      }

      if (filters.location && !filters.location.includes('All Nigeria')) {
        const locLower = filters.location.toLowerCase();
        if (!prod.location?.toLowerCase().includes(locLower)) {
          return false;
        }
      }

      if (filters.condition && filters.condition !== 'All') {
        if (prod.condition?.toLowerCase() !== filters.condition.toLowerCase()) {
          return false;
        }
      }

      if (filters.papers) {
        if (prod.papers !== filters.papers) {
          return false;
        }
      }

      if (filters.minPrice) {
        const min = parseFloat(filters.minPrice);
        if (!isNaN(min) && prod.price < min) return false;
      }
      if (filters.maxPrice) {
        const max = parseFloat(filters.maxPrice);
        if (!isNaN(max) && prod.price > max) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (filters.sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (filters.sortBy === 'popular') {
        return (b.views || 0) - (a.views || 0);
      } else {
        const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return tB - tA;
      }
    });
  }, [products, filters, viewMode]);

  // My Ads from local storage
  const myProducts = useMemo(() => {
    return products.filter((p) => myAdIds.includes(p.id));
  }, [products, myAdIds]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      location: '',
      condition: '',
      papers: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });
  };

  const handleSelectSquatterBoard = () => {
    setViewMode('squatter-board');
    setBottomNavTab('squatter');
    if (window.location.pathname !== '/squatter') {
      window.history.pushState({}, '', '/squatter');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectWukariRiders = () => {
    setViewMode('wukari-riders');
    setBottomNavTab('riders');
    setFilters((prev) => ({ ...prev, category: 'Okada Riders Wukari 🏍️' }));
    if (window.location.pathname !== '/riders') {
      window.history.pushState({}, '', '/riders');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectWantedBoard = () => {
    setViewMode('wanted-board');
    setBottomNavTab('wanted');
    if (window.location.pathname !== '/wanted') {
      window.history.pushState({}, '', '/wanted');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMarketplace = () => {
    setViewMode('marketplace');
    setBottomNavTab('home');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    handleResetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOkadaCategory = () => {
    setViewMode('marketplace');
    setFilters((prev) => ({
      ...prev,
      category: 'Okada Market 🏍️',
      searchQuery: '',
    }));
    setBottomNavTab('okada');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleAdDeleted = (deletedId: string) => {
    const updated = myAdIds.filter((id) => id !== deletedId);
    setMyAdIds(updated);
    try {
      localStorage.setItem('naijamart_my_ad_ids', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleOpenPublish = (isOkada = false) => {
    setPublishIsOkada(isOkada);
    setIsPublishOpen(true);
  };

  const handleOpenPostWanted = () => {
    setIsPostWantedOpen(true);
  };

  const handleWantedPosted = (newItem: WantedItem) => {
    setWantedItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
  };

  const handleIHaveThis = (item: WantedItem) => {
    setSelectedWantedItem(item);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          setFilters((prev) => ({
            ...prev,
            location: loc.includes('All Nigeria') ? '' : loc.split(',')[0],
          }));
        }}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        onOpenPublish={() => handleOpenPublish(false)}
        onOpenMyAds={() => setIsMyAdsOpen(true)}
        onSelectOkadaCategory={handleSelectOkadaCategory}
        onSelectWukariRiders={handleSelectWukariRiders}
        onSelectWantedBoard={handleSelectWantedBoard}
        onSelectSquatterBoard={handleSelectSquatterBoard}
        isWukariRidersActive={viewMode === 'wukari-riders'}
        isWantedBoardActive={viewMode === 'wanted-board'}
        isSquatterBoardActive={viewMode === 'squatter-board'}
        myAdsCount={myProducts.length}
      />

      {/* Horizontal Categories Bar */}
      <CategoriesBar
        selectedCategory={filters.category}
        onSelectSquatterBoard={handleSelectSquatterBoard}
        onSelectCategory={(cat) => {
          if (cat.toLowerCase().includes('okada riders')) {
            handleSelectWukariRiders();
          } else {
            setViewMode('marketplace');
            setFilters((prev) => ({ ...prev, category: cat }));
            if (cat.toLowerCase().includes('okada')) {
              setBottomNavTab('okada');
            } else {
              setBottomNavTab('home');
            }
          }
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5">
        {/* Toggle between Squatter Board, Wanted Board, Wukari Riders View and Marketplace View */}
        {viewMode === 'squatter-board' ? (
          <SquatterBoardView
            items={squatterItems}
            loading={loadingSquatter}
            onOpenPostModal={() => setIsPostSquatterOpen(true)}
            onNavigateHome={handleSelectMarketplace}
          />
        ) : viewMode === 'wanted-board' ? (
          <WantedBoardView
            wantedItems={wantedItems}
            loading={loadingWanted}
            onOpenPostModal={handleOpenPostWanted}
            onIHaveThis={handleIHaveThis}
          />
        ) : viewMode === 'wukari-riders' ? (
          <WukariRidersView
            riders={riders}
            loading={loadingRiders}
            onOpenRegisterModal={() => setIsPostRiderOpen(true)}
          />
        ) : (
          <>
            {/* Hero Banner with Temu Orange Flash Deals */}
            {!filters.searchQuery && !filters.category && (
              <HeroBanner
                onOpenPublish={(isOkada) => handleOpenPublish(isOkada ?? true)}
                onSelectOkada={handleSelectOkadaCategory}
                onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
              />
            )}

            {/* Squatter Board Callout Banner on Marketplace */}
            <div 
              onClick={handleSelectSquatterBoard}
              className="mb-3 bg-gradient-to-r from-[#008751] via-emerald-600 to-[#049b5d] p-3 sm:p-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between text-white border border-emerald-400/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg flex-shrink-0 shadow-2xs">
                  🏠
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm sm:text-base leading-tight">
                      FUW Squatter Board - Find Bedspace & Roommates FREE
                    </h4>
                    <span className="hidden sm:inline bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      New
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    Sublet your bedspace or find a squatter slot in Hostel A, Hostel B, New Site or Wukari Town. No agent fees!
                  </p>
                </div>
              </div>
              <button className="bg-white hover:bg-emerald-50 text-[#008751] px-3.5 py-2 rounded-xl text-xs font-black flex-shrink-0 flex items-center gap-1 transition-colors shadow-2xs">
                <span>Find Bedspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Student Wanted Board Callout Banner */}
            <div 
              onClick={handleSelectWantedBoard}
              className="mb-3 bg-gradient-to-r from-emerald-700 via-[#008751] to-emerald-600 p-3 sm:p-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between text-white border border-emerald-500/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg flex-shrink-0 shadow-2xs">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm sm:text-base leading-tight">
                      Looking to Buy an Item? Student Wanted Board
                    </h4>
                    <span className="hidden sm:inline bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      New
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    Buyers post what they need with their budget. Sellers in FU Wukari & nationwide call or WhatsApp you directly!
                  </p>
                </div>
              </div>
              <button className="bg-white hover:bg-emerald-50 text-[#008751] px-3.5 py-2 rounded-xl text-xs font-black flex-shrink-0 flex items-center gap-1 transition-colors shadow-2xs">
                <span>Open Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Wukari Riders Banner Callout */}
            <div 
              onClick={handleSelectWukariRiders}
              className="mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-[#fb6514] p-3 sm:p-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between text-black"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-yellow-300 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  🏍️
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base leading-tight">
                    Looking for an Okada in Wukari?
                  </h4>
                  <p className="text-xs text-black/80 font-medium">
                    Call available verified riders around Wukari Junction, Hospital Road, Kwararafa & FUW direct!
                  </p>
                </div>
              </div>
              <button className="bg-black text-white hover:bg-zinc-800 px-3.5 py-2 rounded-xl text-xs font-black flex-shrink-0">
                View Riders
              </button>
            </div>

            {/* Filters Bar */}
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              totalResults={filteredProducts.length}
            />

            {/* Product Grid - Jumia 2 columns mobile, 4 desktop */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-emerald-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs my-6">
                <div className="w-20 h-20 bg-orange-50 text-[#fb6514] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <Bike className="w-10 h-10" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
                  No Listings Found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
                  {filters.searchQuery || filters.category || filters.location
                    ? 'No active ads matching your search or filters. Try adjusting keywords or clearing filters.'
                    : 'There are no active approved listings right now. Be the first to post an ad in Wukari or nationwide!'}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {filters.searchQuery || filters.category || filters.location ? (
                    <button
                      onClick={handleResetFilters}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : null}

                  <button
                    onClick={() => handleOpenPublish(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#fb6514] hover:bg-[#e8590c] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post an Okada or Product</span>
                  </button>

                  <button
                    onClick={handleSelectWantedBoard}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#008751] rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
                  >
                    Check Wanted Board 🎯
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onClick={() => setSelectedProduct(prod)}
                    onBargainClick={(p) => setBargainProduct(p)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          if (cat.toLowerCase().includes('okada riders')) {
            handleSelectWukariRiders();
          } else {
            setViewMode('marketplace');
            setFilters((prev) => ({ ...prev, category: cat }));
          }
        }}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          setFilters((prev) => ({ ...prev, location: loc }));
        }}
        onOpenPublish={(isOkada) => handleOpenPublish(isOkada ?? false)}
      />

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        onHomeClick={() => {
          setViewMode('marketplace');
          handleResetFilters();
          setBottomNavTab('home');
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onWantedClick={handleSelectWantedBoard}
        onSquatterClick={handleSelectSquatterBoard}
        onWukariRidersClick={handleSelectWukariRiders}
        onOkadaClick={handleSelectOkadaCategory}
        onPostAdClick={() => handleOpenPublish(false)}
        onMyAdsClick={() => {
          setBottomNavTab('my-ads');
          setIsMyAdsOpen(true);
        }}
        myAdsCount={myProducts.length}
        activeTab={bottomNavTab as any}
      />

      {/* Modals */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPublished={(newProd) => {
          setSelectedProduct(newProd);
          if (!myAdIds.includes(newProd.id)) {
            setMyAdIds((prev) => [...prev, newProd.id]);
          }
        }}
        defaultIsOkada={publishIsOkada}
      />

      <PostRiderModal
        isOpen={isPostRiderOpen}
        onClose={() => setIsPostRiderOpen(false)}
        onRiderRegistered={(newRider) => {
          setViewMode('wukari-riders');
          setBottomNavTab('riders');
        }}
      />

      {/* Wanted Board Modals */}
      <PostWantedModal
        isOpen={isPostWantedOpen}
        onClose={() => setIsPostWantedOpen(false)}
        onWantedPosted={handleWantedPosted}
      />

      <IHaveThisModal
        item={selectedWantedItem}
        onClose={() => setSelectedWantedItem(null)}
      />

      {/* Squatter Board Post Modal */}
      <PostSquatterModal
        isOpen={isPostSquatterOpen}
        onClose={() => setIsPostSquatterOpen(false)}
        onPostCreated={(newItem) => {
          setSquatterItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
        }}
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelatedProduct={(rel) => setSelectedProduct(rel)}
        allProducts={products}
        onOpenBargainChat={(p) => setBargainProduct(p)}
      />

      {/* Bargain Chat Modal (WhatsApp Style) */}
      <BargainChatModal
        product={bargainProduct}
        isOpen={!!bargainProduct}
        onClose={() => setBargainProduct(null)}
      />

      <MyAdsModal
        isOpen={isMyAdsOpen}
        onClose={() => setIsMyAdsOpen(false)}
        myProducts={myProducts}
        onSelectProduct={(p) => {
          setIsMyAdsOpen(false);
          setSelectedProduct(p);
        }}
        onOpenPublish={() => handleOpenPublish(false)}
        onAdDeleted={handleAdDeleted}
      />

      {/* Floating Real-Time Incoming Message Alert Banner */}
      {latestIncomingMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-gradient-to-r from-[#008751] to-emerald-700 text-white p-3 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white text-[#008751] font-black flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
              💬
            </div>
            <div className="min-w-0">
              <span className="font-black text-xs block leading-tight text-yellow-300">
                New Message from {latestIncomingMessage.senderName}!
              </span>
              <p className="text-[11px] text-emerald-100 truncate">
                "{latestIncomingMessage.text}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                openPrivateChatWith({
                  id: latestIncomingMessage.partnerId,
                  fullName: latestIncomingMessage.partnerName,
                  campus: latestIncomingMessage.partnerCampus,
                  phone: latestIncomingMessage.partnerPhone,
                });
              }}
              className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-xs px-2.5 py-1 rounded-xl shadow-xs transition-colors"
            >
              Reply
            </button>
            <button
              onClick={clearLatestIncomingMessage}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Network & Private Chat Modals */}
      <FriendsModal />
      <PrivateChatModal />
      <StudentProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StudentProvider>
        <MarketplaceApp />
      </StudentProvider>
    </ToastProvider>
  );
}
