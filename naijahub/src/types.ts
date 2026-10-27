export interface BusinessProfile {
  id: string;
  name: string;
  businessName?: string;
  category: string;
  description: string;
  state: string;
  lga?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  verifiedType?: 'cac' | 'community' | 'none';
  verified?: boolean;
  verificationType?: string;
  cacNumber?: string;
  rating?: number;
  reviewCount?: number;
  openTime?: string; // e.g. "08:00"
  closeTime?: string; // e.g. "18:00"
  openingHours?: { open: string; close: string };
  products?: BusinessProduct[];
  bannerUrl?: string;
  logoUrl?: string;
  ownerUid: string;
  lat?: number;
  lng?: number;
  createdAt?: any;
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  title: string;
  price: number;
  stockStatus?: 'In Stock' | 'Out of Stock' | 'Pre-order';
  images?: string[];
  description: string;
  ownerUid?: string;
  createdAt?: any;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  authorName: string;
  authorUid: string;
  rating: number;
  comment: string;
  isVerifiedBuyer?: boolean;
  createdAt?: any;
}

export interface FarmListing {
  id: string;
  cropName: string;
  category: string; // Grains, Tubers, Vegetables, Fruits, Livestock, Cash Crops
  variety?: string;
  description?: string;
  pricePerUnit: number;
  unit: 'kg' | 'bag (50kg)' | 'bag (100kg)' | 'crate' | 'tonne' | 'basket';
  minOrderQuantity?: number;
  moq?: number;
  availableQuantity?: number;
  harvestDate?: string;
  state: string;
  lga: string;
  logistics: 'seller_delivery' | 'buyer_pickup' | 'negotiable';
  farmerName: string;
  phone: string;
  whatsapp?: string;
  imageUrl?: string;
  farmerUid: string;
  lat?: number;
  lng?: number;
  createdAt?: any;
}

export interface JobListing {
  id: string;
  title: string;
  companyName?: string;
  company?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship' | 'Apprenticeship';
  type?: string;
  category?: string;
  state: string;
  lga?: string;
  salaryRange?: string;
  salary?: string;
  description: string;
  requirements?: string[];
  employerUid: string;
  contactEmail: string;
  contactPhone?: string;
  applicationDeadline?: string;
  lat?: number;
  lng?: number;
  createdAt?: any;
}

export interface FreelancerProfile {
  id: string;
  uid: string;
  fullName?: string;
  name?: string;
  tagline: string;
  skills: string[];
  hourlyRate: number; // in NGN
  state: string;
  bio: string;
  phone: string;
  whatsapp?: string;
  portfolioImages?: string[];
  rating?: number;
  completedGigs?: number;
  avatarUrl?: string;
  createdAt?: any;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  portfolioUrl?: string;
  cvUrl: string;
  coverNote?: string;
  applicantUid: string;
  employerUid: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected';
  createdAt?: any;
}

export interface LearningSession {
  id: string;
  title: string;
  topic: string;
  category: 'Agribusiness' | 'Solar Tech' | 'Financial & Loans' | 'Physics & Engineering' | 'Data Science';
  userUid?: string;
  createdAt?: any;
}

export const NIGERIAN_STATES = [
  'All Nigeria',
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

// Approximate coordinates for state capitals to calculate Haversine distance
export const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Taraba': { lat: 8.892, lng: 11.362 }, // Jalingo/Wukari area
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'FCT Abuja': { lat: 9.0765, lng: 7.3986 },
  'Kano': { lat: 12.0022, lng: 8.592 },
  'Rivers': { lat: 4.8156, lng: 7.0498 },
  'Oyo': { lat: 7.3775, lng: 3.947 },
  'Kaduna': { lat: 10.5105, lng: 7.4165 },
  'Enugu': { lat: 6.4584, lng: 7.5464 },
  'Plateau': { lat: 9.8965, lng: 8.8583 },
  'Benue': { lat: 7.7322, lng: 8.5391 },
  'Edo': { lat: 6.335, lng: 5.6037 },
  'Delta': { lat: 5.5174, lng: 5.7501 },
  'Anambra': { lat: 6.2209, lng: 7.0723 },
  'Ogun': { lat: 7.1557, lng: 3.3451 },
  'Borno': { lat: 11.8333, lng: 13.15 },
  'Sokoto': { lat: 13.0059, lng: 5.2476 },
};
