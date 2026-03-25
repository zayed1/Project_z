// ============================================
// مشاركة اجتماعية | Social Share Component
// ============================================
import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function SocialShare({ title, url, description }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = title || 'استمع لهذه الحلقة';

  const platforms = [
    {
      name: 'X / Twitter',
      color: 'bg-black',
      icon: '𝕏',
      link: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      color: 'bg-green-500',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
      ),
      link: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      color: 'bg-blue-500',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
      ),
      link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('تم نسخ الرابط');
    setOpen(false);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: shareText, text: description || '', url: shareUrl });
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
        title="مشاركة"
        aria-label="مشاركة"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">مشاركة</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {platforms.map((p) => (
                <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1" onClick={() => setOpen(false)}>
                  <div className={`w-10 h-10 ${p.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>{p.icon}</div>
                  <span className="text-[10px] text-gray-500">{p.name}</span>
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={copyLink} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs">نسخ الرابط</button>
              {navigator.share && (
                <button onClick={nativeShare} className="flex-1 bg-primary-500 text-white py-2 rounded-lg text-xs">مشاركة أخرى</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
