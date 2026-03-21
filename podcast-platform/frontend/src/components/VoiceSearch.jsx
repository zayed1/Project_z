// ============================================
// بحث صوتي | Voice Search
// باستخدام Web Speech API
// ============================================
import { useState, useRef } from 'react';

export default function VoiceSearch({ onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = () => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={listening ? stopListening : startListening}
      className={`p-2.5 rounded-lg transition-colors ${
        listening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-white text-gray-500 hover:text-primary-600 hover:bg-gray-100'
      }`}
      title={listening ? 'إيقاف الاستماع' : 'بحث صوتي'}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
      </svg>
    </button>
  );
}
