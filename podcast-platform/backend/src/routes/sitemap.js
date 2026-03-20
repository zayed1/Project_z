// ============================================
// خريطة الموقع | Sitemap Generator
// ============================================
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const { data: podcasts } = await supabase
      .from('podcasts')
      .select('id, updated_at')
      .order('updated_at', { ascending: false });

    const podcastUrls = (podcasts || []).map((p) => `
  <url>
    <loc>${baseUrl}/podcast/${p.id}</loc>
    <lastmod>${p.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${podcastUrls}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(sitemap);
  } catch (err) {
    console.error('Sitemap error:', err.message);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
