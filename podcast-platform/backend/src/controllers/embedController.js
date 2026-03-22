// ============================================
// متحكم التضمين الخارجي | Embed Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب بيانات التضمين | Get embed data for episode
async function getEmbedData(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: episode, error } = await supabase
      .from('episodes')
      .select('id, title, audio_file_url, podcast_id')
      .eq('id', episodeId)
      .single();

    if (error || !episode) {
      return res.status(404).json({ error: true, message: 'الحلقة غير موجودة' });
    }

    const { data: podcast } = await supabase
      .from('podcasts')
      .select('title, cover_image_url')
      .eq('id', episode.podcast_id)
      .single();

    res.json({
      embed: {
        episodeId: episode.id,
        title: episode.title,
        audioUrl: episode.audio_file_url,
        podcastTitle: podcast?.title || '',
        coverUrl: podcast?.cover_image_url || '',
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// صفحة التضمين HTML | Embed HTML page
async function getEmbedPage(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: episode } = await supabase
      .from('episodes')
      .select('id, title, audio_file_url, podcast_id')
      .eq('id', episodeId)
      .single();

    if (!episode) return res.status(404).send('Not found');

    const { data: podcast } = await supabase
      .from('podcasts')
      .select('title, cover_image_url')
      .eq('id', episode.podcast_id)
      .single();

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${episode.title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#1a1a2e;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:12px}
    .player{display:flex;align-items:center;gap:12px;background:#16213e;border-radius:12px;padding:12px 16px;width:100%;max-width:500px}
    .cover{width:56px;height:56px;border-radius:8px;object-fit:cover;background:#0f3460;flex-shrink:0}
    .info{flex:1;min-width:0}
    .info h3{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .info p{font-size:11px;color:#a0a0b0;margin-top:2px}
    audio{width:100%;margin-top:8px;height:32px}
    .btn{background:#e94560;border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .btn:hover{background:#c73a52}
  </style>
</head>
<body>
  <div class="player">
    ${podcast?.cover_image_url ? `<img class="cover" src="${podcast.cover_image_url}" alt="">` : '<div class="cover"></div>'}
    <div class="info">
      <h3>${episode.title}</h3>
      <p>${podcast?.title || ''}</p>
      <audio controls preload="none" src="${episode.audio_file_url}"></audio>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error');
  }
}

module.exports = { getEmbedData, getEmbedPage };
