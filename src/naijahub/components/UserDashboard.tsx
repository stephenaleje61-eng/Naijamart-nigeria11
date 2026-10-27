import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  User, 
  Store, 
  Sprout, 
  Briefcase, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Send,
  X,
  ExternalLink
} from 'lucide-react';
import { BusinessProfile, FarmListing, JobListing, FreelancerProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPublish: () => void;
}

export const UserDashboard: React.FC<Props> = ({ isOpen, onClose, onOpenPublish }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'applications' | 'verify'>('listings');

  // Listings State
  const [myBusinesses, setMyBusinesses] = useState<BusinessProfile[]>([]);
  const [myFarms, setMyFarms] = useState<FarmListing[]>([]);
  const [myJobs, setMyJobs] = useState<JobListing[]>([]);
  const [myFreelancers, setMyFreelancers] = useState<FreelancerProfile[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);

  // Verification Form State
  const [verifyType, setVerifyType] = useState<'cac' | 'community'>('cac');
  const [bizRegNumber, setBizRegNumber] = useState('');
  const [bizEntityName, setBizEntityName] = useState('');
  const [associationName, setAssociationName] = useState('');
  const [verifyPhone, setVerifyPhone] = useState('08167258121');
  const [verifyProofDetails, setVerifyProofDetails] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Subscribe to user's businesses
  useEffect(() => {
    if (!user) return;

    // Businesses
    const bRef = collection(db, 'businessProfiles');
    const bQuery = query(bRef, where('ownerUid', '==', user.uid));
    const unsubB = onSnapshot(bQuery, (snap) => {
      setMyBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile)));
    });

    // Farm listings
    const fRef = collection(db, 'farmListings');
    const fQuery = query(fRef, where('farmerUid', '==', user.uid));
    const unsubF = onSnapshot(fQuery, (snap) => {
      setMyFarms(snap.docs.map(d => ({ id: d.id, ...d.data() } as FarmListing)));
    });

    // Job listings
    const jRef = collection(db, 'jobListings');
    const jButtonQuery = query(jRef, where('employerUid', '==', user.uid));
    const unsubJ = onSnapshot(jButtonQuery, (snap) => {
      setMyJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as JobListing)));
    });

    // Freelancer profile
    const freeRef = collection(db, 'freelancerProfiles');
    const freeQuery = query(freeRef, where('freelancerUid', '==', user.uid));
    const unsubFree = onSnapshot(freeQuery, (snap) => {
      setMyFreelancers(snap.docs.map(d => ({ id: d.id, ...d.data() } as FreelancerProfile)));
    });

    // Applications submitted
    const appRef = collection(db, 'jobApplications');
    const appQuery = query(appRef, where('applicantUid', '==', user.uid));
    const unsubApp = onSnapshot(appQuery, (snap) => {
      setMyApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubB();
      unsubF();
      unsubJ();
      unsubFree();
      unsubApp();
    };
  }, [user]);

  if (!isOpen || !user) return null;

  const handleDeleteListing = async (col: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteDoc(doc(db, col, id));
      } catch (err) {
        console.error('Failed to delete listing:', err);
      }
    }
  };

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifySubmitting(true);
    try {
      await addDoc(collection(db, 'verificationRequests'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Vendor',
        verificationType: verifyType,
        businessName: bizEntityName.trim(),
        regNumber: verifyType === 'cac' ? bizRegNumber.trim() : null,
        associationName: verifyType === 'community' ? associationName.trim() : null,
        phone: verifyPhone.trim(),
        proofNotes: verifyProofDetails.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setVerifySuccess(true);
      setBizRegNumber('');
      setBizEntityName('');
      setAssociationName('');
      setVerifyProofDetails('');
      setTimeout(() => setVerifySuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit verification request:', err);
    } finally {
      setVerifySubmitting(false);
    }
  };

  const totalListings = myBusinesses.length + myFarms.length + myJobs.length + myFreelancers.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto">
        {/* Top Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#075B43] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#17231F] leading-tight">
                {user.displayName || user.email?.split('@')[0] || 'User'} Dashboard
              </h2>
              <span className="text-xs text-gray-500 font-medium truncate">
                {user.email} • Member ID: {user.uid.slice(0, 8)}
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

        {/* Dashboard Tabs */}
        <div className="px-6 pt-4 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#075B43] text-[#075B43]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>My Listings ({totalListings})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'applications'
                ? 'border-[#075B43] text-[#075B43]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Applications ({myApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verify'
                ? 'border-[#075B43] text-[#075B43]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Get Verified (CAC / Market)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* TAB 1: MY LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Manage Your Offerings</h3>
                  <p className="text-xs text-gray-500">
                    Active businesses, farm harvests, jobs, and freelance profiles posted by you.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPublish();
                  }}
                  className="px-3.5 py-1.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post New</span>
                </button>
              </div>

              {totalListings === 0 ? (
                <div className="p-8 text-center bg-[#F8F7F2] rounded-2xl border border-gray-200/70 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#075B43] flex items-center justify-center mx-auto">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-gray-900">No Listings Yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    You haven't published any businesses, farm produce, jobs, or talent profiles yet.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPublish();
                    }}
                    className="px-4 py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-bold"
                  >
                    Publish First Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Business Listings */}
                  {myBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-[#075B43]">
                            Business
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{biz.businessName || biz.name}</h4>
                          {(biz.verified || biz.verifiedType === 'cac' || biz.verifiedType === 'community') && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{biz.category} • {biz.state}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteListing('businessProfiles', biz.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Farm Listings */}
                  {myFarms.map((farm) => (
                    <div
                      key={farm.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-800">
                            Farm Produce
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{farm.cropName}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                          ₦{farm.pricePerUnit.toLocaleString()} / {farm.unit} • {farm.lga}, {farm.state}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteListing('farmListings', farm.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Job Listings */}
                  {myJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-800">
                            Job Role
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{job.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                          {job.companyName || job.company} • {job.state} • {job.jobType || job.type}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteListing('jobListings', job.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Freelancer Profiles */}
                  {myFreelancers.map((free) => (
                    <div
                      key={free.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 text-purple-800">
                            Freelance Profile
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{free.fullName || free.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                          {free.tagline} • ₦{free.hourlyRate?.toLocaleString()}/hr
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteListing('freelancerProfiles', free.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-gray-900">Your Submitted Applications</h3>
                <p className="text-xs text-gray-500">Track status of jobs and roles you have applied for.</p>
              </div>

              {myApplications.length === 0 ? (
                <div className="p-8 text-center bg-[#F8F7F2] rounded-2xl border border-gray-200/70">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No applications submitted yet.</p>
                  <p className="text-[11px] text-gray-500">Browse the SkillBridge Africa job board to apply.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-900">{app.jobTitle}</h4>
                        <p className="text-[11px] text-gray-500">{app.companyName}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          app.status === 'shortlisted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VERIFICATION REQUEST */}
          {activeTab === 'verify' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-gray-900">Get Verified on NaijaHub Africa</h3>
                <p className="text-xs text-gray-500">
                  Earn trust and boost orders with a genuine CAC Badge or Local Market Association verification.
                </p>
              </div>

              {verifySuccess ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-[#0D9B72] mx-auto" />
                  <h4 className="text-xs font-black text-[#075B43]">Verification Request Submitted!</h4>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">
                    Our compliance team is verifying your registration details with the registry. You will receive an update within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestVerification} className="space-y-4 bg-[#F8F7F2] p-5 rounded-2xl border border-gray-200/70">
                  {/* Verification Type Radio */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Verification Scheme</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setVerifyType('cac')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          verifyType === 'cac'
                            ? 'border-[#075B43] bg-white shadow-xs'
                            : 'border-gray-200 bg-white/50 text-gray-600'
                        }`}
                      >
                        <span className="text-xs font-black text-gray-900 block">CAC Registered (BN / RC)</span>
                        <span className="text-[10px] text-gray-500">Corporate Affairs Commission corporate badge</span>
                      </div>

                      <div
                        onClick={() => setVerifyType('community')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          verifyType === 'community'
                            ? 'border-[#075B43] bg-white shadow-xs'
                            : 'border-gray-200 bg-white/50 text-gray-600'
                        }`}
                      >
                        <span className="text-xs font-black text-gray-900 block">Community / Market Association</span>
                        <span className="text-[10px] text-gray-500">Local trade union, farmers cooperative, okada association</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Registered Business / Store Name
                      </label>
                      <input
                        type="text"
                        required
                        value={bizEntityName}
                        onChange={(e) => setBizEntityName(e.target.value)}
                        placeholder="e.g. Wukari Agro Enterprise Ltd"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                      />
                    </div>

                    {verifyType === 'cac' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          CAC Registration Number (BN / RC)
                        </label>
                        <input
                          type="text"
                          required
                          value={bizRegNumber}
                          onChange={(e) => setBizRegNumber(e.target.value)}
                          placeholder="e.g. BN 3982910 or RC 1827462"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Cooperative / Association Name
                        </label>
                        <input
                          type="text"
                          required
                          value={associationName}
                          onChange={(e) => setAssociationName(e.target.value)}
                          placeholder="e.g. Wukari Main Market Traders Union"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Verification Phone</label>
                      <input
                        type="tel"
                        required
                        value={verifyPhone}
                        onChange={(e) => setVerifyPhone(e.target.value)}
                        placeholder="08167258121"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Supporting Evidence / Notes
                      </label>
                      <input
                        type="text"
                        value={verifyProofDetails}
                        onChange={(e) => setVerifyProofDetails(e.target.value)}
                        placeholder="e.g. Certificate attached, or Chairman Mr. Danladi contact"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={verifySubmitting}
                    className="w-full py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#F5B942]" />
                    <span>{verifySubmitting ? 'Submitting Application...' : 'Submit Verification Request'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
