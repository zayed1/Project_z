// ============================================
// سياق مشغل الصوت العام | Global Audio Player Context
// ============================================
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import api from '../utils/api';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [podcastTitle, setPodcastTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [listenRecorded, setListenRecorded] = useState(false);

  const audio = audioRef.current;

  useEffect(() => {
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      // حفظ الموضع الحالي | Save current position
      if (currentEpisode) {
        localStorage.setItem(`pos_${currentEpisode.id}`, String(audio.currentTime));
      }
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audio, currentEpisode]);

  // تسجيل الاستماع بعد 30 ثانية | Record listen after 30s
  useEffect(() => {
    if (currentTime > 30 && !listenRecorded && currentEpisode) {
      setListenRecorded(true);
      api.post(`/episodes/${currentEpisode.id}/listen`).catch(() => {});
    }
  }, [currentTime, listenRecorded, currentEpisode]);

  // تشغيل حلقة | Play an episode
  const playEpisode = useCallback((episode, podcast = '') => {
    if (currentEpisode?.id === episode.id) {
      // نفس الحلقة - toggle
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play(); setIsPlaying(true); }
      return;
    }

    audio.src = episode.audio_file_url;
    audio.playbackRate = playbackRate;
    setPodcastTitle(podcast);
    setCurrentEpisode(episode);
    setListenRecorded(false);

    // استعادة الموضع المحفوظ | Restore saved position
    const savedPos = localStorage.getItem(`pos_${episode.id}`);
    if (savedPos) {
      audio.currentTime = parseFloat(savedPos);
    }

    audio.play();
    setIsPlaying(true);
  }, [audio, currentEpisode, isPlaying, playbackRate]);

  const togglePlay = () => {
    if (!currentEpisode) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  };

  const seek = (time) => { audio.currentTime = time; };
  const skipForward = () => { audio.currentTime = Math.min(audio.currentTime + 15, duration); };
  const skipBackward = () => { audio.currentTime = Math.max(audio.currentTime - 15, 0); };

  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    audio.playbackRate = rate;
  };

  return (
    <PlayerContext.Provider value={{
      currentEpisode, podcastTitle, isPlaying, currentTime, duration, playbackRate,
      playEpisode, togglePlay, seek, skipForward, skipBackward, changeSpeed,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
