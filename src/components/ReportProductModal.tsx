import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, Flag } from 'lucide-react';
import { submitProductReport } from '../services/reputationService';
import { useToast } from '../context/ToastContext';

interface ReportProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  sellerId?: string;
  sellerName?: string;
}

const REPORT_REASONS = [
  'Fake picture',
  'Scam / Suspicious Seller',
  'Already sold',
  'Wrong price'
] as const;

export const ReportProductModal: React.FC<ReportProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  sellerId,
  sellerName
}) => {
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<typeof REPORT_REASONS[number]>('Fake picture');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await submitProductReport({
        productId,
        productTitle,
        sellerId,
        sellerName,
        reason: selectedReason,
        explanation
      });

      if (res.success) {
        showToast(res.message, 'success');
        onClose();
      } else {
        showToast(res.message, 'info');
        onClose();
      }
    } catch (err: any) {
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#151515] border border-[#2A2A2A] text-[#EDEDED] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Flag className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">Report Listing</h3>
              <p className="text-[11px] text-gray-400 truncate max-w-[220px]">
                {productTitle}
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
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Select Reason <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-red-950/30 border-red-500/60 text-white font-bold'
                      : 'bg-[#0A0A0A] border-[#2A2A2A] text-gray-300 hover:bg-[#202020]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-500 w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tell us what is wrong with this listing or seller..."
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500"
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
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
