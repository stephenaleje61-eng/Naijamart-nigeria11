import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Users, 
  Eye, 
  Lock 
} from 'lucide-react';
import { HouseListing, RoommateListing } from '../../types/housing';
import { 
  subscribeAdminHousing, 
  adminVerifyHouse, 
  adminRestoreListing, 
  deleteHouseListing, 
  deleteRoommateListing 
} from '../../services/housingService';
import { useToast } from '../../context/ToastContext';

interface AdminHousingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminHousingModal: React.FC<AdminHousingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [houses, setHouses] = useState<HouseListing[]>([]);
  const [roommates, setRoommates] = useState<RoommateListing[]>([]);
  const [activeTab, setActiveTab] = useState<'reported' | 'unverified' | 'all'>('reported');

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeAdminHousing(({ houses: h, roommates: r }) => {
      setHouses(h);
      setRoommates(r);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const reportedHouses = houses.filter((h) => h.reportsCount > 0 || h.status === 'hidden');
  const reportedRoommates = roommates.filter((r) => r.reportsCount > 0 || r.status === 'hidden');

  const unverifiedHouses = houses.filter((h) => !h.verified && h.status !== 'hidden');

  const handleVerify = async (houseId: string, current: boolean) => {
    try {
      await adminVerifyHouse(houseId, !current);
      showToast(!current ? 'Agent & House Verified!' : 'Verification removed', 'success');
    } catch {
      showToast('Failed to update verification', 'error');
    }
  };

  const handleRestore = async (type: 'houses' | 'roommates', id: string) => {
    try {
      await adminRestoreListing(type, id);
      showToast('Listing restored and reports reset to 0', 'success');
    } catch {
      showToast('Could not restore listing', 'error');
    }
  };

  const handleDelete = async (type: 'houses' | 'roommates', id: string) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      if (type === 'houses') {
        await deleteHouseListing(id);
      } else {
        await deleteRoommateListing(id);
      }
      showToast('Listing permanently deleted', 'success');
    } catch {
      showToast('Failed to delete listing', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Housing Admin & Verification</h2>
              <p className="text-xs text-gray-400">
                Moderate reported items, verify genuine agents, eliminate fake listings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('reported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reported' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Reported / Auto-Hidden ({reportedHouses.length + reportedRoommates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('unverified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unverified' ? 'bg-[#075E54] text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pending Verification ({unverifiedHouses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all' ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>All Houses ({houses.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'reported' && (
            <div className="space-y-3">
              {reportedHouses.length === 0 && reportedRoommates.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Clean community! No flagged or hidden listings currently.
                </div>
              ) : (
                <>
                  {reportedHouses.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {h.reportsCount} Reports
                          </span>
                          {h.status === 'hidden' && (
                            <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              AUTO-HIDDEN
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-gray-900">{h.title}</h4>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1">
                          Agent: {h.agentName} ({h.agentPhone}) • ₦{h.price.toLocaleString()}/{h.pricePer} in {h.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestore('houses', h.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        >
                          Restore Listing
                        </button>
                        <button
                          onClick={() => handleDelete('houses', h.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Fake</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {reportedRoommates.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {r.reportsCount} Reports
                          </span>
                          <h4 className="text-xs font-bold text-gray-900">Roommate in {r.location}</h4>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1">
                          Poster: {r.posterName} ({r.posterPhone}) • Budget ₦{r.budget.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestore('roommates', r.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete('roommates', r.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Fake</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'unverified' && (
            <div className="space-y-3">
              {unverifiedHouses.map((h) => (
                <div
                  key={h.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{h.title}</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Agent: {h.agentName} • Phone: {h.agentPhone} • Location: {h.location}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                      ₦{h.price.toLocaleString()}/{h.pricePer} • {h.bedrooms} Bed, {h.bathrooms} Bath
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(h.id, h.verified)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Agent</span>
                    </button>
                    <button
                      onClick={() => handleDelete('houses', h.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="space-y-2">
              {houses.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-gray-900">{h.title}</span>
                    <span className="text-gray-500 ml-2">({h.location})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(h.id, h.verified)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        h.verified ? 'bg-emerald-100 text-[#075E54]' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {h.verified ? 'Verified ✓' : 'Mark Verified'}
                    </button>
                    <button
                      onClick={() => handleDelete('houses', h.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
