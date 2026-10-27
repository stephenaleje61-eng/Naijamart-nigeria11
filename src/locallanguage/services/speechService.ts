// Web Speech API Voice and Synthesis utilities for Nigerian languages

export class LocalSpeechService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Speak text using browser speech synthesis with tone and speed adaptation
  public static speak(text: string, langCode: string = 'en', rate: number = 0.95): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.warn('Speech synthesis not supported in this browser.');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Select suitable voice if available
      const voices = this.synth.getVoices();
      const voice = voices.find(v => 
        v.lang.toLowerCase().includes('en-ng') || 
        v.lang.toLowerCase().includes('en-za') ||
        v.lang.toLowerCase().includes('en-gb') ||
        v.lang.toLowerCase().startsWith(langCode)
      );

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis warning:', e);
        resolve(); // resolve to prevent unhandled rejection in UI
      };

      this.synth.speak(utterance);
    });
  }

  public static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Check if speech recognition is supported in this browser
  public static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  // Initialize speech recognition strictly on user trigger
  public static createRecognizer(
    langCode: string,
    onResult: (transcript: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): any {
    if (!this.isRecognitionSupported()) {
      onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Use Nigerian English if available, or appropriate locale
    if (langCode === 'pcm' || langCode === 'en') {
      recognition.lang = 'en-NG';
    } else {
      recognition.lang = langCode;
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      let message = 'Microphone error occurred.';
      if (event.error === 'not-allowed') {
        message = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Please try speaking closer to your mic.';
      } else if (event.error === 'network') {
        message = 'Network error during speech recognition.';
      }
      onError(message);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }
}
