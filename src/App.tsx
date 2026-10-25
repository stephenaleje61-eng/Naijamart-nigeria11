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
import { LogIn, LogOut, User } from 'lucide-react';

function AppContent() {
  // Set initial page to "market" always. Just useState navigation.
  const [page, setPage] = useState<string>("market");
  const { user, openAuthModal, signOutUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#1F2937] flex flex-col font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setPage("market")} 
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#008751] text-white flex items-center justify-center font-black text-xl shadow-md">
              N
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900">
                NaijaMart <span className="text-[#008751]">Hub</span>
              </span>
              <p className="text-[10px] text-gray-500 font-medium -mt-0.5">
                Nigeria's #1 Campus Market & Protection
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setPage("market")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                page === "market" ? "bg-[#008751] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setPage("sell")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                page === "sell" ? "bg-[#008751] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => setPage("my-products")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                page === "my-products" ? "bg-[#008751] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              My Products
            </button>
            <button
              onClick={() => setPage("track")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                page === "track" ? "bg-[#008751] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Track Phone
            </button>
            <button
              onClick={() => setPage("hubs")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                page === "hubs" ? "bg-[#008751] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Hubs
            </button>
          </div>

          {/* User Sign In / Profile */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage("my-products")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                </button>
                <button
                  onClick={signOutUser}
                  title="Sign Out"
                  className="p-2 text-gray-500 hover:text-red-600 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="flex items-center gap-1 bg-[#008751] hover:bg-[#007043] text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition-all"
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
