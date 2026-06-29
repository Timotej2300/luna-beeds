import { create } from "zustand";
import type { ForumPost } from "@/types/forum";

interface ForumState {
  posts: ForumPost[];
  isLoading: boolean;
  setPosts: (posts: ForumPost[]) => void;
  addPost: (post: ForumPost) => void;
  updatePost: (postId: string, updates: Partial<ForumPost>) => void;
  removePost: (postId: string) => void;
  setLoading: (loading: boolean) => void;
  toggleLikeOptimistic: (postId: string, liked: boolean) => void;
  incrementComments: (postId: string, delta: number) => void;
}

/**
 * Lokálny store fóra. Slúži na okamžitú (optimistickú) aktualizáciu UI
 * - reálny zdroj pravdy zostáva Supabase (Realtime kanály v ForumPost.tsx
 * a ForumComments.tsx synchronizujú zmeny od iných používateľov).
 */
export const useForumStore = create<ForumState>((set) => ({
  posts: [],
  isLoading: false,

  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),

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

  setLoading: (loading) => set({ isLoading: loading }),

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
