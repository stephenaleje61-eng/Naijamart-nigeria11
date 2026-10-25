import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { compressImageToMax800KB, uploadProductImage } from '../utils/imageUpload';
import { 
  PlusCircle, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon, 
  Loader2, 
  Tag, 
  MapPin, 
  DollarSign, 
  FileText, 
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

const LOCATIONS = [
  'FUWukari Campus (Federal University Wukari)',
  'Wukari Town, Taraba State',
  'Jalingo, Taraba State',
  'Yola, Adamawa State',
  'Makurdi, Benue State',
  'Abuja (FCT)',
  'Lagos State',
  'Kano State',
  'Port Harcourt, Rivers State',
  'Enugu State',
  'Other Location in Nigeria'
];

export const SellPage: React.FC<SellPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<'New' | 'Used'>('Used');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [phone, setPhone] = useState('+2348167258121');

  // Selected files & upload progress
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
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

    if (!user) {
      setErrorMessage('You must be logged in to post a product.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a title for your product.');
      return;
    }

    const numericPrice = parseFloat(price.replace(/,/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Please enter a valid price in Naira.');
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage('Please add at least 1 image of your item.');
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(5);
      setUploadStatusText('Compressing images to <800KB...');

      const uploadedUrls: string[] = [];
      const total = selectedFiles.length;

      for (let i = 0; i < total; i++) {
        const file = selectedFiles[i];
        setUploadStatusText(`Uploading photo ${i + 1} of ${total}...`);
        
        const url = await uploadProductImage(file, user.uid, i, (percent) => {
          const overall = Math.round(((i + percent / 100) / total) * 90);
          setUploadProgress(overall);
        });

        if (url && typeof url === 'string') {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('Failed to upload product images. Please try again.');
      }

      setUploadProgress(95);
      setUploadStatusText('Saving product listing to NaijaMart...');

      const primaryImageUrl = uploadedUrls[0];
      const normalizedPhone = phone.trim() || '+2348167258121';

      // Ensure no undefined fields are passed to Firestore
      const newProductDoc = {
        title: title.trim(),
        description: description.trim() || 'Direct from verified seller on NaijaMart Hub.',
        category: category || 'Other Items',
        condition: condition || 'Used',
        price: numericPrice,
        imageUrl: primaryImageUrl,
        images: uploadedUrls,
        ownerUid: user.uid,
        ownerPhone: normalizedPhone,
        phoneNumber: normalizedPhone,
        whatsappNumber: normalizedPhone,
        sellerName: user.displayName || user.email?.split('@')[0] || 'NaijaMart Seller',
        location: location || 'Wukari, Taraba State',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), newProductDoc);

      setUploadProgress(100);
      setUploadStatusText('Done!');
      setSuccessMessage('🎉 Product posted successfully! View it in My Products or the Market.');

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setSelectedFiles([]);
      setPreviewUrls([]);

      setTimeout(() => {
        onNavigate('my-products');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMessage(err?.message || 'Could not post product. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not logged in, show friendly authentication banner
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-[#008751] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sell on NaijaMart Hub</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Reach thousands of buyers in FUWukari campus, Taraba, and across Nigeria. Please log in or create a free account to post your goods.
          </p>
          <button
            onClick={() => onOpenAuth ? onOpenAuth() : onNavigate('market')}
            className="w-full bg-[#008751] hover:bg-[#007043] text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In to Post Goods</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#008751] text-xs font-bold mb-2">
          <Tag className="w-3.5 h-3.5" /> Instant Listing
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Post an Item for Sale
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Buyers contact you directly on WhatsApp or Call. Direct meetup inspection recommended.
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#008751]" />
          <div>
            <p className="font-bold">Success!</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
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
            placeholder="e.g., iPhone 12 Pro Max 128GB Pristine, Mini-fridge, Okada Bajaj"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
          />
        </div>

        {/* Category & Condition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
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
                    ? 'bg-[#008751] text-white border-[#008751]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Used (Second-hand)
              </button>
              <button
                type="button"
                onClick={() => setCondition('New')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all ${
                  condition === 'New'
                    ? 'bg-[#008751] text-white border-[#008751]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Brand New
              </button>
            </div>
          </div>
        </div>

        {/* Price & State/Location Grid */}
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
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              State / Campus Location <span className="text-red-500">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Phone / WhatsApp */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            WhatsApp / Call Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2348167258121"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Buyers will click to call or chat you on WhatsApp using this number.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Description & Key Details
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mention battery health, accessories included, reason for selling, or meetup point..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#008751]"
          />
        </div>

        {/* Image Upload with Canvas Auto-Compression */}
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
                  <span className="absolute bottom-1 left-1 bg-[#008751] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {selectedFiles.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#008751] bg-gray-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center p-2 text-center transition-colors group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#008751] mb-1" />
                <span className="text-[11px] font-bold text-gray-600 group-hover:text-[#008751]">
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
            <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
            Images are compressed automatically under 800KB for fast mobile loading.
          </p>
        </div>

        {/* Upload Progress Bar */}
        {submitting && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#008751]" />
                {uploadStatusText}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#008751] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#008751] hover:bg-[#007043] disabled:bg-gray-400 text-white py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
        >
          {submitting ? (
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
