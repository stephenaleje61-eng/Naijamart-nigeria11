import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Bike, 
  Phone, 
  MessageSquare, 
  MapPin, 
  User 
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { WUKARI_AREAS } from '../data/constants';
import { OkadaRider } from '../types';
import { useToast } from '../context/ToastContext';

interface PostRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRiderRegistered: (rider: OkadaRider) => void;
}

export const PostRiderModal: React.FC<PostRiderModalProps> = ({
  isOpen,
  onClose,
  onRiderRegistered,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [location, setLocation] = useState(WUKARI_AREAS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [bikeNumber, setBikeNumber] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Direct Base64 Photo state
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  // 1. handleImage check: const file = e.target.files?.[0]; if (!file) return;
  // 2. reader.readAsDataURL(file) - NOT readAsText
  // 3. Save base64 directly to photoUrl state immediately after reader.onload
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
      alert('Failed to read image file. Please try selecting the picture again.');
    };

    reader.onload = () => {
      const result = reader.result as string;
      if (!result) return;

      // Compress to max 700px width with HTML Canvas (jpeg quality 0.6)
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxWidth = 700;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setPhotoUrl(compressedBase64);
        } else {
          setPhotoUrl(result);
        }
      };

      img.onerror = () => {
        setPhotoUrl(result);
      };

      img.src = result;
    };

    // Use readAsDataURL
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 4. Before publishing, check if (!photoUrl) alert "Please select image" and return
    if (!photoUrl) {
      alert('Please select rider picture');
      return;
    }

    if (!name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      showToast('Please enter a valid 11-digit phone number', 'error');
      return;
    }

    if (!whatsappNumber.trim()) {
      showToast('Please enter a WhatsApp number', 'error');
      return;
    }

    if (!bikeNumber.trim()) {
      showToast('Please enter your bike plate number (e.g. TAR-123-WK)', 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusText('Registering rider in Wukari...');

    try {
      // 5. 7-day expiration
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiresAtTimestamp = Timestamp.fromDate(sevenDaysFromNow);

      const finalLocation = customLocation.trim() || location;

      const riderPayload = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        location: finalLocation,
        bikeNumber: bikeNumber.trim().toUpperCase(),
        isAvailable,
        photoUrl: photoUrl, // Direct base64 string
        createdAt: serverTimestamp(),
        expiresAt: expiresAtTimestamp,
        status: 'approved' as const,
        category: 'Okada Riders Wukari 🏍️' as const,
      };

      // Save to Firestore okada_riders collection
      const docRef = await addDoc(collection(db, 'okada_riders'), riderPayload);

      // Also register in products collection under category 'Okada Riders Wukari 🏍️'
      try {
        await addDoc(collection(db, 'products'), {
          title: `Okada Rider: ${name.trim()} (${bikeNumber.trim().toUpperCase()})`,
          description: `Active Okada Rider in ${finalLocation}, Wukari. Available for quick pickups, market runs, and travel.`,
          price: 0,
          category: 'Okada Riders Wukari 🏍️',
          condition: 'New' as const,
          papers: 'Complete' as const,
          model: bikeNumber.trim().toUpperCase(),
          images: [photoUrl],
          imageUrl: photoUrl,
          location: `${finalLocation}, Wukari`,
          sellerName: name.trim(),
          phoneNumber: phoneNumber.trim(),
          whatsappNumber: whatsappNumber.trim(),
          status: 'approved' as const,
          createdAt: serverTimestamp(),
          expiresAt: expiresAtTimestamp,
          views: 0,
          isOkada: true,
        });
      } catch (err) {
        console.warn('Cross-posting error:', err);
      }

      showToast('Rider registered successfully! You are now live on Wukari Okada Express.', 'success');

      const createdRider: OkadaRider = {
        id: docRef.id,
        ...riderPayload,
        createdAt: new Date(),
        expiresAt: sevenDaysFromNow,
      };

      onRiderRegistered(createdRider);
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast('Failed to register: ' + (err.message || 'Check network connection'), 'error');
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-orange-600 via-[#fb6514] to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="font-black text-base sm:text-lg">Register as Wukari Okada Rider</h2>
              <p className="text-[11px] text-orange-100">
                100% Free • No Signup • Direct Passenger Calls & WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Photo Upload (Direct Base64 Conversion) */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Rider Picture <span className="text-red-500">*</span>
              <span className="font-normal text-gray-400 ml-1">
                (Clear face photo or standing with your bike)
              </span>
            </label>

            {photoUrl ? (
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#fb6514] shadow-xs">
                <img src={photoUrl} alt="Rider preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md shadow-xs hover:bg-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="w-full border-2 border-dashed border-gray-300 hover:border-[#fb6514] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50 hover:bg-orange-50/40">
                <Upload className="w-8 h-8 text-[#fb6514] mb-1.5" />
                <span className="text-xs font-bold text-gray-800">Upload Your Picture</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Auto-converted to Base64 (700px quality 0.6)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
            {!photoUrl && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg font-medium mt-2">
                ⚠️ Please select your photo to proceed.
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="rider-name-input" className="block font-bold text-gray-800 mb-1">
              Rider Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="rider-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yakubu Danladi"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-[#fb6514]"
              />
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-orange-50/60 border border-orange-200 p-3 rounded-xl">
            <div>
              <label htmlFor="rider-phone-input" className="block font-bold text-gray-800 mb-1">
                Phone Number (Calls) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="rider-phone-input"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (!whatsappNumber) setWhatsappNumber(e.target.value);
                  }}
                  placeholder="08031234567"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-[#fb6514]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rider-whatsapp-input" className="block font-bold text-gray-800 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  id="rider-whatsapp-input"
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="08031234567"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Location in Wukari */}
          <div>
            <label htmlFor="rider-location-select" className="block font-bold text-gray-800 mb-1">
              Your Usual Spot / Location in Wukari <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#fb6514] absolute left-3 top-3" />
              <select
                id="rider-location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-[#fb6514]"
              >
                {WUKARI_AREAS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Or specify exact junction/landmark in Wukari (optional)"
              className="w-full p-2 mt-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          {/* Bike Number & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="rider-bike-number" className="block font-bold text-gray-800 mb-1">
                Bike Plate Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Bike className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="rider-bike-number"
                  type="text"
                  required
                  value={bikeNumber}
                  onChange={(e) => setBikeNumber(e.target.value)}
                  placeholder="e.g. TAR-882-WK"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-gray-900 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Current Availability <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    isAvailable
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  🟢 Available
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    !isAvailable
                      ? 'bg-zinc-800 text-white border-zinc-900 shadow-xs'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  🔴 Off Duty
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#fb6514] hover:bg-[#e8590c] disabled:bg-gray-400 text-white font-black py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{statusText || 'Registering...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Post Wukari Rider Profile 🏍️</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
