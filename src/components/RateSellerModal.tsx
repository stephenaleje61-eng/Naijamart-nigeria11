import React, { useState } from 'react';
import { X, Star, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { submitSellerRating } from '../services/reputationService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface RateSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName?: string;
  productId?: string;
  productTitle?: string;
  onRatingSubmitted?: () => void;
}

export const RateSellerModal: React.FC<RateSellerModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName = 'Seller',
  productId,
  productTitle,
  onRatingSubmitted
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      showToast('Please select at least 1 star', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSellerRating({
        sellerId,
        sellerName,
        productId,
        productTitle,
        buyerName: user?.displayName || user?.email?.split('@')[0] || 'FUW Student',
        rating,
        comment
      });

      if (res.success) {
        showToast(res.message, 'success');
        if (onRatingSubmitted) onRatingSubmitted();
        onClose();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Could not save rating. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5: return '🌟 Outstanding! Smooth & Honest transaction';
      case 4: return '👍 Very Good! Item as described';
      case 3: return '👌 Average / Acceptable';
      case 2: return '👎 Poor experience';
      case 1: return '⚠️ Very Bad / Dishonest';
      default: return 'Select your rating';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#151515] border border-[#2A2A2A] text-[#EDEDED] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-gradient-to-r from-[#075B43] to-[#151515]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">Rate Seller</h3>
              <p className="text-[11px] text-emerald-200 truncate max-w-[220px]">
                {sellerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {productTitle && (
            <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] text-xs">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Item:</span>
              <p className="font-bold text-white truncate">{productTitle}</p>
            </div>
          )}

          {/* Interactive Star Selection */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Your Star Rating <span className="text-[#10B981]">*</span>
            </label>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-hidden"
                  >
                    <Star
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                        active
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-emerald-400 min-h-[18px]">
              {getRatingLabel(hoverRating || rating)}
            </p>
          </div>

          {/* Comment / Review Box */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Review or Transaction Note
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Seller met me at FUW School Gate promptly. Phone was 100% clean and working. Highly recommended!"
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#0A0A0A] hover:bg-[#2A2A2A] text-gray-300 font-bold text-xs sm:text-sm rounded-2xl border border-[#2A2A2A] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#008751] hover:bg-[#007043] active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Submit Rating</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
