import { CuratedPhrase } from '../types';

export const CURATED_PHRASES: CuratedPhrase[] = [
  // YORUBA
  {
    id: 'yp-1',
    language: 'yo',
    category: 'greetings',
    phrase: 'Ẹ kú àárọ̀ o, ṣé àlàáfíà ni?',
    phonetic: 'Eh koo ah-rah-aw oh, sheh ah-lah-fee-ah nee?',
    english: 'Good morning, hope you are in peaceful good health?',
    culturalInsight: 'Adds "àlàáfíà" (wholeness/peace) to show that you genuinely care about the person\'s total health.'
  },
  {
    id: 'yp-2',
    language: 'yo',
    category: 'bargaining',
    phrase: 'Ẹ dín owó yìí kù fún mi, mo fẹ́ ra púpọ̀!',
    phonetic: 'Eh deen oh-woh yee koo foon mee, moh feh rah poo-poh!',
    english: 'Please discount this price for me, I want to purchase in large quantity!',
    culturalInsight: 'Traders love wholesale buyers; stating intent to buy more unlocks the best bulk rates.'
  },
  {
    id: 'yp-3',
    language: 'yo',
    category: 'proverbs',
    phrase: 'Ilé la ti ń kọ́ ẹ̀ṣọ́ ròde.',
    phonetic: 'Ee-leh lah tee n koh eh-shaw roh-deh.',
    english: 'Good character and manners are taught and cultivated at home before going outside.',
    culturalInsight: 'Reflects the ancient concept of "Ọmọlúwàbí" — an individual of impeccable moral pedigree.'
  },
  {
    id: 'yp-4',
    language: 'yo',
    category: 'dining',
    phrase: 'Ẹ jẹ́ ká jẹun o!',
    phonetic: 'Eh jeh kah jeh-oon oh!',
    english: 'Come and join me to eat! (Generous food invitation)',
    culturalInsight: 'It is traditional hospitality in Yorubaland to invite anyone present when food is served.'
  },
  {
    id: 'yp-5',
    language: 'yo',
    category: 'emergencies',
    phrase: 'Ẹ gbà mí o! Ẹ jọ̀ọ́, ẹ ran mí lọ́wọ́!',
    phonetic: 'Eh gbah mee oh! Eh joh-aw, eh rahn mee loh-woh!',
    english: 'Help me! Please, lend me your urgent assistance!',
    culturalInsight: 'Emergency call for community intervention or medical/rescue aid.'
  },

  // HAUSA
  {
    id: 'hp-1',
    language: 'ha',
    category: 'greetings',
    phrase: 'Barka da yamma, yaya iyalai?',
    phonetic: 'Bar-kah dah yahm-mah, yah-yah ee-yah-lye?',
    english: 'Good evening, how is the family?',
    culturalInsight: 'Inquiring about family ("Iyalai") shows deep personal respect and high etiquette.'
  },
  {
    id: 'hp-2',
    language: 'ha',
    category: 'bargaining',
    phrase: 'Alhaji, a rage kudi mana, zan sayi da yawa!',
    phonetic: 'Ahl-hah-jee, ah rah-geh koo-dee mah-nah, zahn sah-yee dah yah-wah!',
    english: 'Sir, please reduce the price for me, I will buy plenty!',
    culturalInsight: 'Using "Alhaji" or "Malam" pays respect to the merchant before negotiating.'
  },
  {
    id: 'hp-3',
    language: 'ha',
    category: 'proverbs',
    phrase: 'Komi ya yi nisa, zai dawo.',
    phonetic: 'Koh-mee yah yee nee-sah, zye dah-woh.',
    english: 'No matter how far a journey goes, it will eventually return / Truth always prevails.',
    culturalInsight: 'Classic Hausa proverb teaching patience, moral steadfastness, and certainty.'
  },
  {
    id: 'hp-4',
    language: 'ha',
    category: 'dining',
    phrase: 'Abinci ya yi dadi sosai, na gode!',
    phonetic: 'Ah-been-chee yah yee dah-dee soh-sye, nah go-deh!',
    english: 'The food is exceptionally delicious, thank you!',
    culturalInsight: 'Praising the cook\'s seasoning ("Dadi") brings immense joy to any host.'
  },
  {
    id: 'hp-5',
    language: 'ha',
    category: 'emergencies',
    phrase: 'Don Allah ku taimake ni! Ina bukatar likita!',
    phonetic: 'Don Ahl-lah koo tye-mah-keh nee! Ee-nah boo-kah-tar lee-kee-tah!',
    english: 'For God\'s sake please help me! I need a doctor/medical help immediately!',
    culturalInsight: '"Don Allah" invokes sacred moral duty among bystanders to rush to help.'
  },

  // IGBO
  {
    id: 'ip-1',
    language: 'ig',
    category: 'greetings',
    phrase: 'Ụtụtụ ọma, kedu ka ị mere taa?',
    phonetic: 'Oo-too-too oh-mah, keh-doo kah ee meh-reh tah-ah?',
    english: 'Good morning, how are you doing today?',
    culturalInsight: 'Central Igbo standard greeting appropriate across all Eastern states.'
  },
  {
    id: 'ip-2',
    language: 'ig',
    category: 'bargaining',
    phrase: 'Biko nyem ọnụ ahịa ikpeazụ, ka m gụọ ego ugbu a!',
    phonetic: 'Bee-koh nyehm oh-noo ah-hee-ah eek-peh-ah-zoo, kah m goo-oh eh-goh oog-boo ah!',
    english: 'Please give me the final discounted price, so I can count out the money right now!',
    culturalInsight: 'Shows you are serious with cash in hand, cutting out unnecessary price back-and-forth.'
  },
  {
    id: 'ip-3',
    language: 'ig',
    category: 'proverbs',
    phrase: 'Onye nwere mmadụ ka onye nwere ego.',
    phonetic: 'Oh-nyeh nweh-reh mmah-doo kah oh-nyeh nweh-reh eh-goh.',
    english: 'He who has good people and strong relationships is wealthier than he who merely has cash.',
    culturalInsight: 'Emphasizes that human solidarity and family support outlast material possessions.'
  },
  {
    id: 'ip-4',
    language: 'ig',
    category: 'respect',
    phrase: 'Daalụ nne m / Daalụ nna m, Chineke gọzie gị!',
    phonetic: 'Dah-loo n-neh m / Dah-loo n-nah m, Chee-neh-keh goh-zee-eh gee!',
    english: 'Thank you my mother / father, may God bless you abundantly!',
    culturalInsight: 'Conferring parental honorifics upon elders evokes sincere prayers and goodwill.'
  },

  // NIGERIAN PIDGIN
  {
    id: 'pp-1',
    language: 'pcm',
    category: 'greetings',
    phrase: 'How far my person! Wetin dey shele?',
    phonetic: 'How far my per-son! Weh-teen dey sheh-leh?',
    english: 'Hello my friend! What is happening / What is the latest update?',
    culturalInsight: 'The quintessential Nigerian warm informal greeting from street to boardroom.'
  },
  {
    id: 'pp-2',
    language: 'pcm',
    category: 'bargaining',
    phrase: 'Bros, commot something for this price na, I be your regular customer!',
    phonetic: 'Brohs, com-mot some-tin for dis price nah, eye bee yor reg-yoo-lar cus-toh-ma!',
    english: 'Brother, please knock something off this price, I am your loyal customer!',
    culturalInsight: 'Claiming "regular customer" status creates instant camaraderie with traders.'
  },
  {
    id: 'pp-3',
    language: 'pcm',
    category: 'proverbs',
    phrase: 'No condition is permanent; water wey person go drink no dey pass am.',
    phonetic: 'No con-dee-shon is per-mah-nent; wah-tah wey per-son go drink no dey pass ahm.',
    english: 'Difficult circumstances will change; what is divinely meant for you will never miss you.',
    culturalInsight: 'Expresses resilient optimism in the face of economic or everyday hurdles.'
  },
  {
    id: 'pp-4',
    language: 'pcm',
    category: 'transport',
    phrase: 'Oga driver, slow down small abeg, no be race we come!',
    phonetic: 'Oh-gah dry-vah, slow down smawl ah-beg, no bee race wee com!',
    english: 'Please driver, gently slow down, we are commuters not Formula 1 racers!',
    culturalInsight: 'Polite humorous banter to urge cautious driving without provoking an argument.'
  },

  // EDO / BINI
  {
    id: 'ep-1',
    language: 'bin',
    category: 'greetings',
    phrase: 'Kóyo o! Òb’ówa!',
    phonetic: 'Koh-yoh oh! Oh-boh-wah!',
    english: 'Hello / Greetings! Welcome home!',
    culturalInsight: '"Kóyo" is the universal Benin greeting of affection and welcome.'
  },
  {
    id: 'ep-2',
    language: 'bin',
    category: 'respect',
    phrase: 'Òb’ókhiàn, Ọba gha tọ́ kkpẹ́!',
    phonetic: 'Oh-boh-khee-ahn, Oh-bah ghah toh kpeh!',
    english: 'Welcome! Long live the King (Great reverence)!',
    culturalInsight: 'Royal salute recognizing the ancient Benin Monarchy and cultural heritage.'
  },

  // EFIK / IBIBIO
  {
    id: 'ef-1',
    language: 'efi',
    category: 'greetings',
    phrase: 'Emesiere o! Idem mfo?',
    phonetic: 'Eh-meh-see-eh-reh oh! Ee-dem m-foh?',
    english: 'Good morning! How is your health and body?',
    culturalInsight: '"Emesiere" brings peace and dawn blessing across Calabar and Uyo.'
  },
  {
    id: 'ef-2',
    language: 'efi',
    category: 'dining',
    phrase: 'Udia emi enem eti-eti, Sosongo!',
    phonetic: 'Oo-dee-ah eh-mee eh-nem eh-tee eh-tee, Soh-song-goh!',
    english: 'This meal (Edikang Ikong / Afang) is immensely delicious, thank you!',
    culturalInsight: 'Efik culinary excellence is celebrated with rich gratitude.'
  },

  // FULFULDE
  {
    id: 'fp-1',
    language: 'fuv',
    category: 'greetings',
    phrase: 'Jam waali? Jam tan, Usoko!',
    phonetic: 'Jahm wah-lee? Jahm tahn, Oo-soh-koh!',
    english: 'Did you spend the night in peace? Only peace, thank you!',
    culturalInsight: '"Jam" means peace and wellness, the core virtue in Fulani social interactions.'
  },

  // TIV
  {
    id: 'tp-1',
    language: 'tiv',
    category: 'greetings',
    phrase: 'Msugh u sha iyange i nyian! U ngu nena?',
    phonetic: 'M-soogh oo shah ee-yahn-geh ee nyee-ahn! Oo ngoo neh-nah?',
    english: 'Greetings on this wonderful day! How are you doing?',
    culturalInsight: 'Tiv greeting full of warmth spoken across the food basket of Benue and Taraba.'
  }
];
