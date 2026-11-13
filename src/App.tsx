import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MessagingProvider, useMessaging } from './context/MessagingContext';
import { StudentProvider } from './context/StudentContext';
import { MarketPage } from './components/MarketPage';
import { SellPage } from './components/SellPage';
import { MyProductsPage } from './components/MyProductsPage';
import { TrackPage } from './components/TrackPage';
import { HubsPage } from './components/HubsPage';
import { MessagesPage } from './components/MessagesPage';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { NaijaHubPortal } from './naijahub/NaijaHubPortal';
import { HousesView } from './components/housing/HousesView';
import { CgpaCalculatorPage } from './components/cgpa/CgpaCalculatorPage';
import { WantedBoardPage } from './components/WantedBoardPage';
import { SavedProductsPage } from './components/SavedProductsPage';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { Product } from './types';
import { LogIn, LogOut, User, Globe, Home, GraduationCap, Sparkles, Heart, MessageSquare } from 'lucide-react';

function AppContent() {
  // Set initial page with URL recognition for /cgpa-calculator, /wanted, /saved, /naijahub, etc.
  const [page, setPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.pathname.includes('/cgpa-calculator') ||
        window.location.pathname.includes('/cgpa') ||
        window.location.search.includes('cgpa')
      ) {
        return 'cgpa-calculator';
      }
      if (
        window.location.pathname.includes('/wanted') || 
        window.location.search.includes('wanted')
      ) {
        return 'wanted';
      }
      if (
        window.location.pathname.includes('/saved') || 
        window.location.search.includes('saved')
      ) {
        return 'saved';
      }
      if (
        window.location.pathname.includes('/messages') ||
        window.location.search.includes('messages')
      ) {
        return 'messages';
      }
      if (
        window.location.pathname.includes('/naijahub') || 
        window.location.search.includes('naijahub') ||
        window.location.pathname.includes('/local-language')
      ) {
        return 'naijahub';
      }
    }
    return 'market';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user, openAuthModal, signOutUser } = useAuth();
  const { totalUnreadCount, registerNavigateCallback } = useMessaging();

  useEffect(() => {
    registerNavigateCallback(() => setPage('messages'));
  }, [registerNavigateCallback]);

  // If user is inside NaijaHub Africa portal, render it as a full-page experience
  if (page === 'naijahub') {
    return (
      <>
        <NaijaHubPortal onBackToCampus={() => setPage('market')} />
        <AuthModal />
        <PwaInstallBanner />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] flex flex-col font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#151515]/95 backdrop-blur-md border-b border-[#2A2A2A] shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setPage("market")} 
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-[#2A2A2A] shrink-0 overflow-hidden">
              <img
                src="/fuwukari-crest.png"
                alt="Federal University Wukari Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                FU <span className="text-[#008751]">MARKET</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">
                FUWUKARI Campus • Buy. Sell. Connect.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setPage("market")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === "market" ? "bg-[#008751] text-white shadow-sm" : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setPage("wanted")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                page === "wanted" ? "bg-[#008751] text-white shadow-sm" : "text-amber-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Wanted Board</span>
            </button>
            <button
              onClick={() => setPage("saved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                page === "saved" ? "bg-[#008751] text-white shadow-sm" : "text-red-400 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              <span>Saved</span>
            </button>
            <button
              onClick={() => setPage("sell")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === "sell" ? "bg-[#008751] text-white shadow-sm" : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => setPage("my-products")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === "my-products" ? "bg-[#008751] text-white shadow-sm" : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              My Goods
            </button>
            <button
              onClick={() => setPage("messages")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                page === "messages" ? "bg-[#008751] text-white shadow-sm" : "text-emerald-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messages 💬</span>
              {totalUnreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-[#25D366] text-gray-950 text-[10px] font-black rounded-full flex items-center justify-center">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setPage("hubs")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === "hubs" ? "bg-[#008751] text-white shadow-sm" : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              Africa Chat
            </button>
            <button
              onClick={() => setPage("houses")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                page === "houses" ? "bg-[#075E54] text-white shadow-sm" : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Houses</span>
            </button>
            <button
              onClick={() => setPage("track")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === "track" ? "bg-[#008751] text-white shadow-sm" : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              }`}
            >
              Track Phone
            </button>

            <button
              onClick={() => {
                setPage("cgpa-calculator");
                if (typeof window !== 'undefined' && window.history.pushState) {
                  window.history.pushState({}, '', '/cgpa-calculator');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                page === "cgpa-calculator"
                  ? "bg-[#087443] text-white"
                  : "bg-[#151515] text-emerald-400 hover:bg-[#2A2A2A] hover:text-white border border-[#2A2A2A]"
              }`}
            >
              <span>🎓</span>
              <span>CGPA Calc</span>
            </button>

            {/* Direct Switch to NaijaHub Africa */}
            <button
              onClick={() => setPage("naijahub")}
              className="ml-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all bg-[#151515] text-emerald-400 hover:bg-[#2A2A2A] hover:text-white border border-[#2A2A2A] flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>NaijaHub Africa</span>
            </button>
          </div>

          {/* User Sign In / Profile */}
          <div className="flex items-center gap-1.5">
            {/* Mobile quick buttons: Wanted & Saved */}
            <button
              onClick={() => setPage("wanted")}
              className={`md:hidden px-2 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1 cursor-pointer transition-all ${
                page === "wanted"
                  ? "bg-[#008751] text-white border-[#008751]"
                  : "bg-[#151515] text-amber-300 hover:text-white border-[#2A2A2A]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Wanted</span>
            </button>

            <button
              onClick={() => setPage("messages")}
              className={`md:hidden px-2 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1 cursor-pointer transition-all relative ${
                page === "messages"
                  ? "bg-[#008751] text-white border-[#008751]"
                  : "bg-[#151515] text-emerald-300 hover:text-white border-[#2A2A2A]"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
              {totalUnreadCount > 0 && (
                <span className="min-w-[15px] h-[15px] px-1 bg-[#25D366] text-gray-950 text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPage("saved")}
              className={`md:hidden px-2 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1 cursor-pointer transition-all ${
                page === "saved"
                  ? "bg-red-600 text-white border-red-500"
                  : "bg-[#151515] text-red-400 hover:text-white border-[#2A2A2A]"
              }`}
            >
              <Heart className="w-3 h-3 fill-red-400 text-red-400" />
              <span>Saved</span>
            </button>

            {/* Mobile switch to CGPA */}
            <button
              onClick={() => {
                setPage("cgpa-calculator");
                if (typeof window !== 'undefined' && window.history.pushState) {
                  window.history.pushState({}, '', '/cgpa-calculator');
                }
              }}
              className="md:hidden px-2 py-1.5 rounded-xl text-[11px] font-black bg-[#151515] text-amber-300 border border-[#2A2A2A] flex items-center gap-1 cursor-pointer"
            >
              <span>🎓</span>
              <span>CGPA</span>
            </button>

            {/* Mobile switch to NaijaHub */}
            <button
              onClick={() => setPage("naijahub")}
              className="md:hidden px-2 py-1.5 rounded-xl text-[11px] font-black bg-[#151515] text-emerald-400 border border-[#2A2A2A] flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>NaijaHub</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage("my-products")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151515] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-xl text-xs font-bold text-gray-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#008751]" />
                  <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                </button>
                <button
                  onClick={signOutUser}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#2A2A2A] rounded-xl cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="flex items-center gap-1 bg-[#008751] hover:bg-[#007043] text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer border border-emerald-600/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Pages Conditional Rendering */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {page === "market" && <MarketPage onNavigate={(p: any) => setPage(p)} />}
        {page === "wanted" && <WantedBoardPage onNavigate={(p: any) => setPage(p)} />}
        {page === "saved" && (
          <SavedProductsPage 
            onNavigate={(p: any) => setPage(p)} 
            onSelectProduct={(prod: any) => setSelectedProduct(prod)} 
          />
        )}
        {page === "sell" && <SellPage onNavigate={(p) => setPage(p)} onOpenAuth={openAuthModal} />}
        {page === "my-products" && <MyProductsPage onNavigate={(p) => setPage(p)} onOpenAuth={openAuthModal} />}
        {page === "messages" && <MessagesPage onNavigate={(p) => setPage(p)} />}
        {page === "track" && <TrackPage onNavigate={(p) => setPage(p)} />}
        {page === "hubs" && <HubsPage onNavigate={(p) => setPage(p)} />}
        {page === "houses" && (
          <div className="max-w-5xl mx-auto">
            <HousesView />
          </div>
        )}
        {page === "cgpa-calculator" && (
          <CgpaCalculatorPage onNavigateHome={() => setPage("market")} />
        )}
      </main>

      {/* Product Details Modal if opened from Saved page */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectRelatedProduct={(rel) => setSelectedProduct(rel)}
          allProducts={[]}
        />
      )}

      {/* Bottom Nav with useState setPage */}
      <BottomNav currentPage={page} setPage={setPage} />

      {/* Global Auth Modal & PWA Prompt */}
      <AuthModal />
      <PwaInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MessagingProvider>
          <StudentProvider>
            <AppContent />
          </StudentProvider>
        </MessagingProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
