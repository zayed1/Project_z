// ============================================
// قوالب الرسائل | Message Templates Controller
// ============================================
const { supabase } = require('../config/supabase');

// إنشاء قالب | Create template
async function createTemplate(req, res) {
  try {
    const { name, title, body, type } = req.body;
    if (!name?.trim() || !body?.trim()) return res.status(400).json({ error: true, message: 'الاسم والمحتوى مطلوبان' });

    const { data, error } = await supabase
      .from('message_templates')
      .insert({ name: name.trim(), title: title?.trim() || '', body: body.trim(), type: type || 'notification' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ template: data });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب القوالب | Get templates
async function getTemplates(req, res) {
  try {
    const { data } = await supabase.from('message_templates').select('*').order('created_at', { ascending: false });
    res.json({ templates: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// تعديل قالب | Update template
async function updateTemplate(req, res) {
  try {
    const { templateId } = req.params;
    const { name, title, body, type } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (title !== undefined) updates.title = title.trim();
    if (body) updates.body = body.trim();
    if (type) updates.type = type;

    const { error } = await supabase.from('message_templates').update(updates).eq('id', templateId);
    if (error) throw error;
    res.json({ message: 'تم التحديث' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف قالب | Delete template
async function deleteTemplate(req, res) {
  try {
    const { templateId } = req.params;
    await supabase.from('message_templates').delete().eq('id', templateId);
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { createTemplate, getTemplates, updateTemplate, deleteTemplate };
