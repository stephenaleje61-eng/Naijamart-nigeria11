import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Flame, 
  CheckCircle, 
  FileText, 
  Handshake, 
  Heart, 
  MoreVertical, 
  Flag, 
  Star 
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { SafeImage } from './SafeImage';
import { isProductSaved, toggleSavedProduct } from '../services/favoritesService';
import { getSellerReputation } from '../services/reputationService';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBargainClick?: (product: Product) => void;
  onReportClick?: (product: Product) => void;
  onRateClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onBargainClick,
  onReportClick,
  onRateClick,
}) => {
  const { showToast } = useToast();
  const [saved, setSaved] = useState<boolean>(() => isProductSaved(product.id));
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleSavedChange = () => {
      setSaved(isProductSaved(product.id));
    };
    window.addEventListener('savedProductsChanged', handleSavedChange);
    return () => window.removeEventListener('savedProductsChanged', handleSavedChange);
  }, [product.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowSaved = await toggleSavedProduct(product.id);
    setSaved(isNowSaved);
    showToast(isNowSaved ? 'Saved to your Wishlist ❤️' : 'Removed from Saved items', isNowSaved ? 'success' : 'info');
  };

  const isOkada =
    product.isOkada ||
    product.category?.toLowerCase().includes('okada') ||
    product.category?.toLowerCase().includes('motorcycle');

  // Format clean phone for tel: and WhatsApp
  const rawPhone = product.phoneNumber || product.ownerPhone || product.whatsappNumber || '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rawWhatsapp = product.whatsappNumber || product.ownerPhone || product.phoneNumber || '';
  const cleanDigits = rawWhatsapp.replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('0')
    ? '234' + cleanDigits.substring(1)
    : cleanDigits.startsWith('234')
    ? cleanDigits
    : cleanDigits ? '234' + cleanDigits : '';

  const discountPercent =
    product.discountPercent ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : Math.floor(Math.random() * 15) + 10);

  const originalPrice =
    product.originalPrice ||
    Math.round((product.price * (100 + discountPercent)) / 100);

  const displayImage = product.imageUrl || (product.images && product.images[0]) || (product as any).coverImage;
  const reputation = getSellerReputation((product as any).userId || (product as any).ownerUid, product.sellerName);

  return (
    <div
      onClick={onClick}
      className="group bg-[#151515] rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-2xs hover:shadow-lg hover:border-[#10B981] transition-all duration-200 cursor-pointer flex flex-col justify-between text-[#EDEDED] relative"
    >
      <div>
        {/* Image Container with Heart Button, 3-dot Menu, & Badges */}
        <div className="relative aspect-square w-full bg-[#0A0A0A] overflow-hidden">
          <SafeImage
            src={displayImage}
            alt={product.title}
            fallbackCategory={isOkada ? 'vehicle' : product.category}
            aspectRatio="aspect-square"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Heart ❤️ Button (Top Right) */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            title={saved ? 'Remove from Saved' : 'Save Item'}
            className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xs transition-all cursor-pointer border border-white/10 active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                saved ? 'fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : 'text-white/80 hover:text-red-400'
              }`}
            />
          </button>

          {/* 3-Dot Action Menu Button (Top Right beside Heart) */}
          <div className="absolute top-2 right-11 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="More options"
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xs text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div 
                className="absolute right-0 top-9 w-44 bg-[#1E1E1E] border border-[#333] rounded-2xl shadow-2xl py-1 z-30 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {onRateClick && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRateClick(product);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-amber-300 hover:bg-[#2A2A2A] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Rate Seller</span>
                  </button>
                )}

                {onReportClick && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onReportClick(product);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-[#2A2A2A] flex items-center gap-2 cursor-pointer transition-colors border-t border-[#2A2A2A]"
                  >
                    <Flag className="w-3.5 h-3.5 text-red-400" />
                    <span>Report This Post</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Temu Discount Badge (Top Left) */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            <span className="bg-[#fb6514] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
            {isOkada && (
              <span className="bg-black/80 backdrop-blur-xs text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-[#2A2A2A]">
                🏍️ OKADA
              </span>
            )}
          </div>

          {/* Free Delivery / Direct Inspection Green Tag */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="bg-[#008751]/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 border border-emerald-600/30">
              <ShieldCheck className="w-3 h-3" /> Direct Meetup
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3 sm:p-3.5">
          {/* Title */}
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#10B981] transition-colors mb-1.5">
            {product.title}
          </h3>

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-base sm:text-lg font-black text-[#10B981] tracking-tight">
              {formatNaira(product.price)}
            </span>
            <span className="text-[11px] text-gray-500 line-through">
              {formatNaira(originalPrice)}
            </span>
          </div>

          {/* Seller Reputation & Verified Badge */}
          <div className="flex items-center justify-between text-[11px] py-1 border-t border-[#2A2A2A]/80 my-1">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{reputation.averageRating} ★</span>
              <span className="text-gray-400 font-normal text-[10px]">({reputation.totalRatings})</span>
            </div>

            {reputation.isVerifiedSeller && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-[#10B981] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                <CheckCircle className="w-2.5 h-2.5" />
                <span>Verified Seller</span>
              </span>
            )}
          </div>

          {/* Location & Time */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#2A2A2A]">
            <span className="flex items-center gap-1 truncate max-w-[130px]">
              <MapPin className="w-3 h-3 text-[#10B981] shrink-0" />
              <span className="truncate">{product.location || 'FUWukari, Taraba'}</span>
            </span>
            <span className="text-[10px] text-gray-500 shrink-0">
              {formatTimeAgo(product.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Bargain Offer + Call + WhatsApp */}
      <div className="p-2.5 pt-0 space-y-1.5 mt-1">
        {onBargainClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBargainClick(product);
            }}
            className="w-full bg-[#0A0A0A] hover:bg-[#2A2A2A] text-emerald-400 border border-[#2A2A2A] py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98 cursor-pointer"
          >
            <Handshake className="w-3.5 h-3.5 text-emerald-400" />
            <span>🤝 Bargain Offer</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Call Button */}
          <a
            href={`tel:${cleanPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0A0A0A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A] py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Call</span>
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
              `Hello ${product.sellerName || 'Seller'}, I am contacting you from FUWUKARI NaijaMart regarding "${product.title}" listed for ${formatNaira(
                product.price
              )} in ${product.location || 'FUWukari'}. Is it still available?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-gray-950 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-gray-950 text-gray-950" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
