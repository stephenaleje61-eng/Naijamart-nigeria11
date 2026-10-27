import { 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  SupportedLanguage, 
  DomainTone, 
  TranslationResult, 
  TranslationFeedback, 
  SavedTranslationRecord 
} from '../types';
import { translateWithIndigenousEngine } from './indigenousEngine';

export class TranslateService {
  // Main translation function: calls backend endpoint with automatic fallback
  public static async translate(
    text: string,
    sourceLang: SupportedLanguage,
    targetLang: SupportedLanguage,
    tone: DomainTone = 'general'
  ): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Please enter text to translate.');
    }

    try {
      const response = await fetch('/api/translateLocal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          sourceLang,
          targetLang,
          tone
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          sourceText: trimmed,
          sourceLang,
          targetLang,
          tone,
          translatedText: data.translation,
          explanation: data.explanation,
          toneNote: data.toneNote,
          pronunciation: data.pronunciation,
          alternatives: data.alternatives || [],
          uncertainty: data.uncertainty || false,
          createdAt: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('Backend API translation call failed, utilizing local linguistic engine:', err);
    }

    // Client-side linguistic fallback engine
    return this.generateFallbackTranslation(trimmed, sourceLang, targetLang, tone);
  }

  // Conversation simulator reply: calls backend endpoint with persona
  public static async simulateConversation(
    message: string,
    language: SupportedLanguage,
    scenarioId: string,
    history: { role: string; text: string }[]
  ): Promise<{
    nativeReply: string;
    englishSubtitle: string;
    feedback: string;
    simplerExplanation: string;
  }> {
    try {
      const res = await fetch('/api/conversationLocal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language,
          scenarioId,
          history
        })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend conversation endpoint unreachable, using simulator fallback', e);
    }

    // Cultural simulator responses per language
    if (language === 'yo') {
      return {
        nativeReply: 'Ẹ pẹ̀lẹ́ o! Ọjà mi dára gan-an, kò sí àbùkù kankan. Èló lẹ fẹ́ san?',
        englishSubtitle: 'Greetings! My goods are of top quality, zero defects. How much are you offering to pay?',
        feedback: 'Great tone! Adding "ẹ" shows high respect in Yoruba commerce.',
        simplerExplanation: 'The trader is commending their goods quality and asking for your counter-offer.'
      };
    } else if (language === 'ha') {
      return {
        nativeReply: 'Toh madalla! Gaskiya kaya na suna da inganci sosai. Zan rage maka kadan.',
        englishSubtitle: 'Very well, splendid! Truly my items are of high quality. I will give you a friendly discount.',
        feedback: 'Polite inquiry. "Toh madalla" shows mutual understanding and agreement.',
        simplerExplanation: 'The merchant has agreed to negotiate and will offer you a lower price.'
      };
    } else if (language === 'ig') {
      return {
        nativeReply: 'Nwanne m, ị ma na ihe a bụ original. Weta ₦5,000 ka anyị mechie ya!',
        englishSubtitle: 'My brother, you know this item is genuine. Bring ₦5,000 and let us close the transaction!',
        feedback: 'Addressing the trader as a peer invites this quick deal closing.',
        simplerExplanation: 'The seller is affirming authenticity and stating their immediate closing price.'
      };
    } else {
      // Pidgin
      return {
        nativeReply: 'O boy! You sabi business well well! Bring four-five (₦4,500) make I pack am for you sharp sharp!',
        englishSubtitle: 'My guy! You really know how to negotiate! Bring ₦4,500 and let me bag it for you immediately!',
        feedback: 'Authentic Nigerian street bargaining banter.',
        simplerExplanation: 'The seller appreciated your firmness and gave you the best discounted price.'
      };
    }
  }

  // Fallback generator when offline or before API key setup
  private static generateFallbackTranslation(
    text: string,
    sourceLang: SupportedLanguage,
    targetLang: SupportedLanguage,
    tone: DomainTone
  ): TranslationResult {
    const engineRes = translateWithIndigenousEngine(text, sourceLang, targetLang, tone as any);
    return {
      sourceText: text,
      sourceLang,
      targetLang,
      tone,
      translatedText: engineRes.translation,
      explanation: engineRes.explanation,
      toneNote: engineRes.toneNote,
      pronunciation: engineRes.pronunciation,
      alternatives: engineRes.alternatives,
      uncertainty: engineRes.uncertainty,
      createdAt: new Date().toISOString()
    };
  }

  private static getSamplePronunciation(lang: SupportedLanguage, text: string): string {
    if (lang === 'yo') return 'Phonetic: Stress syllables with clear vowel openness (ẹ = eh, ọ = aw).';
    if (lang === 'ha') return 'Phonetic: Articulate consonants cleanly (ts, ' + 'k, ' + 'b, ' + 'd).';
    if (lang === 'ig') return 'Phonetic: Central Igbo tone balance; dots indicate sub-vowel tones (ị, ọ, ụ).';
    if (lang === 'pcm') return 'Phonetic: West African cadence with rhythmic stress and cheerful lilt.';
    return 'Phonetic guide available with browser audio.';
  }

  // Save translation to user's saved translations collection
  public static async saveTranslation(uid: string, record: TranslationResult): Promise<string> {
    const colRef = collection(db, 'users', uid, 'savedTranslationsLocal');
    const docRef = await addDoc(colRef, {
      ...record,
      uid,
      savedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  // Delete saved translation
  public static async deleteSavedTranslation(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'savedTranslationsLocal', id));
  }

  // Submit accuracy feedback or issue report to feedbackLocal
  public static async submitFeedback(feedback: Omit<TranslationFeedback, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const colRef = collection(db, 'feedbackLocal');
    const docRef = await addDoc(colRef, {
      ...feedback,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }
}
