// ============================================
// نظام Webhooks | Webhooks Controller
// ============================================
const { supabase } = require('../config/supabase');
const crypto = require('crypto');

// إنشاء webhook | Create webhook
async function createWebhook(req, res) {
  try {
    const { url, events } = req.body;
    if (!url?.trim() || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: true, message: 'URL والأحداث مطلوبة' });
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('webhooks')
      .insert({ url: url.trim(), events, secret, active: true })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ webhook: data });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب كل الـ webhooks | Get all webhooks
async function getWebhooks(req, res) {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ webhooks: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف webhook | Delete webhook
async function deleteWebhook(req, res) {
  try {
    const { webhookId } = req.params;
    const { error } = await supabase.from('webhooks').delete().eq('id', webhookId);
    if (error) throw error;
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// تفعيل/تعطيل | Toggle webhook
async function toggleWebhook(req, res) {
  try {
    const { webhookId } = req.params;
    const { data: wh } = await supabase.from('webhooks').select('active').eq('id', webhookId).single();
    if (!wh) return res.status(404).json({ error: true, message: 'غير موجود' });

    await supabase.from('webhooks').update({ active: !wh.active }).eq('id', webhookId);
    res.json({ active: !wh.active });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// إرسال webhook (دالة داخلية) | Fire webhook (internal helper)
async function fireWebhooks(eventType, payload) {
  try {
    const { data: hooks } = await supabase
      .from('webhooks')
      .select('url, secret')
      .eq('active', true)
      .contains('events', [eventType]);

    if (!hooks || hooks.length === 0) return;

    const body = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() });

    await Promise.allSettled(
      hooks.map((hook) => {
        const signature = crypto.createHmac('sha256', hook.secret).update(body).digest('hex');
        return fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': signature },
          body,
          signal: AbortSignal.timeout(10000),
        }).catch(() => {});
      })
    );

    // سجل الإرسال | Log delivery
    await supabase.from('webhook_logs').insert(
      hooks.map((h) => ({ webhook_url: h.url, event: eventType, status: 'sent' }))
    );
  } catch {}
}

// سجل الـ webhooks | Get webhook logs
async function getWebhookLogs(req, res) {
  try {
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    res.json({ logs: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { createWebhook, getWebhooks, deleteWebhook, toggleWebhook, fireWebhooks, getWebhookLogs };
