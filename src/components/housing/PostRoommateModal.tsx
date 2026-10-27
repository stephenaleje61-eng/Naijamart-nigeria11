import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  Users, 
  Upload, 
  Trash2, 
  Loader2, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { GenderPreference, POPULAR_NIGERIAN_STATES } from '../../types/housing';
import { createRoommateListing, uploadHousingImages } from '../../services/housingService';

interface PostRoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PostRoommateModal: React.FC<PostRoommateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [posterName, setPosterName] = useState(user?.displayName || '');
  const [posterPhone, setPosterPhone] = useState('');
  const [state, setState] = useState('Abuja (FCT)');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [genderPref, setGenderPref] = useState<GenderPreference>('Any');
  const [roomType, setRoomType] = useState('Self-contain');
  const [lookingFor, setLookingFor] = useState('1 roommate');
  const [moveInDate, setMoveInDate] = useState('Immediately / This Month');
  const [aboutMe, setAboutMe] = useState('');

  // Image files & previews
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const combined = [...selectedFiles, ...incoming].slice(0, 3); // up to 3 room photos
    setSelectedFiles(combined);
    const urls = combined.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const removeFile = (idx: number) => {
    const updatedF = selectedFiles.filter((_, i) => i !== idx);
    const updatedP = previewUrls.filter((_, i) => i !== idx);
    setSelectedFiles(updatedF);
    setPreviewUrls(updatedP);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to find a roommate', 'error');
      return;
    }

    if (!posterName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    if (!posterPhone.trim()) {
      showToast('Please enter your contact phone or WhatsApp number', 'error');
      return;
    }
    const numBudget = Number(budget);
    if (!numBudget || numBudget <= 0) {
      showToast('Please specify the budget to split', 'error');
      return;
    }
    if (!city.trim() || !area.trim()) {
      showToast('Please enter City and Area location', 'error');
      return;
    }

    setIsUploading(true);
    setUploadPercent(10);

    try {
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        photoUrls = await uploadHousingImages(
          selectedFiles,
          user.uid,
          'roommates',
          (pct) => setUploadPercent(pct)
        );
      }

      const fullLocation = `${area.trim()}, ${city.trim()}, ${state}`;

      await createRoommateListing({
        posterUid: user.uid,
        posterName: posterName.trim(),
        posterPhone: posterPhone.trim(),
        posterPhoto: user.photoURL || '',
        location: fullLocation,
        state,
        city: city.trim(),
        area: area.trim(),
        budget: numBudget,
        genderPref,
        roomType,
        lookingFor,
        aboutMe: aboutMe.trim(),
        moveInDate,
        photos: photoUrls,
        available: true,
      });

      showToast('Roommate request posted to Africa Chat!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error posting roommate request:', err);
      showToast(err.message || 'Failed to post roommate request', 'error');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#128C7E] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <Users className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Find a Roommate</h2>
              <p className="text-xs text-emerald-100">
                Split rent & lodge with verified fellow students or workers
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#075E54] uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Your Identity & Contact</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={posterName}
                  onChange={(e) => setPosterName(e.target.value)}
                  placeholder="e.g. Joy Daniel"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={posterPhone}
                  onChange={(e) => setPosterPhone(e.target.value)}
                  placeholder="080XXXXXXXX"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                State *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
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
                placeholder="e.g. Wukari / Yaba"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Area / Neighbourhood *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Behind School Gate"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Split Budget & Gender Pref */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Budget / Person (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">₦</span>
                <input
                  type="number"
                  required
                  min="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="150,000"
                  className="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Gender Preference
              </label>
              <select
                value={genderPref}
                onChange={(e) => setGenderPref(e.target.value as GenderPreference)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
              >
                <option value="Any">Any Gender</option>
                <option value="Female">Female Only</option>
                <option value="Male">Male Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Looking For
              </label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
              >
                <option value="1 roommate">1 roommate</option>
                <option value="2 roommates">2 roommates</option>
                <option value="3+ roommates">3+ roommates</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Room / House Type
              </label>
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="e.g. 2-Room Self-contain or 1 Bed in Flat"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Target Move-in Date
              </label>
              <input
                type="text"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                placeholder="e.g. Next month or Immediate"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
              />
            </div>
          </div>

          {/* About Me & House Rules */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              About Me & Preferred House Rules
            </label>
            <textarea
              rows={3}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="e.g. Final year Biochemistry student. Calm, non-smoker, clean compound. Seeking responsible roommate to share bills..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#128C7E] bg-white outline-hidden"
            />
          </div>

          {/* Room Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Room Photos (Up to 3)
              </label>
              <span className="text-[11px] text-gray-500">
                {selectedFiles.length} / 3 selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Room preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 3 && (
                <label className="border-2 border-dashed border-gray-300 hover:border-[#128C7E] rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer aspect-4/3 transition-colors bg-gray-50/50 hover:bg-emerald-50/30">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#128C7E] mb-1" />
                  <span className="text-[10px] font-bold text-gray-600">Add Room Photo</span>
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
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#075E54]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading Roommate Request...
                </span>
                <span>{uploadPercent}%</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#128C7E] h-2 transition-all duration-300 rounded-full"
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
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#128C7E] hover:bg-[#0e7468] shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting Request...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Post Roommate Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
