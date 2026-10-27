import React, { useState } from 'react';
import { FarmListing, NIGERIAN_STATES } from '../types';
import { 
  X, 
  Sprout, 
  MapPin, 
  Calendar, 
  Truck, 
  Scale, 
  MessageSquare, 
  Calculator, 
  CheckCircle,
  Share2,
  TrendingDown
} from 'lucide-react';

interface Props {
  produce: FarmListing | null;
  onClose: () => void;
}

export const FarmDetailModal: React.FC<Props> = ({ produce, onClose }) => {
  const minOrder = produce?.minOrderQuantity || produce?.moq || 1;
  const [orderQuantity, setOrderQuantity] = useState<number>(minOrder);
  const [destinationState, setDestinationState] = useState<string>('Lagos');
  const [transportMode, setTransportMode] = useState<'haulage' | 'truck_10t' | 'bus_waybill'>('haulage');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!produce) return null;

  // Bulk tier pricing logic:
  // > 20 units -> 5% discount
  // > 50 units -> 10% discount
  let discountMultiplier = 1;
  if (orderQuantity >= 50) {
    discountMultiplier = 0.9;
  } else if (orderQuantity >= 20) {
    discountMultiplier = 0.95;
  }

  const effectiveUnitPrice = Math.round(produce.pricePerUnit * discountMultiplier);
  const produceCost = orderQuantity * effectiveUnitPrice;

  // Waybill freight estimation per unit based on destination region
  const getFreightRate = (dest: string, mode: string) => {
    let baseRate = 1800; // default intra-region
    const northernStates = ['Taraba', 'Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Yobe', 'Kano', 'Kaduna', 'Katsina', 'Jigawa', 'Sokoto', 'Kebbi', 'Zamfara'];
    const southernStates = ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti', 'Rivers', 'Delta', 'Edo', 'Bayelsa', 'Akwa Ibom', 'Cross River', 'Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi'];
    
    const isInterRegional = (northernStates.includes(produce.state) && southernStates.includes(dest)) ||
                            (southernStates.includes(produce.state) && northernStates.includes(dest));

    if (dest === produce.state) {
      baseRate = 900;
    } else if (isInterRegional) {
      baseRate = 3200;
    } else {
      baseRate = 1900;
    }

    if (mode === 'truck_10t') baseRate *= 0.85; // volume discount
    if (mode === 'bus_waybill') baseRate *= 1.25; // small batch premium

    return Math.round(baseRate);
  };

  const perUnitFreight = getFreightRate(destinationState, transportMode);
  const estimatedFreight = orderQuantity * perUnitFreight;
  const grandTotal = produceCost + estimatedFreight;

  const getWhatsAppUrl = () => {
    const raw = produce.phone.replace(/[^0-9]/g, '');
    const intl = raw.startsWith('0') 
      ? '234' + raw.slice(1) 
      : raw.startsWith('234') 
      ? raw 
      : '234' + raw;
    
    const text = `Hello Farmer ${produce.farmerName}, I am contacting you from FarmLink Africa (NaijaHub) regarding your ${produce.cropName}.
Order Details:
• Quantity: ${orderQuantity} ${produce.unit}
• Est. Produce Cost: ₦${produceCost.toLocaleString()} (at ₦${effectiveUnitPrice.toLocaleString()}/${produce.unit})
• Delivery Destination: ${destinationState} State
• Est. Waybill Freight: ₦${estimatedFreight.toLocaleString()}
• Grand Estimated Total: ₦${grandTotal.toLocaleString()}

Please confirm produce availability and dispatch schedule.`;

    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#17231F] leading-tight">
                {produce.cropName}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {produce.category} • Farmer: {produce.farmerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share link"
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {copiedLink && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#075B43] text-xs font-bold rounded-xl text-center">
              Link copied to clipboard!
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F8F7F2] rounded-2xl border border-gray-200/60 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Standard Price</span>
              <span className="font-black text-sm text-[#075B43]">
                ₦{produce.pricePerUnit.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-500"> / {produce.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Minimum Order (MOQ)</span>
              <span className="font-bold text-gray-800">{minOrder} {produce.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Harvest Date</span>
              <span className="font-bold text-gray-800">{produce.harvestDate || 'Fresh on Demand'}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Farm Location</span>
              <span className="font-bold text-gray-800 truncate">{produce.lga}, {produce.state}</span>
            </div>
          </div>

          {/* Bulk Volume Discount Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-bold">
            <TrendingDown className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Volume Discounts: 5% off on 20+ {produce.unit}, 10% off on 50+ {produce.unit}!
            </span>
          </div>

          {/* Farm Description */}
          {produce.description && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Produce Specifications & Harvest Notes
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                {produce.description}
              </p>
            </div>
          )}

          {/* INTERACTIVE FREIGHT & BULK PURCHASE CALCULATOR */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-800/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#075B43] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#0D9B72]" />
                Interstate Waybill & Bulk Purchase Calculator
              </h3>
              <span className="text-[10px] font-bold text-gray-500">Direct Farm Gate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Order Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Order Quantity ({produce.unit})
                </label>
                <input
                  type="number"
                  min={minOrder}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(minOrder, Number(e.target.value) || minOrder))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#075B43] focus:outline-none"
                />
                <span className="text-[10px] text-gray-400">Min: {minOrder} {produce.unit}</span>
              </div>

              {/* Destination State */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Delivery State
                </label>
                <select
                  value={destinationState}
                  onChange={(e) => setDestinationState(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#075B43] focus:outline-none cursor-pointer"
                >
                  {NIGERIAN_STATES.filter(s => s !== 'All Nigeria').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400">Origin: {produce.state}</span>
              </div>

              {/* Transport Vehicle Type */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Waybill Vehicle
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#075B43] focus:outline-none cursor-pointer"
                >
                  <option value="haulage">Haulage Trailer / Truck</option>
                  <option value="truck_10t">10-Tonne Tipper / Canter</option>
                  <option value="bus_waybill">Interstate Bus Waybill</option>
                </select>
                <span className="text-[10px] text-gray-400">Rate: ~₦{perUnitFreight.toLocaleString()}/{produce.unit}</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-[#F8F7F2] p-4 rounded-xl border border-gray-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>
                  Produce Cost ({orderQuantity} × ₦{effectiveUnitPrice.toLocaleString()}
                  {discountMultiplier < 1 && ` [${Math.round((1 - discountMultiplier) * 100)}% off]`}):
                </span>
                <span className="font-bold text-gray-900">₦{produceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Interstate Freight to {destinationState}:</span>
                <span className="font-bold text-gray-900">₦{estimatedFreight.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-[#075B43]">
                <span>Estimated Total (Produce + Freight):</span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600 font-medium">
            Farmer Phone: <span className="font-bold text-gray-900">{produce.phone}</span>
          </div>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
          >
            <MessageSquare className="w-4 h-4 text-[#F5B942]" />
            <span>Send Direct Bulk Inquiry</span>
          </a>
        </div>
      </div>
    </div>
  );
};
