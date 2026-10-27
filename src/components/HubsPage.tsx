import React, { useState } from 'react';
import { MessageSquare, Bike, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { NaijaMartHubSpace } from './NaijaMartHubSpace';
import { WukariOkadaSpace } from './WukariOkadaSpace';

interface HubsPageProps {
  onNavigate?: (route: string) => void;
}

export const HubsPage: React.FC<HubsPageProps> = () => {
  const [activeSpace, setActiveSpace] = useState<'naijamart-hub' | 'wukari-okada'>('naijamart-hub');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Space Switcher Navigation */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0B8751] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2 Real Verified Community Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            NaijaMart Real Spaces
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            100% real-time Firestore communication, member directories, and Okada dispatch. Zero mock data.
          </p>
        </div>

        {/* Space Selection Buttons */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => setActiveSpace('naijamart-hub')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSpace === 'naijamart-hub'
                ? 'bg-[#0B8751] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>NaijaMart Hub</span>
          </button>
          <button
            onClick={() => setActiveSpace('wukari-okada')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSpace === 'wukari-okada'
                ? 'bg-amber-400 text-gray-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Wukari Okada</span>
          </button>
        </div>
      </div>

      {/* Render selected real space */}
      {activeSpace === 'naijamart-hub' && <NaijaMartHubSpace />}
      {activeSpace === 'wukari-okada' && <WukariOkadaSpace />}
    </div>
  );
};

export default HubsPage;
