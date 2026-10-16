import React from 'react';
import { Phone, MessageSquare, MapPin, Bike, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OkadaRider } from '../types';
import { formatTimeAgo } from '../utils/formatters';

interface RiderCardProps {
  rider: OkadaRider;
}

export const RiderCard: React.FC<RiderCardProps> = ({ rider }) => {
  // Format clean phone for tel: and WhatsApp
  const rawPhone = rider.phoneNumber || '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rawWhatsapp = rider.whatsappNumber || rider.phoneNumber || '';
  const cleanDigits = rawWhatsapp.replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('0')
    ? '234' + cleanDigits.substring(1)
    : cleanDigits.startsWith('234')
    ? cleanDigits
    : '234' + cleanDigits;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Rider Picture with Status Badge */}
        <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
          {rider.photoUrl ? (
            <img
              src={rider.photoUrl}
              alt={rider.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-orange-600">
              <Bike className="w-12 h-12 mb-1" />
              <span className="text-xs font-bold">Wukari Rider</span>
            </div>
          )}

          {/* Availability Status Badge (Top Left) */}
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 ${
                rider.isAvailable
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-zinc-700 text-zinc-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${rider.isAvailable ? 'bg-emerald-200' : 'bg-zinc-400'}`} />
              {rider.isAvailable ? 'Available Now' : 'Off Duty'}
            </span>
          </div>

          {/* Wukari Badge (Top Right) */}
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-[#fb6514] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              <span>WUKARI</span>
            </span>
          </div>

          {/* Bike Plate Number Overlay (Bottom) */}
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="bg-black/75 backdrop-blur-xs text-yellow-300 text-[10px] font-mono font-bold px-2 py-1 rounded-md flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-yellow-400" />
                <span>Plate: {rider.bikeNumber || 'Registered'}</span>
              </span>
              <span className="text-[9px] text-white/80">Wukari</span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3 sm:p-3.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="font-black text-gray-900 text-sm truncate">
              {rider.name}
            </h3>
            <span title="Verified Wukari Rider">
              <ShieldCheck className="w-4 h-4 text-[#008751] flex-shrink-0" />
            </span>
          </div>

          {/* Specific Location in Wukari */}
          <div className="flex items-center gap-1 text-xs text-gray-700 font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#fb6514] flex-shrink-0" />
            <span className="truncate">{rider.location || 'Wukari Junction'}</span>
          </div>

          {/* Phone Display */}
          <div className="bg-orange-50/70 border border-orange-200/80 px-2 py-1 rounded-lg text-xs flex items-center justify-between font-mono">
            <span className="text-gray-500 text-[10px]">Direct Phone:</span>
            <span className="font-bold text-gray-900">{cleanPhone}</span>
          </div>
        </div>
      </div>

      {/* 2 BIG ACTION BUTTONS: Call & WhatsApp */}
      <div className="p-2.5 pt-0 grid grid-cols-2 gap-2 mt-1">
        {/* Call Rider Button */}
        <a
          href={`tel:${cleanPhone}`}
          className="bg-gray-900 hover:bg-black text-white py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call Rider</span>
        </a>

        {/* WhatsApp Rider Button */}
        <a
          href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
            `Hello ${rider.name}, I found your contact on NaijaMart Wukari Okada Riders. Are you available for a ride around ${rider.location}?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
