// ============================================
// متحكم التصنيفات | Category Management Controller
// ============================================
const { supabase } = require('../config/supabase');

// إنشاء تصنيف | Create category
async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: true, message: 'اسم التصنيف مطلوب' });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ category: data, message: 'تم إنشاء التصنيف بنجاح' });
  } catch (err) {
    console.error('خطأ في إنشاء التصنيف:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إنشاء التصنيف' });
  }
}

// تعديل تصنيف | Update category
async function updateCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: true, message: 'اسم التصنيف مطلوب' });
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    res.json({ category: data, message: 'تم تعديل التصنيف' });
  } catch (err) {
    console.error('خطأ في تعديل التصنيف:', err.message);
    res.status(500).json({ error: true, message: 'فشل في تعديل التصنيف' });
  }
}

// حذف تصنيف | Delete category
async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params;

    // فحص عدد البودكاست في التصنيف | Check podcasts in category
    const { count } = await supabase
      .from('podcasts')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (count > 0) {
      return res.status(400).json({
        error: true,
        message: `لا يمكن حذف التصنيف لأنه يحتوي على ${count} بودكاست`,
      });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    res.json({ message: 'تم حذف التصنيف' });
  } catch (err) {
    console.error('خطأ في حذف التصنيف:', err.message);
    res.status(500).json({ error: true, message: 'فشل في حذف التصنيف' });
  }
}

module.exports = { createCategory, updateCategory, deleteCategory };
