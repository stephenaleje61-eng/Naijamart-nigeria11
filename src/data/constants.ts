export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  isOkada?: boolean;
  isRider?: boolean;
  popularSearch: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'okada-riders', name: 'Okada Riders Wukari 🏍️', iconName: 'Users', isRider: true, popularSearch: 'Wukari Junction' },
  { id: 'okada', name: 'Okada Market 🏍️', iconName: 'Bike', isOkada: true, popularSearch: 'Bajaj Boxer' },
  { id: 'phones', name: 'Phones & Tablets', iconName: 'Smartphone', popularSearch: 'iPhone' },
  { id: 'electronics', name: 'Electronics', iconName: 'Laptop', popularSearch: 'Smart TV' },
  { id: 'fashion', name: 'Fashion & Clothes', iconName: 'Shirt', popularSearch: 'Sneakers' },
  { id: 'vehicles', name: 'Cars & Vehicles', iconName: 'Car', popularSearch: 'Toyota' },
  { id: 'home', name: 'Home & Living', iconName: 'Home', popularSearch: 'Generator' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', popularSearch: 'Skincare' },
  { id: 'jobs', name: 'Jobs & Services', iconName: 'Briefcase', popularSearch: 'Driver' },
];

export const WUKARI_AREAS = [
  'Wukari Junction',
  'Kwararafa University / Junction',
  'Hospital Road',
  'New Market',
  'Old Market',
  'Yam Market',
  'Federal University Wukari (FUW)',
  'Mission Ward',
  'Police Station Junction',
  'Ibi Road Junction',
  'Takum Road Junction',
  'General Hospital Area',
  'Township / Central Wukari'
];

export const OKADA_MODELS = [
  'Bajaj Boxer 100',
  'Bajaj Boxer 150 (X150)',
  'TVS HLX 125 / 150',
  'TVS Neo / Apache',
  'TVS King Tricycle (Keke)',
  'Honda Ace 110',
  'Honda CG 125',
  'Haujue Lucky 110 / 125',
  'Daylong DL110 / DL125',
  'Qlink Champion / Tour',
  'Jincheng JC110',
  'Suzuki AX100',
  'Kasea / Sonlink / Other'
];

export const NIGERIAN_LOCATIONS = [
  'Wukari, Taraba State', // Default
  'Jalingo, Taraba State',
  'Takum, Taraba State',
  'Ibi, Taraba State',
  'Bali, Taraba State',
  'Ikeja, Lagos State',
  'Lekki / Ajah, Lagos State',
  'Alaba / Ojo, Lagos State',
  'Yaba / Surulere, Lagos State',
  'Abuja (FCT)',
  'Port Harcourt, Rivers State',
  'Kano, Kano State',
  'Ibadan, Oyo State',
  'Enugu, Enugu State',
  'Benin City, Edo State',
  'Kaduna, Kaduna State',
  'Jos, Plateau State',
  'Makurdi, Benue State',
  'All Nigeria (Nationwide)'
];

export const CAMPUSES = [
  'Federal University Wukari (FU Wukari)',
  'Kwararafa University Wukari',
  'Taraba State University (TSU Jalingo)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Ahmadu Bello University (ABU Zaria)',
  'University of Nigeria Nsukka (UNN)',
  'Obafemi Awolowo University (OAU Ife)',
  'University of Benin (UNIBEN)',
  'Federal University of Technology Owerri (FUTO)',
  'University of Ilorin (UNILORIN)',
  'Federal University of Technology Akure (FUTA)',
  'University of Port Harcourt (UNIPORT)',
  'University of Maiduguri (UNIMAID)',
  'Bayero University Kano (BUK)',
  'Other Nigerian Campus'
];

export const WANTED_CATEGORIES = [
  'Phones & Gadgets',
  'Hostel Appliances & Furniture',
  'Textbooks & Academics',
  'Laptops & Computers',
  'Fashion, Wears & Shoes',
  'Food, Provisions & Gas',
  'Roommate & Accommodation',
  'Services & Student Gigs'
];

export const CAMPUS_LOCATIONS_WUKARI = [
  'FUW School Gate',
  'FUW Male Hostel Block A/B/C',
  'FUW Female Hostel',
  'FUW New Site Campus',
  'FUW Library / Lecture Theatre',
  'Kwararafa Univ Campus Gate',
  'Hospital Road Off-Campus',
  'Wukari Junction Area',
  'New Market Area',
  'Yam Market Road'
];

export const INITIAL_WANTED_REQUESTS = [];

export const SQUATTER_LOCATIONS = [
  'Hostel A',
  'Hostel B',
  'New Site',
  'Wukari Town'
];

export const INITIAL_SQUATTER_ITEMS = [
  {
    id: 'sq_fuw_001',
    type: 'have_space' as const,
    location: 'Hostel A',
    price: 45000,
    gender: 'male' as const,
    people_in_room: '2 people in room',
    whatsapp: '08134567890',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Clean bedspace available in FUW Male Hostel A, Block 2. Water running regularly, quiet room for serious study. Wardrobe and reading desk ready.',
    is_verified: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sq_fuw_002',
    type: 'have_space' as const,
    location: 'Hostel B',
    price: 50000,
    gender: 'female' as const,
    people_in_room: '2 people in room',
    whatsapp: '08023456781',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Bedspace available in FUW Female Hostel B. Very tidy room, friendly roommates, tiled floor with full security and constant power supply.',
    is_verified: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sq_fuw_003',
    type: 'need_space' as const,
    location: 'New Site',
    price: 40000,
    gender: 'male' as const,
    people_in_room: '1 or 2',
    whatsapp: '09012345672',
    images: [],
    description: '300L Science student urgently looking for a bedspace around FUW New Site. Ready to pay immediately. Non-smoker and quiet.',
    is_verified: true,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sq_fuw_004',
    type: 'have_space' as const,
    location: 'Wukari Town',
    price: 65000,
    gender: 'any' as const,
    people_in_room: 'Self-contain sharing',
    whatsapp: '07034567893',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Spacious self-contain off-campus along Hospital Road Wukari Town. Fenced with gate, running borehole water, generator connection. Looking for roommate to split.',
    is_verified: true,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  }
];
