-- =============================================
-- FORUM SYSTEM
-- =============================================

-- Forum categories
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT '💬',
  color text DEFAULT '#C2185B',
  position int DEFAULT 0,
  is_active boolean DEFAULT true,
  post_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Forum posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  category_id uuid REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  allow_comments boolean DEFAULT true,
  is_pinned boolean DEFAULT false,
  is_published boolean DEFAULT true,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Forum post likes
CREATE TABLE IF NOT EXISTS public.forum_likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Forum comments
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  like_count int DEFAULT 0,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comment likes
CREATE TABLE IF NOT EXISTS public.forum_comment_likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Updated_at triggers
CREATE TRIGGER set_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_forum_comments_updated_at
  BEFORE UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Seed default categories
INSERT INTO public.forum_categories (name, slug, description, icon, color, position) VALUES
  ('Novinky & Aktualizácie', 'novinky', 'Najnovšie správy z Luna&Beeds', '📢', '#C2185B', 1),
  ('Nové produkty', 'nove-produkty', 'Predstavenie nových kolekcií a produktov', '💎', '#880E4F', 2),
  ('Akcie & Zľavy', 'akcie', 'Špeciálne ponuky a výpredaje', '🎉', '#FF5722', 3),
  ('Komunita', 'komunita', 'Príbehy a fotky od našej komunity', '💬', '#9C27B0', 4),
  ('Otázky & Odpovede', 'qa', 'Odpovede na vaše otázky', '❓', '#2196F3', 5),
  ('Inšpirácie', 'inspiracie', 'Tipy na štýlovanie a nosenie šperkov', '🌸', '#FF8EC7', 6)
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comment_likes ENABLE ROW LEVEL SECURITY;

-- Categories - public read
CREATE POLICY "Forum categories public read" ON public.forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage forum categories" ON public.forum_categories FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Posts - public read
CREATE POLICY "Forum posts public read" ON public.forum_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage forum posts" ON public.forum_posts FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Likes - logged in users only
CREATE POLICY "Users can view likes" ON public.forum_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.forum_likes FOR ALL USING (auth.uid() = user_id);

-- Comments - public read, logged in can create
CREATE POLICY "Comments public read" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Logged in users can comment" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any comment" ON public.forum_comments FOR DELETE USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Comment likes
CREATE POLICY "Comment likes public read" ON public.forum_comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own comment likes" ON public.forum_comment_likes FOR ALL USING (auth.uid() = user_id);
