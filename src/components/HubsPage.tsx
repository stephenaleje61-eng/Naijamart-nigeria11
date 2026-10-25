import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Bike, 
  Home, 
  Users, 
  PlusCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { WantedItem, OkadaRider, SquatterItem } from '../types';
import { ChatView } from './ChatView';
import { WantedBoardView } from './WantedBoardView';
import { WukariRidersView } from './WukariRidersView';
import { SquatterBoardView } from './SquatterBoardView';
import { PostWantedModal } from './PostWantedModal';
import { PostSquatterModal } from './PostSquatterModal';
import { PostRiderModal } from './PostRiderModal';
import { StudentProfileModal } from './StudentProfileModal';
import { IHaveThisModal } from './IHaveThisModal';
import { useStudent } from '../context/StudentContext';

interface HubsPageProps {
  onNavigate: (route: string) => void;
}

export const HubsPage: React.FC<HubsPageProps> = ({ onNavigate }) => {
  const { isProfileModalOpen, setIsProfileModalOpen, profile } = useStudent();
  const [hubTab, setHubTab] = useState<'chat' | 'wanted' | 'riders' | 'squatters'>('chat');

  // Firestore live state
  const [wantedItems, setWantedItems] = useState<WantedItem[]>([]);
  const [wantedLoading, setWantedLoading] = useState(true);

  const [riders, setRiders] = useState<OkadaRider[]>([]);
  const [ridersLoading, setRidersLoading] = useState(true);

  const [squatters, setSquatters] = useState<SquatterItem[]>([]);
  const [squattersLoading, setSquattersLoading] = useState(true);

  // Modals
  const [isWantedModalOpen, setIsWantedModalOpen] = useState(false);
  const [isSquatterModalOpen, setIsSquatterModalOpen] = useState(false);
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [selectedWantedItem, setSelectedWantedItem] = useState<WantedItem | null>(null);

  // Live queries for sub-boards
  useEffect(() => {
    // Wanted items
    const wantedRef = collection(db, 'wanted_items');
    const unsubWanted = onSnapshot(wantedRef, (snapshot) => {
      const items: WantedItem[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as WantedItem));
      setWantedItems(items);
      setWantedLoading(false);
    }, (err) => {
      console.warn('Wanted items query notice:', err);
      setWantedLoading(false);
    });

    // Riders
    const ridersRef = collection(db, 'okada_riders');
    const unsubRiders = onSnapshot(ridersRef, (snapshot) => {
      const items: OkadaRider[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as OkadaRider));
      setRiders(items);
      setRidersLoading(false);
    }, (err) => {
      console.warn('Riders query notice:', err);
      setRidersLoading(false);
    });

    // Squatters
    const squattersRef = collection(db, 'squatters');
    const unsubSquatters = onSnapshot(squattersRef, (snapshot) => {
      const items: SquatterItem[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as SquatterItem));
      setSquatters(items);
      setSquattersLoading(false);
    }, (err) => {
      console.warn('Squatters query notice:', err);
      setSquattersLoading(false);
    });

    return () => {
      unsubWanted();
      unsubRiders();
      unsubSquatters();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#008751] text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" /> Campus Student Community
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            NaijaMart Hubs & Networks
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Connect with verified students, request items on Wanted Board, find roommates, or hail campus riders.
          </p>
        </div>

        {/* Profile Button */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-gray-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-gray-800 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#008751] flex items-center justify-center font-black text-xs">
            🎓
          </div>
          <span>Student Profile</span>
        </button>
      </div>

      {/* Sub-Hub Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setHubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            hubTab === 'chat'
              ? 'bg-[#008751] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Student Chat & Friends</span>
        </button>

        <button
          onClick={() => setHubTab('wanted')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            hubTab === 'wanted'
              ? 'bg-[#008751] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Wanted Board ("I Need This")</span>
        </button>

        <button
          onClick={() => setHubTab('riders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            hubTab === 'riders'
              ? 'bg-[#008751] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bike className="w-4 h-4 text-emerald-600" />
          <span>Campus Riders / Okada</span>
        </button>

        <button
          onClick={() => setHubTab('squatters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            hubTab === 'squatters'
              ? 'bg-[#008751] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-4 h-4 text-blue-600" />
          <span>Roommate / Bedspaces</span>
        </button>
      </div>

      {/* Hub Content */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-sm min-h-[500px]">
        {hubTab === 'chat' && <ChatView onNavigateHome={() => onNavigate('market')} />}
        {hubTab === 'wanted' && (
          <WantedBoardView
            wantedItems={wantedItems}
            loading={wantedLoading}
            onOpenPostModal={() => setIsWantedModalOpen(true)}
            onIHaveThis={(item) => setSelectedWantedItem(item)}
          />
        )}
        {hubTab === 'riders' && (
          <WukariRidersView
            riders={riders}
            loading={ridersLoading}
            onOpenRegisterModal={() => setIsRiderModalOpen(true)}
          />
        )}
        {hubTab === 'squatters' && (
          <SquatterBoardView
            items={squatters}
            loading={squattersLoading}
            onOpenPostModal={() => setIsSquatterModalOpen(true)}
            onNavigateHome={() => onNavigate('market')}
          />
        )}
      </div>

      {/* Sub-Modals */}
      {isWantedModalOpen && (
        <PostWantedModal
          isOpen={isWantedModalOpen}
          onClose={() => setIsWantedModalOpen(false)}
          onWantedPosted={(newItem) => setWantedItems((prev) => [newItem, ...prev])}
        />
      )}
      {selectedWantedItem && (
        <IHaveThisModal
          item={selectedWantedItem}
          onClose={() => setSelectedWantedItem(null)}
        />
      )}
      {isSquatterModalOpen && (
        <PostSquatterModal
          isOpen={isSquatterModalOpen}
          onClose={() => setIsSquatterModalOpen(false)}
          onPostCreated={(newItem) => setSquatters((prev) => [newItem, ...prev])}
        />
      )}
      {isRiderModalOpen && (
        <PostRiderModal
          isOpen={isRiderModalOpen}
          onClose={() => setIsRiderModalOpen(false)}
          onRiderRegistered={(newRider) => setRiders((prev) => [newRider, ...prev])}
        />
      )}
      <StudentProfileModal />
    </div>
  );
};
