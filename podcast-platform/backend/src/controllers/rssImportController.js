// ============================================
// متحكم استيراد RSS | RSS Import Controller
// ============================================
const { supabase } = require('../config/supabase');

// استيراد بودكاست من رابط RSS خارجي | Import podcast from external RSS
async function importFromRSS(req, res) {
  try {
    const { rss_url } = req.body;
    const creatorId = req.user.id;

    if (!rss_url) {
      return res.status(400).json({ error: true, message: 'رابط RSS مطلوب' });
    }

    // جلب محتوى RSS | Fetch RSS content
    const response = await fetch(rss_url);
    if (!response.ok) throw new Error('فشل في جلب RSS');
    const xml = await response.text();

    // تحليل XML بسيط | Simple XML parsing
    const getTag = (str, tag) => {
      const match = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1') : '';
    };

    const getAttr = (str, tag, attr) => {
      const match = str.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`, 'i'));
      return match ? match[1] : '';
    };

    const channelMatch = xml.match(/<channel>([\s\S]*)<\/channel>/);
    if (!channelMatch) {
      return res.status(400).json({ error: true, message: 'تنسيق RSS غير صالح' });
    }
    const channel = channelMatch[1];

    const podcastTitle = getTag(channel, 'title');
    const podcastDesc = getTag(channel, 'description');
    const coverUrl = getAttr(channel, 'itunes:image', 'href') || getTag(channel, 'url');

    if (!podcastTitle) {
      return res.status(400).json({ error: true, message: 'لم يتم العثور على عنوان البودكاست في RSS' });
    }

    // إنشاء البودكاست | Create podcast
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .insert({
        title: podcastTitle,
        description: podcastDesc || null,
        cover_image_url: coverUrl || null,
        creator_id: creatorId,
      })
      .select('*')
      .single();

    if (podcastError) throw podcastError;

    // استخراج الحلقات | Extract episodes
    const items = channel.match(/<item>([\s\S]*?)<\/item>/g) || [];
    let importedCount = 0;

    for (let i = 0; i < Math.min(items.length, 50); i++) {
      const item = items[i];
      const title = getTag(item, 'title');
      const desc = getTag(item, 'description') || getTag(item, 'itunes:summary');
      const audioUrl = getAttr(item, 'enclosure', 'url');
      const durationStr = getTag(item, 'itunes:duration');

      if (!title || !audioUrl) continue;

      let durationSec = null;
      if (durationStr) {
        const parts = durationStr.split(':').map(Number);
        if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
        else durationSec = parts[0];
      }

      await supabase.from('episodes').insert({
        podcast_id: podcast.id,
        title,
        description: desc || null,
        audio_file_url: audioUrl,
        duration_seconds: durationSec,
        episode_number: items.length - i,
        published_at: new Date().toISOString(),
      });

      importedCount++;
    }

    res.status(201).json({
      message: `تم استيراد "${podcastTitle}" مع ${importedCount} حلقة`,
      podcast,
      imported_episodes: importedCount,
    });
  } catch (err) {
    console.error('خطأ في استيراد RSS:', err.message);
    res.status(500).json({ error: true, message: 'فشل في استيراد RSS: ' + err.message });
  }
}

module.exports = { importFromRSS };
