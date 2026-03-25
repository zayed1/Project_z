// ============================================
// رسالة ترحيب | Welcome Message Controller
// ============================================
const { supabase } = require('../config/supabase');

// تعيين رسالة ترحيب للبودكاست | Set welcome message
async function setWelcomeMessage(req, res) {
  try {
    const { podcastId } = req.params;
    const { message } = req.body;

    const { data: existing } = await supabase
      .from('welcome_messages')
      .select('id')
      .eq('podcast_id', podcastId)
      .single();

    if (existing) {
      await supabase.from('welcome_messages')
        .update({ message: message?.trim() || '', enabled: !!message?.trim() })
        .eq('id', existing.id);
    } else {
      await supabase.from('welcome_messages')
        .insert({ podcast_id: podcastId, message: message?.trim() || '', enabled: !!message?.trim() });
    }

    res.json({ message: 'تم حفظ رسالة الترحيب' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب رسالة الترحيب | Get welcome message
async function getWelcomeMessage(req, res) {
  try {
    const { podcastId } = req.params;
    const { data } = await supabase
      .from('welcome_messages')
      .select('message, enabled')
      .eq('podcast_id', podcastId)
      .eq('enabled', true)
      .single();

    res.json({ welcome: data || null });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// إرسال رسالة ترحيب لمتابع جديد (تُنادى من follow endpoint) | Trigger welcome on follow
async function triggerWelcome(podcastId, userId) {
  try {
    const { data: wm } = await supabase
      .from('welcome_messages')
      .select('message')
      .eq('podcast_id', podcastId)
      .eq('enabled', true)
      .single();

    if (wm?.message) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'welcome',
        title: 'مرحباً بك!',
        message: wm.message,
        related_id: podcastId,
      });
    }
  } catch {}
}

module.exports = { setWelcomeMessage, getWelcomeMessage, triggerWelcome };
