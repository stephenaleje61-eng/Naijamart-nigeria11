import React from 'react';
import { 
  GraduationCap, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Check, 
  Handshake, 
  Tag, 
  Share2 
} from 'lucide-react';
import { WantedItem } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';

interface WantedCardProps {
  item: WantedItem;
  onIHaveThis: (item: WantedItem) => void;
  onShare?: (item: WantedItem) => void;
}

export const WantedCard: React.FC<WantedCardProps> = ({
  item,
  onIHaveThis,
  onShare,
}) => {
  const cleanPhone = item.phoneNumber?.replace(/[^0-9+]/g, '') || '';
  const cleanWhatsapp = item.whatsappNumber?.replace(/[^0-9]/g, '') || cleanPhone;
  const formattedWhatsapp = cleanWhatsapp.startsWith('0')
    ? '234' + cleanWhatsapp.substring(1)
    : cleanWhatsapp;

  // Format urgency badge
  const renderUrgencyBadge = () => {
    if (item.urgency === 'Urgent') {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[11px] font-black animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          🚨 Urgent (Need ASAP)
        </span>
      );
    }
    if (item.urgency === 'This Week') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
          <Calendar className="w-3 h-3 text-amber-600" />
          📅 This Week
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
        <Clock className="w-3 h-3 text-gray-500" />
        ⏳ Flexible Timing
      </span>
    );
  };

  // Student initials for avatar if no photo
  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 p-3.5 sm:p-5 flex flex-col justify-between relative group">
      {/* Twitter-like Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Student Avatar */}
            <div className="relative flex-shrink-0">
              {item.avatarUrl ? (
                <img 
                  src={item.avatarUrl} 
                  alt={item.buyerName} 
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-400 text-white flex items-center justify-center font-black text-sm shadow-2xs border-2 border-white">
                  {getInitials(item.buyerName)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                <div className="w-3.5 h-3.5 bg-[#008751] rounded-full flex items-center justify-center text-white text-[8px]">
                  ✓
                </div>
              </div>
            </div>

            {/* Buyer Name & School Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-black text-gray-900 text-sm sm:text-base truncate">
                  {item.buyerName}
                </h4>
                <span className="text-[11px] text-gray-400 font-normal">
                  @{item.buyerName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'student'}
                </span>
                <span className="text-gray-300 text-xs">•</span>
                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                  {formatTimeAgo(item.createdAt)}
                </span>
              </div>

              {/* School / Campus Pill */}
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#008751] font-bold text-[11px] px-2 py-0.5 rounded-md border border-emerald-100">
                  <GraduationCap className="w-3 h-3 text-[#008751]" />
                  <span className="truncate max-w-[200px]">{item.school || 'FU Wukari'}</span>
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="truncate max-w-[150px]">{item.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Urgency Badge (Top-Right) */}
          <div className="flex-shrink-0">
            {renderUrgencyBadge()}
          </div>
        </div>

        {/* Item Wanted Headline (Bold & Prominent) */}
        <div className="my-2.5">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3 h-3 text-[#008751]" /> Buyer Is Looking For:
          </div>
          <h3 className="font-black text-gray-950 text-base sm:text-lg leading-snug">
            {item.itemWanted}
          </h3>

          {/* Description / Requirements */}
          {item.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-3 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
              "{item.description}"
            </p>
          )}

          {/* Sample Image if buyer attached a reference picture */}
          {item.sampleImageUrl && (
            <div className="mt-2.5 rounded-xl overflow-hidden border border-gray-200 max-h-48 bg-gray-100">
              <img 
                src={item.sampleImageUrl} 
                alt={item.itemWanted} 
                className="w-full h-40 object-cover hover:scale-105 transition-transform cursor-pointer"
                onClick={() => onIHaveThis(item)}
              />
            </div>
          )}
        </div>

        {/* Jiji-style Details Bar: Budget & Category */}
        <div className="flex items-center justify-between gap-2 flex-wrap py-2 border-y border-gray-100 my-2.5 bg-emerald-50/40 px-3 rounded-xl">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">
              Max Budget
            </span>
            <div className="text-lg sm:text-xl font-black text-[#008751] tracking-tight">
              {formatNaira(item.budget)}
              <span className="text-[10px] text-gray-500 font-semibold ml-1">
                {item.budgetType === 'fixed' ? '(Fixed)' : item.budgetType === 'negotiable' ? '(Negotiable)' : '(Ready)'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">
              Category
            </span>
            <span className="inline-block bg-white text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-gray-200">
              {item.category || 'General'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer: Big Green "I Have This" + Direct Contact */}
      <div className="pt-2 flex items-center justify-between gap-2">
        {/* Direct Call / WhatsApp Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${cleanPhone}`}
            title="Call Buyer Directly"
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors shadow-2xs"
          >
            <Phone className="w-4 h-4 text-gray-700" />
          </a>

          <a
            href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
              `Hello ${item.buyerName}, I saw your request on NaijaMarket Hub Wanted Board for "${item.itemWanted}" (Budget: ${formatNaira(item.budget)}). I have this available! Are you still looking for it?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
          </a>
        </div>

        {/* Big Green "I Have This" Button */}
        <button
          onClick={() => onIHaveThis(item)}
          className="flex-1 bg-[#008751] hover:bg-[#007043] active:scale-98 text-white py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <Handshake className="w-4 h-4 text-emerald-200" />
          <span>I Have This</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
            ₦
          </span>
        </button>
      </div>
    </article>
  );
};
