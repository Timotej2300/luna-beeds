"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { fetchForumPost, fetchForumPosts } from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";
import { ForumComposer } from "@/components/forum/ForumComposer";
import { ForumPost } from "@/components/forum/ForumPost";

interface ForumFeedProps {
  currentUserId: string | null;
  isOwner: boolean;
}

export function ForumFeed({ currentUserId, isOwner }: ForumFeedProps) {
  const posts = useForumStore((s) => s.posts);
  const setPosts = useForumStore((s) => s.setPosts);
  const isLoading = useForumStore((s) => s.isLoading);
  const setLoading = useForumStore((s) => s.setLoading);
  const updatePost = useForumStore((s) => s.updatePost);
  const removePost = useForumStore((s) => s.removePost);
  const addPost = useForumStore((s) => s.addPost);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    setLoading(true);
    fetchForumPosts(supabase, currentUserId)
      .then((data) => {
        if (isMounted) setPosts(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Realtime: nové prispevky, lajky a zmeny počtu komentárov od iných používateľov
    const channel = supabase
      .channel("forum_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "forum_posts" },
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
  }, [currentUserId]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 text-2xl font-bold text-[#C2185B] sm:text-3xl"
      >
        Forum
      </motion.h1>

      {currentUserId && (
        <div className="mb-8">
          <ForumComposer currentUserId={currentUserId} />
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
                isOwner={isOwner}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
