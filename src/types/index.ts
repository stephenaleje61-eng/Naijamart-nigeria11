export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  condition: 'New' | 'Fairly Used' | 'Used' | 'Fair';
  papers?: 'Complete' | 'Incomplete' | 'N/A';
  model?: string;
  images: string[];
  imageUrl: string;
  location: string;
  sellerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  status: 'approved' | 'pending' | 'sold';
  createdAt?: any;
  expiresAt?: any;
  views: number;
  isOkada?: boolean;
  stockLeft?: number;
}

export interface OkadaRider {
  id: string;
  name: string;
  phoneNumber: string;
  whatsappNumber: string;
  location: string;
  bikeNumber: string;
  isAvailable: boolean;
  photoUrl: string;
  createdAt?: any;
  expiresAt?: any;
  status: 'approved' | 'pending';
  category: 'Okada Riders Wukari 🏍️';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  location: string;
  condition: string;
  papers: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'discount';
}

export interface WantedItem {
  id: string;
  buyerName: string;
  avatarUrl?: string; // Base64 profile picture or avatar
  school: string; // e.g. "FU Wukari", "UNILAG", etc.
  itemWanted: string; // e.g. "iPhone X under 120k", "Mini fridge for hostel"
  budget: number; // in Naira
  budgetType?: 'fixed' | 'up_to' | 'negotiable';
  location: string; // e.g. "Hostel Block B", "School Gate", "Off-campus"
  urgency: 'Urgent' | 'This Week' | 'Flexible';
  category: string; // Phones & Gadgets, Hostel & Appliances, etc.
  description?: string;
  phoneNumber: string;
  whatsappNumber: string;
  sampleImageUrl?: string; // Optional Base64 photo of what is wanted
  createdAt?: any;
  status: 'approved' | 'fulfilled' | 'pending';
  views?: number;
  offersCount?: number;
}

export interface WantedFilterState {
  searchQuery: string;
  campus: string;
  category: string;
  budgetRange: string;
  urgency: string;
  sortBy: 'newest' | 'budget-desc' | 'budget-asc' | 'urgent';
}
