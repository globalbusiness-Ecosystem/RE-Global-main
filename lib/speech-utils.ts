import type { NavLanguage } from '@/lib/nav-i18n';

// Text-to-Speech utility
export const speakMessage = (text: string, language: NavLanguage = 'en', onComplete?: () => void) => {
  // Check browser support
  if (!window.speechSynthesis) {
    console.warn('[v0] Speech Synthesis not supported');
    return;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Handle completion
  utterance.onend = () => {
    if (onComplete) onComplete();
  };

  // Speak
  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
