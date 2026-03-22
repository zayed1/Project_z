-- ============================================
-- هجرة قاعدة البيانات | Database Migration
-- منصة البودكاست | Podcast Platform v2
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- جدول المستخدمين | Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'listener' CHECK (role IN ('admin', 'listener')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول التصنيفات | Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة التصنيفات الافتراضية | Default categories
INSERT INTO categories (name, slug) VALUES
  ('تقنية', 'technology'),
  ('ثقافة', 'culture'),
  ('رياضة', 'sports'),
  ('أعمال', 'business'),
  ('تعليم', 'education'),
  ('ترفيه', 'entertainment'),
  ('أخبار', 'news'),
  ('صحة', 'health'),
  ('دين', 'religion'),
  ('عام', 'general')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- جدول البودكاست | Podcasts Table
-- ============================================
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category_id UUID REFERENCES categories(id),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول الحلقات | Episodes Table
-- ============================================
CREATE TABLE IF NOT EXISTS episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_file_url TEXT NOT NULL,
  duration_seconds INTEGER,
  episode_number INTEGER,
  listen_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول التعليقات | Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول سجل النشاطات | Activity Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول الإعجابات | Likes Table
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(episode_id, user_id)
);

-- ============================================
-- جدول المتابعات | Follows Table
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- إضافة عمود النص المكتوب للحلقات | Add transcript column
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS transcript TEXT;

-- إضافة عمود الحظر | Add ban column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- ============================================
-- الفهارس | Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_podcasts_creator_id ON podcasts(creator_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_category_id ON podcasts(category_id);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON episodes(published_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_comments_episode_id ON comments(episode_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_episode_id ON likes(episode_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_user_id ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_podcast_id ON follows(podcast_id);

-- ============================================
-- سياسات أمان الصفوف (RLS) | Row Level Security
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "podcasts_public_read" ON podcasts FOR SELECT USING (true);
CREATE POLICY "episodes_public_read" ON episodes FOR SELECT USING (true);
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);

CREATE POLICY "podcasts_insert" ON podcasts FOR INSERT WITH CHECK (true);
CREATE POLICY "podcasts_update" ON podcasts FOR UPDATE USING (true);
CREATE POLICY "podcasts_delete" ON podcasts FOR DELETE USING (true);
CREATE POLICY "episodes_insert" ON episodes FOR INSERT WITH CHECK (true);
CREATE POLICY "episodes_update" ON episodes FOR UPDATE USING (true);
CREATE POLICY "episodes_delete" ON episodes FOR DELETE USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (true);
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (true);
CREATE POLICY "activity_logs_read" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "likes_public_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (true);
CREATE POLICY "follows_public_read" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (true);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (true);

-- ============================================
-- Batch 5: الردود المتداخلة | Nested Replies (parent_id)
-- ============================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ============================================
-- Batch 5: جدول الإشعارات | Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (true);

-- ============================================
-- Batch 6: حقول الملف الشخصي | Profile fields
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- ============================================
-- Batch 6: المقاطع المميزة | Clips Table
-- ============================================
CREATE TABLE IF NOT EXISTS clips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  title TEXT,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clips_episode_id ON clips(episode_id);
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clips_read" ON clips FOR SELECT USING (true);
CREATE POLICY "clips_insert" ON clips FOR INSERT WITH CHECK (true);
CREATE POLICY "clips_delete" ON clips FOR DELETE USING (true);

-- ============================================
-- Batch 6: الاستطلاعات | Polls Tables
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_num INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "polls_read" ON polls FOR SELECT USING (true);
CREATE POLICY "polls_insert" ON polls FOR INSERT WITH CHECK (true);
CREATE POLICY "poll_options_read" ON poll_options FOR SELECT USING (true);
CREATE POLICY "poll_options_insert" ON poll_options FOR INSERT WITH CHECK (true);
CREATE POLICY "poll_votes_read" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "poll_votes_insert" ON poll_votes FOR INSERT WITH CHECK (true);

-- ============================================
-- Batch 6: الاستماع الجغرافي | Geo Listens
-- ============================================
CREATE TABLE IF NOT EXISTS geo_listens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geo_listens_country ON geo_listens(country);
ALTER TABLE geo_listens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geo_listens_read" ON geo_listens FOR SELECT USING (true);
CREATE POLICY "geo_listens_insert" ON geo_listens FOR INSERT WITH CHECK (true);

-- ============================================
-- Batch 7: قوائم التشغيل | Playlists
-- ============================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  position INT DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playlists_all" ON playlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "playlist_items_all" ON playlist_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 7: التقييمات | Ratings
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(episode_id, user_id)
);
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings_all" ON ratings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 7: البلاغات | Reports
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_all" ON reports FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 7: الفصول | Chapters
-- ============================================
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time REAL NOT NULL,
  end_time REAL
);
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chapters_all" ON chapters FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 7: المزامنة | Playback Sync
-- ============================================
CREATE TABLE IF NOT EXISTS playback_sync (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  position REAL NOT NULL DEFAULT 0,
  duration REAL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);
ALTER TABLE playback_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playback_sync_all" ON playback_sync FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 7: A/B Testing
-- ============================================
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  views_a INT DEFAULT 0,
  views_b INT DEFAULT 0,
  clicks_a INT DEFAULT 0,
  clicks_b INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ab_tests_all" ON ab_tests FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 8: التعليقات الموقّتة | Timed Comments
-- ============================================
CREATE TABLE IF NOT EXISTS timed_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timed_comments_ep ON timed_comments(episode_id, timestamp);
ALTER TABLE timed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timed_comments_all" ON timed_comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 8: تصنيف المزاج | Episode Moods
-- ============================================
CREATE TABLE IF NOT EXISTS episode_moods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  mood TEXT NOT NULL
);
ALTER TABLE episode_moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episode_moods_all" ON episode_moods FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 8: تفضيلات المستخدم | User Preferences
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  favorite_categories JSONB DEFAULT '[]',
  favorite_moods JSONB DEFAULT '[]',
  listen_frequency TEXT DEFAULT 'daily',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_preferences_all" ON user_preferences FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 8: رسائل الترحيب | Welcome Messages
-- ============================================
CREATE TABLE IF NOT EXISTS welcome_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  podcast_id UUID NOT NULL UNIQUE REFERENCES podcasts(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  enabled BOOLEAN DEFAULT TRUE
);
ALTER TABLE welcome_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "welcome_messages_all" ON welcome_messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 8: Webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  events JSONB DEFAULT '[]',
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_url TEXT,
  event TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_all" ON webhooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "webhook_logs_all" ON webhook_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ============================================
-- Batch 9: ملاحظات الحلقات | Episode Notes
-- ============================================
CREATE TABLE IF NOT EXISTS episode_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE episode_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episode_notes_all" ON episode_notes FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 9: سجل التعديلات | Audit Logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 9: إعدادات الموقع | Site Settings
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_name TEXT DEFAULT 'منصة البودكاست',
  description TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#6366f1',
  maintenance_mode BOOLEAN DEFAULT FALSE
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_all" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Batch 9: قوالب الرسائل | Message Templates
-- ============================================
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  body TEXT NOT NULL,
  type TEXT DEFAULT 'notification',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "message_templates_all" ON message_templates FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- تتبع المزاج | Mood Tracking Table
-- ============================================
CREATE TABLE IF NOT EXISTS mood_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mood_tracking_all" ON mood_tracking FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- خريطة الاستماع الحرارية | Listen Heatmap Table
-- ============================================
CREATE TABLE IF NOT EXISTS listen_heatmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  position_seconds INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE listen_heatmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listen_heatmap_all" ON listen_heatmap FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- غرف الاستماع | Listen Rooms Table
-- ============================================
CREATE TABLE IF NOT EXISTS listen_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  members_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE listen_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listen_rooms_all" ON listen_rooms FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- الهدايا | Episode Gifts Table
-- ============================================
CREATE TABLE IF NOT EXISTS episode_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE episode_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episode_gifts_all" ON episode_gifts FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- جدار المعجبين | Fan Wall Table
-- ============================================
CREATE TABLE IF NOT EXISTS fan_wall (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fan_wall ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fan_wall_all" ON fan_wall FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- المنشورات المجدولة | Scheduled Posts Table
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) DEFAULT 'announcement',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scheduled_posts_all" ON scheduled_posts FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- إنشاء Buckets للتخزين | Create Storage Buckets
-- نفذ هذا من لوحة تحكم Supabase:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcast-audio', 'podcast-audio', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcast-covers', 'podcast-covers', true);
-- ============================================
