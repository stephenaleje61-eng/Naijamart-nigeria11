import React, { useState } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { NIGERIAN_STATES, STATE_COORDINATES } from '../types';
import { 
  X, 
  Store, 
  Sprout, 
  Briefcase, 
  UserCheck, 
  Upload, 
  CheckCircle,
  Plus
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [listingType, setListingType] = useState<'business' | 'farm' | 'job' | 'freelancer'>('business');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Business Form State
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Retail & Wholesale');
  const [bizDescription, setBizDescription] = useState('');
  const [bizState, setBizState] = useState('Taraba');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('08167258121');
  const [bizOpen, setBizOpen] = useState('08:00');
  const [bizClose, setBizClose] = useState('18:00');

  // Farm Form State
  const [cropName, setCropName] = useState('');
  const [cropCategory, setCropCategory] = useState('Grains & Cereals');
  const [pricePerUnit, setPricePerUnit] = useState<number>(35000);
  const [unit, setUnit] = useState<'kg' | 'bag (50kg)' | 'bag (100kg)' | 'crate' | 'tonne' | 'basket'>('bag (100kg)');
  const [moq, setMoq] = useState<number>(5);
  const [farmState, setFarmState] = useState('Taraba');
  const [farmLga, setFarmLga] = useState('Wukari');
  const [farmerPhone, setFarmerPhone] = useState('08167258121');
  const [logistics, setLogistics] = useState<'seller_delivery' | 'buyer_pickup' | 'negotiable'>('seller_delivery');

  // Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship' | 'Apprenticeship'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('150,000 - 250,000');
  const [jobState, setJobState] = useState('Taraba');
  const [jobDesc, setJobDesc] = useState('');
  const [jobEmail, setJobEmail] = useState('');

  // Freelancer Form State
  const [freeName, setFreeName] = useState('');
  const [tagline, setTagline] = useState('');
  const [skillsStr, setSkillsStr] = useState('React, Graphic Design, Social Media');
  const [hourlyRate, setHourlyRate] = useState<number>(4500);
  const [freeBio, setFreeBio] = useState('');
  const [freePhone, setFreePhone] = useState('08167258121');
  const [freeState, setFreeState] = useState('Taraba');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (listingType === 'business') {
        const coords = STATE_COORDINATES[bizState] || { lat: 9.0765, lng: 7.3986 };
        await addDoc(collection(db, 'businessProfiles'), {
          name: bizName.trim(),
          category: bizCategory,
          description: bizDescription.trim(),
          state: bizState,
          address: bizAddress.trim(),
          phone: bizPhone.trim(),
          whatsapp: bizPhone.trim(),
          verifiedType: 'community',
          rating: 5.0,
          reviewCount: 1,
          openTime: bizOpen,
          closeTime: bizClose,
          ownerUid: user.uid,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: serverTimestamp(),
        });
      } else if (listingType === 'farm') {
        const coords = STATE_COORDINATES[farmState] || { lat: 8.892, lng: 11.362 };
        await addDoc(collection(db, 'farmListings'), {
          cropName: cropName.trim(),
          category: cropCategory,
          pricePerUnit: Number(pricePerUnit),
          unit,
          minOrderQuantity: Number(moq),
          availableQuantity: 100,
          harvestDate: 'Fresh / Available Now',
          state: farmState,
          lga: farmLga.trim(),
          logistics,
          farmerName: user.displayName || user.email?.split('@')[0] || 'Local Farmer',
          phone: farmerPhone.trim(),
          whatsapp: farmerPhone.trim(),
          farmerUid: user.uid,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: serverTimestamp(),
        });
      } else if (listingType === 'job') {
        const coords = STATE_COORDINATES[jobState] || { lat: 9.0765, lng: 7.3986 };
        await addDoc(collection(db, 'jobListings'), {
          title: jobTitle.trim(),
          companyName: companyName.trim(),
          jobType,
          category: 'Enterprise',
          state: jobState,
          salaryRange: salaryRange.trim(),
          description: jobDesc.trim(),
          requirements: ['Relevant experience', 'Professional dedication', 'Communication skills'],
          employerUid: user.uid,
          contactEmail: jobEmail.trim() || user.email || '',
          lat: coords.lat,
          lng: coords.lng,
          createdAt: serverTimestamp(),
        });
      } else if (listingType === 'freelancer') {
        const skillsArray = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
        await addDoc(collection(db, 'freelancerProfiles'), {
          uid: user.uid,
          fullName: freeName.trim() || user.displayName || 'African Builder',
          tagline: tagline.trim(),
          skills: skillsArray,
          hourlyRate: Number(hourlyRate),
          state: freeState,
          bio: freeBio.trim(),
          phone: freePhone.trim(),
          whatsapp: freePhone.trim(),
          rating: 5.0,
          completedGigs: 3,
          createdAt: serverTimestamp(),
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to publish listing:', err);
      alert('Error publishing listing. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#075B43] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-900">Publish to NaijaHub Africa</h3>
              <p className="text-[11px] text-gray-500">Reach verified buyers, farmers, employers & clients</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success message */}
        {isSuccess ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-[#0D9B72] mx-auto animate-bounce" />
            <h4 className="font-black text-base text-gray-900">Listing Published Live!</h4>
            <p className="text-xs text-gray-500">
              Your post is now active nationwide across all 36 states and FCT.
            </p>
          </div>
        ) : (
          <div>
            {/* Category Select Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#F8F7F2] p-1.5 rounded-2xl mb-4 border border-gray-200/60">
              {[
                { id: 'business', label: 'Business', icon: Store },
                { id: 'farm', label: 'Farm Produce', icon: Sprout },
                { id: 'job', label: 'Job Opening', icon: Briefcase },
                { id: 'freelancer', label: 'Freelancer', icon: UserCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setListingType(tab.id as any)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      listingType === tab.id
                        ? 'bg-white text-[#075B43] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* BUSINESS FORM */}
              {listingType === 'business' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        required
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        placeholder="e.g. Apex Tech & Electronics"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#075B43]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                      <select
                        value={bizCategory}
                        onChange={(e) => setBizCategory(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      >
                        <option value="Phones & Electronics">Phones & Electronics</option>
                        <option value="Fashion & Textiles">Fashion & Textiles</option>
                        <option value="Agro-Allied & Food">Agro-Allied & Food</option>
                        <option value="Automobile & Spare Parts">Automobile & Spare Parts</option>
                        <option value="Retail & Supermarket">Retail & Supermarket</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                      <select
                        value={bizState}
                        onChange={(e) => setBizState(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      >
                        {NIGERIAN_STATES.filter((s) => s !== 'All Nigeria').map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={bizPhone}
                        onChange={(e) => setBizPhone(e.target.value)}
                        placeholder="08167258121"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Store Address</label>
                    <input
                      type="text"
                      required
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                      placeholder="e.g. Shop 14, Main Market, Wukari"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      required
                      value={bizDescription}
                      onChange={(e) => setBizDescription(e.target.value)}
                      placeholder="Specialized in genuine gadgets and accessories with warranty..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </>
              )}

              {/* FARM FORM */}
              {listingType === 'farm' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Produce / Crop</label>
                      <input
                        type="text"
                        required
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        placeholder="e.g. Yellow Maize (White Corn)"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as any)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      >
                        <option value="bag (100kg)">bag (100kg)</option>
                        <option value="bag (50kg)">bag (50kg)</option>
                        <option value="kg">kg</option>
                        <option value="crate">crate</option>
                        <option value="tonne">tonne</option>
                        <option value="basket">basket</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price per Unit (₦)</label>
                      <input
                        type="number"
                        required
                        value={pricePerUnit}
                        onChange={(e) => setPricePerUnit(Number(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Min Order Qty (MOQ)</label>
                      <input
                        type="number"
                        required
                        value={moq}
                        onChange={(e) => setMoq(Number(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Farm State & LGA</label>
                      <div className="flex gap-1.5">
                        <select
                          value={farmState}
                          onChange={(e) => setFarmState(e.target.value)}
                          className="w-1/2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                        >
                          {NIGERIAN_STATES.filter((s) => s !== 'All Nigeria').map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={farmLga}
                          onChange={(e) => setFarmLga(e.target.value)}
                          placeholder="LGA"
                          className="w-1/2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Farmer Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value)}
                        placeholder="08167258121"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* JOB FORM */}
              {listingType === 'job' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Role Title</label>
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Solar Installation Technician"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. GreenEnergy Africa Ltd"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Job Type</label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value as any)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Remote">Remote</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                      <select
                        value={jobState}
                        onChange={(e) => setJobState(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      >
                        {NIGERIAN_STATES.filter((s) => s !== 'All Nigeria').map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Salary (₦/mo)</label>
                      <input
                        type="text"
                        value={salaryRange}
                        onChange={(e) => setSalaryRange(e.target.value)}
                        placeholder="150,000"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Job Description</label>
                    <textarea
                      rows={2}
                      required
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      placeholder="Describe core duties and expectations..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </>
              )}

              {/* FREELANCER FORM */}
              {listingType === 'freelancer' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={freeName}
                        onChange={(e) => setFreeName(e.target.value)}
                        placeholder="e.g. Tunde Adeyemi"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Professional Tagline</label>
                      <input
                        type="text"
                        required
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g. Senior Mobile & Web Developer"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Skills (comma-separated)</label>
                      <input
                        type="text"
                        required
                        value={skillsStr}
                        onChange={(e) => setSkillsStr(e.target.value)}
                        placeholder="React, Python, Accounting, Figma"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Rate (₦/hr)</label>
                      <input
                        type="number"
                        required
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Bio & Experience</label>
                    <textarea
                      rows={2}
                      required
                      value={freeBio}
                      onChange={(e) => setFreeBio(e.target.value)}
                      placeholder="Over 4 years building fintech and logistics applications across Nigeria..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-[#075B43] hover:bg-[#0D9B72] disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Publishing Live...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
