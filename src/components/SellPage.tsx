import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { uploadProductImages } from '../services/upload';
import { 
  PlusCircle, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Tag, 
  ShieldCheck,
  LogIn
} from 'lucide-react';

interface SellPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth?: () => void;
}

const CATEGORIES = [
  'Phones & Tablets',
  'Fashion & Shoes',
  'Electronics & Appliances',
  'Bedspaces & Hostels',
  'Okada & Vehicles',
  'Food & Groceries',
  'Beauty & Personal Care',
  'Books & Stationery',
  'Services',
  'Other Items'
];

const STATES = [
  'FUWukari',
  'Wukari Town, Taraba',
  'Jalingo, Taraba',
  'Abuja (FCT)',
  'Lagos State',
  'Other Location in Nigeria'
];

export const SellPage: React.FC<SellPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, signInGuest } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<'New' | 'Used'>('Used');
  const [price, setPrice] = useState('');
  const [state, setState] = useState(STATES[0]);
  const [phone, setPhone] = useState('+2348167258121');

  // Selected files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Upload & Publishing States (as requested)
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle local file picking (max 6 images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const availableSlots = 6 - selectedFiles.length;
    if (availableSlots <= 0) {
      setErrorMessage('Maximum 6 photos allowed per product.');
      return;
    }

    const newFiles = files.slice(0, availableSlots);
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setErrorMessage(null);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate Title
    if (!title.trim()) {
      setErrorMessage('Please provide a title for your product.');
      return;
    }

    // Validate Price
    const numericPrice = parseFloat(price.replace(/,/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Please enter a valid price in Naira.');
      return;
    }

    // Require at least 1 image
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least 1 photo of your product.');
      return;
    }

    try {
      // 1. Ensure user is authenticated (auto guest sign-in if needed)
      let activeUser = user || auth.currentUser;
      if (!activeUser) {
        try {
          await signInGuest();
          activeUser = auth.currentUser;
        } catch (guestErr) {
          console.warn('Guest sign-in notice:', guestErr);
        }
      }

      const uid = activeUser?.uid || `guest_${Date.now()}`;

      // a. Set isUploading true
      setIsUploading(true);
      setUploadProgress(10);

      // b. Call uploadProductImages with progress callback
      const urls = await uploadProductImages(selectedFiles, uid, (percent) => {
        setUploadProgress(percent);
      });

      if (!urls || urls.length === 0) {
        throw new Error('Failed to process image upload. Please try another image.');
      }

      // c. After all URLs ready, set isPublishing true
      setIsUploading(false);
      setIsPublishing(true);

      // d. addDoc to Firestore collection "products"
      const productDoc = {
        title: title.trim(),
        description: description.trim() || 'Direct from verified seller on NaijaMart Hub.',
        category: category || 'Phones & Tablets',
        condition: condition || 'Used',
        price: numericPrice,
        state: state || 'FUWukari',
        location: state || 'FUWukari',
        phone: phone.trim() || '+2348167258121',
        ownerPhone: phone.trim() || '+2348167258121',
        phoneNumber: phone.trim() || '+2348167258121',
        whatsappNumber: phone.trim() || '+2348167258121',
        images: urls,
        coverImage: urls[0],
        imageUrl: urls[0],
        ownerUid: uid,
        createdAt: serverTimestamp(),
        status: 'active'
      };

      await addDoc(collection(db, 'products'), productDoc);

      setSuccessMessage('🎉 Product posted successfully!');

      // e. Reset form, navigate to /my-products
      setTitle('');
      setDescription('');
      setPrice('');
      setSelectedFiles([]);
      setPreviewUrls([]);

      setTimeout(() => {
        onNavigate('my-products');
      }, 1200);

    } catch (err: any) {
      console.error('Error submitting product:', err);
      setErrorMessage(err?.message || 'Could not publish product. Please check your network and try again.');
    } finally {
      setIsUploading(false);
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0B8751] text-xs font-bold mb-2">
          <Tag className="w-3.5 h-3.5" /> Post an Item
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Sell on NaijaMart
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Buyers in FUWukari and Nigeria contact you directly on WhatsApp or phone call.
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#0B8751]" />
          <div>
            <p className="font-bold">Success!</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 12 Pro Max 128GB Pristine, Mini-fridge, Okada Bajaj"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B8751]"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B8751]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('Used')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all ${
                  condition === 'Used'
                    ? 'bg-[#0B8751] text-white border-[#0B8751]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Used
              </button>
              <button
                type="button"
                onClick={() => setCondition('New')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all ${
                  condition === 'New'
                    ? 'bg-[#0B8751] text-white border-[#0B8751]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Brand New
              </button>
            </div>
          </div>
        </div>

        {/* Price & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Price in Naira (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 font-bold">₦</span>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B8751]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              State / Campus <span className="text-red-500">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B8751]"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            WhatsApp / Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2348167258121"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B8751]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mention condition, accessories included, reason for selling..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B8751]"
          />
        </div>

        {/* Images Selection & Compression Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Product Images (Max 6) <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-500 font-medium">
              {selectedFiles.length} of 6 selected
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100">
                <img src={url} alt={`preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-[#0B8751] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {selectedFiles.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#0B8751] bg-gray-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center p-2 text-center transition-colors group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#0B8751] mb-1" />
                <span className="text-[11px] font-bold text-gray-600 group-hover:text-[#0B8751]">
                  Add Photo
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0B8751]" />
            Images are compressed automatically under 800KB for fast mobile loading.
          </p>
        </div>

        {/* Upload Progress Bar (Live state) */}
        {(isUploading || isPublishing) && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0B8751]" />
                {isUploading ? `Compressing & Uploading (${uploadProgress}%)...` : 'Publishing Listing to NaijaMart...'}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0B8751] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, uploadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || isPublishing}
          className="w-full bg-[#0B8751] hover:bg-[#096e42] disabled:bg-gray-400 text-white py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading Photos ({uploadProgress}%)...</span>
            </>
          ) : isPublishing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Publishing Listing...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Post Product Now</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
