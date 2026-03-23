// ============================================
// حفظ تلقائي للنماذج | Auto-save Forms Hook
// يحفظ بيانات النماذج في localStorage لمنع فقدان البيانات
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useAutoSave - حفظ تلقائي لبيانات النموذج
 * @param {string} key - مفتاح التخزين الفريد
 * @param {object} initialValues - القيم الأولية
 * @param {number} delay - تأخير الحفظ (مللي ثانية)
 * @returns {{ values, setValue, clearSaved, hasSavedData, restoreSaved }}
 */
export default function useAutoSave(key, initialValues = {}, delay = 1000) {
  const storageKey = `autosave_${key}`;
  const timeoutRef = useRef(null);

  // استرجاع البيانات المحفوظة | Restore saved data
  const getSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // تجاهل البيانات المحفوظة الأقدم من 24 ساعة | Ignore data older than 24h
        if (parsed._timestamp && Date.now() - parsed._timestamp < 86400000) {
          const { _timestamp, ...data } = parsed;
          return data;
        }
        localStorage.removeItem(storageKey);
      }
    } catch {}
    return null;
  }, [storageKey]);

  const savedData = getSavedData();
  const [values, setValues] = useState(savedData || initialValues);
  const hasSavedData = !!savedData;

  // تعديل قيمة واحدة | Set single value
  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // حفظ تلقائي مع تأخير | Auto-save with debounce
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // تحقق أن هناك بيانات فعلية | Check there's actual data
      const hasData = Object.values(values).some((v) => v && v !== '');
      if (hasData) {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ ...values, _timestamp: Date.now() }));
        } catch {}
      }
    }, delay);
    return () => clearTimeout(timeoutRef.current);
  }, [values, storageKey, delay]);

  // مسح البيانات المحفوظة | Clear saved data
  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // استرجاع البيانات المحفوظة | Restore saved data
  const restoreSaved = useCallback(() => {
    const data = getSavedData();
    if (data) setValues(data);
  }, [getSavedData]);

  return { values, setValue, setValues, clearSaved, hasSavedData, restoreSaved };
}
