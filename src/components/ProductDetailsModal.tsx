import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Share2, 
  AlertTriangle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bike,
  FileCheck,
  CheckCircle2,
  Eye,
  Flame,
  Handshake,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira, formatTimeAgo } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectRelatedProduct: (product: Product) => void;
  allProducts: Product[];
  onOpenBargainChat?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onSelectRelatedProduct,
  allProducts,
  onOpenBargainChat,
}) => {
  const { showToast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const isOkada =
    product.isOkada ||
    product.category?.toLowerCase().includes('okada') ||
    product.category?.toLowerCase().includes('motorcycle');

  // Phone and WhatsApp formatting
  const rawPhone = product.phoneNumber || '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rawWhatsapp = product.whatsappNumber || product.phoneNumber || '';
  const cleanDigits = rawWhatsapp.replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('0')
    ? '234' + cleanDigits.substring(1)
    : cleanDigits.startsWith('234')
    ? cleanDigits
    : '234' + cleanDigits;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Ad link copied to clipboard!', 'info');
    }
  };

  // Related items
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-3 sm:my-6 flex flex-col max-h-[95vh]">
        {/* Top Action Bar */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/90">
          <div className="flex items-center gap-2 text-xs truncate">
            <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
              isOkada ? 'bg-orange-100 text-[#fb6514]' : 'bg-emerald-100 text-[#008751]'
            }`}>
              {product.category}
            </span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-800 truncate max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Left Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Main Image */}
              <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl bg-zinc-950 overflow-hidden border border-gray-200 shadow-xs flex items-center justify-center">
                <img
                  src={imagesList[activeImageIndex] || product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />

                {/* Left/Right swipe if multiple images */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/85"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/85"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-[#fb6514] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    {product.condition || 'Used'}
                  </span>
                  {isOkada && (
                    <span className="bg-black/80 text-yellow-300 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                      🏍️ OKADA
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails row */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#fb6514] scale-105 shadow-xs'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description Box */}
              <div className="mt-2 pt-3 border-t border-gray-200">
                <h3 className="font-black text-gray-900 text-sm mb-2">Item Description</h3>
                <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {product.description || 'No detailed description provided by the seller.'}
                </div>
              </div>
            </div>

            {/* Info Right Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  {product.title}
                </h1>

                {/* Large Green Price with Original Price Strikethrough */}
                <div className="flex items-baseline gap-2.5 mt-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#008751] tracking-tight">
                    {formatNaira(product.price)}
                  </span>
                  <span className="text-sm sm:text-base text-gray-400 line-through font-semibold">
                    {formatNaira(product.originalPrice || Math.round((product.price * 1.18) / 500) * 500)}
                  </span>
                  {onOpenBargainChat && (
                    <button
                      onClick={() => onOpenBargainChat(product)}
                      className="bg-emerald-100 hover:bg-emerald-200 text-[#008751] text-xs font-black px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1 transition-all"
                    >
                      <Handshake className="w-3.5 h-3.5 text-[#008751]" />
                      <span>Negotiable • Bargain</span>
                    </button>
                  )}
                </div>

                {/* Badges: Condition, Location, Papers */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                    Condition: {product.condition || 'Used'}
                  </span>

                  {isOkada && (
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        product.papers === 'Complete'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{product.papers === 'Complete' ? 'Complete Papers' : 'Incomplete Papers'}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                    <span>{product.location || 'Wukari, Taraba State'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatTimeAgo(product.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* Seller Contact Card with BARGAIN CHAT & ACTION BUTTONS */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#008751] text-white font-black flex items-center justify-center text-lg shadow-xs">
                    {product.sellerName?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-gray-900 text-sm">
                        {product.sellerName || 'Marketplace Seller'}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-[#008751]" />
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Location: {product.location || 'Wukari, Nigeria'}
                    </p>
                    <p className="text-xs font-mono font-bold text-gray-800 mt-0.5">
                      Phone: {cleanPhone || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* 3 ACTION BUTTONS: Bargain Chat, Call, WhatsApp */}
                <div className="flex flex-col gap-2 mt-2">
                  {/* Bargain Chat Button (WhatsApp Style) */}
                  {onOpenBargainChat && (
                    <button
                      onClick={() => onOpenBargainChat(product)}
                      className="w-full bg-gradient-to-r from-emerald-600 via-[#008751] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 border border-emerald-500"
                    >
                      <Handshake className="w-4 h-4 text-yellow-300" />
                      <span>Bargain Chat (Offer Your Price) 💬</span>
                    </button>
                  )}
                  {/* Big Call Button */}
                  {cleanPhone ? (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>📞 Call Seller ({cleanPhone})</span>
                    </a>
                  ) : null}

                  {/* Big WhatsApp Button */}
                  <a
                    href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                      `Hello ${product.sellerName || 'Seller'}, I am interested in your listing "${product.title}" (${formatNaira(
                        product.price
                      )}) on NaijaMarket Hub. Is it still available for inspection in ${product.location || 'your area'}?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>💬 Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Safety Guidelines Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Buyer Safety Tips</span>
                </div>
                <ul className="space-y-1 text-amber-900 text-[11px] leading-relaxed">
                  <li>• Meet seller in a busy public place (bank, junction, market).</li>
                  {isOkada && (
                    <li>• Test-ride and inspect engine numbers, chassis, and purchase receipt carefully.</li>
                  )}
                  <li>• Never pay advance delivery fees or bank transfer before seeing the product in person.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                More {product.category} Listings
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedProduct(rel)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{rel.title}</p>
                      <p className="text-xs font-black text-[#008751] mt-0.5">{formatNaira(rel.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
