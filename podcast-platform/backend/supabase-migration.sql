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
-- إنشاء Buckets للتخزين | Create Storage Buckets
-- نفذ هذا من لوحة تحكم Supabase:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcast-audio', 'podcast-audio', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcast-covers', 'podcast-covers', true);
-- ============================================
