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
