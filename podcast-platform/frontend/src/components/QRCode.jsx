// ============================================
// مولد رمز QR | QR Code Generator
// باستخدام Canvas API
// ============================================
import { useRef, useEffect, useState } from 'react';

// مولد بسيط لرمز QR باستخدام API خارجي | Simple QR via external service
export default function QRCode({ url, size = 150 }) {
  const [show, setShow] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="رمز QR"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>

      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 z-50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">امسح للمشاركة</p>
          <img
            src={qrUrl}
            alt="QR Code"
            className="rounded-lg"
            width={size}
            height={size}
          />
          <button
            onClick={() => setShow(false)}
            className="absolute top-1 left-1 text-gray-400 hover:text-gray-600 text-xs"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
