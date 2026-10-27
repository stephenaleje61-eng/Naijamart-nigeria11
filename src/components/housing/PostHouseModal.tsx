import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  Home, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  HouseType, 
  PaymentPeriod, 
  HOUSE_TYPES, 
  HOUSING_FACILITIES, 
  POPULAR_NIGERIAN_STATES 
} from '../../types/housing';
import { createHouseListing, uploadHousingImages } from '../../services/housingService';

interface PostHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PostHouseModal: React.FC<PostHouseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [agentName, setAgentName] = useState(user?.displayName || '');
  const [agentPhone, setAgentPhone] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HouseType>('Self-contain');
  const [price, setPrice] = useState<string>('');
  const [pricePer, setPricePer] = useState<PaymentPeriod>('year');
  const [state, setState] = useState('Abuja (FCT)');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [furnished, setFurnished] = useState(false);
  const [available, setAvailable] = useState(true);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'Running Water',
    'Pre-paid Meter',
    'Tiled Floor',
  ]);

  // Image files & previews
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const combined = [...selectedFiles, ...incoming].slice(0, 5); // max 5

    setSelectedFiles(combined);
    // Build object URLs for instant preview
    const urls = combined.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const removeFile = (idx: number) => {
    const updatedF = selectedFiles.filter((_, i) => i !== idx);
    const updatedP = previewUrls.filter((_, i) => i !== idx);
    setSelectedFiles(updatedF);
    setPreviewUrls(updatedP);
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to post a property', 'error');
      return;
    }

    if (!title.trim()) {
      showToast('Please provide a house title', 'error');
      return;
    }
    if (!agentPhone.trim()) {
      showToast('Please enter a valid Nigerian contact phone number', 'error');
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      showToast('Please provide a valid rental price', 'error');
      return;
    }
    if (!city.trim() || !area.trim()) {
      showToast('Please provide both City and Area/Neighbourhood', 'error');
      return;
    }

    setIsUploading(true);
    setUploadPercent(5);

    try {
      // 1. Upload photos (if any selected)
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        photoUrls = await uploadHousingImages(
          selectedFiles,
          user.uid,
          'houses',
          (pct) => setUploadPercent(pct)
        );
      }

      // 2. Build location string
      const fullLocation = `${area.trim()}, ${city.trim()}, ${state}`;

      // 3. Save listing to Firestore
      await createHouseListing({
        agentUid: user.uid,
        agentName: agentName.trim() || user.displayName || 'Verified Landlord / Agent',
        agentPhone: agentPhone.trim(),
        agentPhoto: user.photoURL || '',
        title: title.trim(),
        type,
        price: numPrice,
        pricePer,
        location: fullLocation,
        state,
        city: city.trim(),
        area: area.trim(),
        address: address.trim(),
        description: description.trim(),
        photos: photoUrls,
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        furnished,
        facilities: selectedFacilities,
        available,
        verified: false, // Starts unverified until admin checks
      });

      showToast('House listing posted successfully to Africa Chat Housing!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating house listing:', err);
      showToast(err.message || 'Failed to post house. Try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#075E54] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <Home className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Post House For Rent</h2>
              <p className="text-xs text-emerald-100">
                Connect directly with genuine tenants on Africa Chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section: Agent Info */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#075E54] uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Agent / Landlord Contact</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Full Name / Agency *
                </label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Samuel Okafor or Apex Realty"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] focus:ring-1 focus:ring-[#075E54] bg-white outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  placeholder="e.g. 08012345678 or +2348012345678"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] focus:ring-1 focus:ring-[#075E54] bg-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section: Property Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Property Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern 2-Bedroom Flat with POP & Prepaid Meter in Wuse 2"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] focus:ring-1 focus:ring-[#075E54] bg-white outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  House Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as HouseType)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
                >
                  {HOUSE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Price (₦ Naira) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="850,000"
                    className="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Payment Term
                </label>
                <select
                  value={pricePer}
                  onChange={(e) => setPricePer(e.target.value as PaymentPeriod)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
                >
                  <option value="year">Per Year (Annual)</option>
                  <option value="month">Per Month</option>
                  <option value="total">Total Package</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
                >
                  {POPULAR_NIGERIAN_STATES.filter((s) => s !== 'All Nigeria').map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Wukari, Ikeja, Garki"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Area / Zone *
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Campus Gate, Phase 2, Wuse 2"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Street Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Beside Zenith Bank, Off Campus Main Road"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Section: Specs (Bed, Bath, Furnished) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-xs font-bold text-gray-700 mb-1">Furnished?</label>
              <button
                type="button"
                onClick={() => setFurnished(!furnished)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  furnished
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {furnished ? '✓ Furnished' : 'Unfurnished'}
              </button>
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-xs font-bold text-gray-700 mb-1">Available Now?</label>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  available
                    ? 'bg-[#075E54] text-white border-[#075E54]'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {available ? '✓ Ready / Vacant' : 'Occupied'}
              </button>
            </div>
          </div>

          {/* Section: Photos (1 to 5) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Property Photos (1 - 5 images)
              </label>
              <span className="text-[11px] text-gray-500">
                {selectedFiles.length} / 5 selected
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 group bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {selectedFiles.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 hover:border-[#075E54] rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer aspect-4/3 transition-colors bg-gray-50/50 hover:bg-emerald-50/30">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#075E54] mb-1" />
                  <span className="text-[10px] font-bold text-gray-600">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              Photos are automatically compressed to under 800KB for rapid loading on Nigerian networks.
            </p>
          </div>

          {/* Section: Facilities Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              Compound & House Facilities (Tap to select)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOUSING_FACILITIES.map((facility) => {
                const isSelected = selectedFacilities.includes(facility);
                return (
                  <button
                    type="button"
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`text-left text-xs p-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-[#075E54] font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#075E54] border-[#075E54] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{facility}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Description */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Description & Additional Information
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give details about proximity to campus/market, security, quietness, terms, caution fee, agency & agreement if any..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#075E54] bg-white outline-hidden"
            />
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#075E54]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Compressing and Uploading Listing...
                </span>
                <span>{uploadPercent}%</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#075E54] h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#075E54] hover:bg-[#064e46] shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish House Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
