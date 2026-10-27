import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Store, 
  Sprout, 
  Briefcase, 
  AlertTriangle, 
  X,
  Check,
  Search,
  Filter,
  Languages
} from 'lucide-react';
import { AdminLocalLanguage } from '../../locallanguage/components/AdminLocalLanguage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'verifications' | 'listings' | 'locallanguage'>('verifications');
  
  // Data states
  const [verifications, setVerifications] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch verification requests
    const vRef = collection(db, 'verificationRequests');
    const vQuery = query(vRef, orderBy('createdAt', 'desc'));
    const unsubV = onSnapshot(vQuery, (snap) => {
      setVerifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    // Fetch businesses for moderation & stats
    const bRef = collection(db, 'businessProfiles');
    const unsubB = onSnapshot(bRef, (snap) => {
      setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch farms
    const fRef = collection(db, 'farmListings');
    const unsubF = onSnapshot(fRef, (snap) => {
      setFarms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch jobs
    const jRef = collection(db, 'jobListings');
    const unsubJ = onSnapshot(jRef, (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubV();
      unsubB();
      unsubF();
      unsubJ();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApproveVerification = async (req: any) => {
    try {
      // 1. Update verification request status
      await updateDoc(doc(db, 'verificationRequests', req.id), {
        status: 'approved',
        reviewedAt: new Date().toISOString()
      });

      // 2. Find matching business owned by user or by businessName
      const matchingBiz = businesses.find(
        (b) => b.ownerUid === req.userId || b.businessName?.toLowerCase() === req.businessName?.toLowerCase()
      );

      if (matchingBiz) {
        await updateDoc(doc(db, 'businessProfiles', matchingBiz.id), {
          verified: true,
          verificationType: req.verificationType || 'cac'
        });
      }
    } catch (err) {
      console.error('Failed to approve verification:', err);
    }
  };

  const handleRejectVerification = async (id: string) => {
    try {
      await updateDoc(doc(db, 'verificationRequests', id), {
        status: 'rejected',
        reviewedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to reject verification:', err);
    }
  };

  const handleDeleteListing = async (col: string, id: string) => {
    if (window.confirm('Delete this listing immediately from NaijaHub?')) {
      try {
        await deleteDoc(doc(db, col, id));
      } catch (err) {
        console.error('Failed to remove listing:', err);
      }
    }
  };

  const pendingRequests = verifications.filter((v) => v.status === 'pending');
  const verifiedBusinessesCount = businesses.filter((b) => b.verified).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#075B43] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#F5B942]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#17231F] leading-tight">
                  NaijaHub Trust & Admin Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#075B43] border border-emerald-200">
                  Staff Access
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Verify CAC/Community credentials & manage platform safety
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="px-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-[#F8F7F2] rounded-2xl border border-gray-200/70">
            <span className="text-gray-500 text-[10px] uppercase font-bold block">Total Businesses</span>
            <span className="text-lg font-black text-gray-900">{businesses.length}</span>
            <span className="text-[10px] text-emerald-700 font-bold block">{verifiedBusinessesCount} verified</span>
          </div>
          <div className="p-3.5 bg-[#F8F7F2] rounded-2xl border border-gray-200/70">
            <span className="text-gray-500 text-[10px] uppercase font-bold block">Farm Produce</span>
            <span className="text-lg font-black text-gray-900">{farms.length}</span>
            <span className="text-[10px] text-gray-500 block">Direct farm gate</span>
          </div>
          <div className="p-3.5 bg-[#F8F7F2] rounded-2xl border border-gray-200/70">
            <span className="text-gray-500 text-[10px] uppercase font-bold block">Job Openings</span>
            <span className="text-lg font-black text-gray-900">{jobs.length}</span>
            <span className="text-[10px] text-gray-500 block">Career roles</span>
          </div>
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="text-amber-800 text-[10px] uppercase font-bold block">Pending Verifications</span>
            <span className="text-lg font-black text-amber-900">{pendingRequests.length}</span>
            <span className="text-[10px] text-amber-700 font-bold block">Requires review</span>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-6 pt-4 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verifications'
                ? 'border-[#075B43] text-[#075B43]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Queue ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#075B43] text-[#075B43]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Listing Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('locallanguage')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'locallanguage'
                ? 'border-[#075B43] text-[#075B43]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>LocalLanguage AI Quality</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'verifications' ? (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center bg-[#F8F7F2] rounded-2xl border border-gray-200/70 space-y-2">
                  <CheckCircle className="w-8 h-8 text-[#0D9B72] mx-auto" />
                  <h4 className="text-sm font-black text-gray-900">Queue is Clear!</h4>
                  <p className="text-xs text-gray-500">All submitted verification requests have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              req.verificationType === 'cac'
                                ? 'bg-emerald-50 text-[#075B43]'
                                : 'bg-purple-50 text-purple-800'
                            }`}
                          >
                            {req.verificationType === 'cac' ? 'CAC Reg' : 'Community'}
                          </span>
                          <h4 className="text-sm font-black text-gray-900">{req.businessName}</h4>
                        </div>

                        <div className="text-xs text-gray-600 space-y-0.5">
                          {req.regNumber && (
                            <p>
                              Registration No: <span className="font-bold text-gray-900">{req.regNumber}</span>
                            </p>
                          )}
                          {req.associationName && (
                            <p>
                              Association: <span className="font-bold text-gray-900">{req.associationName}</span>
                            </p>
                          )}
                          <p>
                            Contact: <span className="font-medium text-gray-800">{req.phone}</span> ({req.userEmail})
                          </p>
                          {req.proofNotes && (
                            <p className="text-gray-500 italic">Notes: "{req.proofNotes}"</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectVerification(req.id)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveVerification(req)}
                          className="px-4 py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-[#F5B942]" />
                          <span>Approve & Issue Badge</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Recent Business Listings ({businesses.length})
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{biz.businessName}</span>
                        {biz.verified && (
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Verified</span>
                        )}
                      </div>
                      <span className="text-gray-500">{biz.category} • {biz.state} • {biz.phone}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteListing('businessProfiles', biz.id)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'locallanguage' && (
            <AdminLocalLanguage />
          )}
        </div>
      </div>
    </div>
  );
};
