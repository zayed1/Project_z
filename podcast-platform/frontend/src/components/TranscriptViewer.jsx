// ============================================
// عارض النص المكتوب | Transcript Viewer
// ============================================
import { useState } from 'react';

export default function TranscriptViewer({ transcript }) {
  const [expanded, setExpanded] = useState(false);

  if (!transcript) return null;

  const lines = transcript.split('\n');
  const preview = lines.slice(0, 5).join('\n');
  const hasMore = lines.length > 5;

  return (
    <div className="mt-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">النص المكتوب</span>
      </div>
      <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
        {expanded ? transcript : preview}
      </pre>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary-500 hover:text-primary-600 text-sm mt-2 font-medium"
        >
          {expanded ? 'عرض أقل' : `عرض الكل (${lines.length} سطر)`}
        </button>
      )}
    </div>
  );
}
