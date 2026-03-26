// ============================================
// Tooltips إرشادية للمبتدئين | Beginner Guide Tooltips
// رسائل تظهر أول مرة على العناصر المهمة
// ============================================
import { useState, useEffect } from 'react';

const TIPS = [
  { id: 'player', target: '[data-tip="player"]', title: 'المشغل', message: 'تحكم بالصوت من هنا — غيّر السرعة، اضبط المؤقت، أو استخدم اختصارات لوحة المفاتيح', position: 'top' },
  { id: 'search', target: '[data-tip="search"]', title: 'البحث', message: 'ابحث بالنص أو بالصوت عن بودكاست وحلقات', position: 'bottom' },
  { id: 'listenLater', target: '[data-tip="listen-later"]', title: 'استمع لاحقاً', message: 'احفظ الحلقات لتسمعها وقت ما تبي', position: 'bottom' },
  { id: 'theme', target: '[data-tip="theme"]', title: 'المظهر', message: 'غيّر الألوان وفعّل الوضع الليلي', position: 'bottom' },
];

function getSeenTips() {
  try { return JSON.parse(localStorage.getItem('seen_tips') || '[]'); } catch { return []; }
}

export default function GuideTooltips() {
  const [currentTipIdx, setCurrentTipIdx] = useState(-1);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const seen = getSeenTips();
    // إذا شاف كل التلميحات، ما نعرض شيء
    if (seen.length >= TIPS.length) { setDismissed(true); return; }

    // أول تلميحة ما شافها
    const firstUnseen = TIPS.findIndex((t) => !seen.includes(t.id));
    if (firstUnseen === -1) { setDismissed(true); return; }

    // تأخير بسيط بعد تحميل الصفحة
    const timer = setTimeout(() => setCurrentTipIdx(firstUnseen), 2000);
    return () => clearTimeout(timer);
  }, []);

  const markSeen = (tipId) => {
    const seen = getSeenTips();
    if (!seen.includes(tipId)) {
      seen.push(tipId);
      localStorage.setItem('seen_tips', JSON.stringify(seen));
    }
  };

  const nextTip = () => {
    if (currentTipIdx >= 0) markSeen(TIPS[currentTipIdx].id);
    const next = currentTipIdx + 1;
    if (next >= TIPS.length) {
      setDismissed(true);
    } else {
      setCurrentTipIdx(next);
    }
  };

  const skipAll = () => {
    const allIds = TIPS.map((t) => t.id);
    localStorage.setItem('seen_tips', JSON.stringify(allIds));
    setDismissed(true);
  };

  if (dismissed || currentTipIdx < 0 || currentTipIdx >= TIPS.length) return null;

  const tip = TIPS[currentTipIdx];

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none">
      {/* خلفية شفافة | Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={skipAll} />

      {/* البطاقة الإرشادية | Tooltip card */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto z-[151] w-[320px] animate-slide-down">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{tip.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.message}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
            <div className="flex gap-1">
              {TIPS.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentTipIdx ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={skipAll} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                تخطي
              </button>
              <button onClick={nextTip} className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg">
                {currentTipIdx === TIPS.length - 1 ? 'تم' : 'التالي'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
