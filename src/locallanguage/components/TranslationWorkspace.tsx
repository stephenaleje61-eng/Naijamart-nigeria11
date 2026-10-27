import React, { useState, useEffect } from 'react';
import { 
  SupportedLanguage, 
  DomainTone, 
  SUPPORTED_LANGUAGES, 
  TONE_OPTIONS, 
  TranslationResult, 
  SavedTranslationRecord 
} from '../types';
import { TranslateService } from '../services/translateService';
import { LocalSpeechService } from '../services/speechService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeftRight, 
  Volume2, 
  Copy, 
  Check, 
  Bookmark, 
  Sparkles, 
  Trash2, 
  Clipboard, 
  AlertCircle, 
  HelpCircle, 
  Star, 
  Send, 
  Info,
  History,
  X,
  VolumeX
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export const TranslationWorkspace: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  const [sourceLang, setSourceLang] = useState<SupportedLanguage>('en');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('yo');
  const [tone, setTone] = useState<DomainTone>('general');
  const [inputText, setInputText] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Feedback modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<'accuracy' | 'cultural_nuance' | 'grammar' | 'spelling' | 'other'>('accuracy');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Saved translations drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedList, setSavedList] = useState<SavedTranslationRecord[]>([]);

  // Update char counter
  useEffect(() => {
    setCharCount(inputText.length);
  }, [inputText]);

  // Load saved translations when drawer opens
  useEffect(() => {
    if (!user || !isHistoryOpen) return;
    const colRef = collection(db, 'users', user.uid, 'savedTranslationsLocal');
    const q = query(colRef, orderBy('savedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSavedList(snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedTranslationRecord)));
    }, (err) => console.warn('Could not fetch saved translations:', err));
    return () => unsub();
  }, [user, isHistoryOpen]);

  // Swap languages
  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    if (result && result.translatedText) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text.slice(0, 2000));
      }
    } catch {
      setErrorNotice('Please allow clipboard access or paste directly into the box.');
    }
  };

  // Perform translation
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setErrorNotice('Please type or paste text to translate.');
      return;
    }
    setErrorNotice(null);
    setIsLoading(true);
    setSavedSuccess(false);

    try {
      const res = await TranslateService.translate(inputText, sourceLang, targetLang, tone);
      setResult(res);
    } catch (err: any) {
      setErrorNotice(err.message || 'Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Text-to-Speech
  const handleSpeak = async (text: string, lang: SupportedLanguage) => {
    if (isSpeaking) {
      LocalSpeechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await LocalSpeechService.speak(text, lang, 0.9);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Save to Firestore
  const handleSaveTranslation = async () => {
    if (!result) return;
    if (!user) {
      openAuthModal('signin');
      return;
    }
    try {
      await TranslateService.saveTranslation(user.uid, result);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      setErrorNotice('Failed to save translation: ' + e.message);
    }
  };

  // Submit accuracy feedback
  const handleSubmitFeedback = async () => {
    if (!result) return;
    try {
      await TranslateService.submitFeedback({
        sourceText: result.sourceText,
        translatedText: result.translatedText,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
        rating: feedbackRating,
        feedbackText: feedbackNote,
        category: feedbackCategory,
        userUid: user?.uid,
        userEmail: user?.email || undefined
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSubmitted(false);
        setFeedbackNote('');
      }, 2000);
    } catch (err: any) {
      setErrorNotice('Error submitting feedback: ' + err.message);
    }
  };

  const getLangName = (code: SupportedLanguage) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & History Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#087443] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>AI Translation Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            High-Accuracy Nigerian & African Translation
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Natural phrasing, tonal accuracy, cultural honorifics & street-smart market dialects.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              openAuthModal('signin');
            } else {
              setIsHistoryOpen(true);
            }
          }}
          className="self-start sm:self-center px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4 text-[#087443]" />
          <span>Saved Translations</span>
        </button>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Language & Tone Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#F8F7F2]/60 flex flex-wrap items-center justify-between gap-3">
          {/* Source & Target Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as SupportedLanguage)}
              className="bg-white border border-gray-300 text-[#17231F] text-xs sm:text-sm font-bold py-2 px-3 rounded-2xl focus:ring-2 focus:ring-[#087443] focus:outline-none cursor-pointer shadow-2xs"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={`src-${l.code}`} value={l.code}>
                  {l.flagEmoji} {l.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleSwapLanguages}
              title="Swap languages"
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl text-gray-600 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#087443]" />
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
              className="bg-white border border-[#087443] text-[#087443] text-xs sm:text-sm font-black py-2 px-3 rounded-2xl focus:ring-2 focus:ring-[#087443] focus:outline-none cursor-pointer shadow-2xs"
            >
              {SUPPORTED_LANGUAGES.filter(l => l.code !== sourceLang).map((l) => (
                <option key={`tgt-${l.code}`} value={l.code}>
                  {l.flagEmoji} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Domain Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">Tone:</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as DomainTone)}
              className="bg-emerald-50 border border-emerald-300 text-[#087443] text-xs font-black py-2 px-3 rounded-2xl focus:ring-2 focus:ring-[#087443] focus:outline-none cursor-pointer shadow-2xs"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input & Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Source Input Column */}
          <div className="p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-bold text-gray-700">Source Text ({getLangName(sourceLang)})</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePaste}
                    className="hover:text-[#087443] flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                  {inputText && (
                    <button
                      onClick={() => setInputText('')}
                      className="hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 2000))}
                placeholder={`Type or paste your text in ${getLangName(sourceLang)} here...\nExample: "Please reduce the price for me, I want to buy in bulk."`}
                rows={6}
                className="w-full p-3 bg-gray-50/80 rounded-2xl border border-gray-200 text-sm font-medium text-[#17231F] focus:outline-none focus:ring-2 focus:ring-[#087443] focus:bg-white resize-none"
              />
            </div>

            {/* Input Action Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-semibold text-gray-400">
                {charCount} / 2,000 characters
              </span>

              <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isLoading || !inputText.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#087443] hover:bg-[#16A34A] text-white active:scale-98'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E8B44F]" />
                    <span>Translate Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Translated Output Column */}
          <div className="p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-gray-50/40">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-bold text-[#087443]">Translation ({getLangName(targetLang)})</span>
                {result && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#087443]">
                    Tone: {tone.replace('_', ' ')}
                  </span>
                )}
              </div>

              {result ? (
                <div className="space-y-3">
                  {/* Big Translated Text */}
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200/90 shadow-2xs min-h-[120px] flex flex-col justify-between">
                    <p className="text-base sm:text-lg font-bold text-[#17231F] leading-relaxed select-text">
                      {result.translatedText}
                    </p>

                    {result.pronunciation && (
                      <p className="text-xs text-gray-500 italic mt-2 border-t border-gray-100 pt-1.5">
                        🗣️ {result.pronunciation}
                      </p>
                    )}
                  </div>

                  {/* Cultural & Tone Explanation */}
                  {(result.toneNote || result.explanation) && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs text-amber-950 font-medium space-y-1">
                      <p className="font-bold flex items-center gap-1 text-amber-800">
                        <Info className="w-3.5 h-3.5" /> Cultural & Tone Insight:
                      </p>
                      <p>{result.toneNote || result.explanation}</p>
                    </div>
                  )}

                  {/* Alternatives */}
                  {result.alternatives && result.alternatives.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Alternative Expressions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.alternatives.map((alt, idx) => (
                          <span
                            key={idx}
                            onClick={() => handleCopy(alt)}
                            title="Click to copy alternative"
                            className="text-xs bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 px-2.5 py-1 rounded-xl cursor-pointer transition-colors"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white/60">
                  <ArrowLeftRight className="w-8 h-8 text-gray-300 mb-2 stroke-1" />
                  <p className="text-xs font-semibold text-gray-500">Translation will appear here</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mt-1">
                    Select your tone (e.g. Market Bargaining or Respectful) for authentic nuance.
                  </p>
                </div>
              )}
            </div>

            {/* Translation Output Footer Controls */}
            {result && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeak(result.translatedText, result.targetLang)}
                    className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-[#087443] border border-gray-200 transition-all cursor-pointer"
                    title={isSpeaking ? 'Stop speaking' : 'Listen with pronunciation'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleCopy(result.translatedText)}
                    className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer"
                    title="Copy translation"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleSaveTranslation}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      savedSuccess
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                    title="Save to favorites"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-xs font-bold text-gray-500 hover:text-[#087443] flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Rate Accuracy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error or Alert banner */}
      {errorNotice && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-700 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Legal & Medical Certified Translation Disclaimer */}
      <div className="p-3.5 bg-gray-100/90 rounded-2xl border border-gray-200/80 flex items-start gap-2.5 text-xs text-gray-600">
        <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold text-gray-800">Legal & Medical Translation Notice: </span>
          LocalLanguage AI is designed for commerce, everyday conversations, community communication, and educational enrichment.
          Certified professional human translators are strictly required for binding legal court documents, medical diagnoses, official government affidavits, and formal bank contracts.
        </div>
      </div>

      {/* Feedback / Accuracy Report Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-[#17231F]">Rate Translation Accuracy</h3>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-[#087443] rounded-full mx-auto flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-gray-900">Thank you for your feedback!</h4>
                <p className="text-xs text-gray-500">
                  Your feedback helps indigenous linguists refine Nigerian language models.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Accuracy Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 text-gray-300 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-gray-600">{feedbackRating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Issue Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-medium"
                  >
                    <option value="accuracy">General Accuracy</option>
                    <option value="cultural_nuance">Cultural Nuance / Tone Wrong</option>
                    <option value="grammar">Grammar / Tonal Marks</option>
                    <option value="spelling">Indigenous Spelling</option>
                    <option value="other">Other Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your Linguistic Notes (Optional)</label>
                  <textarea
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Suggest a better native phrase or context note..."
                    rows={3}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#087443] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    className="px-4 py-2 rounded-xl bg-[#087443] hover:bg-[#16A34A] text-white font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Translations Drawer / Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end p-0 animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#087443]" />
                  <h3 className="font-black text-lg text-[#17231F]">Saved Translations</h3>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {savedList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <Bookmark className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                  <p className="text-xs font-semibold text-gray-600">No saved translations yet</p>
                  <p className="text-[11px] text-gray-400">
                    Click the bookmark button after translating to save phrases for offline reference.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-gray-50 hover:bg-emerald-50/40 rounded-2xl border border-gray-200 text-xs space-y-1.5 transition-colors relative group"
                    >
                      <div className="flex items-center justify-between text-gray-400 font-semibold text-[10px]">
                        <span>
                          {getLangName(item.sourceLang)} → {getLangName(item.targetLang)}
                        </span>
                        <button
                          onClick={() => user && TranslateService.deleteSavedTranslation(user.uid, item.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-gray-600 line-clamp-1 italic">"{item.sourceText}"</p>
                      <p className="text-gray-900 font-bold text-sm">{item.translatedText}</p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSpeak(item.translatedText, item.targetLang)}
                          className="text-[#087443] font-bold flex items-center gap-1 hover:underline text-[11px]"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Listen
                        </button>
                        <button
                          onClick={() => handleCopy(item.translatedText)}
                          className="text-gray-600 font-bold flex items-center gap-1 hover:underline text-[11px]"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Close Saved List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
