import { Lesson } from '../types';

export const DEFAULT_LESSONS: Lesson[] = [
  // 1. YORUBA - Greetings & Respect
  {
    id: 'yo-greetings-01',
    language: 'yo',
    category: 'greetings',
    title: 'Essential Yoruba Greetings & Reverence',
    situation: 'Meeting neighbors, elders, and colleagues throughout the day',
    level: 'Beginner',
    culturalNote: 'Respect (Ìbọ̀wọ̀) is fundamental in Yoruba culture. When greeting elders, younger males traditionally prostrate (Dọ̀bálẹ̀) and females kneel (Kúnlẹ̀), while adding the respectful honorific "Ẹ" before verbs.',
    keyPhrases: [
      {
        indigenous: 'Ẹ kú àárọ̀ o',
        phonetic: 'Eh koo ah-rah-aw oh',
        english: 'Good morning (Respectful / To elder or multiple people)',
        context: 'Use when greeting parents, superiors, or morning customers'
      },
      {
        indigenous: 'Ẹ kú ìsọ̀wọ́ / Ẹ kú iṣẹ́',
        phonetic: 'Eh koo ee-sho-woh / Eh koo ee-sheh',
        english: 'Well done at work / Greetings for your labor',
        context: 'Said to anyone actively working, trading, or hustling'
      },
      {
        indigenous: 'Báwo ni?',
        phonetic: 'Bah-woh nee',
        english: 'How are things? / How are you doing? (Casual/Peers)',
        context: 'Between peers, friends, classmates'
      },
      {
        indigenous: 'A dúpẹ́ o',
        phonetic: 'Ah doo-kpeh oh',
        english: 'We give thanks / All is well, thank God',
        context: 'Standard positive response to inquiry about well-being'
      }
    ],
    dialogue: [
      { speaker: 'Adeola (Youth)', text: 'Ẹ kú àárọ̀ mà, ẹ pẹ̀lẹ́ o!', translation: 'Good morning ma, greetings to you!' },
      { speaker: 'Iya Morayo (Elder)', text: 'Àárọ̀ dáadaa ọmọ mi. Báwo ni gbogbo nǹkan?', translation: 'Good morning my child. How is everything?' },
      { speaker: 'Adeola', text: 'A dúpẹ́ lọ́wọ́ Ọlọ́run mà.', translation: 'We thank God, ma.' }
    ],
    quiz: [
      {
        id: 'yo-q1',
        question: 'Which prefix transforms a Yoruba greeting into a respectful form for elders?',
        options: ['O (informal)', 'Ẹ (respectful plural)', 'Mo (first person)', 'A (collective)'],
        correctIndex: 1,
        explanation: '"Ẹ" is the honorific pronoun used to show deep deference to elders and groups.'
      },
      {
        id: 'yo-q2',
        question: 'What is the appropriate greeting to say to a market trader or artisan working?',
        options: ['Báwo ni', 'Ẹ kú iṣẹ́', 'Ó dábọ̀', 'Ẹ jọ̀ọ́'],
        correctIndex: 1,
        explanation: '"Ẹ kú iṣẹ́" acknowledges and commends their labor and effort.'
      },
      {
        id: 'yo-q3',
        question: 'What does "A dúpẹ́" mean when someone asks how you are?',
        options: ['I am tired', 'We give thanks (to God)', 'I have no money', 'See you tomorrow'],
        correctIndex: 1,
        explanation: '"A dúpẹ́" means "We give thanks", reflecting gratitude and optimism.'
      }
    ]
  },

  // 2. HAUSA - Greetings & Courtesies
  {
    id: 'ha-greetings-01',
    language: 'ha',
    category: 'greetings',
    title: 'Essential Hausa Greetings & Peaceful Inquiries',
    situation: 'Arriving in Northern Nigeria, meeting shopkeepers, elders, and host families',
    level: 'Beginner',
    culturalNote: 'Hausa greetings are warm, lengthy, and inquire about peace (Lafiya), family, and work before moving to transaction details. Placing your right hand over your chest shows genuine warmth.',
    keyPhrases: [
      {
        indigenous: 'Sannu da safe',
        phonetic: 'Sahn-noo dah sah-feh',
        english: 'Good morning',
        context: 'Greeting anyone before noon'
      },
      {
        indigenous: 'Ina kwana? - Lafiya lau',
        phonetic: 'Ee-nah kwah-nah? - Lah-fee-yah laow',
        english: 'How did you sleep? - Very peacefully / Fine',
        context: 'Standard morning question and answer'
      },
      {
        indigenous: 'Yaya aiki?',
        phonetic: 'Yah-yah eye-kee?',
        english: 'How is work / the hustle?',
        context: 'Very respectful and encouraging greeting to workers'
      },
      {
        indigenous: 'Na gode kwarai',
        phonetic: 'Nah go-deh kwah-rye',
        english: 'Thank you very much',
        context: 'Expressing heartfelt appreciation'
      }
    ],
    dialogue: [
      { speaker: 'Musa', text: 'Salamu alaikum, Ina kwana Malam?', translation: 'Peace be upon you, how did you sleep sir?' },
      { speaker: 'Alhaji Danladi', text: 'Wa alaikumus salam. Lafiya lau, yaya gida?', translation: 'And unto you peace. Very well, how is home/family?' },
      { speaker: 'Musa', text: 'Lafiya kalau, Alhmdulillah!', translation: 'All is peaceful, praise be to God!' }
    ],
    quiz: [
      {
        id: 'ha-q1',
        question: 'What is the standard, positive answer to "Ina kwana?" (How was your night)?',
        options: ['Ba kyau', 'Lafiya lau', 'Ina zuwa', 'Na gode'],
        correctIndex: 1,
        explanation: '"Lafiya lau" translates to "Very peacefully/fine".'
      },
      {
        id: 'ha-q2',
        question: 'How do you say "Thank you very much" in Hausa?',
        options: ['Sannu', 'Barka', 'Na gode kwarai', 'Yauwa'],
        correctIndex: 2,
        explanation: '"Na gode" means thank you; "kwarai" adds "very much".'
      },
      {
        id: 'ha-q3',
        question: 'What does "Yaya aiki?" mean when greeting a craftsman or trader?',
        options: ['Where is the money?', 'How is work?', 'What time is it?', 'Are you sleeping?'],
        correctIndex: 1,
        explanation: '"Yaya aiki?" politely inquires about their work progress.'
      }
    ]
  },

  // 3. IGBO - Market & Trade Bargaining
  {
    id: 'ig-market-01',
    language: 'ig',
    category: 'market',
    title: 'Igbo Market Bargaining & Smart Shopping',
    situation: 'Buying goods at Onitsha, Ariaria Aba, or Alaba market with savvy respect',
    level: 'Everyday Pro',
    culturalNote: 'In Igbo commercial hubs, bargaining is a dialogue of mutual respect. Calling a trader "Nwanna" (My brother) or "Nne" (Mother) builds trust. Never rush to the first price.',
    keyPhrases: [
      {
        indigenous: 'Ego ole ka ọ bụ?',
        phonetic: 'Eh-goh oh-leh kah oh boo?',
        english: 'How much is it?',
        context: 'Asking the price of any item'
      },
      {
        indigenous: 'Ọ dị oke ọnụ, biko belata ya!',
        phonetic: 'Oh dee oh-keh oh-noo, bee-koh beh-lah-tah yah!',
        english: 'It is too expensive, please reduce it!',
        context: 'Standard counter to the first quoted price'
      },
      {
        indigenous: 'Nye m ego ikpeazụ ya',
        phonetic: 'Nyeh m eh-goh eek-peh-ah-zoo yah',
        english: 'Give me the final last price',
        context: 'When you are ready to pull out cash and close the deal'
      },
      {
        indigenous: 'Dalụ rinne, aga m alọghachi',
        phonetic: 'Dah-loo reen-neh, ah-gah m ah-loh-ghah-chee',
        english: 'Thank you very much, I will return to patronize you again',
        context: 'Polite closing statement cementing buyer-seller relationship'
      }
    ],
    dialogue: [
      { speaker: 'Emeka (Buyer)', text: 'Nwanne m, ego ole ka akpụkpọ ụkwụ a bụ?', translation: 'My brother, how much are these shoes?' },
      { speaker: 'Chidi (Trader)', text: 'Nna a, ọ bụ puku iri abụọ (₦20,000) naanị.', translation: 'My friend, it is twenty thousand (₦20,000) only.' },
      { speaker: 'Emeka', text: 'Mba nwanne, ọ dị oke ọnụ. Welite ₦12,000 m kwụọ gị ugbu a!', translation: 'No brother, it is too high. Take ₦12,000 and I pay you right now!' }
    ],
    quiz: [
      {
        id: 'ig-q1',
        question: 'What is the correct Igbo phrase for "How much is it?"',
        options: ['Kedu aha gi?', 'Ego ole ka ọ bụ?', 'I na-eje ebee?', 'Biko nyem nri'],
        correctIndex: 1,
        explanation: '"Ego ole" means "how much money", "ka ọ bụ" means "is it".'
      },
      {
        id: 'ig-q2',
        question: 'When a trader asks for too much, what phrase asks them to reduce the price?',
        options: ['Ọ dị oke ọnụ, belata ya', 'Ngwa ngwa', 'Akwụkwọ m', 'Ka chi foo'],
        correctIndex: 0,
        explanation: '"Ọ dị oke ọnụ" means "it is too expensive", "belata ya" means "reduce it".'
      },
      {
        id: 'ig-q3',
        question: 'What does "Nwanne m" signify in a friendly business greeting?',
        options: ['Enemy', 'My sibling / My brother / sister', 'Boss only', 'Customer care'],
        correctIndex: 1,
        explanation: '"Nwanne m" literally means "my mother\'s child / my brother", fostering immediate warmth.'
      }
    ]
  },

  // 4. NIGERIAN PIDGIN - Street Navigation & Transit
  {
    id: 'pcm-transport-01',
    language: 'pcm',
    category: 'transport',
    title: 'Pidgin Transit, Bus Stop & Keke Navigation',
    situation: 'Commuting in Lagos Danfo, Abuja Keke NAPEP, Port Harcourt taxi, or campus shuttles',
    level: 'Beginner',
    culturalNote: 'Nigerian Pidgin is the ultimate lingua franca of transit. Being crisp, confident, and having your change ready ("Hold your change o!") prevents disputes with conductors.',
    keyPhrases: [
      {
        indigenous: 'Owa o! Conductor, drop dey here!',
        phonetic: 'Oh-wah oh! Con-doc-tor, drop dey here!',
        english: 'I want to drop! Conductor, stop at this junction!',
        context: 'Shouting your drop before the driver passes your destination'
      },
      {
        indigenous: 'How much be the T-fare go Ikeja?',
        phonetic: 'How much bee di T-fare go Ee-keh-jah?',
        english: 'How much is the transportation fare to Ikeja?',
        context: 'Asking fare before entering bus or keke'
      },
      {
        indigenous: 'Driver, abeg wetin dey happen for front? Traffic hold?',
        phonetic: 'Dry-vah, ah-beg weh-teen dey hah-peen for front?',
        english: 'Driver, please what is causing the bottleneck ahead? Is there a traffic jam?',
        context: 'Checking commuter route conditions'
      },
      {
        indigenous: 'I hold exact change, no worry',
        phonetic: 'Eye hold eg-zact chenj, no woh-ree',
        english: 'I have the exact money, no need for change hassles',
        context: 'Brings immense relief to any Nigerian bus conductor'
      }
    ],
    dialogue: [
      { speaker: 'Passenger', text: 'Conductor, CMS enter? How much be the last?', translation: 'Conductor, are you going to CMS? What is the final fare?' },
      { speaker: 'Conductor', text: 'Five hundred naira straight! Enter with your exact change!', translation: '₦500 straight! Enter with exact change!' },
      { speaker: 'Passenger', text: 'Enter am! Drop dey under bridge o!', translation: 'Entering! Drop is under the bridge!' }
    ],
    quiz: [
      {
        id: 'pcm-q1',
        question: 'What do Nigerian commuters yell out when their bus stop has arrived?',
        options: ['Stop the vehicle please', 'Owa o! / Drop dey here!', 'Driver stop right now', 'Halt passenger'],
        correctIndex: 1,
        explanation: '"Owa o!" or "Drop dey!" is the unmistakable Nigerian transit call to alight.'
      },
      {
        id: 'pcm-q2',
        question: 'What does "T-fare" stand for in Nigerian everyday conversation?',
        options: ['Train fare only', 'Transport fare', 'Ticket fare', 'Tea fare'],
        correctIndex: 1,
        explanation: '"T-fare" is universally understood as Transport Fare.'
      },
      {
        id: 'pcm-q3',
        question: 'Why do bus conductors repeatedly shout "Hold your change"?',
        options: ['They do not have loose cash to give balance', 'They want extra tips', 'They are angry', 'They are closing for the day'],
        correctIndex: 0,
        explanation: 'Nigerian conductors often lack smaller currency denominations for change.'
      }
    ]
  },

  // 5. YORUBA - Business Etiquette & Negotiations
  {
    id: 'yo-business-01',
    language: 'yo',
    category: 'business',
    title: 'Yoruba Business Etiquette & Trust Building',
    situation: 'Meeting enterprise partners, signing MoUs, and establishing long-term commercial ties in Lagos or Ibadan',
    level: 'Everyday Pro',
    culturalNote: 'In Yoruba commercial circles, building genuine relationship ("Àjọṣepọ̀") precedes transaction. Asking about family and showing patience builds deep loyalty.',
    keyPhrases: [
      {
        indigenous: 'Inú mi dùn láti bá yín pàdé lónìí',
        phonetic: 'Ee-noo mee doon lah-tee bah yeen pah-deh loh-nee',
        english: 'I am genuinely delighted to meet with you today',
        context: 'Executive or partnership greeting opening'
      },
      {
        indigenous: 'A fẹ́ kí ajọṣepọ̀ yìí mú èso rere wá',
        phonetic: 'Ah feh kee ah-joh-sheh-poh yee moo eh-soh reh-reh wah',
        english: 'We desire that this collaboration yields bountiful, good fruits',
        context: 'Stating high mutual aspirations for business deals'
      },
      {
        indigenous: 'Ẹ ṣeun púpọ̀ fún àkókò yín',
        phonetic: 'Eh sheh-oon poo-poh foon ah-koh-koh yeen',
        english: 'Thank you very much for your precious time',
        context: 'Closing a client or investor meeting respectfully'
      }
    ],
    quiz: [
      {
        id: 'yo-biz-q1',
        question: 'What does "Ajọṣepọ̀" signify in business communication?',
        options: ['Conflict', 'Partnership & Mutual Collaboration', 'Quick money', 'Debt collection'],
        correctIndex: 1,
        explanation: '"Ajọṣepọ̀" means partnership, working harmoniously together for shared gain.'
      },
      {
        id: 'yo-biz-q2',
        question: 'How do you politely thank an executive or client for their time in Yoruba?',
        options: ['Ó dábọ̀', 'Ẹ ṣeun púpọ̀ fún àkókò yín', 'Ẹ fún mi lówó', 'Báwo ni'],
        correctIndex: 1,
        explanation: '"Ẹ ṣeun púpọ̀ fún àkókò yín" expresses deep gratitude for their invested time.'
      }
    ]
  },

  // 6. HAUSA - Numbers, Currency & Daily Accounting
  {
    id: 'ha-numbers-01',
    language: 'ha',
    category: 'numbers',
    title: 'Hausa Numbers, Counting & Trading Calculations',
    situation: 'Counting commodities, bags of grains, or cash in northern agricultural markets',
    level: 'Intermediate',
    culturalNote: 'Grain merchants and livestock traders in Dawanau (Kano) use rapid traditional counting. Knowing numbers from 1 to 100 builds instant credibility.',
    keyPhrases: [
      {
        indigenous: 'Daya, Biyu, Uku, Hudu, Biyar',
        phonetic: 'Dah-yah, Bee-yoo, Oo-koo, Hoo-doo, Bee-yar',
        english: '1, 2, 3, 4, 5',
        context: 'Fundamental counting'
      },
      {
        indigenous: 'Goma, Ashirin, Talatin, Hamsin',
        phonetic: 'Goh-mah, Ah-shee-reen, Tah-lah-teen, Hahm-seen',
        english: '10, 20, 30, 50',
        context: 'Decades counting for pricing'
      },
      {
        indigenous: 'Dari daya (100) / Dubu daya (1,000)',
        phonetic: 'Dah-ree dah-yah / Doo-boo dah-yah',
        english: 'One hundred (100) / One thousand (1,000)',
        context: 'Common currency denominations in Naira'
      }
    ],
    quiz: [
      {
        id: 'ha-num-q1',
        question: 'How do you say "Ten" in Hausa?',
        options: ['Daya', 'Biyar', 'Goma', 'Dari'],
        correctIndex: 2,
        explanation: '"Goma" is 10 in Hausa.'
      },
      {
        id: 'ha-num-q2',
        question: 'What is "One Thousand" in Hausa trade transactions?',
        options: ['Ashirin', 'Dubu daya', 'Dari biyu', 'Kobo daya'],
        correctIndex: 1,
        explanation: '"Dubu daya" means one thousand (₦1,000).'
      }
    ]
  }
];
