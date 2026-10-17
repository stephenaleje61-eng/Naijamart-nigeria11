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

export const INITIAL_WANTED_REQUESTS = [
  {
    id: 'seed-w-1',
    buyerName: 'Ibrahim Danladi',
    school: 'Federal University Wukari (FU Wukari)',
    location: 'FUW School Gate',
    itemWanted: 'iPhone X or XR under 120k',
    budget: 120000,
    budgetType: 'up_to' as const,
    urgency: 'Urgent' as const,
    category: 'Phones & Gadgets',
    description: 'Looking for clean UK used, 64GB or 128GB with Face ID working. Battery health 80%+. Cash ready, will test at School Gate.',
    phoneNumber: '08034567891',
    whatsappNumber: '08034567891',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35m ago
  },
  {
    id: 'seed-w-2',
    buyerName: 'Chiamaka Okonkwo',
    school: 'Federal University Wukari (FU Wukari)',
    location: 'FUW Female Hostel',
    itemWanted: 'Mini Tabletop Fridge / Refrigerator',
    budget: 65000,
    budgetType: 'negotiable' as const,
    urgency: 'This Week' as const,
    category: 'Hostel Appliances & Furniture',
    description: 'Need a small working fridge for hostel room to keep water and cooked soup chilled. Any brand (Haier Thermocool, Hisense, or Nexus).',
    phoneNumber: '08123456782',
    whatsappNumber: '08123456782',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
  },
  {
    id: 'seed-w-3',
    buyerName: 'Bala Mohammed',
    school: 'Federal University Wukari (FU Wukari)',
    location: 'FUW Male Hostel Block B',
    itemWanted: 'Single 4.5x6 Mouka Foam / Student Mattress',
    budget: 35000,
    budgetType: 'fixed' as const,
    urgency: 'Urgent' as const,
    category: 'Hostel Appliances & Furniture',
    description: 'Need a clean 4.5x6 or 3x6 student foam mattress. No sagged or torn mattress please. I can arrange an Okada to pick up immediately.',
    phoneNumber: '07031234567',
    whatsappNumber: '07031234567',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
  },
  {
    id: 'seed-w-4',
    buyerName: 'Blessing Jerry',
    school: 'Kwararafa University Wukari',
    location: 'Kwararafa Univ Campus Gate',
    itemWanted: 'Rechargeable Standing Fan (Lontor / QASA)',
    budget: 25000,
    budgetType: 'up_to' as const,
    urgency: 'Urgent' as const,
    category: 'Hostel Appliances & Furniture',
    description: 'Looking for a durable rechargeable fan with solar charging or good battery backup. Must hold charge for at least 4 hours.',
    phoneNumber: '08055678901',
    whatsappNumber: '08055678901',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
  },
  {
    id: 'seed-w-5',
    buyerName: 'Emmanuel Audu',
    school: 'Federal University Wukari (FU Wukari)',
    location: 'FUW New Site Campus',
    itemWanted: 'MTH 101, CHM 101 & PHY 101 Textbooks & Past Qs',
    budget: 15000,
    budgetType: 'fixed' as const,
    urgency: 'This Week' as const,
    category: 'Textbooks & Academics',
    description: '100L science student looking for clean past questions with solutions and course textbooks. Ready to meet at FUW Library.',
    phoneNumber: '09087654321',
    whatsappNumber: '09087654321',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14h ago
  },
  {
    id: 'seed-w-6',
    buyerName: 'Kelechi Eze',
    school: 'University of Lagos (UNILAG)',
    location: 'New Hall / Jaja Hall',
    itemWanted: '6kg Gas Cylinder with Burner Head',
    budget: 22000,
    budgetType: 'up_to' as const,
    urgency: 'This Week' as const,
    category: 'Food, Provisions & Gas',
    description: 'Standard 6kg camping cylinder with burner collar and lighter. No leaks, strictly safe cylinder.',
    phoneNumber: '08169876543',
    whatsappNumber: '08169876543',
    status: 'approved' as const,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20h ago
  }
];
