import React, { useState, useEffect, useRef } from 'react';
import { 
  SupportedLanguage, 
  ConversationMessage, 
  ScenarioMeta 
} from '../types';
import { TranslateService } from '../services/translateService';
import { LocalSpeechService } from '../services/speechService';
import { 
  MessageSquare, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  MapPin, 
  User, 
  Lightbulb, 
  Mic, 
  MicOff 
} from 'lucide-react';

const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'balogun-market',
    title: 'Balogun Market Lace Bargaining',
    location: 'Lagos Island, Lagos State',
    defaultLanguage: 'yo',
    character: 'Iya Morayo (Textile & Lace Merchant)',
    context: 'You are shopping for traditional wedding fabric. Negotiate a respectful price discount for 5 yards.',
    initialGreeting: {
      nativeText: 'Káàbọ̀ ọmọ mi! Wọlé wá wo aṣọ aṣẹ́gbé tó dára gidi. Ẹ wo àwọ̀ funfun yìí, èló lẹ fẹ́ ra?',
      englishSubtitle: 'Welcome my child! Step inside and see top-tier ceremonial fabrics. Look at this crisp white lace, how much are you looking to buy?'
    }
  },
  {
    id: 'wuse-market',
    title: 'Wuse Market Grain & Spice Shopping',
    location: 'Abuja / Kano Northern Corridor',
    defaultLanguage: 'ha',
    character: 'Malam Danladi (Grain & Tomato Merchant)',
    context: 'You need 2 bags of northern rice and a basket of fresh tomatoes. Inquire peacefully and negotiate fairly.',
    initialGreeting: {
      nativeText: 'Sannu maraba! Ina kwana? Muna da shinkafa mai kyau sosai da tumatir sabo daga gona.',
      englishSubtitle: 'Welcome! How are you doing this morning? We have premium rice and fresh farm tomatoes straight from the fields.'
    }
  },
  {
    id: 'onitsha-market',
    title: 'Onitsha Main Market Electronics',
    location: 'Onitsha, Anambra State',
    defaultLanguage: 'ig',
    character: 'Chidi Nwoke (Electronics & Phones Trader)',
    context: 'You want to buy a durable power bank and phone screen guard with warranty.',
    initialGreeting: {
      nativeText: 'Ndewo nwanne m! Ị biala n\'oge. Ngwaahịa niile m nwere bụ original na direct factory. Kedu nke ị chọrọ?',
      englishSubtitle: 'Greetings my brother! You arrived right on time. All my accessories are original direct from factory. Which one do you need?'
    }
  },
  {
    id: 'keke-ride',
    title: 'Keke NAPEP Transit in Ikeja',
    location: 'Allen Avenue, Ikeja, Lagos',
    defaultLanguage: 'pcm',
    character: 'Baba Segun (Keke Driver)',
    context: 'Catching a quick tricycle ride to Computer Village during rush hour.',
    initialGreeting: {
      nativeText: 'How far boss! Computer Village enter! Na two hundred naira straight, enter with your exact change abeg!',
      englishSubtitle: 'Hello boss! Hop in for Computer Village! ₦200 straight, please enter with exact change!'
    }
  }
];

export const ConversationWorkspace: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioMeta>(SCENARIOS[0]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [activeTabLanguage, setActiveTabLanguage] = useState<SupportedLanguage>('yo');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize scenario messages
  useEffect(() => {
    setActiveTabLanguage(activeScenario.defaultLanguage);
    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        nativeText: activeScenario.initialGreeting.nativeText,
        englishSubtitle: activeScenario.initialGreeting.englishSubtitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: 'Greeting sets the warm tone. Respond with polite deference and ask for the price.'
      }
    ]);
  }, [activeScenario]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      nativeText: trimmed,
      englishSubtitle: 'Your response',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.role,
        text: m.nativeText
      }));

      const reply = await TranslateService.simulateConversation(
        trimmed,
        activeTabLanguage,
        activeScenario.id,
        historyPayload
      );

      const botMsg: ConversationMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        nativeText: reply.nativeReply,
        englishSubtitle: reply.englishSubtitle,
        feedback: reply.feedback,
        simplerExplanation: reply.simplerExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      console.warn('Conversation reply error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlayVoice = async (text: string, lang: SupportedLanguage) => {
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

  const handleToggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      setIsRecording(false);
    } else {
      const rec = LocalSpeechService.createRecognizer(
        activeTabLanguage,
        (text) => setInputText(text),
        (err) => {
          console.warn('Voice input error:', err);
          setIsRecording(false);
        },
        () => setIsRecording(false)
      );
      if (rec) {
        try {
          rec.start();
          recognitionRef.current = rec;
          setIsRecording(true);
        } catch {
          setIsRecording(false);
        }
      }
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'assistant',
        nativeText: activeScenario.initialGreeting.nativeText,
        englishSubtitle: activeScenario.initialGreeting.englishSubtitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: 'Conversation reset. Try a new bargaining strategy!'
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#087443] text-xs font-bold mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Real-Life Dialogue Simulator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            Practice Real Conversations with AI
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Roleplay market bargaining, street transport, and business deals with native cultural feedback.
          </p>
        </div>

        <button
          onClick={handleResetConversation}
          className="self-start md:self-center px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Scenario</span>
        </button>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map(sc => {
          const isSelected = activeScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/80 border-[#087443] shadow-xs ring-1 ring-[#087443]'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#087443]">
                  <MapPin className="w-3 h-3" />
                  <span>{sc.location.split(',')[0]}</span>
                </div>
                <h4 className="text-xs font-black text-gray-900 line-clamp-1">{sc.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2">{sc.character}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Scenario Info Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#087443] text-white flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900">{activeScenario.character}</h4>
              <p className="text-[10px] text-gray-500 font-medium">{activeScenario.context}</p>
            </div>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8F7F2]/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl text-xs space-y-1.5 shadow-2xs ${
                    isUser
                      ? 'bg-[#087443] text-white rounded-tr-xs'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                  }`}
                >
                  <p className="text-sm sm:text-base font-bold leading-relaxed">{msg.nativeText}</p>
                  
                  {msg.englishSubtitle && (
                    <p className={`text-xs italic ${isUser ? 'text-emerald-100' : 'text-gray-500'}`}>
                      ↳ {msg.englishSubtitle}
                    </p>
                  )}

                  {!isUser && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handlePlayVoice(msg.nativeText, activeTabLanguage)}
                        className="text-[11px] font-bold text-[#087443] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {isPlayingAudio === msg.nativeText ? (
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

                      <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {/* Cultural Feedback or Simpler Breakdown Tip */}
                {msg.feedback && (
                  <div className="max-w-[80%] p-2.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Linguistic Coach: </span>
                      {msg.feedback}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200 w-28 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-[#087443] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#087443] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#087443] animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2">
          <button
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-2xl transition-colors cursor-pointer ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isRecording ? 'Stop voice recording' : 'Dictate with microphone'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Reply in ${activeTabLanguage.toUpperCase()} or English (e.g. "Ego ole?", "Báwo ni?")...`}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#087443] focus:bg-white focus:outline-none"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
              inputText.trim() && !isTyping
                ? 'bg-[#087443] hover:bg-[#16A34A] text-white shadow-xs'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
