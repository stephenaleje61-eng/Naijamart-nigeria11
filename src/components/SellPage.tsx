import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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

  const { showToast } = useToast();

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

    const uid = auth.currentUser?.uid || user?.uid || 'stephenaleje61';
    const newId = 'prod_' + Date.now().toString();

    // Default image if no file was picked
    const initialImages = previewUrls.length > 0 
      ? previewUrls 
      : ['https://images.unsplash.com/photo-1511707171634-5f897ff02526?w=600&auto=format&fit=crop&q=80'];

    // 1. INSTANT SHOW ON SUBMIT - ZERO SECOND DELAY
    // Auto-approve and hardcode user priority
    const newProduct = {
      id: newId,
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
      images: initialImages,
      coverImage: initialImages[0],
      imageUrl: initialImages[0],
      userId: auth.currentUser?.uid || 'stephenaleje61',
      username: 'stephenaleje61',
      sellerName: 'stephenaleje61',
      ownerUid: uid,
      status: 'approved',
      isApproved: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    // Step 1: Save product immediately to localStorage
    try {
      const localProducts = JSON.parse(localStorage.getItem('my_products') || '[]');
      localStorage.setItem('my_products', JSON.stringify([newProduct, ...localProducts]));

      const cachedProducts = JSON.parse(localStorage.getItem('cached_products') || '[]');
      localStorage.setItem('cached_products', JSON.stringify([newProduct, ...cachedProducts]));
    } catch (storageErr) {
      console.warn('LocalStorage save notice:', storageErr);
    }

    // Step 2: Dispatch local event so MarketPage updates immediately
    window.dispatchEvent(new CustomEvent('localProductAdded', { detail: newProduct }));

    // Step 3: Show toast "Product live now! 🔥"
    try {
      showToast('Product live now! 🔥', 'success');
    } catch {
      // Toast fallback
    }

    // Step 4: Navigate to homepage/market IMMEDIATELY (no waiting for Firebase)
    onNavigate('market');

    // Step 5: Send to Firebase in background with .catch(err => console.log(err))
    const filesToUpload = [...selectedFiles];
    (async () => {
      try {
        let cloudUrls: string[] = [];
        if (filesToUpload.length > 0) {
          try {
            cloudUrls = await uploadProductImages(filesToUpload, uid, () => {});
          } catch (uploadErr) {
            console.warn('Background image upload notice:', uploadErr);
          }
        }
        const finalImages = cloudUrls.length > 0 ? cloudUrls : newProduct.images;
        const firestoreDoc = {
          ...newProduct,
          images: finalImages,
          coverImage: finalImages[0],
          imageUrl: finalImages[0],
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'products'), firestoreDoc);
        console.log('Product persisted to Firestore collection "products"');
      } catch (err) {
        console.log('Firebase background sync notice:', err);
      }
    })();
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2A2A2A] text-[#10B981] text-xs font-bold mb-2">
          <Tag className="w-3.5 h-3.5" /> Post an Item
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Sell on NaijaMart
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Buyers in FUWukari and Nigeria contact you directly on WhatsApp or phone call.
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-start gap-3 text-red-200 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 text-emerald-200 text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#10B981]" />
          <div>
            <p className="font-bold">Success!</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#151515] rounded-3xl p-5 sm:p-7 border border-[#2A2A2A] shadow-md space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Product Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 12 Pro Max 128GB Pristine, Mini-fridge, Okada Bajaj"
            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl text-sm font-medium placeholder-gray-500 focus:bg-[#0A0A0A] focus:outline-hidden focus:ring-1 focus:ring-[#0B8751] focus:border-[#0B8751]"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl text-sm font-medium focus:bg-[#0A0A0A] focus:outline-hidden focus:ring-1 focus:ring-[#0B8751] focus:border-[#0B8751]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#151515] text-white">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Condition <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('Used')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                  condition === 'Used'
                    ? 'bg-[#0B8751] text-white border-[#0B8751]'
                    : 'bg-[#0A0A0A] text-gray-300 border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white'
                }`}
              >
                Used
              </button>
              <button
                type="button"
                onClick={() => setCondition('New')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                  condition === 'New'
                    ? 'bg-[#0B8751] text-white border-[#0B8751]'
                    : 'bg-[#0A0A0A] text-gray-300 border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white'
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
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Price in Naira (₦) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400 font-bold">₦</span>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className="w-full pl-8 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl text-sm font-bold focus:bg-[#0A0A0A] focus:outline-hidden focus:ring-1 focus:ring-[#0B8751] focus:border-[#0B8751]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              State / Campus <span className="text-red-400">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl text-sm font-medium focus:bg-[#0A0A0A] focus:outline-hidden focus:ring-1 focus:ring-[#0B8751] focus:border-[#0B8751]"
            >
              {STATES.map((st) => (
                <option key={st} value={st} className="bg-[#151515] text-white">{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            WhatsApp / Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2348167258121"
            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl text-sm font-medium focus:bg-[#0A0A0A] focus:outline-hidden focus:ring-1 focus:ring-[#0B8751] focus:border-[#0B8751]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mention condition, accessories included, reason for selling..."
            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-2xl text-sm font-medium focus:bg-[#0A0A0A] focus:outline-hidden focus:ring-1 focus:ring-[#0B8751] focus:border-[#0B8751]"
          />
        </div>

        {/* Images Selection & Compression Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Product Images (Max 6) <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-gray-400 font-medium">
              {selectedFiles.length} of 6 selected
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-[#2A2A2A] group bg-[#0A0A0A]">
                <img src={url} alt={`preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
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
                className="aspect-square rounded-2xl border-2 border-dashed border-[#2A2A2A] hover:border-[#0B8751] bg-[#0A0A0A] hover:bg-[#151515] flex flex-col items-center justify-center p-2 text-center transition-colors group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-500 group-hover:text-[#10B981] mb-1" />
                <span className="text-[11px] font-bold text-gray-400 group-hover:text-[#10B981]">
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

          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            Images are compressed automatically under 800KB for fast mobile loading.
          </p>
        </div>

        {/* Upload Progress Bar (Live state) */}
        {(isUploading || isPublishing) && (
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A]">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-2">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                {isUploading ? `Compressing & Uploading (${uploadProgress}%)...` : 'Publishing Listing to NaijaMart...'}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
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
          className="w-full bg-[#0B8751] hover:bg-[#096e42] disabled:bg-gray-800 text-white py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition-all cursor-pointer border border-emerald-500/20"
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
