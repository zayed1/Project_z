// ============================================
// سياق مشغل الصوت العام | Global Audio Player Context
// مع قائمة تشغيل + مؤقت النوم | With Playlist + Sleep Timer
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

  // قائمة التشغيل | Playlist
  const [playlist, setPlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(-1);

  // مؤقت النوم | Sleep Timer
  const [sleepTimer, setSleepTimer] = useState(null); // minutes remaining
  const sleepIntervalRef = useRef(null);

  const audio = audioRef.current;

  useEffect(() => {
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (currentEpisode) {
        localStorage.setItem(`pos_${currentEpisode.id}`, String(audio.currentTime));
      }
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setIsPlaying(false);
      if (playlist.length > 0 && playlistIndex < playlist.length - 1) {
        const nextIdx = playlistIndex + 1;
        const nextEp = playlist[nextIdx];
        setPlaylistIndex(nextIdx);
        loadAndPlay(nextEp);
      }
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audio, currentEpisode, playlist, playlistIndex]);

  // تسجيل الاستماع بعد 30 ثانية | Record listen after 30s
  useEffect(() => {
    if (currentTime > 30 && !listenRecorded && currentEpisode) {
      setListenRecorded(true);
      api.post(`/episodes/${currentEpisode.id}/listen`).catch(() => {});
    }
  }, [currentTime, listenRecorded, currentEpisode]);

  // مؤقت النوم | Sleep Timer logic
  const startSleepTimer = useCallback((minutes) => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);

    if (!minutes) {
      setSleepTimer(null);
      return;
    }

    let remaining = minutes * 60; // seconds
    setSleepTimer(minutes);

    sleepIntervalRef.current = setInterval(() => {
      remaining--;
      const minsLeft = Math.ceil(remaining / 60);
      setSleepTimer(minsLeft > 0 ? minsLeft : null);

      if (remaining <= 0) {
        clearInterval(sleepIntervalRef.current);
        sleepIntervalRef.current = null;
        setSleepTimer(null);
        audio.pause();
        setIsPlaying(false);
      }
    }, 1000);
  }, [audio]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
    setSleepTimer(null);
  }, []);

  useEffect(() => {
    return () => {
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    };
  }, []);

  // اختصارات لوحة المفاتيح | Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!currentEpisode) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) { audio.pause(); setIsPlaying(false); }
          else { audio.play(); setIsPlaying(true); }
          break;
        case 'ArrowRight':
          e.preventDefault();
          audio.currentTime = Math.min(audio.currentTime + 15, duration);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          audio.currentTime = Math.max(audio.currentTime - 15, 0);
          break;
        case 'KeyM':
          audio.muted = !audio.muted;
          break;
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [audio, currentEpisode, isPlaying, duration]);

  function loadAndPlay(episode) {
    audio.src = episode.audio_file_url;
    audio.playbackRate = playbackRate;
    setCurrentEpisode(episode);
    setListenRecorded(false);

    const savedPos = localStorage.getItem(`pos_${episode.id}`);
    if (savedPos) audio.currentTime = parseFloat(savedPos);

    audio.play();
    setIsPlaying(true);
  }

  const playEpisode = useCallback((episode, podcast = '', episodes = []) => {
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play(); setIsPlaying(true); }
      return;
    }

    if (episodes.length > 0) {
      setPlaylist(episodes);
      const idx = episodes.findIndex((e) => e.id === episode.id);
      setPlaylistIndex(idx >= 0 ? idx : 0);
    }

    setPodcastTitle(podcast);
    loadAndPlay(episode);
  }, [audio, currentEpisode, isPlaying, playbackRate]);

  // تشغيل من ثانية معينة | Play from specific timestamp
  const playFromTimestamp = useCallback((episode, podcast, episodes, seconds) => {
    if (currentEpisode?.id === episode.id) {
      audio.currentTime = seconds;
      if (!isPlaying) { audio.play(); setIsPlaying(true); }
      return;
    }

    if (episodes.length > 0) {
      setPlaylist(episodes);
      const idx = episodes.findIndex((e) => e.id === episode.id);
      setPlaylistIndex(idx >= 0 ? idx : 0);
    }

    setPodcastTitle(podcast);
    audio.src = episode.audio_file_url;
    audio.playbackRate = playbackRate;
    setCurrentEpisode(episode);
    setListenRecorded(false);

    audio.addEventListener('loadedmetadata', function onceLoaded() {
      audio.currentTime = seconds;
      audio.play();
      setIsPlaying(true);
      audio.removeEventListener('loadedmetadata', onceLoaded);
    });
    audio.load();
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

  const playNext = () => {
    if (playlistIndex < playlist.length - 1) {
      const nextIdx = playlistIndex + 1;
      setPlaylistIndex(nextIdx);
      loadAndPlay(playlist[nextIdx]);
    }
  };
  const playPrev = () => {
    if (playlistIndex > 0) {
      const prevIdx = playlistIndex - 1;
      setPlaylistIndex(prevIdx);
      loadAndPlay(playlist[prevIdx]);
    }
  };

  const hasNext = playlist.length > 0 && playlistIndex < playlist.length - 1;
  const hasPrev = playlist.length > 0 && playlistIndex > 0;

  return (
    <PlayerContext.Provider value={{
      currentEpisode, podcastTitle, isPlaying, currentTime, duration, playbackRate,
      playlist, playlistIndex, hasNext, hasPrev,
      sleepTimer,
      playEpisode, playFromTimestamp, togglePlay, seek, skipForward, skipBackward, changeSpeed,
      playNext, playPrev, startSleepTimer, cancelSleepTimer,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
