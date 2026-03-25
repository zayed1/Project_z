// ============================================
// متحكم قوائم التشغيل | Playlists Controller
// ============================================
const { supabase } = require('../config/supabase');

// إنشاء قائمة | Create playlist
async function createPlaylist(req, res) {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: true, message: 'اسم القائمة مطلوب' });

    const { data, error } = await supabase
      .from('playlists')
      .insert({ user_id: userId, name: name.trim(), description: description?.trim() || '' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ playlist: data });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في إنشاء القائمة' });
  }
}

// جلب قوائم المستخدم | Get user playlists
async function getMyPlaylists(req, res) {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_items(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ playlists: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب قائمة مع حلقاتها | Get playlist with episodes
async function getPlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const { data: playlist, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();

    if (error || !playlist) return res.status(404).json({ error: true, message: 'القائمة غير موجودة' });

    const { data: items } = await supabase
      .from('playlist_items')
      .select('*, episodes:episode_id(id, title, audio_file_url, duration, podcast_id, podcasts:podcast_id(title, cover_image_url))')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    res.json({ playlist, items: items || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// إضافة حلقة | Add episode to playlist
async function addToPlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const { episode_id } = req.body;
    const userId = req.user.id;

    // تحقق من الملكية | Verify ownership
    const { data: pl } = await supabase.from('playlists').select('id').eq('id', playlistId).eq('user_id', userId).single();
    if (!pl) return res.status(403).json({ error: true, message: 'غير مصرح' });

    // آخر position
    const { data: last } = await supabase
      .from('playlist_items')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (last?.position || 0) + 1;

    const { error } = await supabase
      .from('playlist_items')
      .insert({ playlist_id: playlistId, episode_id, position });

    if (error) throw error;
    res.json({ message: 'تمت الإضافة' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف حلقة من القائمة | Remove from playlist
async function removeFromPlaylist(req, res) {
  try {
    const { playlistId, itemId } = req.params;
    const { error } = await supabase
      .from('playlist_items')
      .delete()
      .eq('id', itemId)
      .eq('playlist_id', playlistId);

    if (error) throw error;
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف قائمة | Delete playlist
async function deletePlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'تم حذف القائمة' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { createPlaylist, getMyPlaylists, getPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist };
