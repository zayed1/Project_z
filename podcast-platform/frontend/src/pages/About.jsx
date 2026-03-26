// ============================================
// صفحة عن المنصة التفاعلية | Interactive About Page
// مع FAQ + إحصائيات + عرض المميزات
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';

const FEATURES = [
  { icon: '🎙️', title: 'مكتبة متنوعة', desc: 'بودكاست في مختلف التصنيفات والمواضيع' },
  { icon: '🎧', title: 'مشغل متقدم', desc: 'تحكم بالسرعة، مؤقت نوم، اختصارات لوحة المفاتيح' },
  { icon: '📌', title: 'استمع لاحقاً', desc: 'احفظ الحلقات وارجع لها في أي وقت' },
  { icon: '🔍', title: 'بحث ذكي', desc: 'بحث بالنص والصوت مع فلترة متقدمة' },
  { icon: '🌙', title: 'وضع ليلي', desc: '6 ثيمات ألوان مع وضع ليلي تلقائي' },
  { icon: '📡', title: 'دعم RSS', desc: 'تابع البودكاست من أي تطبيق خارجي' },
];

const FAQ = [
  { q: 'كيف أبدأ الاستماع؟', a: 'تصفح البودكاست من الصفحة الرئيسية واضغط على أي حلقة لبدء التشغيل. يمكنك أيضاً استخدام البحث للعثور على محتوى محدد.' },
  { q: 'هل يمكنني الاستماع بدون إنترنت؟', a: 'نعم! يمكنك تحميل الحلقات للاستماع بدون اتصال من خلال زر التحميل الموجود في كل حلقة.' },
  { q: 'كيف أنشئ قائمة تشغيل؟', a: 'انتقل إلى صفحة "قوائم التشغيل" وأنشئ قائمة جديدة، ثم أضف الحلقات إليها من صفحة أي بودكاست.' },
  { q: 'هل المنصة مجانية؟', a: 'نعم، المنصة مجانية بالكامل لجميع المستمعين وصانعي المحتوى.' },
  { q: 'كيف أصبح صانع محتوى؟', a: 'سجّل حساباً جديداً وانتقل إلى "لوحة صانع المحتوى" لبدء رفع البودكاست والحلقات.' },
];

function AnimatedCounter({ target, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(interval); }
      else setCount(current);
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{count.toLocaleString('ar')}+</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0, users: 0 });

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        const s = data.settings || {};
        setStats({
          podcasts: s.total_podcasts || 50,
          episodes: s.total_episodes || 300,
          users: s.total_users || 1000,
        });
      })
      .catch(() => setStats({ podcasts: 50, episodes: 300, users: 1000 }));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>عن المنصة - منصة البودكاست</title>
        <meta name="description" content="تعرف على منصة البودكاست العربية" />
      </Helmet>

      {/* الهيرو | Hero */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-center text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-white/15 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">منصة البودكاست</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            منصة عربية متكاملة لاكتشاف والاستماع لأفضل المحتوى الصوتي
          </p>
        </div>
      </div>

      {/* الإحصائيات | Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <AnimatedCounter target={stats.podcasts} label="بودكاست" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <AnimatedCounter target={stats.episodes} label="حلقة" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <AnimatedCounter target={stats.users} label="مستمع" />
        </div>
      </div>

      {/* المميزات | Features */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">المميزات</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-0.5">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* الأسئلة الشائعة | FAQ */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">الأسئلة الشائعة</h2>
        <div className="space-y-2">
          {FAQ.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-right"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.q}</span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 animate-slide-down">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* تواصل معنا | Contact */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">تواصل معنا</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">نرحب بملاحظاتكم واقتراحاتكم</p>
        <a href="mailto:info@podcast-platform.com" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          info@podcast-platform.com
        </a>
      </div>
    </div>
  );
}
