import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Users, 
  Home, 
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SquatterItem } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { useStudent } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';

interface SquatterCardProps {
  item: SquatterItem;
  onSelectImage?: (imageUrl: string) => void;
}

export const SquatterCard: React.FC<SquatterCardProps> = ({ item }) => {
  const { openPrivateChatWith } = useStudent();
  const { showToast } = useToast();

  const cleanWhatsapp = item.whatsapp.replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanWhatsapp.startsWith('0')
    ? '234' + cleanWhatsapp.substring(1)
    : cleanWhatsapp.startsWith('234')
    ? cleanWhatsapp
    : '234' + cleanWhatsapp;

  const whatsappMessage = encodeURIComponent('Hello, I saw your hostel on NaijaMart Squatter Board');
  const whatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${whatsappMessage}`;

  const isHaveSpace = item.type === 'have_space';

  const defaultImage = isHaveSpace
    ? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80';

  const displayImage = item.images && item.images.length > 0 ? item.images[0] : defaultImage;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Bedspace link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Header Image with Badges */}
        <div className="relative aspect-[16/10] bg-gray-900 overflow-hidden">
          <img 
            src={displayImage} 
            alt={item.location} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* Top Left: Type Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm border ${
              isHaveSpace 
                ? 'bg-[#008751] text-white border-emerald-400' 
                : 'bg-blue-600 text-white border-blue-400'
            }`}>
              <Home className="w-3.5 h-3.5" />
              <span>{isHaveSpace ? 'I HAVE SPACE' : 'I NEED SPACE'}</span>
            </span>
          </div>

          {/* Top Right: Verified Badge & Share */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            {item.is_verified && (
              <span className="bg-white/95 text-[#008751] text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" /> Verified
              </span>
            )}
            <button
              onClick={handleShare}
              className="w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-lg flex items-center justify-center transition-colors"
              title="Share bedspace"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Left on Image: Price */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="text-white text-lg sm:text-xl font-black drop-shadow-md tracking-tight">
              {formatNaira(item.price)}
              <span className="text-[11px] font-medium text-emerald-200 ml-1">
                {isHaveSpace ? '/ session' : ' budget'}
              </span>
            </span>
          </div>

          {/* Bottom Right on Image: Image Count */}
          {item.images && item.images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                📷 {item.images.length} photos
              </span>
            </div>
          )}
        </div>

        {/* Card Content Details */}
        <div className="p-3.5 sm:p-4 space-y-2.5">
          {/* Location & Time ago */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-extrabold text-gray-900 flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4 text-[#008751] flex-shrink-0" />
              <span>{item.location}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Posted {formatTimeAgo(item.created_at)}</span>
            </span>
          </div>

          {/* Roommate details & Gender chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-gray-200">
              <Users className="w-3 h-3 text-gray-600" />
              <span>{item.people_in_room}</span>
            </span>

            <span className={`inline-flex items-center text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
              item.gender === 'male'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : item.gender === 'female'
                ? 'bg-pink-50 text-pink-800 border-pink-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {item.gender === 'male' ? '♂ Male Only' : item.gender === 'female' ? '♀ Female Only' : '⚧ Any Gender'}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3.5 sm:p-4 pt-1 border-t border-gray-100 flex items-center gap-2">
        {/* WhatsApp Button (Prompt Requirement: Chat on WhatsApp FREE) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>Chat on WhatsApp FREE</span>
        </a>

        {/* In-App Private Chat Button */}
        <button
          onClick={() => {
            openPrivateChatWith(
              {
                id: 'hostel_' + item.id,
                fullName: `${item.location} Bedspace`,
                campus: 'FU Wukari',
                phone: item.whatsapp,
              },
              {
                id: item.id,
                title: `${item.location} - ${isHaveSpace ? 'Available Bedspace' : 'Seeking Bedspace'}`,
                price: item.price,
                imageUrl: displayImage,
              }
            );
          }}
          title="Private Chat on NaijaMarket Hub"
          className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008751] border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs font-bold"
        >
          <MessageSquare className="w-4 h-4 text-[#008751]" />
        </button>
      </div>
    </div>
  );
};
