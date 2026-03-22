// ============================================
// معادل صوتي | Audio Equalizer Component
// ============================================
import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const BANDS = [
  { freq: 60, label: 'Bass' },
  { freq: 250, label: 'Low' },
  { freq: 1000, label: 'Mid' },
  { freq: 4000, label: 'High' },
  { freq: 12000, label: 'Treble' },
];

const PRESETS = {
  'عادي': [0, 0, 0, 0, 0],
  'جهوري': [6, 4, 0, -2, -4],
  'حاد': [-4, -2, 0, 4, 6],
  'بودكاست': [3, 5, 4, 2, 1],
  'موسيقى': [4, 2, 0, 2, 4],
};

export default function AudioEqualizer() {
  const { audioRef } = usePlayer();
  const [open, setOpen] = useState(false);
  const [gains, setGains] = useState([0, 0, 0, 0, 0]);
  const [preset, setPreset] = useState('عادي');
  const audioCtxRef = useRef(null);
  const filtersRef = useRef([]);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!open || !audioRef?.current) return;

    if (!audioCtxRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaElementSource(audioRef.current);
        sourceRef.current = source;

        const filters = BANDS.map(({ freq }) => {
          const filter = ctx.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1;
          filter.gain.value = 0;
          return filter;
        });

        // ربط السلسلة | Chain filters
        source.connect(filters[0]);
        for (let i = 0; i < filters.length - 1; i++) {
          filters[i].connect(filters[i + 1]);
        }
        filters[filters.length - 1].connect(ctx.destination);

        filtersRef.current = filters;
      } catch {}
    }
  }, [open, audioRef]);

  const updateGain = (index, value) => {
    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
    setPreset('');

    if (filtersRef.current[index]) {
      filtersRef.current[index].gain.value = value;
    }
  };

  const applyPreset = (name) => {
    const values = PRESETS[name];
    if (!values) return;
    setPreset(name);
    setGains(values);
    values.forEach((v, i) => {
      if (filtersRef.current[i]) filtersRef.current[i].gain.value = v;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded-lg transition-colors ${open ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        title="المعادل الصوتي"
        aria-label="المعادل الصوتي"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 p-4 min-w-[300px] z-50">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">المعادل الصوتي</h3>

          {/* الإعدادات المسبقة | Presets */}
          <div className="flex flex-wrap gap-1 mb-4">
            {Object.keys(PRESETS).map((name) => (
              <button key={name} onClick={() => applyPreset(name)}
                className={`px-2 py-0.5 rounded text-xs ${preset === name ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {name}
              </button>
            ))}
          </div>

          {/* الأشرطة | Sliders */}
          <div className="flex items-end gap-3 justify-center" style={{ height: '120px' }}>
            {BANDS.map((band, i) => (
              <div key={band.freq} className="flex flex-col items-center gap-1">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={gains[i]}
                  onChange={(e) => updateGain(i, parseFloat(e.target.value))}
                  className="appearance-none h-[80px] w-2 bg-gray-200 dark:bg-gray-600 rounded-full cursor-pointer accent-primary-500"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  aria-label={`${band.label} ${band.freq}Hz`}
                />
                <span className="text-[9px] text-gray-400">{band.label}</span>
                <span className="text-[9px] text-gray-500 font-mono">{gains[i] > 0 ? '+' : ''}{gains[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
