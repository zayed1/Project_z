// ============================================
// تخزين مؤقت ذكي | Smart Local Cache with TTL
// ============================================

const DEFAULT_TTL = 5 * 60 * 1000; // 5 دقائق

export const cache = {
  set(key, data, ttl = DEFAULT_TTL) {
    try {
      const item = { data, expiry: Date.now() + ttl };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch {}
  },

  get(key) {
    try {
      const raw = localStorage.getItem(`cache_${key}`);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(`cache_${key}`);
  },

  clear() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'));
    keys.forEach((k) => localStorage.removeItem(k));
  },

  // جلب مع كاش | Fetch with cache
  async fetchWithCache(key, fetchFn, ttl = DEFAULT_TTL) {
    const cached = this.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  },
};

export default cache;
