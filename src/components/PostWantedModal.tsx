import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  GraduationCap, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Camera, 
  AlertCircle,
  Clock,
  Calendar,
  AlertTriangle,
  User
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { CAMPUSES, WANTED_CATEGORIES, CAMPUS_LOCATIONS_WUKARI } from '../data/constants';
import { WantedItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useStudent } from '../context/StudentContext';
import { compressImageToBase64 } from '../utils/imageCompressor';

interface PostWantedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWantedPosted: (item: WantedItem) => void;
  defaultCampus?: string;
}

export const PostWantedModal: React.FC<PostWantedModalProps> = ({
  isOpen,
  onClose,
  onWantedPosted,
  defaultCampus = 'Federal University Wukari (FU Wukari)'
}) => {
  const { showToast } = useToast();
  const { profile } = useStudent();

  // Form states
  const [buyerName, setBuyerName] = useState(profile?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [school, setSchool] = useState(profile?.campus || defaultCampus);
  const [customSchool, setCustomSchool] = useState('');
  const [location, setLocation] = useState(profile?.hostelArea || 'FUW School Gate');
  const [customLocation, setCustomLocation] = useState('');
  const [itemWanted, setItemWanted] = useState('');
  const [category, setCategory] = useState(WANTED_CATEGORIES[0]);
  const [budget, setBudget] = useState('');
  const [budgetType, setBudgetType] = useState<'up_to' | 'fixed' | 'negotiable'>('up_to');
  const [urgency, setUrgency] = useState<'Urgent' | 'This Week' | 'Flexible'>('Urgent');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || profile?.phoneNumber || '');
  const [sampleImageUrl, setSampleImageUrl] = useState('');

  // Processing & Loading states
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [isCompressingSample, setIsCompressingSample] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  if (!isOpen) return null;

  // Handle avatar upload with canvas compression
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    setIsCompressingAvatar(true);
    try {
      const base64 = await compressImageToBase64(file, 400, 0.7);
      setAvatarUrl(base64);
      showToast('Profile photo attached!', 'success');
    } catch (err: any) {
      console.error('Avatar error:', err);
      showToast('Failed to process picture: ' + (err.message || 'Try a smaller image'), 'error');
    } finally {
      setIsCompressingAvatar(false);
    }
  };

  // Handle sample reference photo upload with canvas compression
  const handleSampleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setIsCompressingSample(true);
    try {
      const base64 = await compressImageToBase64(file, 700, 0.6);
      setSampleImageUrl(base64);
      showToast('Reference picture attached!', 'success');
    } catch (err: any) {
      console.error('Sample image error:', err);
      showToast('Failed to process image: ' + (err.message || 'Try another photo'), 'error');
    } finally {
      setIsCompressingSample(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim()) {
      showToast('Please enter your name or student nickname', 'error');
      return;
    }

    if (!itemWanted.trim()) {
      showToast('Please state what item you need (e.g. iPhone X under 120k)', 'error');
      return;
    }

    const numBudget = parseFloat(budget.replace(/[^0-9.]/g, ''));
    if (isNaN(numBudget) || numBudget <= 0) {
      showToast('Please enter your realistic budget in Naira (₦)', 'error');
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please provide a valid 11-digit phone number for sellers to reach you', 'error');
      return;
    }

    const finalSchool = school === 'Other Nigerian Campus' && customSchool.trim()
      ? customSchool.trim()
      : school;

    const finalLocation = customLocation.trim() || location;
    const finalWhatsapp = whatsappNumber.trim() || cleanPhone;

    setIsSubmitting(true);
    setSubmitStatus('Posting to Student Wanted Board...');

    try {
      const wantedPayload = {
        buyerId: profile?.id || ('std_' + Math.random().toString(36).substring(2, 9)),
        buyerName: buyerName.trim(),
        avatarUrl: avatarUrl || '',
        school: finalSchool,
        location: finalLocation,
        itemWanted: itemWanted.trim(),
        category,
        budget: numBudget,
        budgetType,
        urgency,
        description: description.trim(),
        phoneNumber: cleanPhone,
        whatsappNumber: finalWhatsapp,
        sampleImageUrl: sampleImageUrl || '',
        status: 'approved' as const,
        createdAt: serverTimestamp(),
        views: 0,
        offersCount: 0,
      };

      // Save directly to Firestore collection 'wanted_items'
      const docRef = await addDoc(collection(db, 'wanted_items'), wantedPayload);

      // Save to localStorage for tracking
      try {
        const savedIds = JSON.parse(localStorage.getItem('naijamart_my_wanted_ids') || '[]');
        if (!savedIds.includes(docRef.id)) {
          savedIds.push(docRef.id);
          localStorage.setItem('naijamart_my_wanted_ids', JSON.stringify(savedIds));
        }
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      showToast('Your request is live on the Wanted Board! Sellers will contact you directly.', 'success');

      const createdItem: WantedItem = {
        id: docRef.id,
        ...wantedPayload,
        createdAt: new Date(),
      };

      onWantedPosted(createdItem);
      onClose();
    } catch (err: any) {
      console.error('Wanted post error:', err);
      showToast('Could not post request: ' + (err.message || 'Check internet connection'), 'error');
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#008751] via-emerald-600 to-[#049b5d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg">
                Post What You Need 🎯
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                Student Wanted Board • Let sellers on campus come to you!
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
          {/* Top Notice */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
            <GraduationCap className="w-4 h-4 text-[#008751] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Need an iPhone, mattress, fan, gas cylinder or textbook?</strong> Post your budget here. Sellers with available items in your campus or town will call or WhatsApp you directly!
            </p>
          </div>

          {/* Row 1: Profile Avatar & Student Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Avatar Upload */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 bg-gray-100 flex-shrink-0 flex items-center justify-center shadow-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-gray-400" />
                )}
                {isCompressingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors border border-gray-300">
                  <Camera className="w-3.5 h-3.5 text-[#008751]" />
                  <span>{avatarUrl ? 'Change Photo' : 'Add Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isCompressingAvatar}
                  />
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">Optional picture</p>
              </div>
            </div>

            {/* Buyer Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-800 mb-1">
                Your Name / Student Handle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Ibrahim Sani, Chidinma, or @fuw_student"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              />
            </div>
          </div>

          {/* Row 2: Campus / School & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#008751]" />
                Campus / University <span className="text-red-500">*</span>
              </label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              >
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {school === 'Other Nigerian Campus' && (
                <input
                  type="text"
                  value={customSchool}
                  onChange={(e) => setCustomSchool(e.target.value)}
                  placeholder="Type your university or polytechnic name"
                  className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                />
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                Location / Hostel <span className="text-red-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              >
                {CAMPUS_LOCATIONS_WUKARI.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Other Area">Other Campus Hostel / Area</option>
              </select>
              {location === 'Other Area' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Specify location (e.g. Off campus behind stadium)"
                  className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                />
              )}
            </div>
          </div>

          {/* Row 3: Item Wanted (Headline) */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              What Item Do You Need? <span className="text-red-500">*</span>
              <span className="font-normal text-gray-400 ml-1">
                (Clear & specific headline)
              </span>
            </label>
            <input
              type="text"
              value={itemWanted}
              onChange={(e) => setItemWanted(e.target.value)}
              placeholder="e.g. iPhone X under 120k, Mini fridge for hostel, 4.5x6 mattress..."
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm sm:text-base text-gray-950 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
            />
          </div>

          {/* Row 4: Budget & Budget Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Your Budget (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-gray-500">₦</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="120000"
                  required
                  min="500"
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-sm text-[#008751] focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Budget Flexibility
              </label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              >
                <option value="up_to">Up To (Max Budget)</option>
                <option value="fixed">Fixed Cash Ready</option>
                <option value="negotiable">Open to Negotiation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              >
                {WANTED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Urgency Selector (Crucial for Wanted Board) */}
          <div>
            <label className="block font-bold text-gray-800 mb-1.5">
              How Urgently Do You Need It? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('Urgent')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  urgency === 'Urgent'
                    ? 'bg-red-500 text-white border-red-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">🚨</span>
                <span>Urgent (Today / ASAP)</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('This Week')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  urgency === 'This Week'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">📅</span>
                <span>This Week</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('Flexible')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  urgency === 'Flexible'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">⏳</span>
                <span>Flexible Timing</span>
              </button>
            </div>
          </div>

          {/* Row 6: Description & Specifications */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Specifications & Notes
              <span className="font-normal text-gray-400 ml-1">
                (Color, condition, storage, battery health, or course code)
              </span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Looking for clean UK used, 64GB or 128GB, battery health 80%+, no cracked screen. Ready to inspect and pay immediately."
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none text-xs sm:text-sm"
            />
          </div>

          {/* Row 7: Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#008751]" />
                Phone Number (Calls) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08012345678"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="08012345678"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
              />
            </div>
          </div>

          {/* Row 8: Optional Reference Photo */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Sample / Reference Picture
              <span className="font-normal text-gray-400 ml-1">
                (Optional picture of the item type or textbook cover)
              </span>
            </label>

            {sampleImageUrl ? (
              <div className="relative w-32 h-24 rounded-2xl overflow-hidden border border-emerald-400 shadow-xs">
                <img src={sampleImageUrl} alt="Sample" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSampleImageUrl('')}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 hover:border-[#008751] rounded-2xl p-3 text-center cursor-pointer flex items-center justify-center gap-2 bg-gray-50 hover:bg-emerald-50/40 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">
                  {isCompressingSample ? 'Compressing picture...' : 'Upload sample/reference image (Base64 free)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSampleImageChange}
                  disabled={isCompressingSample}
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCompressingAvatar || isCompressingSample}
              className="w-full bg-[#008751] hover:bg-[#007043] active:scale-98 text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{submitStatus || 'Posting your request...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Post to Student Wanted Board (Free)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
