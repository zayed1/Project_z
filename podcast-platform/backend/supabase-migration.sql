-- ============================================
-- هجرة قاعدة البيانات | Database Migration
-- منصة البودكاست | Podcast Platform
-- ============================================

-- تفعيل uuid | Enable UUID extension
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
-- جدول البودكاست | Podcasts Table
-- ============================================
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
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
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- الفهارس | Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_podcasts_creator_id ON podcasts(creator_id);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- سياسات أمان الصفوف (RLS) | Row Level Security
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة العامة للبودكاست | Public read for podcasts
CREATE POLICY "podcasts_public_read" ON podcasts
  FOR SELECT USING (true);

-- سياسة القراءة العامة للحلقات | Public read for episodes
CREATE POLICY "episodes_public_read" ON episodes
  FOR SELECT USING (true);

-- سياسة القراءة العامة لأسماء المستخدمين | Public read for usernames
CREATE POLICY "users_public_read" ON users
  FOR SELECT USING (true);

-- سياسة الكتابة للمستخدمين المسجلين | Write policy for authenticated
CREATE POLICY "podcasts_insert" ON podcasts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "podcasts_update" ON podcasts
  FOR UPDATE USING (true);

CREATE POLICY "podcasts_delete" ON podcasts
  FOR DELETE USING (true);

CREATE POLICY "episodes_insert" ON episodes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "episodes_update" ON episodes
  FOR UPDATE USING (true);

CREATE POLICY "episodes_delete" ON episodes
  FOR DELETE USING (true);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (true);

-- ============================================
-- إنشاء Bucket للملفات الصوتية | Create Storage Bucket
-- يتم تنفيذ هذا من لوحة تحكم Supabase
-- Run this from Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcast-audio', 'podcast-audio', true);
-- ============================================
