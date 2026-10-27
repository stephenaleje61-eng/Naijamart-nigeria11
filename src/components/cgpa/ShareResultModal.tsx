import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Copy, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { DegreeClassification, GradingScale } from '../../types/cgpa';
import { 
  generateResultCardDataUrl, 
  downloadResultCard, 
  shareResultCard 
} from './ResultCardCanvas';
import { useToast } from '../../context/ToastContext';

interface ShareResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    studentName?: string;
    university?: string;
    department?: string;
    cgpa: number;
    gradingScale: GradingScale;
    totalUnits: number;
    totalPoints: number;
    semestersCount: number;
    classification: DegreeClassification;
  };
}

export const ShareResultModal: React.FC<ShareResultModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { showToast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    generateResultCardDataUrl(data)
      .then((url) => {
        if (isMounted) {
          setPreviewUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating result card:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      await downloadResultCard(data, `CGPA_${data.cgpa.toFixed(2)}_NaijaHub.png`);
      showToast('Result card downloaded! Ready for WhatsApp Status 🎓', 'success');
    } catch {
      showToast('Could not download image. Please try again.', 'error');
    }
  };

  const handleShareToWhatsApp = () => {
    const text = `🎓 MY CGPA: ${data.cgpa.toFixed(2)} (${data.classification.classTitle})! Calculated on NaijaHub. Check your GPA in 30 seconds: https://naijahub.vercel.app/cgpa-calculator`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    try {
      await shareResultCard(data);
    } catch {
      handleShareToWhatsApp();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://naijahub.vercel.app/cgpa-calculator');
    setIsCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#151515] text-[#EDEDED] w-full max-w-lg rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              🎓
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">Your CGPA Result Card</h2>
              <p className="text-xs text-gray-400">Ready to save & share on WhatsApp Status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0A0A0A] hover:bg-[#2A2A2A] border border-[#2A2A2A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Body / Image Preview */}
        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-[340px] aspect-4/5 rounded-2xl overflow-hidden shadow-2xl border border-[#2A2A2A] relative bg-[#0A0A0A] flex items-center justify-center">
            {isGenerating || !previewUrl ? (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#087443]" />
                <span className="text-xs font-bold">Rendering High-Res Result Card...</span>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="My CGPA Result Card"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <p className="text-xs text-center text-gray-400 max-w-xs">
            Showcase your hard work and inspire fellow course mates on WhatsApp, Instagram & Twitter!
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-2xl bg-white text-gray-950 font-black text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#087443]" />
                <span>Download Image</span>
              </button>

              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Status</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-gray-700 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Device...</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-gray-700 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Calc Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
