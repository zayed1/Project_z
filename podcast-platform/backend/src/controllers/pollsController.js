// ============================================
// متحكم الاستطلاعات | Polls Controller
// ============================================
const { supabase } = require('../config/supabase');

// إنشاء استطلاع | Create poll (admin)
async function createPoll(req, res) {
  try {
    const { episode_id, question, options } = req.body;

    if (!episode_id || !question || !options || options.length < 2) {
      return res.status(400).json({ error: true, message: 'السؤال وخياران على الأقل مطلوبان' });
    }

    const { data: poll, error } = await supabase
      .from('polls')
      .insert({ episode_id, question: question.trim() })
      .select()
      .single();

    if (error) throw error;

    // إنشاء الخيارات | Create options
    const optionRows = options.map((text, i) => ({
      poll_id: poll.id,
      text: text.trim(),
      order_num: i,
    }));

    const { error: optError } = await supabase
      .from('poll_options')
      .insert(optionRows);

    if (optError) throw optError;

    res.status(201).json({ poll, message: 'تم إنشاء الاستطلاع' });
  } catch (err) {
    console.error('خطأ في إنشاء الاستطلاع:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إنشاء الاستطلاع' });
  }
}

// جلب استطلاع حلقة | Get poll for episode
async function getEpisodePoll(req, res) {
  try {
    const { episodeId } = req.params;
    const userId = req.query.userId;

    const { data: poll } = await supabase
      .from('polls')
      .select('*')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!poll) return res.json({ poll: null });

    // جلب الخيارات مع عدد الأصوات | Get options with vote counts
    const { data: options } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', poll.id)
      .order('order_num');

    // عدد الأصوات لكل خيار | Vote count per option
    const optionsWithVotes = await Promise.all(
      (options || []).map(async (opt) => {
        const { count } = await supabase
          .from('poll_votes')
          .select('*', { count: 'exact', head: true })
          .eq('option_id', opt.id);
        return { ...opt, votes: count || 0 };
      })
    );

    // هل صوّت المستخدم | Did user vote
    let userVote = null;
    if (userId) {
      const { data } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id)
        .eq('user_id', userId)
        .single();
      userVote = data?.option_id || null;
    }

    res.json({ poll: { ...poll, options: optionsWithVotes, userVote } });
  } catch (err) {
    console.error('خطأ في جلب الاستطلاع:', err.message);
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// تصويت | Vote
async function votePoll(req, res) {
  try {
    const { pollId } = req.params;
    const { option_id } = req.body;
    const userId = req.user.id;

    // تحقق من عدم التصويت مسبقاً | Check no previous vote
    const { data: existing } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(400).json({ error: true, message: 'لقد صوّت مسبقاً' });
    }

    const { error } = await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, option_id, user_id: userId });

    if (error) throw error;
    res.json({ message: 'تم التصويت بنجاح' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في التصويت' });
  }
}

module.exports = { createPoll, getEpisodePoll, votePoll };
