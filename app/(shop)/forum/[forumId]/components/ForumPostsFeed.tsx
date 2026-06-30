"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchForumPost, fetchForumPosts } from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";
import { ForumComposer } from "@/components/forum/ForumComposer";
import { ForumPost } from "@/components/forum/ForumPost";
import type { Forum } from "@/types/forum";

interface ForumPostsFeedProps {
  forum: Forum;
  currentUserId: string;
  canPost: boolean;
  hasFullAccess: boolean;
}

export function ForumPostsFeed({
  forum,
  currentUserId,
  canPost,
  hasFullAccess,
}: ForumPostsFeedProps) {
  const posts = useForumStore((s) => s.posts);
  const setPosts = useForumStore((s) => s.setPosts);
  const isLoading = useForumStore((s) => s.isLoadingPosts);
  const setLoading = useForumStore((s) => s.setLoadingPosts);
  const updatePost = useForumStore((s) => s.updatePost);
  const removePost = useForumStore((s) => s.removePost);
  const addPost = useForumStore((s) => s.addPost);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    setLoading(true);
    fetchForumPosts(supabase, forum.id, currentUserId)
      .then((data) => {
        if (isMounted) setPosts(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Realtime: nové prispevky, lajky a komentáre od iných používateľov v tomto fóre
    const channel = supabase
      .channel(`forum_posts:${forum.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_posts",
          filter: `forum_id=eq.${forum.id}`,
        },
        async (payload) => {
          const exists = useForumStore.getState().posts.some(
            (p) => p.id === (payload.new as any).id
          );
          if (exists) return;
          const fullPost = await fetchForumPost(
            supabase,
            (payload.new as any).id,
            currentUserId
          );
          if (fullPost && isMounted) addPost(fullPost);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "forum_posts" },
        (payload) => {
          if (isMounted) removePost((payload.old as any).id);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_likes" },
        async (payload) => {
          const postId =
            (payload.new as any)?.post_id ?? (payload.old as any)?.post_id;
          if (!postId) return;
          const fullPost = await fetchForumPost(supabase, postId, currentUserId);
          if (fullPost && isMounted) {
            updatePost(postId, {
              likes_count: fullPost.likes_count,
              liked_by_me: fullPost.liked_by_me,
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forum.id, currentUserId]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/forum"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-[#C2185B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na fóra
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-center gap-3"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFE9F3] text-2xl">
          {forum.icon || "💬"}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-[#C2185B] sm:text-3xl">
            {forum.name}
          </h1>
          {forum.description && (
            <p className="text-sm text-neutral-600">{forum.description}</p>
          )}
        </div>
      </motion.div>

      {canPost && (
        <div className="mb-8">
          <ForumComposer forumId={forum.id} currentUserId={currentUserId} />
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-neutral-400">
          Načítavam prispevky...
        </p>
      ) : posts.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">
          Zatiaľ tu nie sú žiadne prispevky.
        </p>
      ) : (
        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <ForumPost
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                hasFullAccess={hasFullAccess}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
