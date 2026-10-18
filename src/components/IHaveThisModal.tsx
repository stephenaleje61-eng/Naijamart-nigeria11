import React from 'react';
import { 
  X, 
  Handshake, 
  Phone, 
  MessageSquare, 
  GraduationCap, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { WantedItem } from '../types';
import { formatNaira } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useStudent } from '../context/StudentContext';
import { UserPlus } from 'lucide-react';

interface IHaveThisModalProps {
  item: WantedItem | null;
  onClose: () => void;
}

export const IHaveThisModal: React.FC<IHaveThisModalProps> = ({ item, onClose }) => {
  const { showToast } = useToast();
  const { openPrivateChatWith, sendFriendRequest } = useStudent();

  if (!item) return null;

  const cleanPhone = item.phoneNumber?.replace(/[^0-9+]/g, '') || '';
  const cleanWhatsapp = item.whatsappNumber?.replace(/[^0-9]/g, '') || cleanPhone;
  const formattedWhatsapp = cleanWhatsapp.startsWith('0')
    ? '234' + cleanWhatsapp.substring(1)
    : cleanWhatsapp;

  const defaultWhatsappMessage = `Hello ${item.buyerName}, I saw your request on NaijaMarket Hub Wanted Board for "${item.itemWanted}" (Budget: ${formatNaira(item.budget)}). I have this available in ${item.school || 'Wukari'}! Are you still looking to buy?`;

  const copyPhoneNumber = () => {
    if (cleanPhone) {
      navigator.clipboard.writeText(cleanPhone);
      showToast('Phone number copied to clipboard!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#008751] to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg">Contact Buyer</h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                NaijaMarket Hub Student Wanted Board
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Buyer Request Summary Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#008751] block mb-0.5">
                  Requested Item
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                  {item.itemWanted}
                </h3>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">
                  Buyer's Budget
                </span>
                <span className="text-lg font-black text-[#008751]">
                  {formatNaira(item.budget)}
                </span>
              </div>
            </div>

            {/* School & Campus details */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-100 flex-wrap text-xs text-gray-700 font-medium">
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-100 font-bold text-[#008751]">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{item.school || 'FU Wukari'}</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600">
                <span>Buyer: <strong>{item.buyerName}</strong></span>
              </div>
            </div>

            {item.description && (
              <p className="mt-2.5 text-xs text-gray-600 bg-white/80 p-2.5 rounded-xl border border-emerald-100/60 italic">
                "{item.description}"
              </p>
            )}
          </div>

          {/* Action 1: Private Chat inside Marketplace (Real-Time) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                const targetBuyerId = item.buyerId || ('buyer_' + (item.buyerName || 'user').toLowerCase().replace(/[^a-z0-9]/g, ''));
                onClose();
                openPrivateChatWith({
                  id: targetBuyerId,
                  fullName: item.buyerName,
                  campus: item.school || 'FU Wukari',
                  phone: cleanPhone,
                });
              }}
              className="bg-[#008751] hover:bg-[#007043] active:scale-98 text-white py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Private Chat Inside App 💬</span>
            </button>

            <button
              onClick={() => {
                const targetBuyerId = item.buyerId || ('buyer_' + (item.buyerName || 'user').toLowerCase().replace(/[^a-z0-9]/g, ''));
                sendFriendRequest({
                  id: targetBuyerId,
                  name: item.buyerName,
                  campus: item.school || 'FU Wukari',
                  phone: cleanPhone,
                });
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#008751] border border-emerald-300 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Connect / Add Friend</span>
            </button>
          </div>

          {/* Action 2: WhatsApp Chat */}
          <a
            href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(defaultWhatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span>Chat Buyer on WhatsApp Now</span>
          </a>

          {/* Action 3: Direct Phone Call */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 bg-gray-900 hover:bg-black active:scale-98 text-white py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call {cleanPhone || 'Buyer'}</span>
            </a>

            <button
              onClick={copyPhoneNumber}
              title="Copy phone number"
              className="px-3.5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold text-xs flex items-center gap-1 border border-gray-200"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </button>
          </div>

          {/* Campus Safety Tips */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Student Safety & Deal Guidelines:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 pl-1">
              <li>Always meet in a public campus venue (School Gate, FUW Library, Hostel porter lounge).</li>
              <li>Allow the buyer to thoroughly inspect the item before taking payment.</li>
              <li>No upfront delivery fees or commitments before physical inspection.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>100% Free • Direct Connection • No Intermediary</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
