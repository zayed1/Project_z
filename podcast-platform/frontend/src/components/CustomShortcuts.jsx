import React, { useState, useEffect, useCallback } from 'react';

/**
 * CustomShortcuts - لوحة تخصيص اختصارات لوحة المفاتيح
 * Settings panel to view and customize keyboard shortcuts
 * يعرض الاختصارات الحالية مع إمكانية تعديلها وحفظها في localStorage
 * Displays current shortcuts with edit capability, saves to localStorage
 */

// مفتاح التخزين المحلي - localStorage key
const STORAGE_KEY = 'custom_shortcuts';

// الاختصارات الافتراضية - Default keyboard shortcuts
const DEFAULT_SHORTCUTS = [
  { id: 'play_pause', label: 'تشغيل/إيقاف', labelEn: 'Play/Pause', keys: 'Space' },
  { id: 'skip_forward', label: 'تقديم 15 ثانية', labelEn: 'Skip Forward 15s', keys: 'ArrowRight' },
  { id: 'skip_backward', label: 'تأخير 15 ثانية', labelEn: 'Skip Backward 15s', keys: 'ArrowLeft' },
  { id: 'mute', label: 'كتم الصوت', labelEn: 'Mute/Unmute', keys: 'KeyM' },
  { id: 'volume_up', label: 'رفع الصوت', labelEn: 'Volume Up', keys: 'ArrowUp' },
  { id: 'volume_down', label: 'خفض الصوت', labelEn: 'Volume Down', keys: 'ArrowDown' },
  { id: 'speed_up', label: 'زيادة السرعة', labelEn: 'Speed Up', keys: 'BracketRight' },
  { id: 'speed_down', label: 'تقليل السرعة', labelEn: 'Speed Down', keys: 'BracketLeft' },
  { id: 'fullscreen', label: 'ملء الشاشة', labelEn: 'Fullscreen', keys: 'KeyF' },
  { id: 'next_episode', label: 'الحلقة التالية', labelEn: 'Next Episode', keys: 'KeyN' },
  { id: 'prev_episode', label: 'الحلقة السابقة', labelEn: 'Previous Episode', keys: 'KeyP' },
];

/**
 * تنسيق اسم المفتاح للعرض - Format key name for display
 * @param {string} code - رمز المفتاح / Key code
 * @returns {string} اسم المفتاح المنسّق / Formatted key name
 */
function formatKeyDisplay(code) {
  const keyMap = {
    Space: 'مسافة / Space',
    ArrowRight: '← سهم يمين',
    ArrowLeft: '→ سهم يسار',
    ArrowUp: '↑ سهم أعلى',
    ArrowDown: '↓ سهم أسفل',
    KeyM: 'M',
    KeyF: 'F',
    KeyN: 'N',
    KeyP: 'P',
    BracketRight: ']',
    BracketLeft: '[',
    Enter: 'Enter',
    Escape: 'Esc',
  };
  return keyMap[code] || code.replace('Key', '').replace('Digit', '');
}

export default function CustomShortcuts() {
  // قائمة الاختصارات - Shortcuts list
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);
  // معرّف الاختصار قيد التعديل - ID of shortcut being edited
  const [editingId, setEditingId] = useState(null);
  // مفتاح الانتظار - Waiting for key press
  const [waitingForKey, setWaitingForKey] = useState(false);

  // تحميل الاختصارات المحفوظة من التخزين المحلي
  // Load saved shortcuts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // دمج الاختصارات المحفوظة مع الافتراضية
        // Merge saved shortcuts with defaults
        const merged = DEFAULT_SHORTCUTS.map((defaultShortcut) => {
          const savedShortcut = parsed.find((s) => s.id === defaultShortcut.id);
          return savedShortcut ? { ...defaultShortcut, keys: savedShortcut.keys } : defaultShortcut;
        });
        setShortcuts(merged);
      }
    } catch {
      // استخدام الاختصارات الافتراضية في حالة الخطأ
      // Use default shortcuts on error
    }
  }, []);

  // حفظ الاختصارات في التخزين المحلي - Save shortcuts to localStorage
  const saveShortcuts = useCallback((updatedShortcuts) => {
    try {
      const toSave = updatedShortcuts.map(({ id, keys }) => ({ id, keys }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // تجاهل أخطاء التخزين - Ignore storage errors
    }
  }, []);

  // بدء تعديل اختصار - Start editing a shortcut
  const startEditing = useCallback((id) => {
    setEditingId(id);
    setWaitingForKey(true);
  }, []);

  // إلغاء التعديل - Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setWaitingForKey(false);
  }, []);

  // التقاط مفتاح جديد - Capture new key press
  useEffect(() => {
    if (!waitingForKey || !editingId) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // تجاهل مفاتيح التعديل وحدها - Ignore modifier keys alone
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      const newCode = e.code;

      // تحديث الاختصار بالمفتاح الجديد
      // Update shortcut with new key
      const updated = shortcuts.map((s) =>
        s.id === editingId ? { ...s, keys: newCode } : s
      );

      setShortcuts(updated);
      saveShortcuts(updated);
      setEditingId(null);
      setWaitingForKey(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForKey, editingId, shortcuts, saveShortcuts]);

  // إعادة تعيين جميع الاختصارات - Reset all shortcuts to defaults
  const resetAll = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS);
    saveShortcuts(DEFAULT_SHORTCUTS);
    setEditingId(null);
    setWaitingForKey(false);
  }, [saveShortcuts]);

  // إعادة تعيين اختصار واحد - Reset single shortcut to default
  const resetSingle = useCallback((id) => {
    const defaultShortcut = DEFAULT_SHORTCUTS.find((s) => s.id === id);
    if (!defaultShortcut) return;

    const updated = shortcuts.map((s) =>
      s.id === id ? { ...s, keys: defaultShortcut.keys } : s
    );
    setShortcuts(updated);
    saveShortcuts(updated);
  }, [shortcuts, saveShortcuts]);

  return (
    <div dir="rtl" className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* عنوان اللوحة - Panel title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            اختصارات لوحة المفاتيح
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Keyboard Shortcuts
          </p>
        </div>

        {/* زر إعادة التعيين - Reset all button */}
        <button
          onClick={resetAll}
          className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400
            bg-red-50 dark:bg-red-900/20 rounded-lg
            hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          إعادة تعيين الكل / Reset All
        </button>
      </div>

      {/* قائمة الاختصارات - Shortcuts list */}
      <div className="space-y-2">
        {shortcuts.map((shortcut) => {
          const isEditing = editingId === shortcut.id;
          const defaultKeys = DEFAULT_SHORTCUTS.find((s) => s.id === shortcut.id)?.keys;
          const isModified = shortcut.keys !== defaultKeys;

          return (
            <div
              key={shortcut.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                ${isEditing
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
                }`}
            >
              {/* معلومات الاختصار - Shortcut info */}
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {shortcut.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {shortcut.labelEn}
                </span>
              </div>

              {/* عرض المفتاح الحالي - Current key display */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  // حالة الانتظار لمفتاح جديد - Waiting for new key state
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-medium
                      bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300
                      animate-pulse">
                      اضغط مفتاحاً... / Press a key...
                    </span>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="إلغاء / Cancel"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  // عرض المفتاح الحالي مع أزرار التعديل
                  // Show current key with edit buttons
                  <>
                    <kbd className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium
                      border shadow-sm
                      ${isModified
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}>
                      {formatKeyDisplay(shortcut.keys)}
                    </kbd>

                    {/* زر التعديل - Edit button */}
                    <button
                      onClick={() => startEditing(shortcut.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400
                        hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      aria-label={`تعديل اختصار ${shortcut.label} / Edit shortcut`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {/* زر إعادة تعيين مفرد - Single reset button */}
                    {isModified && (
                      <button
                        onClick={() => resetSingle(shortcut.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 dark:hover:text-amber-400
                          hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                        aria-label={`إعادة تعيين ${shortcut.label} / Reset shortcut`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ملاحظة تعليمية - Instruction note */}
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
        انقر على أيقونة التعديل ثم اضغط المفتاح الجديد لتغيير الاختصار
        <br />
        Click the edit icon then press a new key to change the shortcut
      </p>
    </div>
  );
}
