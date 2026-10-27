import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { FarmListing } from '../types';
import { 
  Sprout, 
  Truck, 
  Calendar, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Calculator, 
  X, 
  CheckCircle, 
  ShoppingBag,
  Scale
} from 'lucide-react';

interface Props {
  selectedState: string;
  searchQuery: string;
  onOpenAuth: () => void;
  userCoords: { lat: number; lng: number } | null;
  haversineDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export const FarmLinkModule: React.FC<Props> = ({
  selectedState,
  searchQuery,
  onOpenAuth,
  userCoords,
  haversineDistance
}) => {
  const { user } = useAuth();
  const [farmListings, setFarmListings] = useState<FarmListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk Inquiry Modal State
  const [selectedFarmItem, setSelectedFarmItem] = useState<FarmListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(10);
  const [destinationState, setDestinationState] = useState<string>('Lagos');

  // Subscribe to live farmListings
  useEffect(() => {
    const farmRef = collection(db, 'farmListings');
    const q = query(farmRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: FarmListing[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as FarmListing);
        });
        setFarmListings(list);
        setLoading(false);
      },
      (err) => {
        console.warn('farmListings query note:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // WhatsApp click generator
  const getFarmWhatsAppUrl = (item: FarmListing, qty?: number, totalEstimate?: number) => {
    const cleanDigits = item.phone.replace(/[^0-9]/g, '');
    const intl = cleanDigits.startsWith('0') 
      ? '234' + cleanDigits.slice(1) 
      : cleanDigits.startsWith('234') 
      ? cleanDigits 
      : '234' + cleanDigits;

    let text = `Hello Farmer ${item.farmerName}, I saw your ${item.cropName} on FarmLink Africa (NaijaHub).`;
    if (qty && totalEstimate) {
      text += ` I would like to inquire about a bulk order of ${qty} ${item.unit} (estimated ₦${totalEstimate.toLocaleString()}). Is this currently ready for dispatch?`;
    } else {
      text += ` I would like to purchase ${item.cropName} at ₦${item.pricePerUnit.toLocaleString()} per ${item.unit}.`;
    }

    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  // Filter listings
  const filteredListings = farmListings.filter((f) => {
    const matchState = selectedState === 'All Nigeria' || f.state?.toLowerCase() === selectedState.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      f.cropName?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q) ||
      f.lga?.toLowerCase().includes(q) ||
      f.farmerName?.toLowerCase().includes(q);
    return matchState && matchQuery;
  });

  // Calculate bulk price & freight estimate
  const baseCost = selectedFarmItem ? selectedFarmItem.pricePerUnit * (orderQuantity || 1) : 0;
  // Estimated logistics per unit depending on delivery toggle
  const transportPerUnit = selectedFarmItem?.logistics === 'seller_delivery' ? 1200 : 0;
  const estimatedLogistics = transportPerUnit * (orderQuantity || 1);
  const grandTotal = baseCost + estimatedLogistics;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-black mb-1.5 border border-amber-200/60">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>FarmLink Africa • Farm-to-Buyer Direct</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            Direct Agricultural Market & Wholesale
          </h2>
          <p className="text-xs text-gray-500">
            Zero middleman markups. Buy grains, tubers, livestock, and vegetables in kg, bags, crates, or tonnes.
          </p>
        </div>
        <div className="text-xs font-bold text-gray-500 bg-[#F8F7F2] px-4 py-2 rounded-2xl border border-gray-200/60 self-start sm:self-auto">
          Showing <span className="text-[#075B43] font-black">{filteredListings.length}</span> Farm Listings
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 shadow-xs">
          <Sprout className="w-12 h-12 text-emerald-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-black text-gray-900 mb-1">No farm produce listed in this selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
            Are you a farmer or agricultural cooperative in {selectedState}? Post your produce to connect with buyers nationwide.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredListings.map((item) => {
            const waUrl = getFarmWhatsAppUrl(item);

            let distKm: number | null = null;
            if (userCoords && item.lat && item.lng) {
              distKm = haversineDistance(userCoords.lat, userCoords.lng, item.lat, item.lng);
            }

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Tag */}
                  <div className="h-24 bg-gradient-to-r from-emerald-800 to-teal-900 p-4 relative flex items-start justify-between text-white">
                    <span className="px-2.5 py-1 bg-black/30 backdrop-blur-xs rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {item.category || 'Agricultural Produce'}
                    </span>

                    {/* Logistics Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs">
                      <Truck className="w-3 h-3" />
                      {item.logistics === 'seller_delivery' ? 'Delivery Available' : 'Pickup at Farm'}
                    </span>

                    {distKm !== null && (
                      <span className="absolute bottom-2 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-xs text-[10px] text-amber-300 font-bold rounded-lg">
                        {distKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-base text-[#17231F] leading-tight">
                          {item.cropName}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{item.lga ? `${item.lga}, ${item.state}` : `${item.state}, Nigeria`}</span>
                        </p>
                      </div>

                      {/* Price Pill */}
                      <div className="text-right">
                        <span className="text-base font-black text-[#075B43]">
                          ₦{Number(item.pricePerUnit).toLocaleString()}
                        </span>
                        <p className="text-[10px] text-gray-500 font-bold">per {item.unit}</p>
                      </div>
                    </div>

                    {/* MOQ & Harvest Readiness */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F8F7F2] p-2.5 rounded-2xl border border-gray-200/60 text-[11px]">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Min. Order (MOQ)</span>
                        <strong className="text-gray-900">{item.minOrderQuantity || 1} {item.unit}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Harvest / Ready Date</span>
                        <strong className="text-gray-900">{item.harvestDate || 'Fresh / Available Now'}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 flex items-center justify-between pt-1">
                      <span>Farmer: <strong className="text-gray-900">{item.farmerName}</strong></span>
                      <span className="text-emerald-700 font-bold text-[11px]">
                        Available: {item.availableQuantity || 'Wholesale Volume'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 sm:p-5 pt-0 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedFarmItem(item);
                      setOrderQuantity(item.minOrderQuantity || 10);
                    }}
                    className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-2xl text-xs font-bold transition-all border border-amber-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    <span>Calculate Bulk Order & Freight</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${item.phone}`}
                      className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-2xl text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Purchase Calculator Modal */}
      {selectedFarmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900">Bulk Inquiry Calculator</h3>
                  <p className="text-[11px] text-gray-500">{selectedFarmItem.cropName} • {selectedFarmItem.farmerName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFarmItem(null)}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Desired Quantity ({selectedFarmItem.unit})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={selectedFarmItem.minOrderQuantity || 1}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-500 font-medium">
                    {selectedFarmItem.unit}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Minimum Order Quantity (MOQ): {selectedFarmItem.minOrderQuantity || 1} {selectedFarmItem.unit}
                </p>
              </div>

              {/* Delivery Estimation */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Destination State for Freight Calculation
                </label>
                <select
                  value={destinationState}
                  onChange={(e) => setDestinationState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                >
                  <option value="Taraba">Taraba / Northeast Region</option>
                  <option value="Lagos">Lagos / Southwest Region</option>
                  <option value="FCT Abuja">Abuja / North Central</option>
                  <option value="Kano">Kano / Northwest Region</option>
                  <option value="Rivers">Rivers / South South</option>
                  <option value="Enugu">Enugu / Southeast Region</option>
                </select>
              </div>

              {/* Breakdown Box */}
              <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-gray-200/70 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Farm produce cost ({orderQuantity} × ₦{selectedFarmItem.pricePerUnit.toLocaleString()}):</span>
                  <span className="font-bold text-gray-900">₦{baseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Est. Interstate Transport ({selectedFarmItem.logistics === 'seller_delivery' ? 'Waybill Quote' : 'Buyer Arranged'}):</span>
                  <span className="font-bold text-gray-900">₦{estimatedLogistics.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-[#075B43]">
                  <span>Estimated Total:</span>
                  <span>₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSelectedFarmItem(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <a
                  href={getFarmWhatsAppUrl(selectedFarmItem, orderQuantity, grandTotal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-2 py-3 bg-[#075B43] hover:bg-[#0D9B72] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Inquiry to Farmer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
