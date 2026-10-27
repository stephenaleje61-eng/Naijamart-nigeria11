import React, { useState, useEffect } from 'react';
import { 
  SupportedLanguage, 
  Lesson, 
  UserLessonProgress 
} from '../types';
import { DEFAULT_LESSONS } from '../data/defaultLessons';
import { LocalSpeechService } from '../services/speechService';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  ChevronRight, 
  Flame, 
  VolumeX,
  Compass
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const LearnWorkspace: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('yo');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLesson, setActiveLesson] = useState<Lesson>(DEFAULT_LESSONS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<Record<string, UserLessonProgress>>({});

  // Filter lessons
  const filteredLessons = DEFAULT_LESSONS.filter(lesson => {
    const matchesLang = lesson.language === selectedLang;
    const matchesCat = selectedCategory === 'all' || lesson.category === selectedCategory;
    return matchesLang && matchesCat;
  });

  // Load user progress for active lesson if signed in
  useEffect(() => {
    if (!user || !activeLesson) return;
    const loadProgress = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'progressLocal', activeLesson.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserLessonProgress;
          setUserProgress(prev => ({ ...prev, [activeLesson.id]: data }));
          setQuizScore(data.quizScore);
          setQuizSubmitted(true);
        } else {
          setQuizSubmitted(false);
          setQuizAnswers({});
        }
      } catch (err) {
        console.warn('Could not load user lesson progress:', err);
      }
    };
    loadProgress();
  }, [user, activeLesson]);

  // When changing lesson, reset quiz if not completed
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handlePlayPhrase = async (text: string, lang: SupportedLanguage) => {
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

  const handleSelectQuizAnswer = (qId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson.quiz || activeLesson.quiz.length === 0) return;

    let score = 0;
    activeLesson.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    // Save progress to Firestore if authenticated
    if (user) {
      try {
        const progressRecord: UserLessonProgress = {
          lessonId: activeLesson.id,
          completed: score >= Math.ceil(activeLesson.quiz.length / 2),
          quizScore: score,
          maxScore: activeLesson.quiz.length,
          lastAttemptAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid, 'progressLocal', activeLesson.id), progressRecord);
        setUserProgress(prev => ({ ...prev, [activeLesson.id]: progressRecord }));
      } catch (e) {
        console.warn('Could not save progress record:', e);
      }
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#087443] text-xs font-bold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Interactive Indigenous Language Academy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            Learn Nigerian Tongues Step-by-Step
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Cultural context, situational dialogues, native pronunciation, and interactive quizzes.
          </p>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { code: 'yo', label: '🟢 Yoruba' },
            { code: 'ha', label: '🌾 Hausa' },
            { code: 'ig', label: '🦅 Igbo' },
            { code: 'pcm', label: '✨ Pidgin' }
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLang(lang.code as SupportedLanguage);
                const first = DEFAULT_LESSONS.find(l => l.language === lang.code);
                if (first) handleSelectLesson(first);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLang === lang.code
                  ? 'bg-[#087443] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Lessons List + Active Lesson Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#17231F] uppercase tracking-wider">Lesson Modules</span>
              <span className="text-[11px] font-bold text-gray-400">{filteredLessons.length} available</span>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'greetings', 'market', 'transport', 'numbers', 'business'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold capitalize transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-100/70 text-[#087443]'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              {filteredLessons.map(lesson => {
                const isSelected = activeLesson.id === lesson.id;
                const isCompleted = userProgress[lesson.id]?.completed;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                        : 'bg-gray-50/50 hover:bg-gray-100/70 border-gray-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[#087443]">
                          {lesson.level}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{lesson.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{lesson.situation}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#087443]' : 'text-gray-400'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Lesson Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lesson Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 bg-emerald-100/80 text-[#087443] rounded-full text-xs font-bold">
                Level: {activeLesson.level} • {activeLesson.category.toUpperCase()}
              </span>
              {userProgress[activeLesson.id] && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Quiz Score: {userProgress[activeLesson.id].quizScore} / {userProgress[activeLesson.id].maxScore}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#17231F]">{activeLesson.title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{activeLesson.situation}</p>
            </div>

            {/* Cultural Insight Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Indigenous Cultural Etiquette & Custom</span>
              </div>
              <p className="text-amber-950 font-medium leading-relaxed">{activeLesson.culturalNote}</p>
            </div>

            {/* Key Phrases Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Key Phrases & Pronunciation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeLesson.keyPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-base font-black text-gray-900">{phrase.indigenous}</span>
                        <button
                          onClick={() => handlePlayPhrase(phrase.indigenous, activeLesson.language)}
                          className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#087443] border border-gray-200 shadow-2xs cursor-pointer transition-transform active:scale-95 shrink-0"
                          title="Listen to pronunciation"
                        >
                          {isPlayingAudio === phrase.indigenous ? (
                            <VolumeX className="w-4 h-4 text-red-500" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-emerald-800 font-semibold italic mt-0.5">
                        🗣️ {phrase.phonetic}
                      </p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{phrase.english}</p>
                    </div>

                    <p className="text-[11px] text-gray-400 border-t border-gray-200/60 pt-1.5">
                      Context: {phrase.context}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Dialogue Section (if available) */}
            {activeLesson.dialogue && activeLesson.dialogue.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  Sample Real-Life Dialogue
                </h4>
                <div className="space-y-2 bg-gray-50/60 p-4 rounded-2xl border border-gray-200">
                  {activeLesson.dialogue.map((line, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <span className="font-bold text-[#087443]">{line.speaker}: </span>
                      <span className="font-black text-gray-900">{line.text}</span>
                      <p className="text-gray-500 italic text-[11px] ml-4">↳ {line.translation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Mini-Quiz Card */}
          {activeLesson.quiz && activeLesson.quiz.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="text-base font-black text-[#17231F]">
                    Interactive Lesson Quiz ({activeLesson.quiz.length} Questions)
                  </h4>
                </div>
                {quizSubmitted && (
                  <button
                    onClick={handleResetQuiz}
                    className="text-xs font-bold text-gray-500 hover:text-[#087443] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake
                  </button>
                )}
              </div>

              {/* Quiz Questions List */}
              <div className="space-y-5">
                {activeLesson.quiz.map((q, qIndex) => {
                  const userAnswer = quizAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = isAnswered && userAnswer === q.correctIndex;

                  return (
                    <div key={q.id} className="space-y-2.5">
                      <p className="text-xs font-black text-gray-900">
                        {qIndex + 1}. {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((option, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200';

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-50 text-red-800 border-red-300 line-through';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-[#087443] text-white border-[#087443] font-bold shadow-xs';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleSelectQuizAnswer(q.id, optIdx)}
                              className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <p className={`text-[11px] font-medium p-2 rounded-xl ${
                          isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Footer & Submission */}
              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-3">
                {!quizSubmitted ? (
                  <>
                    <p className="text-xs text-gray-400">
                      Select your answers for all questions to calculate your score.
                    </p>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer ${
                        Object.keys(quizAnswers).length < activeLesson.quiz.length
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#087443] hover:bg-[#16A34A] text-white active:scale-98'
                      }`}
                    >
                      Submit Quiz & Check Score
                    </button>
                  </>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-amber-500" />
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          Quiz Completed! Score: {quizScore} / {activeLesson.quiz.length}
                        </p>
                        <p className="text-xs text-gray-600">
                          {quizScore === activeLesson.quiz.length
                            ? 'Excellent! You have mastered this lesson context.'
                            : 'Good effort! Review the phrases and retake anytime.'}
                        </p>
                      </div>
                    </div>

                    {!user && (
                      <button
                        onClick={() => openAuthModal('signin')}
                        className="px-3.5 py-1.5 bg-[#087443] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl shadow-2xs self-start sm:self-center"
                      >
                        Sign In to Save Progress
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
