// ============================================
// متحكم A/B Testing | A/B Testing Controller
// ============================================
const { supabase } = require('../config/supabase');

// إنشاء اختبار | Create A/B test
async function createABTest(req, res) {
  try {
    const { episode_id, variant_a, variant_b } = req.body;

    if (!episode_id || !variant_a?.trim() || !variant_b?.trim()) {
      return res.status(400).json({ error: true, message: 'عنوانا الاختبار مطلوبان' });
    }

    const { data, error } = await supabase
      .from('ab_tests')
      .insert({
        episode_id,
        variant_a: variant_a.trim(),
        variant_b: variant_b.trim(),
        views_a: 0,
        views_b: 0,
        clicks_a: 0,
        clicks_b: 0,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ test: data });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب العنوان (يختار عشوائياً) | Get title variant
async function getVariant(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: test } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('episode_id', episodeId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!test) return res.json({ variant: null });

    const isA = Math.random() < 0.5;
    const variant = isA ? 'a' : 'b';

    // تسجيل المشاهدة | Record view
    const field = isA ? 'views_a' : 'views_b';
    await supabase.from('ab_tests').update({ [field]: (test[field] || 0) + 1 }).eq('id', test.id);

    res.json({ variant, title: isA ? test.variant_a : test.variant_b, testId: test.id });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// تسجيل نقرة | Record click
async function recordClick(req, res) {
  try {
    const { testId } = req.params;
    const { variant } = req.body;

    const { data: test } = await supabase.from('ab_tests').select('*').eq('id', testId).single();
    if (!test) return res.status(404).json({ error: true, message: 'غير موجود' });

    const field = variant === 'a' ? 'clicks_a' : 'clicks_b';
    await supabase.from('ab_tests').update({ [field]: (test[field] || 0) + 1 }).eq('id', test.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب نتائج الاختبارات (مشرف) | Get test results (admin)
async function getABTests(req, res) {
  try {
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*, episodes:episode_id(title)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ tests: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { createABTest, getVariant, recordClick, getABTests };
