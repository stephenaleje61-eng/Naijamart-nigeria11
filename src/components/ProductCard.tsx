import React from 'react';
import { MapPin, ShieldCheck, Phone, MessageSquare, Flame, CheckCircle, FileText, Handshake } from 'lucide-react';
import { Product } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBargainClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onBargainClick,
}) => {
  const isOkada =
    product.isOkada ||
    product.category?.toLowerCase().includes('okada') ||
    product.category?.toLowerCase().includes('motorcycle');

  // Format clean phone for tel: and WhatsApp
  const rawPhone = product.phoneNumber || '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rawWhatsapp = product.whatsappNumber || product.phoneNumber || '';
  const cleanDigits = rawWhatsapp.replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('0')
    ? '234' + cleanDigits.substring(1)
    : cleanDigits.startsWith('234')
    ? cleanDigits
    : '234' + cleanDigits;

  const discountPercent =
    product.discountPercent ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : Math.floor(Math.random() * 15) + 10);

  const originalPrice =
    product.originalPrice ||
    Math.round((product.price * (100 + discountPercent)) / 100);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image Container with Temu Discount Badge */}
        <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Temu Discount Badge (Top Left) */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            <span className="bg-[#fb6514] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
            {isOkada && (
              <span className="bg-black/80 backdrop-blur-xs text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                🏍️ OKADA
              </span>
            )}
          </div>

          {/* Condition / Papers Badge (Top Right) */}
          <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
            <span className="bg-white/95 backdrop-blur-xs text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs">
              {product.condition || 'Used'}
            </span>
            {isOkada && product.papers && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs ${
                  product.papers === 'Complete'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {product.papers === 'Complete' ? '✓ Papers OK' : 'No Full Papers'}
              </span>
            )}
          </div>

          {/* Free Delivery / Direct Inspection Green Tag */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="bg-[#008751]/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Direct Meetup
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3 sm:p-3.5">
          {/* Title truncated to 2 lines */}
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#008751] transition-colors mb-1.5">
            {product.title}
          </h3>

          {/* Price Row (Temu / Jumia pricing style) */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-base sm:text-lg font-black text-[#008751] tracking-tight">
              {formatNaira(product.price)}
            </span>
            <span className="text-[11px] text-gray-400 line-through">
              {formatNaira(originalPrice)}
            </span>
          </div>

          {/* Temu-style "Almost Sold Out" stock progress bar */}
          <div className="mt-1.5 mb-2">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5 font-medium">
              <span className="flex items-center gap-1 text-[#fb6514] font-bold">
                <Flame className="w-3 h-3 fill-[#fb6514]" /> High Demand
              </span>
              <span className="text-gray-400">Verified seller</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#fb6514] h-1.5 rounded-full w-4/5" />
            </div>
          </div>

          {/* Location & Time */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1.5 border-t border-gray-100">
            <span className="flex items-center gap-1 truncate max-w-[130px]">
              <MapPin className="w-3 h-3 text-[#008751] flex-shrink-0" />
              <span className="truncate">{product.location || 'Wukari, Taraba'}</span>
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {formatTimeAgo(product.createdAt)}
            </span>
          </div>

          {/* Seller Phone Display */}
          <div className="mt-1.5 flex items-center justify-between text-[11px] bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
            <span className="font-semibold text-gray-700 truncate max-w-[100px]">
              {product.sellerName || 'Seller'}
            </span>
            <span className="font-mono text-gray-900 font-bold text-[11px]">
              📞 {cleanPhone || 'Contact'}
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
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#008751] border border-emerald-300 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98"
          >
            <Handshake className="w-3.5 h-3.5 text-[#008751]" />
            <span>🤝 Bargain Offer</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Call Button */}
          <a
            href={`tel:${cleanPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 hover:bg-black text-white py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Seller</span>
          </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
            `Hello ${product.sellerName || 'Seller'}, I am contacting you from NaijaMarket Hub regarding "${product.title}" listed for ${formatNaira(
              product.price
            )} in ${product.location || 'Nigeria'}. Is it still available?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  </div>
);
};
