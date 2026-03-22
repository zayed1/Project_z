// ============================================
// إدارة اختبارات A/B | A/B Test Manager Component
// ============================================
import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ABTestManager() {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ episode_id: '', variant_a: '', variant_b: '' });

  useEffect(() => {
    adminAPI.getABTests()
      .then(({ data }) => setTests(data.tests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.episode_id || !form.variant_a || !form.variant_b) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }
    try {
      const { data } = await adminAPI.createABTest(form);
      setTests([data.test, ...tests]);
      setForm({ episode_id: '', variant_a: '', variant_b: '' });
      setCreating(false);
      toast.success('تم إنشاء الاختبار');
    } catch {
      toast.error('فشل');
    }
  };

  const getWinner = (test) => {
    const ctrA = test.views_a > 0 ? (test.clicks_a / test.views_a * 100).toFixed(1) : 0;
    const ctrB = test.views_b > 0 ? (test.clicks_b / test.views_b * 100).toFixed(1) : 0;
    if (ctrA > ctrB) return 'A';
    if (ctrB > ctrA) return 'B';
    return 'متعادل';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">اختبارات A/B للعناوين</h3>
        <button onClick={() => setCreating(!creating)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm">
          + اختبار جديد
        </button>
      </div>

      {creating && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 space-y-2">
          <input type="text" value={form.episode_id} onChange={(e) => setForm({ ...form, episode_id: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none"
            placeholder="معرف الحلقة (Episode ID)" dir="ltr" />
          <input type="text" value={form.variant_a} onChange={(e) => setForm({ ...form, variant_a: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none"
            placeholder="العنوان A" />
          <input type="text" value={form.variant_b} onChange={(e) => setForm({ ...form, variant_b: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none"
            placeholder="العنوان B" />
          <button onClick={handleCreate} className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm">إنشاء</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto" /></div>
      ) : tests.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">لا توجد اختبارات</p>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => {
            const ctrA = test.views_a > 0 ? (test.clicks_a / test.views_a * 100).toFixed(1) : 0;
            const ctrB = test.views_b > 0 ? (test.clicks_b / test.views_b * 100).toFixed(1) : 0;
            const winner = getWinner(test);

            return (
              <div key={test.id} className="border dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">{test.episodes?.title || test.episode_id}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded ${winner === 'A' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">A: {test.variant_a}</p>
                    <p className="text-xs text-gray-400 mt-1">{test.views_a} مشاهدة · {test.clicks_a} نقرة · {ctrA}%</p>
                  </div>
                  <div className={`p-2 rounded ${winner === 'B' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">B: {test.variant_b}</p>
                    <p className="text-xs text-gray-400 mt-1">{test.views_b} مشاهدة · {test.clicks_b} نقرة · {ctrB}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
