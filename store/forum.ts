import { create } from "zustand";
import type { Forum, ForumPost } from "@/types/forum";

interface ForumState {
  forums: Forum[];
  isLoadingForums: boolean;
  posts: ForumPost[];
  isLoadingPosts: boolean;

  setForums: (forums: Forum[]) => void;
  addForum: (forum: Forum) => void;
  updateForum: (forumId: string, updates: Partial<Forum>) => void;
  removeForum: (forumId: string) => void;
  setLoadingForums: (loading: boolean) => void;

  setPosts: (posts: ForumPost[]) => void;
  addPost: (post: ForumPost) => void;
  updatePost: (postId: string, updates: Partial<ForumPost>) => void;
  removePost: (postId: string) => void;
  setLoadingPosts: (loading: boolean) => void;
  toggleLikeOptimistic: (postId: string, liked: boolean) => void;
  incrementComments: (postId: string, delta: number) => void;
}

/**
 * Lokálny store fóra. Slúži na okamžitú (optimistickú) aktualizáciu UI
 * - reálny zdroj pravdy zostáva Supabase (Realtime kanály v komponentoch
 * synchronizujú zmeny od iných používateľov).
 */
export const useForumStore = create<ForumState>((set) => ({
  forums: [],
  isLoadingForums: false,
  posts: [],
  isLoadingPosts: false,

  setForums: (forums) => set({ forums }),

  addForum: (forum) => set((state) => ({ forums: [forum, ...state.forums] })),

  updateForum: (forumId, updates) =>
    set((state) => ({
      forums: state.forums.map((f) =>
        f.id === forumId ? { ...f, ...updates } : f
      ),
    })),

  removeForum: (forumId) =>
    set((state) => ({
      forums: state.forums.filter((f) => f.id !== forumId),
    })),

  setLoadingForums: (loading) => set({ isLoadingForums: loading }),

  setPosts: (posts) => set({ posts }),

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, ...updates } : p
      ),
    })),

  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    })),

  setLoadingPosts: (loading) => set({ isLoadingPosts: loading }),

  toggleLikeOptimistic: (postId, liked) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked_by_me: liked,
              likes_count: p.likes_count + (liked ? 1 : -1),
            }
          : p
      ),
    })),

  incrementComments: (postId, delta) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, comments_count: Math.max(0, p.comments_count + delta) }
          : p
      ),
    })),
}));
