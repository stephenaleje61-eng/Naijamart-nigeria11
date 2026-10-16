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
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { Product, FilterState, OkadaRider } from './types';
import { ShoppingBag, PlusCircle, Bike, Users } from 'lucide-react';

function MarketplaceApp() {
  const { showToast } = useToast();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Wukari Riders state
  const [riders, setRiders] = useState<OkadaRider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(true);

  // Active page view mode: 'marketplace' or 'wukari-riders'
  const [viewMode, setViewMode] = useState<'marketplace' | 'wukari-riders'>('marketplace');

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
  const [isMyAdsOpen, setIsMyAdsOpen] = useState(false);
  const [bottomNavTab, setBottomNavTab] = useState<'home' | 'riders' | 'okada' | 'my-ads'>('home');

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
        const now = Date.now();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          let isExpired = false;
          if (data.expiresAt?.toDate) {
            isExpired = data.expiresAt.toDate().getTime() < now;
          } else if (data.expiresAt) {
            isExpired = new Date(data.expiresAt).getTime() < now;
          }

          if (!isExpired) {
            fetched.push({
              id: docSnap.id,
              ...data,
            } as Product);
          }
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
          const now = Date.now();
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            let isExpired = false;
            if (data.expiresAt?.toDate) {
              isExpired = data.expiresAt.toDate().getTime() < now;
            }
            if (!isExpired) {
              fetched.push({ id: docSnap.id, ...data } as Product);
            }
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
        const now = Date.now();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          let isExpired = false;
          if (data.expiresAt?.toDate) {
            isExpired = data.expiresAt.toDate().getTime() < now;
          } else if (data.expiresAt) {
            isExpired = new Date(data.expiresAt).getTime() < now;
          }

          if (!isExpired) {
            fetched.push({
              id: docSnap.id,
              ...data,
            } as OkadaRider);
          }
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
          const now = Date.now();
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            let isExpired = false;
            if (data.expiresAt?.toDate) {
              isExpired = data.expiresAt.toDate().getTime() < now;
            }
            if (!isExpired) {
              fetched.push({ id: docSnap.id, ...data } as OkadaRider);
            }
          });
          setRiders(fetched);
          setLoadingRiders(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Don't show rider listings in general merchandise grid if browsing non-riders
      if (viewMode === 'marketplace' && prod.category === 'Okada Riders Wukari 🏍️') {
        return false;
      }

      if (filters.searchQuery) {
        const qLower = filters.searchQuery.toLowerCase();
        const matchesTitle = prod.title?.toLowerCase().includes(qLower);
        const matchesDesc = prod.description?.toLowerCase().includes(qLower);
        const matchesCat = prod.category?.toLowerCase().includes(qLower);
        const matchesModel = prod.model?.toLowerCase().includes(qLower);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesModel) return false;
      }

      if (filters.category) {
        if (filters.category.toLowerCase().includes('okada riders')) {
          return prod.category === 'Okada Riders Wukari 🏍️';
        } else if (filters.category.toLowerCase().includes('okada')) {
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

  const handleSelectWukariRiders = () => {
    setViewMode('wukari-riders');
    setBottomNavTab('riders');
    setFilters((prev) => ({ ...prev, category: 'Okada Riders Wukari 🏍️' }));
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
        isWukariRidersActive={viewMode === 'wukari-riders'}
        myAdsCount={myProducts.length}
      />

      {/* Horizontal Categories Bar */}
      <CategoriesBar
        selectedCategory={filters.category}
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
        {/* Toggle between Wukari Riders View and Marketplace View */}
        {viewMode === 'wukari-riders' ? (
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

            {/* Quick Wukari Riders Banner Callout */}
            <div 
              onClick={handleSelectWukariRiders}
              className="mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-[#fb6514] p-3 sm:p-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between text-black"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-yellow-300 flex items-center justify-center font-bold text-lg">
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
                </div>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Professional Footer */}
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

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onHomeClick={() => {
          setViewMode('marketplace');
          handleResetFilters();
          setBottomNavTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onWukariRidersClick={handleSelectWukariRiders}
        onOkadaClick={handleSelectOkadaCategory}
        onPostAdClick={() => handleOpenPublish(false)}
        onMyAdsClick={() => {
          setBottomNavTab('my-ads');
          setIsMyAdsOpen(true);
        }}
        myAdsCount={myProducts.length}
        activeTab={bottomNavTab}
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

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelatedProduct={(rel) => setSelectedProduct(rel)}
        allProducts={products}
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
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MarketplaceApp />
    </ToastProvider>
  );
}
