// ============================================
// المشغل العام المحسّن | Enhanced Fixed Global Audio Player
// مع الوقت المتبقي + Buffer progress + اختصارات لوحة المفاتيح
// ============================================
import { usePlayer } from '../context/PlayerContext';
import { useState, useEffect, useRef } from 'react';
import DrivingMode from './DrivingMode';
import AudioEqualizer from './AudioEqualizer';
import PlayQueue from './PlayQueue';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [15, 30, 45, 60, 90];

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GlobalPlayer() {
  const {
    currentEpisode, podcastTitle, isPlaying, currentTime, duration, playbackRate,
    hasNext, hasPrev, sleepTimer, audioRef, volume, setVolume,
    togglePlay, seek, skipForward, skipBackward, changeSpeed,
    playNext, playPrev, startSleepTimer, cancelSleepTimer,
  } = usePlayer();

  const [showSpeed, setShowSpeed] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [drivingMode, setDrivingMode] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const volumeRef = useRef(null);

  // تتبع Buffer progress | Track buffer progress
  useEffect(() => {
    if (!audioRef?.current) return;
    const audio = audioRef.current;
    const updateBuffer = () => {
      if (audio.buffered.length > 0 && audio.duration) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setBuffered((bufferedEnd / audio.duration) * 100);
      }
    };
    audio.addEventListener('progress', updateBuffer);
    audio.addEventListener('loadedmetadata', updateBuffer);
    return () => {
      audio.removeEventListener('progress', updateBuffer);
      audio.removeEventListener('loadedmetadata', updateBuffer);
    };
  }, [audioRef, currentEpisode]);

  if (!currentEpisode) return null;

  if (drivingMode) return <DrivingMode onClose={() => setDrivingMode(false)} />;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const remaining = duration - currentTime;

  const handleBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        {/* شريط التقدم مع Buffer | Progress Bar with Buffer */}
        <div
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer mb-3 group relative"
          onClick={handleBarClick}
        >
          {/* Buffer progress */}
          <div
            className="absolute h-full bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-300"
            style={{ width: `${buffered}%` }}
          />
          {/* Playback progress */}
          <div
            className="h-full bg-primary-500 rounded-full relative transition-all duration-150 z-10"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md border-2 border-white dark:border-gray-800" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* معلومات الحلقة | Episode Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{currentEpisode.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{podcastTitle}</p>
          </div>

          {/* أزرار التحكم | Controls */}
          <div className="flex items-center gap-2">
            <button onClick={playPrev} disabled={!hasPrev}
              className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors disabled:opacity-30" title="الحلقة السابقة">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>

            <button onClick={skipBackward} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors" title="رجوع 15 ثانية (←)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 3C17.15 3 21.08 6.03 22.45 10.16l-1.8.67C19.53 7.33 16.28 5 12.5 5c-2.9 0-5.47 1.38-7.12 3.5H9v2H3V4.5h2v3.18C6.86 5.29 9.5 3 12.5 3zM6 13h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2v-2z"/></svg>
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105"
              title={isPlaying ? 'إيقاف (مسافة)' : 'تشغيل (مسافة)'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg className="w-5 h-5 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <button onClick={skipForward} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors" title="تقديم 15 ثانية (→)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.5 3C6.85 3 2.92 6.03 1.55 10.16l1.8.67C4.47 7.33 7.72 5 11.5 5c2.9 0 5.47 1.38 7.12 3.5H15v2h6V4.5h-2v3.18C17.14 5.29 14.5 3 11.5 3zM18 13h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2z"/></svg>
            </button>

            <button onClick={playNext} disabled={!hasNext}
              className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors disabled:opacity-30" title="الحلقة التالية">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>

          {/* الوقت والسرعة والنوم | Time, Speed & Sleep */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {/* الوقت الحالي والمتبقي | Current & remaining time */}
            <div className="flex items-center gap-1.5 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span>{formatTime(duration)}</span>
              <span className="text-gray-300 dark:text-gray-600 mx-0.5">|</span>
              <span className="text-primary-500 dark:text-primary-400" title="الوقت المتبقي">
                -{formatTime(remaining)}
              </span>
            </div>

            {/* شريط الصوت | Volume Slider */}
            <div className="relative" ref={volumeRef}>
              <button
                onClick={() => { setShowVolume(!showVolume); setShowSpeed(false); setShowSleep(false); setShowShortcuts(false); }}
                className="bg-gray-100 dark:bg-gray-700 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={`الصوت ${Math.round((volume || 1) * 100)}% (M للكتم)`}
              >
                {(volume || 1) === 0 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                ) : (volume || 1) < 0.5 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                )}
              </button>
              {showVolume && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-lg border dark:border-gray-700 p-3 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-gray-400 tabular-nums">{Math.round((volume || 1) * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume || 1}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1.5 accent-primary-500 cursor-pointer"
                    style={{ writingMode: 'horizontal-tb' }}
                  />
                  <button
                    onClick={() => setVolume(volume > 0 ? 0 : 1)}
                    className="text-[10px] text-gray-400 hover:text-primary-500"
                  >
                    {volume > 0 ? 'كتم' : 'إلغاء الكتم'}
                  </button>
                </div>
              )}
            </div>

            {/* مؤقت النوم | Sleep Timer */}
            <div className="relative">
              <button
                onClick={() => { setShowSleep(!showSleep); setShowSpeed(false); setShowShortcuts(false); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  sleepTimer ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="مؤقت النوم"
              >
                {sleepTimer ? `${sleepTimer}د` : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {showSleep && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 py-1 min-w-[80px]">
                  {sleepTimer && (
                    <button
                      onClick={() => { cancelSleepTimer(); setShowSleep(false); }}
                      className="block w-full text-center px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      إلغاء
                    </button>
                  )}
                  {SLEEP_OPTIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => { startSleepTimer(m); setShowSleep(false); }}
                      className={`block w-full text-center px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${sleepTimer === m ? 'text-primary-500 font-bold' : ''}`}
                    >
                      {m} دقيقة
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* معادل صوتي | Equalizer */}
            <AudioEqualizer />

            {/* قائمة الانتظار | Queue */}
            <PlayQueue />

            {/* وضع القيادة | Driving Mode */}
            <button
              onClick={() => setDrivingMode(true)}
              className="bg-gray-100 dark:bg-gray-700 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="وضع القيادة"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>

            {/* اختصارات لوحة المفاتيح | Keyboard Shortcuts */}
            <div className="relative">
              <button
                onClick={() => { setShowShortcuts(!showShortcuts); setShowSpeed(false); setShowSleep(false); }}
                className="bg-gray-100 dark:bg-gray-700 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="اختصارات لوحة المفاتيح"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </button>
              {showShortcuts && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-lg border dark:border-gray-700 p-3 min-w-[180px] text-xs">
                  <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">اختصارات لوحة المفاتيح</p>
                  <div className="space-y-1.5 text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between"><span>تشغيل/إيقاف</span><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">Space</kbd></div>
                    <div className="flex justify-between"><span>تقديم 15 ث</span><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">→</kbd></div>
                    <div className="flex justify-between"><span>رجوع 15 ث</span><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">←</kbd></div>
                    <div className="flex justify-between"><span>رفع الصوت</span><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">↑</kbd></div>
                    <div className="flex justify-between"><span>خفض الصوت</span><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">↓</kbd></div>
                    <div className="flex justify-between"><span>كتم الصوت</span><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">M</kbd></div>
                  </div>
                </div>
              )}
            </div>

            {/* السرعة | Speed */}
            <div className="relative">
              <button
                onClick={() => { setShowSpeed(!showSpeed); setShowSleep(false); setShowShortcuts(false); }}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {playbackRate}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 py-1 min-w-[60px]">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { changeSpeed(s); setShowSpeed(false); }}
                      className={`block w-full text-center px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${playbackRate === s ? 'text-primary-500 font-bold' : ''}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
