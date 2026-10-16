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
