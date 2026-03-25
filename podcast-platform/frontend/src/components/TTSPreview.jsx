// ============================================
// تحويل النص لصوت | TTS Preview Component
// ============================================
import { useState, useRef } from 'react';

export default function TTSPreview({ text }) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  if (!text || !('speechSynthesis' in window)) return null;

  const handleSpeak = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
    utterance.lang = 'ar';
    utterance.rate = 0.9;

    // محاولة اختيار صوت عربي | Try to find Arabic voice
    const voices = speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) utterance.voice = arabicVoice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;

    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-1.5 rounded-lg transition-colors ${
        speaking
          ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30'
          : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={speaking ? 'إيقاف القراءة' : 'قراءة الوصف'}
      aria-label={speaking ? 'إيقاف القراءة الصوتية' : 'تشغيل القراءة الصوتية للوصف'}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {speaking ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h6v4H9z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        )}
      </svg>
    </button>
  );
}
