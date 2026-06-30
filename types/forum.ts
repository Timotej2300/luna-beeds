export interface ForumAuthor {
  id: string;
  first_name: string;
  last_name: string;
  role_name: string | null;
  role_color: string | null;
  role_icon: string | null;
}

/** Kategória/sekcia fóra - napr. "Novinky", "Návrhy produktov", "Otázky a odpovede". */
export interface Forum {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_by: string;
  created_at: string;
  posts_count: number;
}

export interface CreateForumInput {
  name: string;
  description: string;
  icon: string;
}

export interface ForumImage {
  id: string;
  post_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
  created_at: string;
  author: ForumAuthor | null;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: ForumAuthor | null;
  images: ForumImage[];
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export interface CreateForumPostInput {
  forum_id: string;
  title: string;
  content: string;
  images: File[];
}

export interface UpdateForumPostInput {
  id: string;
  title: string;
  content: string;
}

export interface CreateForumCommentInput {
  post_id: string;
  text: string;
}

/** Tvar riadku tak, ako prichádza priamo zo Supabase (pred mapovaním na ForumPost). */
export interface ForumPostRow {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  forum_images: ForumImage[];
  forum_likes: { user_id: string }[];
  forum_comments: { id: string }[];
}

/** Riadok z DB view public.forum_authors - zjednocuje admin_users a profiles. */
export interface ForumAuthorRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role_name: string | null;
  role_color: string | null;
  role_icon: string | null;
}

/** Tvar riadku fóra so spočítaným počtom príspevkov (cez forum_posts!inner alebo samostatný count). */
export interface ForumRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_by: string;
  created_at: string;
  forum_posts: { id: string }[];
}
