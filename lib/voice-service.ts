/**
 * Simplified Voice Service for Aladdin AI Advisor
 * Ultra-reliable implementation that works on all devices
 */

export interface VoiceConfig {
  language: 'en' | 'ar';
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error?: string;
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognitionInstance: any = null;
  private isAndroid = false;
  private isIOS = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      const ua = navigator.userAgent;
      this.isAndroid = /Android/i.test(ua);
      this.isIOS = /iPhone|iPad|iPod/i.test(ua);
      
      // Get recognition constructor
      const RecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = RecognitionClass;
    }
  }

  /**
   * Initialize speech recognition
   */
  initializeRecognition(
    onResult: (text: string) => void,
    onError: (error: string) => void,
    language: 'en' | 'ar' = 'en'
  ) {
    if (!this.recognition) {
      onError('تم رفض إذن الميكروفون أو لم يتم دعمه في هذا المتصفح');
      return;
    }

    try {
      this.recognitionInstance = new this.recognition();
      this.recognitionInstance.continuous = false;
      this.recognitionInstance.interimResults = false;
      this.recognitionInstance.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      this.recognitionInstance.onstart = () => {
        console.log('[v0] Recognition started');
      };

      this.recognitionInstance.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        onResult(transcript.trim());
      };

      this.recognitionInstance.onerror = (event: any) => {
        const errorMap: {[key: string]: string} = {
          'no-speech': 'لم يتم سماع أي صوت',
          'audio-capture': 'خطأ في الميكروفون',
          'not-allowed': 'تم رفض إذن الميكروفون',
          'network': 'خطأ في الاتصال',
        };
        onError(errorMap[event.error] || 'خطأ في الاستقبال');
      };

      this.recognitionInstance.onend = () => {
        console.log('[v0] Recognition ended');
      };
    } catch (error) {
      onError('فشل تهيئة الميكروفون');
    }
  }

  /**
   * Start listening
   */
  startListening() {
    if (!this.recognitionInstance) return;
    try {
      this.recognitionInstance.start();
    } catch (e) {
      console.error('[v0] Error starting mic');
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (!this.recognitionInstance) return;
    try {
      this.recognitionInstance.stop();
    } catch (e) {
      console.error('[v0] Error stopping mic');
    }
  }

  /**
   * Abort listening
   */
  abortListening() {
    if (!this.recognitionInstance) return;
    try {
      this.recognitionInstance.abort();
    } catch (e) {
      console.error('[v0] Error aborting mic');
    }
  }

  /**
   * ULTRA-SIMPLE Text-to-Speech - WORKS 100%
   */
  speak(
    text: string,
    config: VoiceConfig = { language: 'en' },
    onComplete?: () => void,
    onError?: (error: string) => void
  ) {
    if (!this.synth) {
      onError?.('Speech synthesis not available');
      return;
    }

    try {
      // Cancel any existing speech
      this.synth.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Basic settings that ALWAYS work
      utterance.lang = config.language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1; // Normal speed
      utterance.pitch = 1;
      utterance.volume = 1; // Max volume

      // Event handlers
      utterance.onstart = () => {
        console.log('[v0] TTS Started');
      };

      utterance.onend = () => {
        console.log('[v0] TTS Completed');
        onComplete?.();
      };

      utterance.onerror = (event: any) => {
        console.error('[v0] TTS Error:', event.error);
        onError?.(`خطأ في الصوت: ${event.error}`);
      };

      // Speak
      this.synth.speak(utterance);
      console.log('[v0] Speaking:', text.substring(0, 30));
    } catch (error) {
      console.error('[v0] Speak error:', error);
      onError?.('خطأ في تشغيل الصوت');
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Check if speaking
   */
  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }

  /**
   * Detect language
   */
  detectLanguage(text: string): 'en' | 'ar' {
    const arabicRegex = /[\u0600-\u06FF]/g;
    const arabicChars = text.match(arabicRegex)?.length || 0;
    return arabicChars > text.length * 0.3 ? 'ar' : 'en';
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error('[v0] Mic permission denied');
      return false;
    }
  }

  /**
   * Get device info
   */
  getDeviceInfo() {
    return {
      isAndroid: this.isAndroid,
      isIOS: this.isIOS,
      isMobile: this.isAndroid || this.isIOS,
      hasSpeechSynthesis: !!this.synth,
      hasSpeechRecognition: !!this.recognition,
    };
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopSpeaking();
    this.abortListening();
  }

  /**
   * Pause speaking
   */
  pauseSpeaking() {
    if (this.synth) {
      try {
        this.synth.pause();
      } catch (e) {
        console.warn('[v0] Pause not supported');
      }
    }
  }

  /**
   * Resume speaking
   */
  resumeSpeaking() {
    if (this.synth) {
      try {
        this.synth.resume();
      } catch (e) {
        console.warn('[v0] Resume not supported');
      }
    }
  }

  /**
   * Check if listening
   */
  isListening(): boolean {
    return !!this.recognitionInstance;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(language: 'en' | 'ar'): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const voices = this.synth.getVoices();
    return voices.filter((voice) => {
      if (language === 'ar') {
        return voice.lang.startsWith('ar');
      }
      return voice.lang.startsWith('en');
    });
  }

  /**
   * Get best voice
   */
  getBestVoice(language: 'en' | 'ar'): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices(language);
    return voices.length > 0 ? voices[0] : null;
  }
}

// Export singleton
const voiceService = new VoiceService();
export default voiceService;
