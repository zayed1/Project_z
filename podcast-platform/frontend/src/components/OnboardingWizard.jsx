// ============================================
// معالج الإعداد الأولي | Onboarding Wizard
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MOODS = ['تحفيزي', 'تعليمي', 'مريح', 'ترفيهي', 'إخباري', 'حواري', 'قصصي', 'تقني'];
const FREQUENCIES = [
  { value: 'daily', label: 'يومياً' },
  { value: 'weekly', label: 'أسبوعياً' },
  { value: 'occasionally', label: 'أحياناً' },
];

export default function OnboardingWizard({ onComplete }) {
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const toggleCat = (id) => setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  const toggleMood = (m) => setSelectedMoods((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.post('/me/preferences', {
        categories: selectedCats,
        moods: selectedMoods,
        listen_frequency: frequency,
      });
      toast.success('مرحباً بك!');
      onComplete?.();
    } catch {
      toast.error('فشل');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    // الخطوة 1: اختيار التصنيفات
    <div key="cats">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">ما المواضيع التي تهمك؟</h2>
      <p className="text-sm text-gray-500 mb-4">اختر تصنيفاً واحداً أو أكثر</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => toggleCat(cat.id)}
            className={`px-4 py-2 rounded-full text-sm border transition-all ${
              selectedCats.includes(cat.id) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-300'
            }`}>
            {cat.name}
          </button>
        ))}
      </div>
    </div>,

    // الخطوة 2: اختيار المزاج
    <div key="moods">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">ما نوع المحتوى المفضل؟</h2>
      <p className="text-sm text-gray-500 mb-4">اختر نوعاً أو أكثر</p>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button key={mood} onClick={() => toggleMood(mood)}
            className={`px-4 py-2 rounded-full text-sm border transition-all ${
              selectedMoods.includes(mood) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-300'
            }`}>
            {mood}
          </button>
        ))}
      </div>
    </div>,

    // الخطوة 3: تردد الاستماع
    <div key="freq">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">كم مرة تستمع للبودكاست؟</h2>
      <div className="space-y-2 mt-4">
        {FREQUENCIES.map((f) => (
          <button key={f.value} onClick={() => setFrequency(f.value)}
            className={`w-full p-3 rounded-xl border text-right transition-all ${
              frequency === f.value ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* مؤشر الخطوات | Step indicator */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
          ))}
        </div>

        {steps[step]}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="text-gray-500 hover:text-gray-700 text-sm">السابق</button>
          ) : (
            <button onClick={onComplete} className="text-gray-400 hover:text-gray-600 text-sm">تخطي</button>
          )}

          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm">التالي</button>
          ) : (
            <button onClick={handleFinish} disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">
              {loading ? 'جاري...' : 'ابدأ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
