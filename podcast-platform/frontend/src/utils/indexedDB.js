// ============================================
// تخزين ذكي بـ IndexedDB | Smart IndexedDB Storage
// ============================================

const DB_NAME = 'podcast_platform';
const DB_VERSION = 1;
const STORES = {
  podcasts: 'podcasts',
  history: 'history',
  cache: 'cache',
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORES.podcasts)) {
        db.createObjectStore(STORES.podcasts, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.history)) {
        const store = db.createObjectStore(STORES.history, { keyPath: 'episodeId' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.cache)) {
        db.createObjectStore(STORES.cache, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// عمليات عامة | Generic operations
async function putItem(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllItems(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// واجهة سجل الاستماع | History API
export const historyDB = {
  add: (item) => putItem(STORES.history, { ...item, timestamp: Date.now() }),
  getAll: () => getAllItems(STORES.history).then((items) => items.sort((a, b) => b.timestamp - a.timestamp)),
  remove: (episodeId) => deleteItem(STORES.history, episodeId),
  clear: () => clearStore(STORES.history),
};

// واجهة الكاش | Cache API
export const cacheDB = {
  set: (key, data, ttl = 300000) => putItem(STORES.cache, { key, data, expires: Date.now() + ttl }),
  get: async (key) => {
    const item = await getItem(STORES.cache, key);
    if (!item) return null;
    if (item.expires < Date.now()) {
      await deleteItem(STORES.cache, key);
      return null;
    }
    return item.data;
  },
  remove: (key) => deleteItem(STORES.cache, key),
  clear: () => clearStore(STORES.cache),
};

// واجهة البودكاست | Podcasts cache API
export const podcastsDB = {
  save: (podcast) => putItem(STORES.podcasts, podcast),
  get: (id) => getItem(STORES.podcasts, id),
  getAll: () => getAllItems(STORES.podcasts),
  remove: (id) => deleteItem(STORES.podcasts, id),
};
