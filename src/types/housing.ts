export type HouseType = 
  | 'Self-contain'
  | '1-Bed Flat'
  | '2-Bed Flat'
  | '3-Bed Flat'
  | '4-Bed+'
  | 'Duplex'
  | 'BQ (Boys Quarters)'
  | 'Single Room';

export type PaymentPeriod = 'year' | 'month' | 'total';

export type GenderPreference = 'Male' | 'Female' | 'Any';

export interface HouseListing {
  id: string;
  agentUid: string;
  agentName: string;
  agentPhone: string;
  agentPhoto?: string;
  title: string;
  type: HouseType;
  price: number;
  pricePer: PaymentPeriod;
  location: string; // e.g. "Wuse 2, Abuja, FCT"
  state: string;
  city: string;
  area: string;
  address: string;
  description: string;
  photos: string[]; // Firebase Storage URLs
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  facilities: string[];
  available: boolean;
  verified: boolean;
  postedAt: any;
  reportsCount: number;
  status: 'active' | 'hidden' | 'rented';
}

export interface RoommateListing {
  id: string;
  posterUid: string;
  posterName: string;
  posterPhone: string;
  posterPhoto?: string;
  location: string;
  state: string;
  city: string;
  area: string;
  budget: number;
  genderPref: GenderPreference;
  roomType: string;
  lookingFor: string; // e.g. "1 roommate", "2 roommates"
  aboutMe: string;
  moveInDate: string;
  photos: string[];
  postedAt: any;
  available: boolean;
  reportsCount: number;
  status: 'active' | 'hidden';
}

export interface HouseFilters {
  searchQuery: string;
  type: string;
  state: string;
  cityOrArea: string;
  minPrice: number;
  maxPrice: number;
  furnishedOnly: boolean;
  verifiedOnly: boolean;
  bedrooms?: number | 'any';
}

export interface RoommateFilters {
  searchQuery: string;
  genderPref: string;
  maxBudget: number;
  state: string;
}

export const HOUSING_FACILITIES = [
  'Running Water',
  '24/7 Light',
  'Pre-paid Meter',
  'POP Ceiling',
  'Tiled Floor',
  'Fenced Compound',
  'Security Guard / Gatekeeper',
  'Car Park',
  'Kitchen Cabinet',
  'Wardrobe',
  'Balcony',
  'Generator Backup',
  'Borehole & Overhead Tank',
  'Interlocked Compound',
  'AC Fitted',
  'CCTV Surveillance',
] as const;

export const HOUSE_TYPES: HouseType[] = [
  'Self-contain',
  '1-Bed Flat',
  '2-Bed Flat',
  '3-Bed Flat',
  '4-Bed+',
  'Duplex',
  'BQ (Boys Quarters)',
  'Single Room',
];

export const POPULAR_NIGERIAN_STATES = [
  'All Nigeria',
  'Abuja (FCT)',
  'Lagos',
  'Taraba (Wukari/Jalingo)',
  'Rivers (Port Harcourt)',
  'Oyo (Ibadan)',
  'Enugu',
  'Kaduna',
  'Kano',
  'Edo (Benin)',
  'Delta',
  'Ogun',
  'Anambra',
  'Imo',
  'Plateau (Jos)',
  'Akwa Ibom',
  'Cross River',
  'Ondo',
  'Osun',
  'Benue',
  'Nasarawa',
  'Kogi',
  'Kwara',
];
