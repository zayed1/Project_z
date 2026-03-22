// ============================================
// صفحة تفاصيل البودكاست | Podcast Detail Page
// مع إعجاب + نص مكتوب + بحث + QR + مقترحات
// ============================================
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI, commentsAPI, episodesAPI } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { isInListenLater, addToListenLater, removeFromListenLater } from '../utils/listenLater';
import { useSwipe } from '../components/SwipeHandler';
import LikeDislike from '../components/LikeDislike';
import TranscriptViewer from '../components/TranscriptViewer';
import SuggestedPodcasts from '../components/SuggestedPodcasts';
import QRCode from '../components/QRCode';
import FollowButton from '../components/FollowButton';
import TimestampShare from '../components/TimestampShare';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CommentReplies from '../components/CommentReplies';
import OfflineDownload from '../components/OfflineDownload';
import ClipCreator from '../components/ClipCreator';
import EpisodePoll from '../components/EpisodePoll';
import EmbedCode from '../components/EmbedCode';
import StarRating from '../components/StarRating';
import SocialShare from '../components/SocialShare';
import DrivingMode from '../components/DrivingMode';
import TTSPreview from '../components/TTSPreview';
import ChapterMarkers from '../components/ChapterMarkers';
import TimedComments from '../components/TimedComments';
import EpisodeNotes from '../components/EpisodeNotes';
import FocusMode from '../components/FocusMode';
import MoodTracker from '../components/MoodTracker';
import GiftEpisode from '../components/GiftEpisode';
import MomentShare from '../components/MomentShare';
import EpisodeQuiz from '../components/EpisodeQuiz';
import ListenHeatmap from '../components/ListenHeatmap';
import SimilarEpisodes from '../components/SimilarEpisodes';
import FanWall from '../components/FanWall';
import NowPlayingIndicator from '../components/NowPlayingIndicator';
import EpisodeProgressBar from '../components/EpisodeProgressBar';
import { DetailSkeleton } from '../components/EnhancedSkeleton';

export default function PodcastDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { playEpisode, playFromTimestamp, currentEpisode, isPlaying } = usePlayer();
  const toast = useToast();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [listenLaterIds, setListenLaterIds] = useState(new Set());
  const [expandedTranscript, setExpandedTranscript] = useState({});

  // بحث في الحلقات | Episode search
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // التعليقات | Comments
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState(false);

  // سحب للتنقل | Swipe navigation
  const swipeHandlers = useSwipe({
    onSwipeRight: () => window.history.back(),
  });

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await podcastsAPI.getById(id);
        setPodcast(data.podcast);
        const saved = (data.podcast.episodes || [])
          .filter((ep) => isInListenLater(ep.id))
          .map((ep) => ep.id);
        setListenLaterIds(new Set(saved));
      } catch {
        setError('فشل في تحميل البودكاست');
      } finally {
        setLoading(false);
      }
    }
    fetch();
    setSearchResults(null);
    setEpisodeSearch('');
  }, [id]);

  // معالجة رابط الوقت المحدد | Handle timestamp URL
  useEffect(() => {
    if (!podcast) return;
    const epId = searchParams.get('ep');
    const time = parseInt(searchParams.get('t'), 10);
    if (epId && time > 0) {
      const ep = (podcast.episodes || []).find((e) => e.id === epId);
      if (ep) playFromTimestamp(ep, podcast.title, podcast.episodes, time);
    }
  }, [podcast, searchParams, playFromTimestamp]);

  // بحث في الحلقات | Search episodes
  useEffect(() => {
    if (!episodeSearch || episodeSearch.length < 2) {
      setSearchResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await episodesAPI.search(id, episodeSearch);
        setSearchResults(data.episodes || []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [episodeSearch, id]);

  const toggleListenLater = (episode) => {
    if (listenLaterIds.has(episode.id)) {
      removeFromListenLater(episode.id);
      setListenLaterIds((prev) => { const s = new Set(prev); s.delete(episode.id); return s; });
      toast.info('تم إزالة الحلقة من القائمة');
    } else {
      addToListenLater(episode);
      setListenLaterIds((prev) => new Set(prev).add(episode.id));
      toast.success('تم حفظ الحلقة للاستماع لاحقاً');
    }
  };

  const shareUrl = `${window.location.origin}/podcast/${id}`;

  const socialShare = (platform) => {
    const title = podcast?.title || 'بودكاست';
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('تم نسخ الرابط');
  };

  const downloadEpisode = (episode) => {
    const a = document.createElement('a');
    a.href = episode.audio_file_url;
    a.download = `${episode.title}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info('جاري تحميل الحلقة...');
  };

  const toggleComments = async (episodeId) => {
    const isOpen = showComments[episodeId];
    setShowComments((prev) => ({ ...prev, [episodeId]: !isOpen }));

    if (!isOpen && !comments[episodeId]) {
      try {
        const { data } = await commentsAPI.getAll(episodeId);
        setComments((prev) => ({ ...prev, [episodeId]: data.comments || [] }));
      } catch { /* ignore */ }
    }
  };

  const submitComment = async (episodeId) => {
    const text = commentInput[episodeId]?.trim();
    if (!text) return;
    setSubmittingComment(true);
    try {
      const { data } = await commentsAPI.add(episodeId, text);
      setComments((prev) => ({
        ...prev,
        [episodeId]: [...(prev[episodeId] || []), data.comment],
      }));
      setCommentInput((prev) => ({ ...prev, [episodeId]: '' }));
      toast.success('تم إضافة التعليق');
    } catch {
      toast.error('يجب تسجيل الدخول لإضافة تعليق');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !podcast) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg">{error || 'البودكاست غير موجود'}</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">العودة للرئيسية</Link>
      </div>
    );
  }

  const allEpisodes = [...(podcast.episodes || [])].sort((a, b) => {
    const diff = (a.episode_number || 0) - (b.episode_number || 0);
    return sortAsc ? diff : -diff;
  });

  const displayEpisodes = searchResults !== null ? searchResults : allEpisodes;

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  const rssUrl = `${apiBase}/rss/${podcast.id}`;

  return (
    <div className="max-w-4xl mx-auto pb-24" {...swipeHandlers}>
      <Helmet>
        <title>{podcast.title} - منصة البودكاست</title>
        <meta name="description" content={podcast.description || podcast.title} />
        <meta property="og:title" content={podcast.title} />
        <meta property="og:description" content={podcast.description || ''} />
        {podcast.cover_image_url && <meta property="og:image" content={podcast.cover_image_url} />}
      </Helmet>

      {/* معلومات البودكاست | Podcast Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-72 md:h-72 aspect-square bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0">
            {podcast.cover_image_url ? (
              <img src={podcast.cover_image_url} alt={podcast.title} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-24 h-24 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
              </svg>
            )}
          </div>
          <div className="p-6 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{podcast.title}</h1>
            <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
              {podcast.creator?.username || 'غير معروف'}
            </p>
            {podcast.category && (
              <span className="inline-block text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full mb-3 w-fit">
                {podcast.category.name}
              </span>
            )}
            {podcast.description ? (
              <MarkdownRenderer content={podcast.description} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">لا يوجد وصف</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400 flex-wrap">
              <span>{podcast.episodes?.length || 0} حلقة</span>
              <FollowButton podcastId={id} />
              <a href={rssUrl} target="_blank" rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
                RSS
              </a>

              {/* مشاركة سوشال | Social Share */}
              <div className="flex items-center gap-2">
                <button onClick={() => socialShare('twitter')} className="text-[#1DA1F2] hover:opacity-80" title="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </button>
                <button onClick={() => socialShare('whatsapp')} className="text-[#25D366] hover:opacity-80" title="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                </button>
                <button onClick={() => socialShare('telegram')} className="text-[#0088cc] hover:opacity-80" title="Telegram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </button>
                <button onClick={copyLink} className="text-gray-400 hover:text-primary-500" title="نسخ الرابط">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </button>
                <QRCode url={shareUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الحلقات | Episodes List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">الحلقات</h2>
          <div className="flex items-center gap-2">
            {/* بحث في الحلقات | Episode Search */}
            <div className="relative">
              <input
                type="text"
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                placeholder="ابحث في الحلقات..."
                className="text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-1 focus:ring-primary-500 w-40"
              />
              {searching && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <div className="animate-spin w-3 h-3 border border-primary-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            <button onClick={() => setSortAsc(!sortAsc)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 flex items-center gap-1">
              {sortAsc ? 'الأقدم أولاً' : 'الأحدث أولاً'}
              <svg className={`w-4 h-4 transition-transform ${sortAsc ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
          </div>
        </div>

        {searchResults !== null && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              نتائج البحث: {searchResults.length} حلقة
            </span>
            <button onClick={() => { setEpisodeSearch(''); setSearchResults(null); }} className="text-xs text-primary-500 hover:underline">
              إلغاء البحث
            </button>
          </div>
        )}

        {displayEpisodes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {searchResults !== null ? 'لا توجد نتائج' : 'لا توجد حلقات بعد'}
          </p>
        ) : (
          <div className="space-y-2">
            {displayEpisodes.map((episode) => {
              const active = currentEpisode?.id === episode.id;
              const epComments = comments[episode.id] || [];
              const isCommentsOpen = showComments[episode.id];

              return (
                <div key={episode.id} className={`rounded-lg border transition-colors ${
                  active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => playEpisode(episode, podcast.title, allEpisodes)}
                        className="flex items-center gap-3 flex-1 text-right min-w-0"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {active ? (
                            <NowPlayingIndicator isPlaying={isPlaying} />
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                            {episode.episode_number && `${episode.episode_number}. `}{episode.title}
                          </h3>
                          {episode.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              <MarkdownRenderer content={episode.description} className="!text-sm !text-gray-500 dark:!text-gray-400" />
                            </div>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {episode.listen_count > 0 && <span className="text-xs text-gray-400">{episode.listen_count}</span>}

                        {/* إعجاب | Like/Dislike */}
                        <LikeDislike episodeId={episode.id} />

                        {/* تحميل | Download */}
                        <button onClick={() => downloadEpisode(episode)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors" title="تحميل">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>

                        {/* استمع لاحقاً | Listen Later */}
                        <button onClick={() => toggleListenLater(episode)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            listenLaterIds.has(episode.id) ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`} title={listenLaterIds.has(episode.id) ? 'إزالة' : 'استمع لاحقاً'}>
                          <svg className="w-4 h-4" fill={listenLaterIds.has(episode.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>

                        {/* حفظ للاستماع بدون انترنت | Offline Download */}
                        <OfflineDownload audioUrl={episode.audio_file_url} />

                        {/* مشاركة وقت محدد | Timestamp Share */}
                        <TimestampShare podcastId={id} episodeId={episode.id} />

                        {/* مقطع مميز | Clip Creator */}
                        <ClipCreator episodeId={episode.id} />

                        {/* كود التضمين | Embed */}
                        <EmbedCode episodeId={episode.id} />

                        {/* مشاركة اجتماعية | Social Share */}
                        <SocialShare title={episode.title} url={`${window.location.origin}/podcast/${id}?ep=${episode.id}`} />

                        {/* قراءة الوصف | TTS Preview */}
                        <TTSPreview text={episode.description} />

                        {/* إهداء | Gift */}
                        <GiftEpisode episodeId={episode.id} episodeTitle={episode.title} />

                        {/* مشاركة لحظة | Moment Share */}
                        <MomentShare episodeId={episode.id} episodeTitle={episode.title} coverUrl={podcast.cover_image_url} />

                        {/* وضع القيادة | Driving Mode */}
                        <DrivingMode />

                        {/* تعليقات | Comments toggle */}
                        <button onClick={() => toggleComments(episode.id)}
                          className={`p-1.5 rounded-lg transition-colors ${isCommentsOpen ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          title="التعليقات">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* النص المكتوب | Transcript */}
                    {episode.transcript && (
                      <TranscriptViewer transcript={episode.transcript} />
                    )}

                    {/* تقييم بالنجوم | Star Rating */}
                    <div className="mt-2">
                      <StarRating episodeId={episode.id} />
                    </div>

                    {/* علامات الفصول | Chapter Markers */}
                    <ChapterMarkers episodeId={episode.id} />

                    {/* تعليقات موقّتة | Timed Comments */}
                    <TimedComments episodeId={episode.id} />

                    {/* ملاحظات شخصية | Episode Notes */}
                    <EpisodeNotes episodeId={episode.id} />

                    {/* خريطة الاستماع الحرارية | Listen Heatmap */}
                    <ListenHeatmap episodeId={episode.id} />

                    {/* تتبع المزاج | Mood Tracker */}
                    <MoodTracker episodeId={episode.id} />

                    {/* تحدي الحلقة | Episode Quiz */}
                    <EpisodeQuiz episodeTitle={episode.title} />

                    {/* شريط التقدم | Progress Bar */}
                    <EpisodeProgressBar episodeId={episode.id} duration={episode.duration} />

                    {/* استطلاع | Poll */}
                    <EpisodePoll episodeId={episode.id} />
                  </div>

                  {/* قسم التعليقات | Comments Section */}
                  {isCommentsOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
                      {epComments.length > 0 ? (
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                          {epComments.map((c) => (
                            <div key={c.id}>
                              <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                                  {(c.user?.username || '?')[0]}
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.user?.username || 'مجهول'}</span>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.content}</p>
                                  {!c.parent_id && <CommentReplies commentId={c.id} />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-3">لا توجد تعليقات بعد</p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="أضف تعليقاً..."
                          value={commentInput[episode.id] || ''}
                          onChange={(e) => setCommentInput((prev) => ({ ...prev, [episode.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && submitComment(episode.id)}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={() => submitComment(episode.id)}
                          disabled={submittingComment}
                          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                        >
                          إرسال
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* حلقات مشابهة | Similar Episodes */}
      <SimilarEpisodes episodeTitle={allEpisodes[0]?.title} podcastId={id} />

      {/* جدار المعجبين | Fan Wall */}
      <FanWall podcastId={id} />

      {/* وضع التركيز | Focus Mode */}
      <FocusMode />

      {/* بودكاست مقترحة | Suggested Podcasts */}
      <SuggestedPodcasts podcastId={id} />
    </div>
  );
}
