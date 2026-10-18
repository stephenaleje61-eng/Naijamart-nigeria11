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
  sellerId?: string;
  sellerCampus?: string;
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
  buyerId?: string; // student ID for 1-click private chat and friend requests
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

export interface StudentProfile {
  id: string; // unique student ID (stored in localStorage and Firestore students collection)
  fullName: string;
  campus: string; // e.g. "Federal University Wukari (FU Wukari)"
  department: string; // e.g. "Computer Science"
  level: string; // e.g. "300L", "100L"
  hostelArea: string; // e.g. "Hostel B", "School Gate"
  phoneNumber: string;
  whatsappNumber: string;
  avatarUrl?: string;
  isVerified?: boolean;
  matricOrReg?: string; // Optional matriculation number or student ID reference
  bio?: string;
  isReported?: boolean;
  reportCount?: number;
  reportReasons?: string[];
  isFake?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromCampus: string;
  fromDepartment?: string;
  fromAvatar?: string;
  fromPhone?: string;
  toId: string;
  toName: string;
  toCampus: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: any;
  updatedAt?: any;
}

export interface ChatConversation {
  id: string; // usually `chat_${[idA, idB].sort().join('_')}`
  participants: string[]; // [idA, idB]
  participantData: {
    [studentId: string]: {
      name: string;
      campus: string;
      avatarUrl?: string;
      phone?: string;
      department?: string;
    };
  };
  lastMessage?: string;
  lastMessageTime?: any;
  lastSenderId?: string;
  productContext?: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
  };
  unreadBy?: string[];
  createdAt?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt?: any;
  timestamp?: number;
  read?: boolean;
}

export interface SquatterItem {
  id: string;
  type: 'have_space' | 'need_space';
  location: string; // 'Hostel A' | 'Hostel B' | 'New Site' | 'Wukari Town'
  price: number;
  gender: 'male' | 'female' | 'any';
  people_in_room: number | string;
  whatsapp: string;
  images: string[];
  description: string;
  is_verified: boolean;
  created_at: any;
}

export interface SquatterFilterState {
  type: 'have_space' | 'need_space';
  location: string;
  gender: string;
  minPrice: string;
  maxPrice: string;
}

