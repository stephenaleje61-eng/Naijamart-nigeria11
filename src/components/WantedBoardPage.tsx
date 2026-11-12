import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Handshake, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Filter,
  User,
  ExternalLink
} from 'lucide-react';
import { 
  subscribeWantedPosts, 
  createWantedPost, 
  deleteWantedPost, 
  closeWantedPost, 
  WantedPost, 
  FUWUKARI_WANTED_LOCATIONS,
  normalizeWhatsAppNumber
} from '../services/wantedService';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface WantedBoardPageProps {
  onNavigate?: (route: string) => void;
}

export const WantedBoardPage: React.FC<WantedBoardPageProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<WantedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  
  // Post modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState<'Rafin Kada' | 'Behind School' | 'Wukari Town'>('Rafin Kada');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [buyerName, setBuyerName] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time Wanted posts
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeWantedPosts(
      (newPosts) => {
        setPosts(newPosts);
        setLoading(false);
      },
      (err) => {
        console.warn('Wanted posts subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update default buyer name when auth loads
  useEffect(() => {
    if (user?.displayName && !buyerName) {
      setBuyerName(user.displayName);
    }
  }, [user]);

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter the product title or what you need', 'error');
      return;
    }
    const numBudget = parseFloat(budget.replace(/,/g, ''));
    if (isNaN(numBudget) || numBudget <= 0) {
      showToast('Please enter a valid budget in Naira', 'error');
      return;
    }
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please provide a valid 11-digit Nigerian WhatsApp number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWantedPost({
        title,
        description,
        budget: numBudget,
        location,
        whatsappNumber,
        buyerName: buyerName.trim() || user?.displayName || 'FUW Student',
        userId: user?.uid
      });

      showToast('Your wanted request is live on the board! Sellers will WhatsApp you directly.', 'success');
      // Reset form
      setTitle('');
      setDescription('');
      setBudget('');
      setWhatsappNumber('');
      setIsPostModalOpen(false);
    } catch (err: any) {
      showToast('Failed to post request: ' + (err.message || 'Check network'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user is owner of post
  const isOwner = (post: WantedPost) => {
    if (user?.uid && post.userId === user.uid) return true;
    try {
      const myIds: string[] = JSON.parse(localStorage.getItem('fuw_my_wanted_post_ids') || '[]');
      return myIds.includes(post.id);
    } catch {
      return false;
    }
  };

  // Delete handler
  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await deleteWantedPost(postId);
      showToast('Request deleted successfully', 'info');
    } catch {
      showToast('Could not delete request', 'error');
    }
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (p.status === 'closed') return false;

    // Location filter
    if (selectedLocation !== 'All') {
      const matchLoc = p.location?.toLowerCase().includes(selectedLocation.toLowerCase());
      if (!matchLoc) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchLoc = p.location?.toLowerCase().includes(q);
      const matchBuyer = p.buyerName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchBuyer) return false;
    }

    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Wanted Board Hero Banner */}
      <div className="bg-gradient-to-r from-[#075B43] via-[#0B8751] to-[#151515] rounded-3xl p-5 sm:p-8 text-white shadow-md border border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>FUWUKARI Wanted Board</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            POST WHAT YOU NEED 🎯
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
            Looking to buy a phone, gadget, mattress, hostel appliance or textbook? State your budget & campus location — students and sellers in FUWukari will message you directly on WhatsApp!
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-5 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-gray-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-white/20"
        >
          <PlusCircle className="w-5 h-5 text-gray-950" />
          <span>+ Post What You Need</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-4 sm:p-5 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wanted requests (e.g. iPhone, mattress, generator, gas cylinder)..."
            className="w-full pl-11 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-sm font-medium text-white placeholder-gray-500 focus:outline-hidden focus:border-[#0B8751] focus:ring-1 focus:ring-[#0B8751]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Campus Location Filter Buttons */}
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Filter by FUW Location:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', ...FUWUKARI_WANTED_LOCATIONS].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedLocation === loc
                    ? 'bg-[#0B8751] text-white shadow-xs'
                    : 'bg-[#0A0A0A] border border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white'
                }`}
              >
                {loc === 'All' ? 'All Locations' : loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wanted Requests Feed */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] text-center py-12 px-4 shadow-xs">
            <div className="w-10 h-10 border-3 border-[#0B8751] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-300">Loading student wanted requests...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] text-center py-12 px-4 shadow-xs">
            <div className="w-16 h-16 bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Handshake className="w-8 h-8" />
            </div>
            <h3 className="font-black text-white text-base mb-1">
              {searchQuery || selectedLocation !== 'All' 
                ? 'No matching requests found' 
                : 'No wanted requests yet — Be the first student to post!'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Need something in Rafin Kada, Behind School or Wukari Town? Tell fellow students what you're willing to pay.
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-3 bg-[#0B8751] hover:bg-[#096e42] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2 border border-emerald-600/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post What You Need</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const formattedWhatsapp = normalizeWhatsAppNumber(post.whatsappNumber);
            const whatsappText = `Hello ${post.buyerName || 'Student'}, I saw your request on FUWUKARI Wanted Board for "${post.title}" (Budget: ${formatNaira(post.budget)}). I have this available! Are you still looking to buy?`;
            const whatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(whatsappText)}`;
            const isMyPost = isOwner(post);

            return (
              <div
                key={post.id}
                className="bg-[#151515] rounded-2xl border border-[#2A2A2A] hover:border-emerald-600/50 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-[#EDEDED]"
              >
                <div>
                  {/* Top Row: Title + Budget + Owner Actions */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="bg-[#0B8751]/20 border border-[#0B8751]/40 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{post.location || 'FUWukari'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                        {post.title}
                      </h3>
                    </div>

                    {/* Prominent Green Budget */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Budget
                      </span>
                      <span className="text-base sm:text-xl font-black text-[#10B981] tracking-tight">
                        {formatNaira(post.budget)}
                      </span>
                    </div>
                  </div>

                  {/* Description / What They Need */}
                  {post.description && (
                    <p className="text-xs sm:text-sm text-gray-300 bg-[#0A0A0A] p-3 rounded-xl border border-[#2A2A2A] my-2 leading-relaxed">
                      {post.description}
                    </p>
                  )}

                  {/* Buyer details */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                        {post.buyerName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-semibold text-gray-200">{post.buyerName || 'FUW Student'}</span>
                    </div>

                    {isMyPost && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer bg-red-950/40 px-2 py-1 rounded-lg border border-red-800/40"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Green "I Have This" Action Button */}
                <div className="pt-3 mt-2 border-t border-[#2A2A2A] flex items-center justify-between gap-3">
                  <a
                    href={`tel:${post.whatsappNumber}`}
                    className="py-2.5 px-3 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-[#2A2A2A]"
                  >
                    <Phone className="w-3.5 h-3.5 text-gray-300" />
                    <span className="hidden sm:inline">Call Buyer</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] active:scale-98 text-gray-950 font-black text-xs sm:text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-white/20"
                  >
                    <MessageSquare className="w-4 h-4 fill-gray-950 text-gray-950" />
                    <span>I Have This (Chat on WhatsApp)</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* "+ Post What You Need" Modal Form */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-[#151515] border border-[#2A2A2A] text-[#EDEDED] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-gradient-to-r from-[#075B43] to-[#151515]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center font-black">
                  🎯
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Post What You Need</h3>
                  <p className="text-[11px] text-emerald-200">
                    Let campus sellers in FUWukari contact you with offers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePost} className="p-5 space-y-4 overflow-y-auto">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  What are you looking to buy? <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. iPhone 12 Pro 128GB, Medium Mattress, Bajaj Okada, Study Table"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* What They Need / Description */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Detailed Description (What you need) <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention preferred brand, acceptable condition, or any specific requirements..."
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Budget in Naira */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Budget in Naira (₦) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₦</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              {/* Location Select (Rafin Kada, Behind School, Wukari Town) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Location (Campus Area) <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FUWUKARI_WANTED_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all border cursor-pointer text-center truncate ${
                        location === loc
                          ? 'bg-[#0B8751] text-white border-[#0B8751] shadow-xs'
                          : 'bg-[#0A0A0A] text-gray-300 border-[#2A2A2A] hover:bg-[#2A2A2A]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your WhatsApp Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="08167258121 or +234..."
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Sellers will tap "I Have This" and message this WhatsApp number immediately.
                </span>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Name / Nickname
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Stephen (Computer Science)"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-300 font-bold text-xs sm:text-sm rounded-2xl border border-[#2A2A2A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-gray-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Request 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
