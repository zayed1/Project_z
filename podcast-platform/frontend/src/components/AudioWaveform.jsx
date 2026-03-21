// ============================================
// موجة صوتية | Audio Waveform Visualization
// باستخدام Web Audio API + Canvas
// ============================================
import { useRef, useEffect, useState, useCallback } from 'react';

export default function AudioWaveform({ audioUrl, isPlaying, currentTime, duration, onSeek }) {
  const canvasRef = useRef(null);
  const [waveData, setWaveData] = useState(null);

  // تحليل الملف الصوتي | Analyze audio file
  const analyzeAudio = useCallback(async () => {
    if (!audioUrl || waveData) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(audioUrl);
      const buffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(buffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 100;
      const blockSize = Math.floor(rawData.length / samples);
      const bars = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        bars.push(sum / blockSize);
      }

      const max = Math.max(...bars);
      setWaveData(bars.map((b) => b / max));
      ctx.close();
    } catch {
      // إنشاء بيانات عشوائية كبديل | Generate random fallback
      const bars = Array.from({ length: 100 }, () => 0.2 + Math.random() * 0.8);
      setWaveData(bars);
    }
  }, [audioUrl, waveData]);

  useEffect(() => {
    analyzeAudio();
  }, [analyzeAudio]);

  // رسم الموجة | Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveData) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const barWidth = w / waveData.length;
    const progress = duration ? currentTime / duration : 0;

    ctx.clearRect(0, 0, w, h);

    waveData.forEach((val, i) => {
      const barH = val * h * 0.8;
      const x = i * barWidth;
      const y = (h - barH) / 2;
      const isPlayed = i / waveData.length <= progress;

      ctx.fillStyle = isPlayed
        ? (getComputedStyle(document.documentElement).getPropertyValue('--theme-primary')?.trim() || '#6366f1')
        : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db');

      ctx.beginPath();
      ctx.roundRect(x + 1, y, barWidth - 2, barH, 1);
      ctx.fill();
    });
  }, [waveData, currentTime, duration]);

  const handleClick = (e) => {
    if (!onSeek || !duration) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(pct * duration);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12 cursor-pointer rounded"
      onClick={handleClick}
    />
  );
}
