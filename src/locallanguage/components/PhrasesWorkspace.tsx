import React, { useState } from 'react';
import { CURATED_PHRASES } from '../data/curatedPhrases';
import { SupportedLanguage, SUPPORTED_LANGUAGES, CuratedPhrase } from '../types';
import { LocalSpeechService } from '../services/speechService';
import { 
  BookMarked, 
  Search, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  Filter, 
  Compass, 
  HeartHandshake 
} from 'lucide-react';

export const PhrasesWorkspace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'greetings', label: 'Greetings' },
    { id: 'bargaining', label: 'Market & Bargaining' },
    { id: 'respect', label: 'Respect & Elders' },
    { id: 'proverbs', label: 'Proverbs & Wisdom' },
    { id: 'dining', label: 'Food & Hospitality' },
    { id: 'transport', label: 'Transit & Directions' },
    { id: 'emergencies', label: 'Urgent & Emergency' }
  ];

  const filteredPhrases = CURATED_PHRASES.filter((p) => {
    const matchesLang = selectedLanguage === 'all' || p.language === selectedLanguage;
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.phrase.toLowerCase().includes(query) ||
      p.english.toLowerCase().includes(query) ||
      p.phonetic.toLowerCase().includes(query) ||
      p.culturalInsight.toLowerCase().includes(query);

    return matchesLang && matchesCat && matchesSearch;
  });

  const handleSpeak = async (text: string, lang: SupportedLanguage) => {
    if (isPlayingAudio === text) {
      LocalSpeechService.stopSpeaking();
      setIsPlayingAudio(null);
      return;
    }
    setIsPlayingAudio(text);
    try {
      await LocalSpeechService.speak(text, lang, 0.9);
    } finally {
      setIsPlayingAudio(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLanguageLabel = (code: SupportedLanguage) => {
    const l = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return l ? `${l.flagEmoji} ${l.name}` : code;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#087443] text-xs font-bold mb-1">
            <BookMarked className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Curated Indigenous Phrasebook</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            Authentic Nigerian Phrases & Cultural Wisdom
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Browse timeless proverbs, polite greetings, everyday marketplace slang, and respect etiquette.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrase, meaning, English..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#087443] focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Bars */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
        {/* Languages selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Tongue:</span>
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedLanguage === 'all'
                ? 'bg-[#087443] text-white shadow-2xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All Tongues ({CURATED_PHRASES.length})
          </button>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedLanguage === lang.code
                  ? 'bg-[#087443] text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {lang.flagEmoji} {lang.name}
            </button>
          ))}
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-2.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Context:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-100 text-[#087443]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phrases Grid */}
      {filteredPhrases.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-200/80 space-y-2">
          <BookMarked className="w-10 h-10 text-gray-300 mx-auto stroke-1" />
          <h4 className="font-bold text-gray-800 text-sm">No matching phrases found</h4>
          <p className="text-xs text-gray-400">
            Try adjusting your search terms or clearing language and category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhrases.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-[#087443] bg-emerald-50 px-2 py-0.5 rounded-md">
                    {getLanguageLabel(item.language)}
                  </span>
                  <span className="font-bold text-gray-400 capitalize">{item.category}</span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                  {item.phrase}
                </h3>

                <p className="text-xs text-emerald-800 font-semibold italic">
                  🗣️ {item.phonetic}
                </p>

                <p className="text-xs font-bold text-gray-700">
                  {item.english}
                </p>

                {item.culturalInsight && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-950">
                    <span className="font-bold text-amber-900">Nuance: </span>
                    {item.culturalInsight}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleSpeak(item.phrase, item.language)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-[#087443] text-xs font-bold flex items-center gap-1.5 border border-gray-200 transition-colors cursor-pointer"
                >
                  {isPlayingAudio === item.phrase ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Pronounce</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(item.id, item.phrase)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 border border-gray-200 transition-colors cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
