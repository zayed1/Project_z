// ============================================
// فلتر المزاج | Mood Filter Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';

const MOOD_ICONS = {
  'تحفيزي': '🔥',
  'تعليمي': '📚',
  'مريح': '🌙',
  'ترفيهي': '🎭',
  'إخباري': '📰',
  'حواري': '💬',
  'قصصي': '📖',
  'تقني': '💻',
};

const MOOD_COLORS = {
  'تحفيزي': 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  'تعليمي': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'مريح': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  'ترفيهي': 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
  'إخباري': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
  'حواري': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  'قصصي': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'تقني': 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
};

export default function MoodFilter({ onSelect, selectedMood }) {
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    api.get('/moods')
      .then(({ data }) => setMoods(data.moods || []))
      .catch(() => setMoods(Object.keys(MOOD_ICONS)));
  }, []);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="فلتر المزاج">
      {moods.map((mood) => (
        <button
          key={mood}
          onClick={() => onSelect(selectedMood === mood ? null : mood)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedMood === mood
              ? `${MOOD_COLORS[mood] || 'bg-primary-100 text-primary-700 border-primary-200'} ring-2 ring-offset-1 ring-primary-300`
              : `${MOOD_COLORS[mood] || 'bg-gray-100 text-gray-600 border-gray-200'} hover:shadow-sm`
          }`}
          aria-pressed={selectedMood === mood}
        >
          {MOOD_ICONS[mood] || '🎙️'} {mood}
        </button>
      ))}
    </div>
  );
}
