// ============================================
// صفحة عن المنصة | About Page
// ============================================
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>عن المنصة - منصة البودكاست</title>
        <meta name="description" content="تعرف على منصة البودكاست العربية - منصة لاكتشاف والاستماع لأفضل البودكاست" />
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">عن منصة البودكاست</h1>

        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            منصة البودكاست هي منصة عربية متكاملة تهدف إلى تقديم تجربة استماع مميزة
            لمحبي البودكاست. نسعى لتكون الوجهة الأولى لاكتشاف المحتوى الصوتي العربي المتميز.
          </p>

          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">مميزات المنصة</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                مكتبة متنوعة من البودكاست في مختلف التصنيفات
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                مشغل صوت متقدم مع التحكم بالسرعة والتخطي
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                حفظ موضع الاستماع للعودة إليه لاحقاً
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                قائمة "استمع لاحقاً" لحفظ الحلقات المفضلة
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                بحث وتصفية حسب التصنيف
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                دعم RSS لتطبيقات البودكاست الخارجية
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                الوضع الليلي لراحة العين
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">تواصل معنا</h2>
            <p>
              نرحب بملاحظاتكم واقتراحاتكم. يمكنكم التواصل معنا عبر البريد الإلكتروني:
              <a href="mailto:info@podcast-platform.com" className="text-primary-600 dark:text-primary-400 hover:underline mr-1">
                info@podcast-platform.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
