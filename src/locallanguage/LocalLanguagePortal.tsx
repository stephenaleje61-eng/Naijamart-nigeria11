import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './types';
import { TranslationWorkspace } from './components/TranslationWorkspace';
import { VoiceWorkspace } from './components/VoiceWorkspace';
import { LearnWorkspace } from './components/LearnWorkspace';
import { ConversationWorkspace } from './components/ConversationWorkspace';
import { PhrasesWorkspace } from './components/PhrasesWorkspace';
import { 
  Globe, 
  Languages, 
  Mic, 
  BookOpen, 
  MessageSquare, 
  BookMarked, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Award,
  ChevronRight,
  TrendingUp,
  Volume2
} from 'lucide-react';

export type LocalLanguageSubRoute = 
  | 'overview' 
  | 'translate' 
  | 'voice' 
  | 'learn' 
  | 'conversation' 
  | 'phrases';

interface Props {
  initialSubRoute?: LocalLanguageSubRoute;
  onBackToPortal?: () => void;
}

export const LocalLanguagePortal: React.FC<Props> = ({ 
  initialSubRoute = 'overview',
  onBackToPortal 
}) => {
  const [subRoute, setSubRoute] = useState<LocalLanguageSubRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/translate')) return 'translate';
      if (path.includes('/voice')) return 'voice';
      if (path.includes('/learn')) return 'learn';
      if (path.includes('/conversation')) return 'conversation';
      if (path.includes('/phrases')) return 'phrases';
    }
    return initialSubRoute;
  });

  // Keep browser URL cleanly in sync with subRoute without forcing hard reloads
  const navigateSubRoute = (route: LocalLanguageSubRoute) => {
    setSubRoute(route);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const urlPath = route === 'overview' ? '/local-language' : `/local-language/${route}`;
      window.history.pushState({}, '', urlPath);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'voice', label: 'Voice AI', icon: Mic },
    { id: 'learn', label: 'Learn & Quiz', icon: BookOpen },
    { id: 'conversation', label: 'Dialogue Practice', icon: MessageSquare },
    { id: 'phrases', label: 'Phrases & Proverbs', icon: BookMarked }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#17231F] font-sans antialiased pb-20 selection:bg-[#16A34A] selection:text-white">
      {/* Sub-Header Navigation for LocalLanguage AI */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title="Back to NaijaHub Africa"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div 
              onClick={() => navigateSubRoute('overview')} 
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#087443] text-white flex items-center justify-center font-black text-lg shadow-xs">
                🌍
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-[#17231F] flex items-center gap-1">
                  LocalLanguage <span className="text-[#16A34A]">AI</span>
                </span>
                <p className="text-[10px] text-gray-500 font-semibold truncate hidden sm:block">
                  Break Language Barriers with AI • Nigerian & African Tongues
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = subRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateSubRoute(item.id as LocalLanguageSubRoute)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#087443] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E8B44F]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateSubRoute('translate')}
              className="px-3.5 py-1.5 rounded-xl bg-[#087443] hover:bg-[#16A34A] text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#E8B44F]" />
              <span className="hidden sm:inline">Translate Now</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Nav */}
        <div className="lg:hidden px-4 py-2 border-t border-gray-100 flex items-center gap-1 overflow-x-auto scrollbar-none bg-[#F8F7F2]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = subRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateSubRoute(item.id as LocalLanguageSubRoute)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-[#087443] text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-[#E8B44F]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body Content based on subRoute */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {subRoute === 'overview' && (
          <div className="space-y-12 animate-in fade-in">
            {/* HERO SECTION */}
            <section className="bg-gradient-to-b from-white via-white to-[#F8F7F2] border border-gray-200/80 rounded-3xl p-6 sm:p-12 text-center shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#087443] text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Zero Login Wall • 100% Public Access • Indigenous Nigerian AI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#17231F] tracking-tight leading-tight max-w-3xl mx-auto">
                Break Language Barriers with AI.
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                Seamlessly translate, speak, listen, and learn across Yoruba, Hausa, Igbo, Nigerian Pidgin, Edo, Efik, Fulfulde, Tiv, and Kanuri. Tuned for everyday market trade, respectful etiquette, and authentic cultural nuance.
              </p>

              {/* 5 Quick CTA Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigateSubRoute('translate')}
                  className="px-5 py-3 bg-[#087443] hover:bg-[#16A34A] text-white font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Languages className="w-4 h-4 text-[#E8B44F]" />
                  <span>Translate Text</span>
                </button>

                <button
                  onClick={() => navigateSubRoute('voice')}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Mic className="w-4 h-4 text-gray-950" />
                  <span>Voice Translator</span>
                </button>

                <button
                  onClick={() => navigateSubRoute('learn')}
                  className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <BookOpen className="w-4 h-4 text-[#087443]" />
                  <span>Learn Lessons & Quiz</span>
                </button>

                <button
                  onClick={() => navigateSubRoute('conversation')}
                  className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 text-[#16A34A]" />
                  <span>Dialogue Practice</span>
                </button>

                <button
                  onClick={() => navigateSubRoute('phrases')}
                  className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <BookMarked className="w-4 h-4 text-amber-500" />
                  <span>Curated Phrases</span>
                </button>
              </div>

              {/* Legal / Medical Certification Disclaimer Banner */}
              <div className="max-w-3xl mx-auto p-4 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-start gap-3 text-xs text-left text-gray-600">
                <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-gray-800">Certified Translation Notice: </span>
                  LocalLanguage AI empowers commerce, travel, cross-cultural communication, and everyday learning.
                  Formal legal court documentation, medical diagnosis, and contractual covenants require certified human translators.
                </p>
              </div>
            </section>

            {/* CAPABILITY MATRIX SECTION */}
            <section className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-[#17231F] tracking-tight">
                  Nigerian & African Language Capability Matrix
                </h2>
                <p className="text-xs text-gray-500 max-w-xl mx-auto">
                  Transparent, genuine capability tiers. We do not claim false perfection: each language shows exact supported features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lang.flagEmoji}</span>
                          <div>
                            <h3 className="text-base font-black text-gray-900">{lang.name}</h3>
                            <p className="text-xs text-[#087443] font-semibold">{lang.nativeName}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            lang.tier === 'full'
                              ? 'bg-emerald-100 text-[#087443]'
                              : lang.tier === 'standard'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lang.tier === 'full'
                            ? 'Full AI Suite'
                            : lang.tier === 'standard'
                            ? 'Core Vocabulary'
                            : 'Phrasebook'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 border-t border-gray-100 pt-2">
                        <p><span className="font-semibold text-gray-700">Region:</span> {lang.region}</p>
                        <p><span className="font-semibold text-gray-700">Estimated Speakers:</span> {lang.speakers}</p>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100 text-[11px]">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        {lang.capabilities.text ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <span className="text-gray-300">○</span>
                        )}
                        <span>Text Translation</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        {lang.capabilities.voice ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <span className="text-gray-300">○</span>
                        )}
                        <span>Speech Audio</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        {lang.capabilities.dialogue ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <span className="text-gray-300">○</span>
                        )}
                        <span>AI Simulator</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        {lang.capabilities.proverbs ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <span className="text-gray-300">○</span>
                        )}
                        <span>Proverbs Library</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {subRoute === 'translate' && <TranslationWorkspace />}
        {subRoute === 'voice' && <VoiceWorkspace />}
        {subRoute === 'learn' && <LearnWorkspace />}
        {subRoute === 'conversation' && <ConversationWorkspace />}
        {subRoute === 'phrases' && <PhrasesWorkspace />}
      </main>
    </div>
  );
};
