// ============================================
// مكون الاستطلاع | Episode Poll Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function EpisodePoll({ episodeId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    api.get(`/episodes/${episodeId}/poll`, { params: { userId: user?.id } })
      .then(({ data }) => setPoll(data.poll))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [episodeId, user]);

  const handleVote = async (optionId) => {
    if (!user) { toast.error('سجل دخولك للتصويت'); return; }
    setVoting(true);
    try {
      await api.post(`/polls/${poll.id}/vote`, { option_id: optionId });
      // تحديث النتائج | Refresh results
      const { data } = await api.get(`/episodes/${episodeId}/poll`, { params: { userId: user.id } });
      setPoll(data.poll);
      toast.success('تم التصويت');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل');
    } finally {
      setVoting(false);
    }
  };

  if (loading || !poll) return null;

  const totalVotes = (poll.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);
  const hasVoted = !!poll.userVote;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-lg p-4 mt-3" role="region" aria-label="استطلاع رأي">
      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm mb-3">{poll.question}</p>

      <div className="space-y-2">
        {(poll.options || []).map((option) => {
          const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = poll.userVote === option.id;

          return (
            <button
              key={option.id}
              onClick={() => !hasVoted && handleVote(option.id)}
              disabled={hasVoted || voting}
              className={`w-full text-right relative rounded-lg border transition-all overflow-hidden ${
                isSelected
                  ? 'border-primary-500 bg-white dark:bg-gray-800'
                  : hasVoted
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400'
              }`}
            >
              {hasVoted && (
                <div
                  className="absolute inset-y-0 right-0 bg-primary-100 dark:bg-primary-900/30 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-800 dark:text-gray-100">
                  {isSelected && '✓ '}{option.text}
                </span>
                {hasVoted && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {totalVotes > 0 && (
        <p className="text-xs text-gray-400 mt-2">{totalVotes} صوت</p>
      )}
    </div>
  );
}
