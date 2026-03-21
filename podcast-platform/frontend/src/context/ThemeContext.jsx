// ============================================
// سياق الثيمات المتعددة | Multi-Theme Context
// 6 ألوان + وضع ليلي/فاتح
// ============================================
import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  default: { name: 'افتراضي', primary: '#6366f1', hue: '239' },
  ocean: { name: 'محيط', primary: '#0891b2', hue: '192' },
  forest: { name: 'غابة', primary: '#16a34a', hue: '142' },
  sunset: { name: 'غروب', primary: '#ea580c', hue: '21' },
  rose: { name: 'وردي', primary: '#e11d48', hue: '347' },
  gold: { name: 'ذهبي', primary: '#ca8a04', hue: '48' },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const theme = THEMES[colorTheme] || THEMES.default;
    document.documentElement.style.setProperty('--theme-hue', theme.hue);
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => setDark((prev) => !prev);
  const changeColorTheme = (t) => setColorTheme(t);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, colorTheme, changeColorTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
