// ============================================
// Onboarding ذكي | Smart Onboarding Controller
// ============================================
const { supabase } = require('../config/supabase');

// حفظ تفضيلات المستخدم | Save user preferences
async function savePreferences(req, res) {
  try {
    const userId = req.user.id;
    const { categories, moods, listen_frequency } = req.body;

    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    const prefs = {
      user_id: userId,
      favorite_categories: categories || [],
      favorite_moods: moods || [],
      listen_frequency: listen_frequency || 'daily',
      onboarding_completed: true,
    };

    if (existing) {
      await supabase.from('user_preferences').update(prefs).eq('id', existing.id);
    } else {
      await supabase.from('user_preferences').insert(prefs);
    }

    res.json({ message: 'تم حفظ التفضيلات' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب تفضيلات المستخدم | Get preferences
async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    res.json({ preferences: data || null });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// توصيات مبنية على التفضيلات | Preference-based recommendations
async function getPersonalizedFeed(req, res) {
  try {
    const userId = req.user.id;
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    let query = supabase
      .from('episodes')
      .select('*, podcasts:podcast_id(title, cover_image_url, category_id)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (prefs?.favorite_categories?.length > 0) {
      query = query.in('podcasts.category_id', prefs.favorite_categories);
    }

    const { data } = await query;
    res.json({ episodes: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { savePreferences, getPreferences, getPersonalizedFeed };
