import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

/**
 * ListenRoom - غرفة الاستماع الجماعي | Group Listening Room Component
 * واجهة غرفة الاستماع الجماعي مع محادثة ومشغل حلقة
 * Group listening room UI with chat and episode player
 */
const ListenRoom = () => {
  // حالة العرض: إنشاء غرفة أو داخل غرفة | View state: create room or in room
  const [view, setView] = useState('create'); // 'create' | 'room'
  // بيانات إنشاء الغرفة | Room creation form data
  const [roomForm, setRoomForm] = useState({ name: '', episodeId: '' });
  // بيانات الغرفة الحالية | Current room data
  const [room, setRoom] = useState(null);
  // رسائل المحادثة | Chat messages
  const [messages, setMessages] = useState([]);
  // رسالة جديدة | New message input
  const [newMessage, setNewMessage] = useState('');
  // الأعضاء | Members
  const [memberCount, setMemberCount] = useState(0);
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(false);
  // رسالة الخطأ | Error message
  const [error, setError] = useState('');
  // حالة التشغيل | Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  // الوقت الحالي | Current time
  const [currentTime, setCurrentTime] = useState(0);
  // مرجع حاوية الرسائل | Messages container ref
  const messagesEndRef = useRef(null);
  // مرجع مؤقت الاستقصاء | Polling interval ref
  const pollingRef = useRef(null);

  /**
   * التمرير لأسفل تلقائيًا عند إضافة رسالة | Auto-scroll on new message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * تنظيف الاستقصاء عند الخروج | Cleanup polling on unmount
   */
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  /**
   * بدء الاستقصاء للرسائل والأعضاء | Start polling for messages and members
   * محاكاة Socket.io بالاستقصاء الدوري
   * Simulates Socket.io with periodic polling
   */
  const startPolling = useCallback((roomId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/rooms/${roomId}/status`);
        if (res.data) {
          setMessages(res.data.messages || []);
          setMemberCount(res.data.memberCount || 0);
          setCurrentTime(res.data.currentTime || 0);
          setIsPlaying(res.data.isPlaying || false);
        }
      } catch {
        // صامت - لا نعرض خطأ للاستقصاء | Silent - don't show polling errors
      }
    }, 3000); // استقصاء كل 3 ثوانٍ | Poll every 3 seconds
  }, []);

  /**
   * إنشاء غرفة جديدة | Create a new room
   */
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim() || !roomForm.episodeId.trim()) {
      setError('يرجى ملء جميع الحقول | Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/rooms', {
        name: roomForm.name,
        episodeId: roomForm.episodeId,
      });
      setRoom(res.data);
      setView('room');
      setMemberCount(1);
      startPolling(res.data.id);
    } catch {
      setError('فشل إنشاء الغرفة | Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  /**
   * الانضمام لغرفة موجودة | Join an existing room
   */
  const handleJoinRoom = async (roomId) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/api/rooms/${roomId}/join`);
      setRoom(res.data);
      setView('room');
      startPolling(roomId);
    } catch {
      setError('فشل الانضمام للغرفة | Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  /**
   * مغادرة الغرفة | Leave room
   */
  const handleLeaveRoom = async () => {
    if (!room) return;
    try {
      await api.post(`/api/rooms/${room.id}/leave`);
    } catch {
      // تجاهل أخطاء المغادرة | Ignore leave errors
    }
    if (pollingRef.current) clearInterval(pollingRef.current);
    setRoom(null);
    setMessages([]);
    setView('create');
    setMemberCount(0);
  };

  /**
   * إرسال رسالة | Send message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !room) return;
    try {
      await api.post(`/api/rooms/${room.id}/messages`, {
        content: newMessage.trim(),
      });
      // إضافة الرسالة محليًا | Add message locally
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: newMessage.trim(),
          userName: 'أنت | You',
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    } catch {
      setError('فشل إرسال الرسالة | Failed to send message');
    }
  };

  /**
   * تبديل التشغيل/الإيقاف | Toggle play/pause
   */
  const togglePlayback = async () => {
    if (!room) return;
    try {
      await api.post(`/api/rooms/${room.id}/playback`, {
        isPlaying: !isPlaying,
        currentTime,
      });
      setIsPlaying(!isPlaying);
    } catch {
      setError('فشل التحكم في التشغيل | Failed to control playback');
    }
  };

  /**
   * تنسيق الوقت | Format time
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* العنوان | Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          غرفة الاستماع الجماعي
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          استمع مع أصدقائك في الوقت الحقيقي | Listen with friends in real-time
        </p>

        {/* رسالة الخطأ | Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError('')} className="float-left font-bold">×</button>
          </div>
        )}

        {/* عرض إنشاء الغرفة | Create Room View */}
        {view === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              إنشاء غرفة جديدة | Create New Room
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              {/* اسم الغرفة | Room name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الغرفة | Room Name
                </label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: جلسة الاستماع المسائية | e.g., Evening Listening Session"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             placeholder-gray-400 dark:placeholder-gray-500
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* اختيار الحلقة | Select episode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اختر الحلقة | Select Episode
                </label>
                <input
                  type="text"
                  value={roomForm.episodeId}
                  onChange={(e) => setRoomForm((p) => ({ ...p, episodeId: e.target.value }))}
                  placeholder="معرّف الحلقة | Episode ID"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             placeholder-gray-400 dark:placeholder-gray-500
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                           rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإنشاء... | Creating...' : 'إنشاء الغرفة | Create Room'}
              </button>
            </form>

            {/* أو الانضمام لغرفة | Or join a room */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                أو انضم لغرفة موجودة | Or Join an Existing Room
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="أدخل معرّف الغرفة | Enter room ID"
                  id="joinRoomId"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  onClick={() => {
                    const id = document.getElementById('joinRoomId').value;
                    if (id) handleJoinRoom(id);
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium
                             rounded-lg transition-colors disabled:bg-gray-400"
                >
                  انضم | Join
                </button>
              </div>
            </div>
          </div>
        )}

        {/* عرض الغرفة | Room View */}
        {view === 'room' && room && (
          <div className="space-y-4">
            {/* شريط معلومات الغرفة | Room info bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {room.name || 'غرفة الاستماع'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  معرّف الغرفة: {room.id} | Room ID: {room.id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* عدد الأعضاء | Member count */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="font-medium">{memberCount}</span>
                </div>

                {/* زر المغادرة | Leave button */}
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400
                             rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/60
                             transition-colors"
                >
                  مغادرة | Leave
                </button>
              </div>
            </div>

            {/* مشغل الحلقة | Episode Player */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                المشغل | Player
              </h3>
              <div className="flex items-center gap-4">
                {/* زر التشغيل/الإيقاف | Play/Pause button */}
                <button
                  onClick={togglePlayback}
                  className="w-14 h-14 flex items-center justify-center rounded-full
                             bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* شريط التقدم | Progress bar */}
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(currentTime / (room.duration || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(room.duration || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* المحادثة | Chat */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col" style={{ height: '400px' }}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  المحادثة | Chat
                </h3>
              </div>

              {/* قائمة الرسائل | Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-gray-500 py-8">
                    لا توجد رسائل بعد. ابدأ المحادثة! | No messages yet. Start chatting!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      {/* أيقونة المستخدم | User avatar */}
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center
                                      justify-center text-blue-600 dark:text-blue-400 text-sm font-bold flex-shrink-0">
                        {(msg.userName || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {msg.userName}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* إدخال الرسالة | Message input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالة... | Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             placeholder-gray-400 dark:placeholder-gray-500
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                             font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  إرسال | Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListenRoom;
