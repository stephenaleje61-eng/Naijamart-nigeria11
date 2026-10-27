import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Check, 
  ShieldCheck, 
  Flag, 
  Share2, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Home, 
  Bed, 
  Bath, 
  Armchair, 
  Sparkles,
  AlertTriangle,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { HouseListing } from '../../types/housing';
import { 
  reportListing, 
  deleteHouseListing, 
  updateHouseListing, 
  toggleFavorite, 
  getFavorites 
} from '../../services/housingService';

interface HouseDetailModalProps {
  house: HouseListing | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (agent: { uid: string; name: string; phone?: string; photo?: string }) => void;
  onListingUpdated?: () => void;
}

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({
  house,
  isOpen,
  onClose,
  onStartChat,
  onListingUpdated,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('Fake or non-existent property');
  const [isFav, setIsFav] = useState(() => (house ? getFavorites().includes(house.id) : false));
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !house) return null;

  const isOwner = user?.uid && user.uid === house.agentUid;
  const photos = house.photos && house.photos.length > 0 ? house.photos : [];

  const handleNextPhoto = () => {
    if (photos.length > 0) {
      setActivePhotoIdx((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (photos.length > 0) {
      setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handleToggleFav = () => {
    const newState = toggleFavorite(house.id);
    setIsFav(newState);
    showToast(newState ? 'Saved to Favorites ❤️' : 'Removed from Favorites', 'info');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: house.title,
          text: `Check out this house on Africa Chat Housing: ${house.title} - ₦${house.price.toLocaleString()}/${house.pricePer}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          `${house.title} - ₦${house.price.toLocaleString()}/${house.pricePer} in ${house.location} (View on Africa Chat Housing)`
        );
        showToast('Property details copied to clipboard!', 'success');
      }
    } catch {
      showToast('Listing link copied to clipboard', 'info');
    }
  };

  const handleReport = async () => {
    if (!user) {
      showToast('Please sign in to report a listing', 'error');
      return;
    }
    try {
      const res = await reportListing('houses', house.id, reportReason, user.uid);
      setIsReporting(false);
      if (res.isHidden) {
        showToast('Thank you. This listing received multiple fraud reports and has been automatically removed.', 'success');
        onClose();
        if (onListingUpdated) onListingUpdated();
      } else {
        showToast('Report submitted for review. Thank you for protecting the community.', 'info');
      }
    } catch (err: any) {
      showToast('Failed to submit report', 'error');
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this house listing?')) return;
    setIsDeleting(true);
    try {
      await deleteHouseListing(house.id);
      showToast('House listing deleted successfully', 'success');
      onClose();
      if (onListingUpdated) onListingUpdated();
    } catch {
      showToast('Could not delete listing', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRented = async () => {
    const newStatus = house.status === 'rented' ? 'active' : 'rented';
    try {
      await updateHouseListing(house.id, {
        status: newStatus,
        available: newStatus === 'active',
      });
      showToast(newStatus === 'rented' ? 'Marked as Rented Out' : 'Marked as Available', 'success');
      if (onListingUpdated) onListingUpdated();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // WhatsApp wa.me link with prefilled text
  const cleanPhone = house.agentPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0')
    ? '234' + cleanPhone.slice(1)
    : cleanPhone.startsWith('234')
    ? cleanPhone
    : '234' + cleanPhone;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hello ${house.agentName}, I saw your listing for "${house.title}" (₦${house.price.toLocaleString()}/${house.pricePer}) on Africa Chat Housing. Is it still available for inspection?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
              {house.type}
            </span>
            {house.verified && (
              <span className="bg-emerald-400 text-emerald-950 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED</span>
              </span>
            )}
            {house.status === 'rented' && (
              <span className="bg-amber-400 text-black text-xs font-black px-2.5 py-1 rounded-xl">
                RENTED OUT
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFav}
              title="Save to favorites"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${isFav ? 'fill-red-400 text-red-400' : 'text-white'}`}
              />
            </button>
            <button
              onClick={handleShare}
              title="Share listing"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Photo Carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-950 aspect-16/10 flex items-center justify-center">
            {photos.length > 0 ? (
              <>
                <img
                  src={photos[activePhotoIdx]}
                  alt={house.title}
                  className="w-full h-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {activePhotoIdx + 1} / {photos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                <Home className="w-12 h-12 stroke-[1.5] text-gray-500 mb-2" />
                <span className="text-xs">No photos uploaded for this property</span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx ? 'border-[#075E54] scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title, Location & Price */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {house.title}
              </h1>
              <div className="text-xl sm:text-2xl font-black text-[#075E54] shrink-0">
                ₦{house.price.toLocaleString()}
                <span className="text-xs font-semibold text-gray-500">
                  /{house.pricePer}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{house.location}</span>
            </div>

            {house.address && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <strong className="text-gray-700">Exact Address / Landmark:</strong> {house.address}
              </div>
            )}
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2.5">
              <Bed className="w-5 h-5 text-[#075E54]" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Bedrooms</p>
                <p className="text-xs font-black text-gray-900">{house.bedrooms} Bed</p>
              </div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2.5">
              <Bath className="w-5 h-5 text-[#075E54]" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Bathrooms</p>
                <p className="text-xs font-black text-gray-900">{house.bathrooms} Bath</p>
              </div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2.5">
              <Armchair className="w-5 h-5 text-[#075E54]" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Furnished</p>
                <p className="text-xs font-black text-gray-900">
                  {house.furnished ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#075E54]" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Status</p>
                <p className="text-xs font-black text-emerald-700">
                  {house.available ? 'Ready Now' : 'Occupied'}
                </p>
              </div>
            </div>
          </div>

          {/* Facilities Chips */}
          {house.facilities && house.facilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Facilities & Amenities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {house.facilities.map((fac) => (
                  <span
                    key={fac}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#075E54] border border-emerald-200 text-xs font-bold rounded-xl"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {house.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                {house.description}
              </p>
            </div>
          )}

          {/* Agent Information Card */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#075E54] font-black flex items-center justify-center text-lg overflow-hidden border border-emerald-300">
                  {house.agentPhoto ? (
                    <img src={house.agentPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    house.agentName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-gray-900">{house.agentName}</h4>
                    {house.verified && (
                      <span title="Verified Landlord / Agent">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Phone / WhatsApp: <span className="font-semibold text-gray-700">{house.agentPhone}</span>
                  </p>
                </div>
              </div>

              {/* Report button */}
              <button
                type="button"
                onClick={() => setIsReporting(!isReporting)}
                className="text-[11px] text-gray-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report fake</span>
              </button>
            </div>

            {/* Quick Connect Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={`tel:${house.agentPhone}`}
                className="py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#075E54]" />
                <span>Call Agent</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  if (onStartChat) {
                    onStartChat({
                      uid: house.agentUid,
                      name: house.agentName,
                      phone: house.agentPhone,
                      photo: house.agentPhoto,
                    });
                  }
                }}
                className="py-2.5 px-3 rounded-2xl bg-[#075E54] hover:bg-[#064e46] text-white text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on Africa Chat</span>
              </button>
            </div>
          </div>

          {/* Owner Dashboard Actions if user is the listing owner */}
          {isOwner && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900">
                  Agent Manager: You posted this listing
                </span>
                <span className="text-[11px] text-amber-700">
                  Reports: {house.reportsCount || 0}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleRented}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-gray-800 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {house.status === 'rented' ? 'Mark as Vacant/Available' : 'Mark as Rented Out'}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteListing}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              </div>
            </div>
          )}

          {/* Reporting Panel */}
          {isReporting && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Fake or Fraudulent Listing</span>
              </div>
              <p className="text-[11px] text-red-600">
                Help keep Africa Chat clean. If a listing receives 3 verified reports, it is automatically hidden.
              </p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-red-300 bg-white"
              >
                <option value="Fake or non-existent property">Fake or non-existent property</option>
                <option value="Agent asking for inspection fee before viewing">Asking for inspection fee / money scam</option>
                <option value="Already rented / unavailable">Already rented / outdated</option>
                <option value="Wrong price or false pictures">Wrong price or false pictures</option>
                <option value="Inappropriate / offensive content">Inappropriate content</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  className="px-4 py-1.5 text-xs font-black bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
