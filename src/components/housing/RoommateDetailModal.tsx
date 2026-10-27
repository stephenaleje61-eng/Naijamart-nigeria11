import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Users, 
  Calendar, 
  DollarSign, 
  Flag, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { RoommateListing } from '../../types/housing';
import { deleteRoommateListing, reportListing } from '../../services/housingService';

interface RoommateDetailModalProps {
  roommate: RoommateListing | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (poster: { uid: string; name: string; phone?: string; photo?: string }) => void;
  onUpdated?: () => void;
}

export const RoommateDetailModal: React.FC<RoommateDetailModalProps> = ({
  roommate,
  isOpen,
  onClose,
  onStartChat,
  onUpdated,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('Fake roommate post');

  if (!isOpen || !roommate) return null;

  const isOwner = user?.uid && user.uid === roommate.posterUid;

  const handleDelete = async () => {
    if (!window.confirm('Delete this roommate request?')) return;
    try {
      await deleteRoommateListing(roommate.id);
      showToast('Roommate request deleted', 'success');
      onClose();
      if (onUpdated) onUpdated();
    } catch {
      showToast('Could not delete', 'error');
    }
  };

  const handleReport = async () => {
    if (!user) {
      showToast('Please sign in to report', 'error');
      return;
    }
    try {
      const res = await reportListing('roommates', roommate.id, reportReason, user.uid);
      setIsReporting(false);
      if (res.isHidden) {
        showToast('Listing removed due to community fraud reports.', 'success');
        onClose();
        if (onUpdated) onUpdated();
      } else {
        showToast('Report received. Thank you.', 'info');
      }
    } catch {
      showToast('Failed to submit report', 'error');
    }
  };

  const cleanPhone = roommate.posterPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0')
    ? '234' + cleanPhone.slice(1)
    : cleanPhone.startsWith('234')
    ? cleanPhone
    : '234' + cleanPhone;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hello ${roommate.posterName}, I saw your Roommate post on Africa Chat Housing (Budget ₦${roommate.budget.toLocaleString()} in ${roommate.location}). Let's discuss room sharing!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#128C7E] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-xl uppercase">
              {roommate.lookingFor}
            </span>
            <span className="bg-emerald-300 text-emerald-950 text-xs font-black px-2.5 py-1 rounded-xl">
              Pref: {roommate.genderPref}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Room photos */}
          {roommate.photos && roommate.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {roommate.photos.map((p, idx) => (
                <div key={idx} className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Heading info */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-black text-gray-900">
                Seeking {roommate.lookingFor}
              </h2>
              <span className="text-lg font-black text-[#128C7E]">
                ₦{roommate.budget.toLocaleString()}
                <span className="text-xs font-semibold text-gray-500"> /person</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-[#128C7E]" />
              <span>{roommate.location}</span>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Room Type</p>
              <p className="text-xs font-black text-gray-900">{roommate.roomType}</p>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Target Move-in</p>
              <p className="text-xs font-black text-gray-900">{roommate.moveInDate}</p>
            </div>
          </div>

          {/* About Me & Rules */}
          {roommate.aboutMe && (
            <div className="space-y-1">
              <p className="text-xs font-black text-gray-900 uppercase tracking-wider">
                About Me & House Rules
              </p>
              <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-200 leading-relaxed whitespace-pre-line">
                {roommate.aboutMe}
              </div>
            </div>
          )}

          {/* Poster info */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#128C7E]/10 text-[#128C7E] font-black flex items-center justify-center text-base">
                  {roommate.posterName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">{roommate.posterName}</h4>
                  <p className="text-[11px] text-gray-500">Phone: {roommate.posterPhone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReporting(!isReporting)}
                className="text-[10px] text-gray-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href={`tel:${roommate.posterPhone}`}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#128C7E]" />
                <span>Call</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  if (onStartChat) {
                    onStartChat({
                      uid: roommate.posterUid,
                      name: roommate.posterName,
                      phone: roommate.posterPhone,
                    });
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-[#128C7E] hover:bg-[#0e7468] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          </div>

          {isOwner && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Request</span>
              </button>
            </div>
          )}

          {isReporting && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-2">
              <p className="text-xs font-bold text-red-700">Report this roommate listing</p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-red-300 bg-white"
              >
                <option value="Fake roommate post">Fake roommate post</option>
                <option value="Asking for upfront deposit before meeting">Asking for money upfront / scam</option>
                <option value="Inappropriate content">Inappropriate content</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsReporting(false)}
                  className="px-3 py-1 text-xs text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
