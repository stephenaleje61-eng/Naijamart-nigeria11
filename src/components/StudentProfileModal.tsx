import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  User, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { CAMPUSES, CAMPUS_LOCATIONS_WUKARI } from '../data/constants';
import { compressImageToBase64 } from '../utils/imageCompressor';
import { useToast } from '../context/ToastContext';

export const StudentProfileModal: React.FC = () => {
  const { profile, updateProfile, isProfileModalOpen, setIsProfileModalOpen } = useStudent();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [campus, setCampus] = useState(profile?.campus || 'Federal University Wukari (FU Wukari)');
  const [department, setDepartment] = useState(profile?.department || '');
  const [level, setLevel] = useState(profile?.level || '200L');
  const [hostelArea, setHostelArea] = useState(profile?.hostelArea || 'FUW School Gate');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isProfileModalOpen || !profile) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setIsCompressing(true);
    try {
      const base64 = await compressImageToBase64(file, 400, 0.7);
      setAvatarUrl(base64);
      showToast('Profile photo updated!', 'success');
    } catch (err: any) {
      showToast('Image processing failed: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter your full name or campus nickname', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        campus,
        department: department.trim(),
        level,
        hostelArea,
        phoneNumber: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim() || phoneNumber.trim(),
        avatarUrl,
        bio: bio.trim(),
        isVerified: true,
      });

      setIsProfileModalOpen(false);
    } catch (err: any) {
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#008751] to-emerald-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="font-black text-base sm:text-lg">Student Profile Setup</h2>
              <p className="text-[11px] text-emerald-100">
                Join verified students • Real campus connections & private chats
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 bg-gray-100 flex-shrink-0 flex items-center justify-center shadow-xs">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
              {isCompressing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors border border-gray-300">
                <Camera className="w-3.5 h-3.5 text-[#008751]" />
                <span>{avatarUrl ? 'Change Photo' : 'Upload Student Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isCompressing}
                />
              </label>
              <p className="text-[10px] text-gray-400 mt-0.5">Free 100% Canvas compressed photo</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Your Full Name or Student Nickname <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ibrahim Musa, Chidinma, or @fuw_student"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none"
            />
          </div>

          {/* Campus & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#008751]" />
                Campus / University
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-1 focus:ring-[#008751] outline-none"
              >
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#008751]" />
                Department & Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Comp Sci"
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none"
                />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                  <option value="Postgraduate">PG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hostel / Campus Area */}
          <div>
            <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#008751]" />
              Hostel / Campus Area
            </label>
            <select
              value={hostelArea}
              onChange={(e) => setHostelArea(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 outline-none"
            >
              {CAMPUS_LOCATIONS_WUKARI.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#008751]" />
                Phone Number (Calls)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08012345678"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="08012345678"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 outline-none"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Short Bio / Status
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Student entrepreneur in Wukari selling gadgets and books"
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="w-full bg-[#008751] hover:bg-[#007043] active:scale-98 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Save Student Profile & Start Connecting</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
