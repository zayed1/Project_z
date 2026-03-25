// ============================================
// RSS Feed لكل بودكاست | Podcast RSS Feed
// ============================================
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// توليد RSS Feed لبودكاست معين | Generate RSS for a podcast
router.get('/:podcastId', async (req, res) => {
  try {
    const { podcastId } = req.params;

    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select(`
        *,
        users:creator_id (username),
        episodes (*)
      `)
      .eq('id', podcastId)
      .single();

    if (error || !podcast) {
      return res.status(404).send('Podcast not found');
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // فلترة الحلقات المنشورة فقط | Only published episodes
    const episodes = (podcast.episodes || [])
      .filter((ep) => ep.published_at && (!ep.scheduled_at || ep.scheduled_at <= new Date().toISOString()))
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    const rssItems = episodes.map((ep) => `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${ep.description || ''}]]></description>
      <enclosure url="${ep.audio_file_url}" type="audio/mpeg" />
      <guid isPermaLink="false">${ep.id}</guid>
      <pubDate>${new Date(ep.published_at).toUTCString()}</pubDate>
      ${ep.duration_seconds ? `<itunes:duration>${ep.duration_seconds}</itunes:duration>` : ''}
      <itunes:episode>${ep.episode_number || ''}</itunes:episode>
    </item>`).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title><![CDATA[${podcast.title}]]></title>
    <description><![CDATA[${podcast.description || ''}]]></description>
    <link>${baseUrl}/podcast/${podcast.id}</link>
    <language>ar</language>
    <itunes:author>${podcast.users?.username || ''}</itunes:author>
    ${podcast.cover_image_url ? `<itunes:image href="${podcast.cover_image_url}" />` : ''}
    ${rssItems}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(rss);
  } catch (err) {
    console.error('RSS error:', err.message);
    res.status(500).send('Error generating RSS');
  }
});

module.exports = router;
