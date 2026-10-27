import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { BusinessProfile } from '../types';
import { 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Star, 
  MessageSquare, 
  ShoppingBag, 
  Send,
  Share2
} from 'lucide-react';

interface Props {
  business: BusinessProfile | null;
  onClose: () => void;
  onOpenAuth: () => void;
  isOpenNow: (openTime?: string, closeTime?: string) => boolean;
}

interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export const BusinessDetailModal: React.FC<Props> = ({
  business,
  onClose,
  onOpenAuth,
  isOpenNow
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!business?.id) return;

    const revRef = collection(db, 'reviews');
    const q = query(
      revRef, 
      where('businessId', '==', business.id), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const revs: Review[] = [];
        snapshot.forEach((doc) => {
          revs.push({ id: doc.id, ...doc.data() } as Review);
        });
        setReviews(revs);
      },
      (err) => {
        console.warn('Reviews fetch warning:', err);
      }
    );

    return () => unsubscribe();
  }, [business?.id]);

  if (!business) return null;

  const bName = business.businessName || business.name || 'Store';
  const openT = business.openingHours?.open || business.openTime || '08:00';
  const closeT = business.openingHours?.close || business.closeTime || '18:00';
  const isVer = business.verified || business.verifiedType === 'cac' || business.verifiedType === 'community';
  const verType = business.verificationType || business.verifiedType || 'cac';

  const openStatus = isOpenNow(openT, closeT);

  const getWhatsAppUrl = (msg?: string) => {
    const raw = business.phone.replace(/[^0-9]/g, '');
    const intl = raw.startsWith('0') 
      ? '234' + raw.slice(1) 
      : raw.startsWith('234') 
      ? raw 
      : '234' + raw;
    const defaultText = msg || `Hello ${bName}, I discovered your business on NaijaHub Africa. I'd like to make an inquiry.`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(defaultText)}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        businessId: business.id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'NaijaHub Member',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });
      setComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#075B43]/10 text-[#075B43] flex items-center justify-center font-bold text-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#17231F] leading-tight">
                  {bName}
                </h2>
                {isVer && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#075B43] border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-[#0D9B72]" />
                    {verType === 'cac' ? 'CAC Verified' : 'Community Verified'}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {business.category} • {business.state}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share link"
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {copiedLink && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#075B43] text-xs font-bold rounded-xl text-center">
              Link copied to clipboard!
            </div>
          )}

          {/* Status & Operating Hours */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F8F7F2] rounded-2xl border border-gray-200/60">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  openStatus ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className="text-xs font-black text-gray-800">
                {openStatus ? 'Open Now (WAT/Lagos)' : 'Closed Right Now'}
              </span>
              <span className="text-xs text-gray-500">
                ({openT} - {closeT})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <MapPin className="w-4 h-4 text-[#075B43]" />
              <span>{business.address}, {business.state}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              About This Business
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
              {business.description}
            </p>
          </div>

          {/* Products / Services Catalog */}
          {business.products && business.products.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#075B43]" />
                Featured Products & Offerings ({business.products.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.products.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{prod.title}</h4>
                        <span className="text-xs font-black text-[#075B43]">
                          ₦{prod.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                    </div>

                    <a
                      href={getWhatsAppUrl(`Hello ${bName}, I would like to order: ${prod.title} (₦${prod.price.toLocaleString()}) seen on NaijaHub.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#075B43] rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#F5B942] fill-[#F5B942]" />
                Customer Reviews ({reviews.length})
              </h3>
            </div>

            {/* Existing Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">
                No customer reviews yet. Be the first to leave feedback!
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-gray-900">{rev.userName}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= rev.rating
                                ? 'text-[#F5B942] fill-[#F5B942]'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review Form */}
            <form onSubmit={handleAddReview} className="bg-[#F8F7F2] p-4 rounded-2xl border border-gray-200/60 space-y-3">
              <h4 className="text-xs font-bold text-gray-800">Leave a Review</h4>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= rating ? 'text-[#F5B942] fill-[#F5B942]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience dealing with this business (quality, speed, customer service)..."
                rows={2}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43] focus:outline-none"
              />

              {reviewSuccess && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Review submitted successfully!
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600 font-medium">
            Contact: <span className="font-bold text-gray-900">{business.phone}</span>
          </div>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
          >
            <MessageSquare className="w-4 h-4 text-[#F5B942]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
