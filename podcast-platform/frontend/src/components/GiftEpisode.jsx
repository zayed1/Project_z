import React, { useState } from 'react';
import api from '../utils/api';

/**
 * GiftEpisode - إهداء حلقة | Gift Episode Component
 * زر/نافذة لإرسال حلقة كهدية مع رسالة شخصية
 * Button/modal to send an episode as a gift with a personal message
 */
const GiftEpisode = ({ episodeId, episodeTitle, coverUrl }) => {
  // حالة النافذة المنبثقة | Modal state
  const [isOpen, setIsOpen] = useState(false);
  // اسم المستلم | Recipient username
  const [recipient, setRecipient] = useState('');
  // الرسالة الشخصية | Personal message
  const [personalMessage, setPersonalMessage] = useState('');
  // حالة الإرسال | Sending state
  const [sending, setSending] = useState(false);
  // حالة النجاح | Success state
  const [success, setSuccess] = useState(false);
  // رسالة الخطأ | Error message
  const [error, setError] = useState('');
  // عرض المعاينة | Show preview
  const [showPreview, setShowPreview] = useState(false);

  /**
   * فتح النافذة المنبثقة | Open modal
   */
  const openModal = () => {
    setIsOpen(true);
    setRecipient('');
    setPersonalMessage('');
    setSuccess(false);
    setError('');
    setShowPreview(false);
  };

  /**
   * إغلاق النافذة المنبثقة | Close modal
   */
  const closeModal = () => {
    setIsOpen(false);
  };

  /**
   * إرسال الهدية | Send the gift
   */
  const handleSendGift = async () => {
    if (!recipient.trim()) {
      setError('يرجى إدخال اسم المستلم | Please enter recipient username');
      return;
    }
    setSending(true);
    setError('');
    try {
      await api.post('/api/gifts', {
        episodeId,
        recipientUsername: recipient.trim(),
        message: personalMessage.trim(),
      });
      setSuccess(true);
    } catch {
      setError('فشل إرسال الهدية | Failed to send gift');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* زر الإهداء | Gift button */}
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700
                   text-white rounded-lg font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        إهداء الحلقة | Gift Episode
      </button>

      {/* النافذة المنبثقة | Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* خلفية معتمة | Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* محتوى النافذة | Modal content */}
          <div
            dir="rtl"
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl
                       shadow-2xl overflow-hidden z-10"
          >
            {/* رأس النافذة | Modal header */}
            <div className="bg-gradient-to-l from-pink-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                إهداء حلقة | Gift an Episode
              </h2>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* حالة النجاح | Success state */}
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/40
                                  rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    تم إرسال الهدية بنجاح!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    تم إرسال الحلقة إلى {recipient} | Episode sent to {recipient}
                  </p>
                  <button
                    onClick={closeModal}
                    className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800
                               dark:text-gray-200 rounded-lg hover:bg-gray-300
                               dark:hover:bg-gray-600 transition-colors"
                  >
                    إغلاق | Close
                  </button>
                </div>
              ) : (
                <>
                  {/* معلومات الحلقة | Episode info */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={episodeTitle}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">الحلقة المهداة | Gifted Episode</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{episodeTitle}</p>
                    </div>
                  </div>

                  {/* البحث عن المستلم | Recipient search */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      اسم المستلم | Recipient Username
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="ابحث عن المستخدم... | Search for user..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* الرسالة الشخصية | Personal message */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      رسالة شخصية (اختياري) | Personal Message (optional)
                    </label>
                    <textarea
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      placeholder="اكتب رسالتك هنا... | Write your message here..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-left">
                      {personalMessage.length}/500
                    </p>
                  </div>

                  {/* زر المعاينة | Preview toggle */}
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-pink-600 dark:text-pink-400 hover:underline mb-4"
                  >
                    {showPreview ? 'إخفاء المعاينة | Hide Preview' : 'معاينة بطاقة الهدية | Preview Gift Card'}
                  </button>

                  {/* معاينة بطاقة الهدية | Gift card preview */}
                  {showPreview && (
                    <div className="mb-4 border-2 border-dashed border-pink-300 dark:border-pink-700
                                    rounded-xl p-4 bg-gradient-to-br from-pink-50 to-purple-50
                                    dark:from-pink-900/20 dark:to-purple-900/20">
                      <div className="text-center">
                        <p className="text-xs text-pink-500 dark:text-pink-400 mb-2">
                          هدية لك | A Gift for You
                        </p>
                        {coverUrl && (
                          <img
                            src={coverUrl}
                            alt={episodeTitle}
                            className="w-24 h-24 rounded-xl mx-auto mb-3 object-cover shadow-lg"
                          />
                        )}
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {episodeTitle}
                        </h4>
                        {personalMessage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2
                                        border-t border-pink-200 dark:border-pink-800 pt-2">
                            &ldquo;{personalMessage}&rdquo;
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          إلى: {recipient || '...'} | To: {recipient || '...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* رسالة الخطأ | Error message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                                    text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  {/* أزرار الإجراءات | Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSendGift}
                      disabled={sending || !recipient.trim()}
                      className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium
                                 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {sending ? 'جاري الإرسال... | Sending...' : 'إرسال الهدية | Send Gift'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800
                                 dark:text-gray-200 rounded-lg hover:bg-gray-300
                                 dark:hover:bg-gray-600 transition-colors"
                    >
                      إلغاء | Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GiftEpisode;
