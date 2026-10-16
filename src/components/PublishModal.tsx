import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Bike, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  FileText
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImageToBase64 } from '../utils/imageCompressor';
import { CATEGORIES, OKADA_MODELS, NIGERIAN_LOCATIONS } from '../data/constants';
import { Product } from '../types';
import { useToast } from '../context/ToastContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublished: (product: Product) => void;
  defaultIsOkada?: boolean;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublished,
  defaultIsOkada = false,
}) => {
  const { showToast } = useToast();

  const [isOkadaMode, setIsOkadaMode] = useState(defaultIsOkada);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultIsOkada ? 'Okada Market 🏍️' : CATEGORIES[0].name);
  const [model, setModel] = useState(OKADA_MODELS[0]);
  const [condition, setCondition] = useState<'New' | 'Fairly Used' | 'Used'>('Fairly Used');
  const [papers, setPapers] = useState<'Complete' | 'Incomplete' | 'N/A'>('Complete');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Wukari, Taraba State');
  const [sellerName, setSellerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Images state (max 3 as requested)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Publishing phase indicator
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');

  // Sync mode with props
  useEffect(() => {
    if (defaultIsOkada) {
      setIsOkadaMode(true);
      setCategory('Okada Market 🏍️');
    }
  }, [defaultIsOkada]);

  // Handle Okada mode toggle
  const handleToggleOkada = (enabled: boolean) => {
    setIsOkadaMode(enabled);
    if (enabled) {
      setCategory('Okada Market 🏍️');
      if (!title) setTitle(`Bajaj Boxer 150 (Clean Sound)`);
    } else {
      setCategory(CATEGORIES[1]?.name || 'Phones & Tablets');
      if (title.includes('Bajaj') || title.includes('TVS')) setTitle('');
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Up to 3 images as requested
    const total = [...selectedFiles, ...files].slice(0, 3);
    setSelectedFiles(total);

    const prevs = total.map((file) => URL.createObjectURL(file));
    setPreviews(prevs);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast('Please upload at least 1 photo of the item', 'error');
      return;
    }

    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      showToast('Please enter a valid price in Naira', 'error');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      showToast('Please provide a valid 11-digit phone number', 'error');
      return;
    }

    if (!whatsappNumber.trim()) {
      showToast('Please provide a WhatsApp number for buyers', 'error');
      return;
    }

    setIsPublishing(true);

    try {
      // Step 1: Compressing photos using HTML canvas max 700px, jpeg 0.6 quality
      setPublishStatus('Compressing images to 700px JPEG 0.6...');
      const base64Images: string[] = [];
      for (const file of selectedFiles) {
        const base64 = await compressImageToBase64(file, 700, 0.6);
        base64Images.push(base64);
      }

      // Step 2: Convert to Firestore data URL
      setPublishStatus('Converting to base64...');
      await new Promise((r) => setTimeout(r, 150));

      // Step 3: Saving to Firestore zangamarket1 with 7-day expiration
      setPublishStatus('Publishing ad to marketplace...');
      const primaryImage = base64Images[0];

      // Calculate 7-day expiry Timestamp
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiresAtTimestamp = Timestamp.fromDate(sevenDaysFromNow);

      const finalTitle = isOkadaMode && model && !title.includes(model)
        ? `${model} - ${title.trim()}`
        : title.trim();

      const productPayload = {
        title: finalTitle,
        description: description.trim() || (isOkadaMode ? 'Well maintained Okada in great mechanical condition. Contact for direct inspection.' : 'Clean item in great working condition.'),
        price: Number(price),
        category: isOkadaMode ? 'Okada Market 🏍️' : category,
        condition,
        papers: isOkadaMode ? papers : 'N/A',
        model: isOkadaMode ? model : '',
        images: base64Images,
        imageUrl: primaryImage,
        location,
        sellerName: sellerName.trim() || 'Verified Seller',
        phoneNumber: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        status: 'approved' as const,
        createdAt: serverTimestamp(),
        expiresAt: expiresAtTimestamp,
        views: 0,
        isOkada: isOkadaMode,
      };

      const docRef = await addDoc(collection(db, 'products'), productPayload);

      // Save to localStorage under 'naijamart_my_ad_ids' for local My Ads tracking
      try {
        const existingMyAds = JSON.parse(localStorage.getItem('naijamart_my_ad_ids') || '[]');
        if (!existingMyAds.includes(docRef.id)) {
          existingMyAds.push(docRef.id);
          localStorage.setItem('naijamart_my_ad_ids', JSON.stringify(existingMyAds));
        }
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      showToast('Ad published successfully! It is now live across Nigeria.', 'success');

      const createdProduct: Product = {
        id: docRef.id,
        ...productPayload,
        createdAt: new Date(),
        expiresAt: sevenDaysFromNow,
      };

      // Reset
      setTitle('');
      setPrice('');
      setDescription('');
      setSelectedFiles([]);
      setPreviews([]);

      onPublished(createdProduct);
      onClose();
    } catch (err: any) {
      console.error('Publishing error:', err);
      showToast('Could not publish ad: ' + (err.message || 'Please check your connection'), 'error');
    } finally {
      setIsPublishing(false);
      setPublishStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className={`px-5 py-3.5 text-white flex items-center justify-between ${
          isOkadaMode ? 'bg-[#fb6514]' : 'bg-[#008751]'
        }`}>
          <div className="flex items-center gap-2">
            {isOkadaMode ? <Bike className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-yellow-300" />}
            <div>
              <h2 className="font-black text-base sm:text-lg">
                {isOkadaMode ? 'Post Okada Motorcycle For Sale' : 'Post Free Ad on NaijaMart'}
              </h2>
              <p className="text-[11px] text-white/90 font-medium">
                No signup required • 100% Free • Base64 Instant Upload • Live for 7 Days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Mode Switcher: Okada vs General Item */}
        <div className="grid grid-cols-2 p-2 bg-gray-100 border-b border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleToggleOkada(true)}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              isOkadaMode
                ? 'bg-[#fb6514] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>🏍️ Sell Okada (Motorcycle)</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleOkada(false)}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              !isOkadaMode
                ? 'bg-[#008751] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>📦 Sell General Item</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Photos Upload (Up to 3, compressed to 700px JPEG 0.6) */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Upload Photos <span className="text-red-500">*</span>
              <span className="font-normal text-gray-500 ml-1">
                (Up to 3 pictures, auto-compressed to 700px quality 0.6)
              </span>
            </label>

            <div className="grid grid-cols-3 gap-3 mb-2">
              {previews.map((previewUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={previewUrl} alt="Ad preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    disabled={isPublishing}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md shadow-xs hover:bg-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/75 text-white px-1.5 py-0.5 rounded font-bold">
                      Main Photo
                    </span>
                  )}
                </div>
              ))}

              {previews.length < 3 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-[#fb6514] rounded-xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-orange-50/40">
                  <Upload className="w-6 h-6 text-gray-500 mb-1" />
                  <span className="text-xs font-bold text-gray-700">Add Picture</span>
                  <span className="text-[10px] text-gray-400">JPG, PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isPublishing}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Okada Model Dropdown (if Okada mode) */}
          {isOkadaMode && (
            <div className="bg-orange-50/70 border border-orange-200 p-3 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#fb6514]">
                <Bike className="w-4 h-4" />
                <span>Okada Motorcycle Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="publish-okada-model" className="block font-bold text-gray-700 mb-1">
                    Okada Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="publish-okada-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-[#fb6514]"
                  >
                    {OKADA_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="publish-okada-papers" className="block font-bold text-gray-700 mb-1">
                    Motorcycle Papers <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="publish-okada-papers"
                    value={papers}
                    onChange={(e) => setPapers(e.target.value as 'Complete' | 'Incomplete')}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-[#fb6514]"
                  >
                    <option value="Complete">Complete Papers (Receipt & Reg)</option>
                    <option value="Incomplete">Incomplete / Receipt Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="publish-ad-title" className="block font-bold text-gray-800 mb-1">
              {isOkadaMode ? 'Okada Title / Subtitle' : 'Ad Title'} <span className="text-red-500">*</span>
            </label>
            <input
              id="publish-ad-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isOkadaMode ? 'e.g. Bajaj Boxer 150 Red, Very Sound Engine, New Tyres' : 'e.g. iPhone 13 Pro 128GB Blue / Toyota Corolla 2008'}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#008751]"
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!isOkadaMode && (
              <div>
                <label htmlFor="publish-ad-category" className="block font-bold text-gray-800 mb-1">Category</label>
                <select
                  id="publish-ad-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#008751]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="publish-ad-condition" className="block font-bold text-gray-800 mb-1">Condition</label>
              <select
                id="publish-ad-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'New' | 'Fairly Used' | 'Used')}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#008751]"
              >
                <option value="New">Brand New</option>
                <option value="Fairly Used">Fairly Used (Clean Condition)</option>
                <option value="Used">Used / Second Hand</option>
              </select>
            </div>

            <div>
              <label htmlFor="publish-ad-price" className="block font-bold text-gray-800 mb-1">
                Price in Naira (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-gray-500">₦</span>
                <input
                  id="publish-ad-price"
                  type="number"
                  required
                  min="100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={isOkadaMode ? 'e.g. 450000' : 'e.g. 85000'}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-[#008751]"
                />
              </div>
            </div>
          </div>

          {/* Location & Seller Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="publish-ad-location" className="block font-bold text-gray-800 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                id="publish-ad-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#008751]"
              >
                {NIGERIAN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="publish-seller-name" className="block font-bold text-gray-800 mb-1">
                Your Name / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                id="publish-seller-name"
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Musa Auto & Okada Motors"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          {/* Phone Number & WhatsApp Number (Required for 2 Big Buttons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl">
            <div>
              <label htmlFor="publish-phone-number" className="block font-bold text-gray-800 mb-1">
                Phone Number (Calls) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="publish-phone-number"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (!whatsappNumber) setWhatsappNumber(e.target.value);
                  }}
                  placeholder="08012345678"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="publish-whatsapp-number" className="block font-bold text-gray-800 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  id="publish-whatsapp-number"
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="08012345678"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="publish-ad-description" className="block font-bold text-gray-800 mb-1">Description</label>
            <textarea
              id="publish-ad-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isOkadaMode ? 'State engine condition, gear shifts, fuel efficiency, tyre state, reason for selling, and inspection point in Wukari...' : 'Describe specifications, accessories, and inspection details...'}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPublishing}
              className={`w-full text-white font-black py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                isOkadaMode
                  ? 'bg-[#fb6514] hover:bg-[#e8590c]'
                  : 'bg-[#008751] hover:bg-[#007043]'
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{publishStatus || 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isOkadaMode ? 'Publish Okada Ad Now 🏍️' : 'Post Ad to NaijaMart'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
