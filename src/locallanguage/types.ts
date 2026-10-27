export type SupportedLanguage = 
  | 'en' 
  | 'ha' 
  | 'yo' 
  | 'ig' 
  | 'pcm' 
  | 'bin' 
  | 'efi' 
  | 'fuv' 
  | 'tiv' 
  | 'knc'
  | 'nup'
  | 'urh'
  | 'igl'
  | 'ijc'
  | 'ebi'
  | 'its'
  | 'bom'
  | 'jbu'
  | 'anw'
  | 'iso'
  | 'yer'
  | 'gbr';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flagEmoji: string;
  region: string;
  speakers: string;
  tier: 'full' | 'standard' | 'phrases';
  capabilities: {
    text: boolean;
    voice: boolean;
    dialogue: boolean;
    proverbs: boolean;
  };
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (Nigerian / Standard)',
    flagEmoji: '🇳🇬',
    region: 'Official / All Nigeria',
    speakers: '120M+',
    tier: 'full',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'yo',
    name: 'Yoruba',
    nativeName: 'Èdè Yorùbá',
    flagEmoji: '🟢',
    region: 'Southwest (Lagos, Oyo, Ogun, Ondo, Osun, Ekiti, Kwara)',
    speakers: '45M+',
    tier: 'full',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Harshen Hausa',
    flagEmoji: '🌾',
    region: 'North (Kano, Kaduna, Sokoto, Katsina, Taraba, etc.)',
    speakers: '55M+',
    tier: 'full',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Asụsụ Igbo',
    flagEmoji: '🦅',
    region: 'Southeast (Anambra, Enugu, Imo, Abia, Ebonyi, Delta)',
    speakers: '35M+',
    tier: 'full',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'pcm',
    name: 'Nigerian Pidgin',
    nativeName: 'Naija Brokin / Pidgin',
    flagEmoji: '✨',
    region: 'Nationwide (Warri, Benin, Port Harcourt, Lagos, Campus)',
    speakers: '80M+',
    tier: 'full',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'jbu',
    name: 'Jukun (Wukari native)',
    nativeName: 'Wapan (Jukun)',
    flagEmoji: '🏛️',
    region: 'Taraba State (Wukari, FUWukari, Donga, Takum)',
    speakers: '1.5M+',
    tier: 'full',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'tiv',
    name: 'Tiv',
    nativeName: 'Zwa Tiv',
    flagEmoji: '🦓',
    region: 'Benue, Taraba, Nasarawa',
    speakers: '4.5M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: true, proverbs: true }
  },
  {
    code: 'fuv',
    name: 'Fulfulde',
    nativeName: 'Fulfulde (Pulaar)',
    flagEmoji: '🐄',
    region: 'Adamawa, Taraba, Bauchi, Gombe',
    speakers: '15M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: false, proverbs: true }
  },
  {
    code: 'bin',
    name: 'Edo (Bini)',
    nativeName: 'Ẹ̀dó',
    flagEmoji: '👑',
    region: 'Edo State, Midwest',
    speakers: '3M+',
    tier: 'standard',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'efi',
    name: 'Efik / Ibibio',
    nativeName: 'Usem Efik',
    flagEmoji: '🌊',
    region: 'Cross River & Akwa Ibom',
    speakers: '6M+',
    tier: 'standard',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'knc',
    name: 'Kanuri',
    nativeName: 'Kànurí',
    flagEmoji: '🌴',
    region: 'Borno, Yobe, Lake Chad basin',
    speakers: '5M+',
    tier: 'standard',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'nup',
    name: 'Nupe',
    nativeName: 'Nupe-Nupe',
    flagEmoji: '🏺',
    region: 'Niger, Kwara, Kogi (Bida, Minna)',
    speakers: '3.5M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: false, proverbs: true }
  },
  {
    code: 'urh',
    name: 'Urhobo',
    nativeName: 'Ẹ̀rọ́ Urhobo',
    flagEmoji: '🛡️',
    region: 'Delta State (Warri, Ughelli, Sapele)',
    speakers: '3M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: false, proverbs: true }
  },
  {
    code: 'igl',
    name: 'Igala',
    nativeName: 'Ichí Igala',
    flagEmoji: '☀️',
    region: 'Kogi, Edo, Anambra (Idah, Ankpa)',
    speakers: '2.5M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: false, proverbs: true }
  },
  {
    code: 'ijc',
    name: 'Ijaw (Izon)',
    nativeName: 'Ịjọ / Izon',
    flagEmoji: '🛶',
    region: 'Bayelsa, Rivers, Delta, Ondo (Niger Delta)',
    speakers: '4M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: false, proverbs: true }
  },
  {
    code: 'ebi',
    name: 'Ebira',
    nativeName: 'Ebira Tao',
    flagEmoji: '⛰️',
    region: 'Kogi State (Okene, Ihima, Adavi)',
    speakers: '2M+',
    tier: 'standard',
    capabilities: { text: true, voice: true, dialogue: false, proverbs: true }
  },
  {
    code: 'its',
    name: 'Itsekiri',
    nativeName: 'Isekiri',
    flagEmoji: '⛵',
    region: 'Delta State (Warri, Ode-Itsekiri)',
    speakers: '1M+',
    tier: 'phrases',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'bom',
    name: 'Berom',
    nativeName: 'Cwey Berom',
    flagEmoji: '🌄',
    region: 'Plateau State (Jos, Barkin Ladi, Riyom)',
    speakers: '1.2M+',
    tier: 'phrases',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'anw',
    name: 'Annang',
    nativeName: 'Usem Annang',
    flagEmoji: '🥥',
    region: 'Akwa Ibom State (Ikot Ekpene, Abak)',
    speakers: '2M+',
    tier: 'phrases',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'iso',
    name: 'Isoko',
    nativeName: 'Isoko',
    flagEmoji: '🌿',
    region: 'Delta State (Oleh, Ozoro)',
    speakers: '1M+',
    tier: 'phrases',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'yer',
    name: 'Tarok',
    nativeName: 'Tarok (Yergam)',
    flagEmoji: '🏹',
    region: 'Plateau State (Langtang, Wase)',
    speakers: '500k+',
    tier: 'phrases',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  },
  {
    code: 'gbr',
    name: 'Gbagyi',
    nativeName: 'Gbagyi / Gwari',
    flagEmoji: '🌾',
    region: 'FCT Abuja, Niger, Kaduna, Nasarawa',
    speakers: '2.5M+',
    tier: 'phrases',
    capabilities: { text: true, voice: false, dialogue: false, proverbs: true }
  }
];

export type DomainTone = 
  | 'general' 
  | 'market' 
  | 'business' 
  | 'customer_care' 
  | 'friendly' 
  | 'respectful';

export interface ToneOption {
  id: DomainTone;
  label: string;
  description: string;
  iconName: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'general', label: 'General / Natural', description: 'Everyday standard communication', iconName: 'MessageSquare' },
  { id: 'market', label: 'Market / Bargaining', description: 'Street bargaining & market hustle tone', iconName: 'ShoppingBag' },
  { id: 'business', label: 'Business Intro', description: 'Professional, courteous partnership tone', iconName: 'Briefcase' },
  { id: 'customer_care', label: 'Customer Service', description: 'Polite, helpful customer communication', iconName: 'Headphones' },
  { id: 'friendly', label: 'Warm & Friendly', description: 'Casual, warm banter among peers', iconName: 'Smile' },
  { id: 'respectful', label: 'Respectful / Elders', description: 'High reverence, cultural honorifics', iconName: 'Award' }
];

export interface TranslationResult {
  id?: string;
  sourceText: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  tone: DomainTone;
  translatedText: string;
  explanation?: string;
  toneNote?: string;
  pronunciation?: string;
  alternatives?: string[];
  uncertainty?: boolean;
  createdAt?: string;
}

export interface SavedTranslationRecord extends TranslationResult {
  id: string;
  uid: string;
  savedAt: string;
}

export interface TranslationFeedback {
  id?: string;
  translationId?: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  rating: number; // 1 to 5
  feedbackText?: string;
  category: 'accuracy' | 'cultural_nuance' | 'grammar' | 'spelling' | 'other';
  userUid?: string;
  userEmail?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  language: SupportedLanguage;
  category: 'greetings' | 'market' | 'transport' | 'numbers' | 'business';
  title: string;
  situation: string;
  level: 'Beginner' | 'Intermediate' | 'Everyday Pro';
  culturalNote: string;
  keyPhrases: {
    indigenous: string;
    phonetic: string;
    english: string;
    context: string;
  }[];
  dialogue?: {
    speaker: string;
    text: string;
    translation: string;
  }[];
  quiz: QuizQuestion[];
}

export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  quizScore: number;
  maxScore: number;
  lastAttemptAt: string;
}

export interface CuratedPhrase {
  id: string;
  language: SupportedLanguage;
  category: 'greetings' | 'bargaining' | 'transport' | 'respect' | 'dining' | 'proverbs' | 'emergencies';
  phrase: string;
  phonetic: string;
  english: string;
  culturalInsight: string;
  audioVoice?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  nativeText: string;
  englishSubtitle: string;
  feedback?: string;
  simplerExplanation?: string;
  timestamp: string;
}

export interface ScenarioMeta {
  id: string;
  title: string;
  location: string;
  defaultLanguage: SupportedLanguage;
  character: string;
  context: string;
  initialGreeting: {
    nativeText: string;
    englishSubtitle: string;
  };
}
