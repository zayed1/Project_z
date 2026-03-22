// ============================================
// متحكم المزامنة بين الأجهزة | Cross-device Sync Controller
// ============================================
const { supabase } = require('../config/supabase');

// حفظ موضع الاستماع | Save playback position
async function savePlaybackPosition(req, res) {
  try {
    const userId = req.user.id;
    const { episode_id, position, duration } = req.body;

    if (!episode_id || position === undefined) {
      return res.status(400).json({ error: true, message: 'بيانات غير مكتملة' });
    }

    const { data: existing } = await supabase
      .from('playback_sync')
      .select('id')
      .eq('user_id', userId)
      .eq('episode_id', episode_id)
      .single();

    if (existing) {
      await supabase.from('playback_sync')
        .update({ position, duration: duration || null, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('playback_sync')
        .insert({ user_id: userId, episode_id, position, duration: duration || null });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب موضع الاستماع | Get playback position
async function getPlaybackPosition(req, res) {
  try {
    const userId = req.user.id;
    const { episodeId } = req.params;

    const { data } = await supabase
      .from('playback_sync')
      .select('position, duration, updated_at')
      .eq('user_id', userId)
      .eq('episode_id', episodeId)
      .single();

    res.json({ sync: data || null });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب كل المواضع | Get all positions (for resume list)
async function getAllPositions(req, res) {
  try {
    const userId = req.user.id;
    const { data } = await supabase
      .from('playback_sync')
      .select('episode_id, position, duration, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);

    res.json({ positions: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { savePlaybackPosition, getPlaybackPosition, getAllPositions };
