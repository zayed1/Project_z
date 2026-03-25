// ============================================
// قائمة "استمع لاحقاً" | Listen Later (localStorage)
// ============================================
const KEY = 'listen_later';

function getList() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function getListenLater() {
  return getList();
}

export function addToListenLater(episode) {
  const list = getList();
  if (list.find((e) => e.id === episode.id)) return list;
  const updated = [...list, { id: episode.id, title: episode.title, podcast_id: episode.podcast_id }];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromListenLater(episodeId) {
  const list = getList().filter((e) => e.id !== episodeId);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function isInListenLater(episodeId) {
  return getList().some((e) => e.id === episodeId);
}
