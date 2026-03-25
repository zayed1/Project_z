// ============================================
// اختصارات لوحة المفاتيح | Keyboard Shortcuts Hook
// ============================================
import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function useKeyboardShortcuts() {
  const { currentEpisode, isPlaying, togglePlay, seekBy, setVolume, volume } = usePlayer();

  useEffect(() => {
    const handler = (e) => {
      // تجاهل داخل حقول الإدخال | Ignore in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          if (currentEpisode) { e.preventDefault(); togglePlay(); }
          break;
        case 'ArrowRight':
          if (currentEpisode) { e.preventDefault(); seekBy(-10); }
          break;
        case 'ArrowLeft':
          if (currentEpisode) { e.preventDefault(); seekBy(10); }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, (volume || 0.8) + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, (volume || 0.8) - 0.1));
          break;
        case 'KeyM':
          if (currentEpisode) setVolume(volume > 0 ? 0 : 0.8);
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentEpisode, isPlaying, togglePlay, seekBy, setVolume, volume]);
}
