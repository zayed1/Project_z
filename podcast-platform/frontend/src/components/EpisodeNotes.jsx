// ============================================
// ملاحظات الحلقة | Episode Notes Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function EpisodeNotes({ episodeId }) {
  const { user } = useAuth();
  const toast = useToast();
  const { currentEpisode, currentTime } = usePlayer();
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const isActive = currentEpisode?.id === episodeId;
  const fmt = (s) => s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '';

  useEffect(() => {
    if (!user || !open) return;
    api.get(`/me/notes/${episodeId}`)
      .then(({ data }) => setNotes(data.notes || []))
      .catch(() => {});
  }, [episodeId, user, open]);

  const handleSave = async () => {
    if (!input.trim()) return;
    try {
      const { data } = await api.post('/me/notes', {
        episode_id: episodeId,
        content: input.trim(),
        timestamp: isActive ? currentTime : null,
      });
      setNotes([...notes, data.note]);
      setInput('');
      toast.success('تم حفظ الملاحظة');
    } catch { toast.error('فشل'); }
  };

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/me/notes/${noteId}`);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch { toast.error('فشل'); }
  };

  if (!user) return null;

  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-primary-500 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        ملاحظاتي ({notes.length})
      </button>

      {open && (
        <div className="mt-2 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-3">
          <div className="flex gap-2 mb-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 px-3 py-1.5 text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none"
              placeholder={isActive ? `ملاحظة عند ${fmt(currentTime)}...` : 'اكتب ملاحظة...'} />
            <button onClick={handleSave} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm">حفظ</button>
          </div>

          {notes.length > 0 && (
            <div className="space-y-1 max-h-[150px] overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="flex items-start gap-2 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-sm">
                  {note.timestamp && <span className="text-xs text-amber-600 font-mono min-w-[36px]" dir="ltr">{fmt(note.timestamp)}</span>}
                  <span className="text-gray-700 dark:text-gray-300 flex-1">{note.content}</span>
                  <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
