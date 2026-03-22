// ============================================
// إعدادات الموقع | Site Settings Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب الإعدادات | Get settings
async function getSettings(req, res) {
  try {
    const { data } = await supabase.from('site_settings').select('*').single();
    res.json({ settings: data || { site_name: 'منصة البودكاست', description: '', logo_url: '', primary_color: '#6366f1' } });
  } catch (err) {
    res.json({ settings: { site_name: 'منصة البودكاست', description: '', logo_url: '', primary_color: '#6366f1' } });
  }
}

// تحديث الإعدادات | Update settings
async function updateSettings(req, res) {
  try {
    const { site_name, description, logo_url, primary_color, maintenance_mode } = req.body;
    const updates = {};
    if (site_name !== undefined) updates.site_name = site_name;
    if (description !== undefined) updates.description = description;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (primary_color !== undefined) updates.primary_color = primary_color;
    if (maintenance_mode !== undefined) updates.maintenance_mode = maintenance_mode;

    const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();

    if (existing) {
      await supabase.from('site_settings').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('site_settings').insert({ ...updates, site_name: site_name || 'منصة البودكاست' });
    }

    res.json({ message: 'تم تحديث الإعدادات' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { getSettings, updateSettings };
