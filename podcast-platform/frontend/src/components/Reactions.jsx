// ============================================
// نظام ردود الفعل | Reactions System Component
// ردود فعل سريعة على الحلقات والتعليقات
// ============================================
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const REACTIONS = [
  { emoji: '❤️', key: 'heart', label: 'أحببته' },
  { emoji: '🔥', key: 'fire', label: 'رائع' },
  { emoji: '😂', key: 'laugh', label: 'مضحك' },
  { emoji: '👏', key: 'clap', label: 'ممتاز' },
  { emoji: '🤔', key: 'think', label: 'مثير للتفكير' },
];

export default function Reactions({ episodeId, compact = false }) {
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [animatingEmoji, setAnimatingEmoji] = useState(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    api.get(`/episodes/${episodeId}/reactions`)
      .then(({ data }) => {
        setReactions(data.reactions || {});
        setUserReaction(data.userReaction || null);
      })
      .catch(() => {});
  }, [episodeId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleReact = async (key) => {
    const wasSelected = userReaction === key;
    setShowPicker(false);

    // تأثير الأنيميشن | Animation effect
    if (!wasSelected) {
      setAnimatingEmoji(key);
      setTimeout(() => setAnimatingEmoji(null), 600);
    }

    // تحديث مبكر للواجهة | Optimistic update
    setReactions((prev) => {
      const updated = { ...prev };
      if (wasSelected) {
        updated[key] = Math.max(0, (updated[key] || 1) - 1);
        if (updated[key] === 0) delete updated[key];
      } else {
        if (userReaction) {
          updated[userReaction] = Math.max(0, (updated[userReaction] || 1) - 1);
          if (updated[userReaction] === 0) delete updated[userReaction];
        }
        updated[key] = (updated[key] || 0) + 1;
      }
      return updated;
    });
    setUserReaction(wasSelected ? null : key);

    try {
      if (wasSelected) {
        await api.delete(`/episodes/${episodeId}/reaction`);
      } else {
        await api.post(`/episodes/${episodeId}/reaction`, { type: key });
      }
    } catch {
      // التراجع عن التحديث | Revert on error
    }
  };

  const totalReactions = Object.values(reactions).reduce((sum, v) => sum + v, 0);

  // الوضع المدمج: زر واحد | Compact mode: single button
  if (compact) {
    return (
      <div className="relative inline-block" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
            userReaction
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="تفاعل"
        >
          {userReaction
            ? REACTIONS.find((r) => r.key === userReaction)?.emoji || '😀'
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          }
          {totalReactions > 0 && <span>{totalReactions}</span>}
        </button>

        {showPicker && (
          <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-2 flex gap-1 z-50 animate-slide-down">
            {REACTIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => handleReact(r.key)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-125 ${
                  userReaction === r.key ? 'bg-primary-100 dark:bg-primary-900/30 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // الوضع الكامل | Full mode
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {REACTIONS.map((r) => {
        const count = reactions[r.key] || 0;
        const isSelected = userReaction === r.key;
        const isAnimating = animatingEmoji === r.key;

        if (count === 0 && !isSelected) return null;

        return (
          <button
            key={r.key}
            onClick={() => handleReact(r.key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all ${
              isSelected
                ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
            } ${isAnimating ? 'scale-110' : ''}`}
            title={r.label}
          >
            <span className={`text-sm ${isAnimating ? 'animate-bounce' : ''}`}>{r.emoji}</span>
            <span className="text-gray-600 dark:text-gray-400">{count}</span>
          </button>
        );
      })}

      {/* زر إضافة تفاعل | Add reaction button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-7 h-7 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-400 transition-colors"
          title="أضف تفاعل"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {showPicker && (
          <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-2 flex gap-1 z-50 animate-slide-down">
            {REACTIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => handleReact(r.key)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-125 ${
                  userReaction === r.key ? 'bg-primary-100 dark:bg-primary-900/30 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
