// ============================================
// شريط تقدم علوي | Top Progress Bar Component
// ============================================
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setVisible(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(60), 100);
    const t2 = setTimeout(() => setProgress(90), 200);
    const t3 = setTimeout(() => { setProgress(100); }, 400);
    const t4 = setTimeout(() => { setVisible(false); setProgress(0); }, 600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px]">
      <div
        className="h-full bg-primary-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
