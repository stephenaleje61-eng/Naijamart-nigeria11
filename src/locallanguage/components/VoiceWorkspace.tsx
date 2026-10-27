import React, { useState, useEffect, useRef } from 'react';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  TranslationResult 
} from '../types';
import { TranslateService } from '../services/translateService';
import { LocalSpeechService } from '../services/speechService';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Info,
  Radio
} from 'lucide-react';

export const VoiceWorkspace: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>('en');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('yo');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      LocalSpeechService.stopSpeaking();
    };
  }, []);

  // Request mic & toggle recording strictly on user click
  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setVoiceNotice(null);
    setTranscript('');
    setTranslationResult(null);

    const rec = LocalSpeechService.createRecognizer(
      sourceLang,
      (text) => {
        setTranscript(text);
      },
      (errorMsg) => {
        setVoiceNotice(errorMsg);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (!rec) return;

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch (err: any) {
      setVoiceNotice('Could not start microphone: ' + err.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);

    // Auto-translate if text was captured
    if (transcript.trim()) {
      handleTranslateVoice(transcript.trim());
    }
  };

  // Perform translation on voice transcript
  const handleTranslateVoice = async (textToTranslate: string) => {
    if (!textToTranslate) return;
    setIsTranslating(true);
    try {
      const res = await TranslateService.translate(textToTranslate, sourceLang, targetLang, 'market');
      setTranslationResult(res);
      // Automatically speak the translation
      handlePlayVoice(res.translatedText, res.targetLang);
    } catch (e: any) {
      setVoiceNotice('Translation failed: ' + e.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayVoice = async (text: string, lang: SupportedLanguage) => {
    if (isPlayingAudio) {
      LocalSpeechService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    try {
      await LocalSpeechService.speak(text, lang, speechSpeed);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getLangName = (code: SupportedLanguage) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#087443] text-xs font-bold mb-1">
            <Radio className="w-3.5 h-3.5 text-[#16A34A] animate-pulse" />
            <span>Voice & Audio Assistant</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
            Speak & Listen in Native Tongues
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Speak naturally into your device — instantly transcribe, translate, and listen with authentic pronunciation.
          </p>
        </div>

        {/* Speed setting */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-500 pl-2">Speech Speed:</span>
          <button
            onClick={() => setSpeechSpeed(0.8)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              speechSpeed === 0.8 ? 'bg-[#087443] text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            0.8x (Slow)
          </button>
          <button
            onClick={() => setSpeechSpeed(1.0)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              speechSpeed === 1.0 ? 'bg-[#087443] text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            1.0x (Normal)
          </button>
        </div>
      </div>

      {/* Language pair selectors */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">I am speaking:</span>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as SupportedLanguage)}
            className="bg-gray-50 border border-gray-200 text-[#17231F] text-xs font-bold py-2 px-3 rounded-2xl focus:ring-2 focus:ring-[#087443]"
          >
            <option value="en">🇳🇬 English</option>
            <option value="pcm">✨ Nigerian Pidgin</option>
            <option value="yo">🟢 Yoruba</option>
            <option value="ha">🌾 Hausa</option>
            <option value="ig">🦅 Igbo</option>
          </select>
        </div>

        <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#087443]">Translate & Speak in:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
            className="bg-emerald-50 border border-emerald-300 text-[#087443] text-xs font-black py-2 px-3 rounded-2xl focus:ring-2 focus:ring-[#087443]"
          >
            {SUPPORTED_LANGUAGES.filter(l => l.code !== sourceLang).map(l => (
              <option key={l.code} value={l.code}>
                {l.flagEmoji} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Mic Recording Stage */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center shadow-xs space-y-6">
        {/* Animated Microphone Target */}
        <div className="relative inline-block">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping -m-4 pointer-events-none" />
          )}

          <button
            onClick={handleToggleRecord}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-[#087443] hover:bg-[#16A34A] text-white hover:shadow-xl'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider">Tap to Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-800">
            {isRecording
              ? 'Listening to your voice... Speak clearly'
              : transcript
              ? 'Speech captured. Click translate or tap mic to speak again.'
              : 'Click the green microphone above to start speaking'}
          </p>
          <p className="text-xs text-gray-400">
            Microphone access is requested only when you click the button. Audio is processed directly in memory.
          </p>
        </div>

        {/* Transcript Box */}
        {(transcript || isRecording) && (
          <div className="max-w-xl mx-auto p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span>Transcript ({getLangName(sourceLang)}):</span>
              {isRecording && (
                <span className="text-red-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Recording Live
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-relaxed min-h-[40px]">
              {transcript || <span className="text-gray-400 italic">Listening...</span>}
            </p>

            {!isRecording && transcript && !translationResult && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleTranslateVoice(transcript)}
                  disabled={isTranslating}
                  className="px-4 py-2 bg-[#087443] hover:bg-[#16A34A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E8B44F]" />
                  <span>Translate Voice</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Translation Output Card */}
        {translationResult && (
          <div className="max-w-xl mx-auto p-5 bg-emerald-50/50 rounded-3xl border border-emerald-200 text-left space-y-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-xs text-[#087443] font-bold">
              <span>Translated to {getLangName(targetLang)}</span>
              <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">Voice Translation</span>
            </div>

            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed">
              {translationResult.translatedText}
            </p>

            {translationResult.pronunciation && (
              <p className="text-xs text-gray-500 italic">
                🗣️ {translationResult.pronunciation}
              </p>
            )}

            {/* Audio & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-200/60">
              <button
                onClick={() => handlePlayVoice(translationResult.translatedText, translationResult.targetLang)}
                className="px-4 py-2 rounded-xl bg-[#087443] hover:bg-[#16A34A] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-transform active:scale-95"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-red-300" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#E8B44F]" />
                    <span>Play Native Pronunciation</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(translationResult.translatedText)}
                  className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Copy translated text"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => {
                    setTranscript('');
                    setTranslationResult(null);
                  }}
                  className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Reset and start fresh"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice notice / error */}
      {voiceNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800 font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{voiceNotice}</span>
          </div>
          <button onClick={() => setVoiceNotice(null)} className="text-amber-500 hover:text-amber-700">✕</button>
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200/80 flex items-start gap-3 text-xs text-gray-600">
        <ShieldCheck className="w-5 h-5 text-[#087443] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-gray-900">Privacy & Microphone Permissions: </span>
          Your browser will ask for microphone permission strictly when you tap the button. 
          No audio files are stored or uploaded without explicit request. Speech-to-text operates seamlessly for real-time translation.
        </div>
      </div>
    </div>
  );
};
