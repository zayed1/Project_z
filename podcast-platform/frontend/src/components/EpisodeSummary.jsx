// ============================================
// ملخص الحلقة | Episode Summary Component
// ============================================
import React, { useState, useMemo } from 'react';

/**
 * EpisodeSummary - يولد ملخصاً تلقائياً من وصف الحلقة
 * Auto-generates summary from episode description
 *
 * @param {string} description - وصف الحلقة الكامل | Full episode description
 * @param {number} sentenceCount - عدد الجمل في الملخص | Number of sentences in summary
 */
const EpisodeSummary = ({ description = '', sentenceCount = 3 }) => {
  // حالة التوسيع | Expanded state
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * تقسيم النص إلى جمل | Split text into sentences
   * يدعم علامات الترقيم العربية والإنجليزية | Supports Arabic and English punctuation
   */
  const sentences = useMemo(() => {
    if (!description) return [];
    // تقسيم حسب النقطة أو علامة الاستفهام أو التعجب | Split by period, question mark, exclamation
    return description
      .split(/(?<=[.!?؟!。])\s+/)
      .filter((s) => s.trim().length > 0);
  }, [description]);

  // الملخص المقتطع | Truncated summary
  const summary = useMemo(() => {
    return sentences.slice(0, sentenceCount).join(' ');
  }, [sentences, sentenceCount]);

  // هل النص أطول من الملخص | Is text longer than summary
  const hasMore = sentences.length > sentenceCount;

  /**
   * حساب عدد الكلمات | Calculate word count
   * يعد الكلمات العربية والإنجليزية | Counts Arabic and English words
   */
  const wordCount = useMemo(() => {
    if (!description) return 0;
    return description.split(/\s+/).filter((w) => w.length > 0).length;
  }, [description]);

  /**
   * حساب وقت القراءة المقدر | Calculate estimated reading time
   * متوسط سرعة القراءة العربية: ~200 كلمة/دقيقة | Arabic avg: ~200 words/min
   */
  const readingTime = useMemo(() => {
    const minutes = Math.ceil(wordCount / 200);
    return minutes;
  }, [wordCount]);

  // إذا لا يوجد وصف | If no description
  if (!description) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500 italic" dir="rtl">
        لا يوجد وصف متاح | No description available
      </div>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      {/* النص | Text content */}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {isExpanded ? description : summary}
        {!isExpanded && hasMore && '...'}
      </div>

      {/* زر اقرأ المزيد/أقل | Read more/less button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700
            dark:hover:text-purple-300 transition-colors"
        >
          {isExpanded ? 'عرض أقل' : 'اقرأ المزيد'}
          {/* Read more / Show less */}
        </button>
      )}

      {/* معلومات إحصائية | Stats info */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {/* عدد الكلمات | Word count */}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {wordCount} كلمة
        </span>
        {/* وقت القراءة | Reading time */}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {readingTime} دقيقة قراءة
        </span>
      </div>
    </div>
  );
};

export default EpisodeSummary;
