import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { StudentProvider } from './context/StudentContext';
import { MarketPage } from './components/MarketPage';
import { SellPage } from './components/SellPage';
import { MyProductsPage } from './components/MyProductsPage';
import { TrackPage } from './components/TrackPage';
import { HubsPage } from './components/HubsPage';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { NaijaHubPortal } from './naijahub/NaijaHubPortal';
import { HousesView } from './components/housing/HousesView';
import { CgpaCalculatorPage } from './components/cgpa/CgpaCalculatorPage';
import { LogIn, LogOut, User, Globe, Home, GraduationCap } from 'lucide-react';

function AppContent() {
  // Set initial page with URL recognition for /cgpa-calculator, /naijahub, etc.
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
        window.location.pathname.includes('/naijahub') || 
        window.location.search.includes('naijahub') ||
        window.location.pathname.includes('/local-language')
      ) {
        return 'naijahub';
      }
    }
    return 'market';
  });
  const { user, openAuthModal, signOutUser } = useAuth();

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
            <div className="w-10 h-10 rounded-xl bg-[#008751] text-white flex items-center justify-center font-black text-xl shadow-md border border-[#2A2A2A]">
              N
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                NaijaMart <span className="text-[#008751]">Hub</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">
                Nigeria's #1 Campus Market & Protection
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
          <div className="flex items-center gap-2">
            {/* Mobile switch to CGPA */}
            <button
              onClick={() => {
                setPage("cgpa-calculator");
                if (typeof window !== 'undefined' && window.history.pushState) {
                  window.history.pushState({}, '', '/cgpa-calculator');
                }
              }}
              className="md:hidden px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-[#151515] text-amber-300 border border-[#2A2A2A] flex items-center gap-1 cursor-pointer"
            >
              <span>🎓</span>
              <span>CGPA</span>
            </button>

            {/* Mobile switch to NaijaHub */}
            <button
              onClick={() => setPage("naijahub")}
              className="md:hidden px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-[#151515] text-emerald-400 border border-[#2A2A2A] flex items-center gap-1 cursor-pointer"
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
                className="flex items-center gap-1 bg-[#008751] hover:bg-[#007043] text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer border border-emerald-600/30"
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
        {page === "sell" && <SellPage onNavigate={(p) => setPage(p)} onOpenAuth={openAuthModal} />}
        {page === "my-products" && <MyProductsPage onNavigate={(p) => setPage(p)} onOpenAuth={openAuthModal} />}
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
        <StudentProvider>
          <AppContent />
        </StudentProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
