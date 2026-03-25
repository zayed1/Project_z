// ============================================
// لوحة صحة النظام | System Health Controller
// ============================================
const { supabase } = require('../config/supabase');
const os = require('os');

// حالة النظام | System status
async function getHealth(req, res) {
  try {
    const startTime = Date.now();

    // فحص قاعدة البيانات | DB check
    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await supabase.from('users').select('id').limit(1);
      dbLatency = Date.now() - dbStart;
      if (dbLatency > 2000) dbStatus = 'slow';
    } catch {
      dbStatus = 'down';
    }

    // إحصائيات الجداول | Table counts
    const tables = ['users', 'podcasts', 'episodes', 'comments'];
    const counts = {};
    await Promise.all(
      tables.map(async (table) => {
        try {
          const { count } = await supabase.from(table).select('id', { count: 'exact', head: true });
          counts[table] = count || 0;
        } catch {
          counts[table] = -1;
        }
      })
    );

    // معلومات السيرفر | Server info
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    res.json({
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      server: {
        uptime: Math.floor(uptime),
        uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        },
        platform: os.platform(),
        nodeVersion: process.version,
        cpus: os.cpus().length,
        totalMem: Math.round(os.totalmem() / 1024 / 1024),
        freeMem: Math.round(os.freemem() / 1024 / 1024),
        loadAvg: os.loadavg().map((l) => l.toFixed(2)),
      },
      database: {
        status: dbStatus,
        latency: dbLatency,
        counts,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'فشل في فحص النظام' });
  }
}

// فحص بسيط (للمراقبة الخارجية) | Simple ping
function ping(req, res) {
  res.json({ status: 'ok', timestamp: Date.now() });
}

module.exports = { getHealth, ping };
