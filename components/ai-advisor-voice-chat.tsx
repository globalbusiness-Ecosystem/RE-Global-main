'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, Loader, Volume2, VolumeX, Mic, MicOff, Phone, Settings, Image } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import voiceService from '@/lib/voice-service';
import { MediaCapture, type CapturedMedia } from '@/components/media-capture';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  poweredByAI?: boolean;
  detectedLanguage?: 'en' | 'ar';
  isPlaying?: boolean;
  imageUrl?: string;
  imageAnalysis?: any;
}

interface AIAdvisorVoiceChatProps {
  language?: 'en' | 'ar';
  onClose: () => void;
  enableVoice?: boolean;
}

const VOICE_LABELS = {
  en: {
    title: 'Aladdin Voice Advisor',
    subtitle: 'Talk or type - I understand you',
    startListening: 'Start Listening',
    stopListening: 'Stop Listening',
    speak: 'Speak',
    mute: 'Mute',
    callSupport: 'Call Support',
    settings: 'Settings',
    micPermission: 'Microphone permission required',
    noSpeech: 'No speech detected',
    networkError: 'Network connection error',
    listening: 'Listening...',
    speaking: 'Speaking...',
    placeholder: 'Ask about properties, investments, or speak naturally...',
    accessibility: 'Voice commands available',
    phoneIntegration: 'WhatsApp Integration',
    callText: 'Call +201010810558',
  },
  ar: {
    title: 'مستشار علاء الدين الصوتي',
    subtitle: 'تحدث أو اكتب - أنا أفهمك',
    startListening: 'ابدأ الاستماع',
    stopListening: 'توقف الاستماع',
    speak: 'تحدث',
    mute: 'كتم',
    callSupport: 'اتصل بالدعم',
    settings: 'الإعدادات',
    micPermission: 'إذن الميكروفون مطلوب',
    noSpeech: 'لم يتم اكتشاف صوت',
    networkError: 'خطأ في الاتصال بالشبكة',
    listening: 'في انتظار صوتك...',
    speaking: 'جاري التحدث...',
    placeholder: 'اسأل عن العقارات أو الاستثمارات أو تحدث بطبيعية...',
    accessibility: 'أوامر صوتية متاحة',
    phoneIntegration: 'تكامل واتس آب',
    callText: 'اتصل على +201010810558',
  },
};

export default function AIAdvisorVoiceChat({ language = 'en', onClose, enableVoice = true }: AIAdvisorVoiceChatProps) {
  const { isAuthenticated } = usePiAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>(language);
  const [voiceError, setVoiceError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const labels = VOICE_LABELS[currentLang];

  // Initialize voice service on mount
  useEffect(() => {
    if (!enableVoice) return;

    const initVoice = async () => {
      voiceService.initializeRecognition(
        (text) => {
          console.log('[v0] Voice input:', text);
          setInputValue((prev) => prev + (prev ? ' ' : '') + text);
          setIsListening(false);
        },
        (error) => {
          console.error('[v0] Voice error:', error);
          setVoiceError(error);
          setIsListening(false);
        },
        currentLang
      );

      // Check microphone permission
      const hasMicPermission = await voiceService.requestMicrophonePermission();
      setMicEnabled(hasMicPermission);
    };

    initVoice();

    return () => {
      voiceService.cleanup();
    };
  }, [enableVoice, currentLang]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (text: string = inputValue) => {
      if (!text.trim() || isLoading) return;

      const detectedLang = voiceService.detectLanguage(text);
      const newMessage: Message = {
        role: 'user',
        content: text,
        id: Date.now().toString(),
        detectedLanguage: detectedLang,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch(
          detectedLang === 'ar' ? '/api/claude-advisor' : '/api/claude-advisor',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              language: detectedLang,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.response,
            id: (Date.now() + 1).toString(),
            poweredByAI: true,
            detectedLanguage: data.language,
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Auto-speak response if enabled
          if (autoSpeak && enableVoice) {
            console.log('[v0] Auto-speaking...');
            setIsSpeaking(true);
            voiceService.speak(
              data.response,
              { language: data.language },
              () => {
                console.log('[v0] Speaking done');
                setIsSpeaking(false);
              },
              (error) => {
                console.error('[v0] TTS error:', error);
                setVoiceError(error);
                setIsSpeaking(false);
              }
            );
          }
        }
      } catch (error) {
        console.error('[v0] Send message error:', error);
        setVoiceError('Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, autoSpeak, enableVoice]
  );

  // Start listening handler
  const handleStartListening = useCallback(() => {
    if (!micEnabled) {
      setVoiceError(labels.micPermission);
      return;
    }
    setIsListening(true);
    setVoiceError('');
    voiceService.startListening();
  }, [micEnabled, labels]);

  // Stop listening handler
  const handleStopListening = useCallback(() => {
    setIsListening(false);
    voiceService.stopListening();
  }, []);

  // Toggle speaker
  const handleToggleSpeaker = useCallback(() => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-center bg-black/50" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full md:w-96 h-screen md:h-[600px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col border border-gold/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-slate-800 border-b border-gold/20 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{labels.title}</h2>
            <p className="text-xs text-gold/80">{labels.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {enableVoice && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-gold/10 text-gold transition"
                title={labels.settings}
              >
                <Settings size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-b border-gold/20 px-6 py-4 bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">{labels.speak}</label>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`px-3 py-1 rounded text-sm transition ${
                  autoSpeak ? 'bg-gold/20 text-gold' : 'bg-slate-700 text-gray-400'
                }`}
              >
                {autoSpeak ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Language</label>
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'ar' : 'en')}
                className="px-3 py-1 rounded text-sm bg-slate-700 text-gray-300 hover:bg-slate-600 transition"
              >
                {currentLang === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot size={48} className="text-gold/50 mb-4" />
              <p className="text-gold/60 text-sm">{labels.accessibility}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-slate-700 text-gray-100 border border-slate-600'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && msg.poweredByAI && (
                    <div className="text-xs text-gold/60 mt-1">Powered by AI</div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Loader size={16} className="animate-spin text-gold" />
                <span className="text-sm text-gray-300">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display with Troubleshooting */}
        {voiceError && (
          <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs">
            <p className="font-semibold mb-1">خطأ في الصوت / Voice Error:</p>
            <p>{voiceError}</p>
            <p className="text-red-300/70 mt-1 text-xs">
              💡 {currentLang === 'ar' 
                ? 'تأكد من تشغيل مكبرات الصوت، السماح بإذن الميكروفون، وتحديث المتصفح'
                : 'Ensure speakers are on, microphone permission is granted, and browser is updated'}
            </p>
          </div>
        )}

        {/* Status Bar */}
        {(isListening || isSpeaking) && (
          <div className="px-6 py-3 bg-gold/10 border-t border-gold/20 flex items-center justify-center gap-2 text-sm text-gold">
            <Loader size={16} className="animate-spin" />
            {isListening ? labels.listening : labels.speaking}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gold/20 bg-slate-800/50 px-6 py-4 space-y-3">
          {/* Voice Controls */}
          {enableVoice && (
            <div className="flex gap-2">
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={!micEnabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span className="text-sm">{isListening ? labels.stopListening : labels.startListening}</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={handleToggleSpeaker}
                  className="px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition"
                >
                  <VolumeX size={18} />
                </button>
              )}
            </div>
          )}

          {/* Text Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={labels.placeholder}
              disabled={isLoading}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gold/50 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 rounded-lg bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Phone Integration */}
          <button
            onClick={() => window.open('https://wa.me/201010810558', '_blank')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition text-sm"
          >
            <Phone size={16} />
            {labels.phoneIntegration}
          </button>
        </div>
      </div>
    </div>
  );
}
