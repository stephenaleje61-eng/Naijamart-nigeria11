import React, { useState } from 'react';
import { 
  X, 
  Home, 
  Upload, 
  Trash2, 
  Loader2, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Users, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { SQUATTER_LOCATIONS } from '../data/constants';
import { compressImageToBase64 } from '../utils/imageCompressor';
import { createSquatterPost } from '../services/squatterService';
import { useToast } from '../context/ToastContext';
import { useStudent } from '../context/StudentContext';
import { SquatterItem } from '../types';

interface PostSquatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (newItem: SquatterItem) => void;
}

export const PostSquatterModal: React.FC<PostSquatterModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { showToast } = useToast();
  const { profile } = useStudent();

  // Form states
  const [type, setType] = useState<'have_space' | 'need_space'>('have_space');
  const [location, setLocation] = useState(SQUATTER_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [price, setPrice] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'any'>('male');
  const [peopleInRoom, setPeopleInRoom] = useState('2 people in room');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsappNumber || profile?.phoneNumber || '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Loading states
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle uploading up to 2 images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= 2) {
      showToast('Maximum 2 images allowed for bedspace listing', 'error');
      return;
    }

    setIsCompressing(true);
    try {
      const remainingSlots = 2 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      const processedImages: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const base64 = await compressImageToBase64(file, 800, 0.7);
        processedImages.push(base64);
      }

      setImages((prev) => [...prev, ...processedImages]);
      showToast(`Added ${processedImages.length} image(s)`, 'success');
    } catch (err: any) {
      console.error('Image compression error:', err);
      showToast('Could not process image: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || Number(price) <= 0) {
      showToast('Please enter a valid price / budget in Naira', 'error');
      return;
    }

    if (!whatsapp.trim()) {
      showToast('Please enter your WhatsApp contact number', 'error');
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
    if (cleanWhatsapp.length < 10) {
      showToast('Please enter a valid Nigerian WhatsApp phone number', 'error');
      return;
    }

    const finalLocation = customLocation.trim() || location;

    setIsSubmitting(true);
    try {
      const newItem = await createSquatterPost({
        type,
        location: finalLocation,
        price: Number(price),
        gender,
        people_in_room: peopleInRoom,
        whatsapp: whatsapp.trim(),
        images,
        description: description.trim() || (type === 'have_space' 
          ? 'Bedspace available in FUW Wukari campus area. Quiet environment with steady water and electricity.' 
          : 'Student searching for a clean and affordable bedspace/squatter slot in FUW Wukari.'),
        is_verified: true,
      });

      showToast('Bedspace posted successfully! Live on FUW Squatter Board.', 'success');
      if (onPostCreated) onPostCreated(newItem);
      onClose();
    } catch (err: any) {
      console.error('Failed to post squatter:', err);
      showToast('Could not post bedspace: ' + (err.message || 'Check network connection'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#008751] via-emerald-600 to-[#049b5d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">
              🏠
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-base sm:text-lg">Post Free Bedspace</h2>
                <span className="bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                FUW Wukari Squatter Board • NO login required • NO agent fees
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Post Type Selector (Two Tabs) */}
          <div>
            <label className="block font-black text-gray-900 mb-1.5 text-xs uppercase tracking-wider">
              Are you offering or looking for a space?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('have_space')}
                className={`py-3 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center gap-1 transition-all ${
                  type === 'have_space'
                    ? 'border-[#008751] bg-emerald-50 text-[#008751] shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base sm:text-lg">🏠</span>
                <span>I HAVE SPACE</span>
                <span className="text-[10px] font-medium text-gray-500">I am subletting / need a roommate</span>
              </button>

              <button
                type="button"
                onClick={() => setType('need_space')}
                className={`py-3 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center gap-1 transition-all ${
                  type === 'need_space'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base sm:text-lg">🙋</span>
                <span>I NEED SPACE</span>
                <span className="text-[10px] font-medium text-gray-500">Looking for a bedspace to squat</span>
              </button>
            </div>
          </div>

          {/* Row 1: Location & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location (Hostel A, Hostel B, New Site, Wukari Town) */}
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                Location in FUW
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
              >
                {SQUATTER_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Other Area">Other Campus Area...</option>
              </select>

              {location === 'Other Area' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Hospital Road Off-campus"
                  className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-[#008751]"
                  required
                />
              )}
            </div>

            {/* Price / Budget in Naira */}
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <span className="text-[#008751] font-black">₦</span>
                {type === 'have_space' ? 'Price (₦ per session)' : 'My Budget (₦)'}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 45000"
                min="0"
                step="1000"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-gray-900 focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none text-base"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Common range: ₦30,000 – ₦150,000</span>
            </div>
          </div>

          {/* Row 2: Gender & People in Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gender */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Gender Preference
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
              >
                <option value="male">Male Only (♂)</option>
                <option value="female">Female Only (♀)</option>
                <option value="any">Any Gender / Flexible (⚧)</option>
              </select>
            </div>

            {/* People in Room */}
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                People in Room
              </label>
              <select
                value={peopleInRoom}
                onChange={(e) => setPeopleInRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
              >
                <option value="1 person in room">1 person in room (Solo room)</option>
                <option value="2 people in room">2 people in room (Double)</option>
                <option value="3 people in room">3 people in room</option>
                <option value="4 people in room">4 people in room (Quad)</option>
                <option value="Self-contain sharing">Self-contain sharing</option>
              </select>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div>
            <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Phone Number (For direct student chats)
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 08123456789"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Students will click "Chat on WhatsApp FREE" to message this number directly.
            </span>
          </div>

          {/* Upload 2 Images */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-800 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-[#008751]" />
                <span>Upload Photos (Max 2 images)</span>
              </label>
              <span className="text-[11px] text-gray-500 font-semibold">
                {images.length}/2 uploaded
              </span>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-300 group">
                  <img src={img} alt="Hostel" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-xs transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < 2 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-emerald-50/50 transition-colors">
                  {isCompressing ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#008751]" />
                      <span className="text-[10px] font-bold text-gray-500 mt-1">Upload Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isCompressing}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Add clear pictures of the bedspace, wardrobe, or hostel building.
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Description & Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Spacious bedspace in Hostel A, Block 3. Tiled floor, running water nearby, serene environment for studying. Roommates are friendly and cooperative."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none resize-none text-xs sm:text-sm"
            />
          </div>

          {/* Anti-Scam Notice */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-[#008751] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Campus Safety Rules:</strong> Do not demand money before showing the room. Students must always inspect the bedspace physically inside FUW Wukari campus.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="w-full bg-[#008751] hover:bg-[#007043] active:scale-98 text-white py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Posting Free Bedspace...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Post Free Bedspace Now (Instant)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
