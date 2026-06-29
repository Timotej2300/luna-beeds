"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  createForumComment,
  deleteForumComment,
  fetchForumComments,
} from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";
import { ForumComment } from "./ForumComment";
import { CommentForm } from "./CommentForm";
import type { ForumComment as ForumCommentType } from "@/types/forum";

interface ForumCommentsProps {
  postId: string;
  postAuthorId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

export function ForumComments({
  postId,
  postAuthorId,
  currentUserId,
  isOwner,
}: ForumCommentsProps) {
  const [comments, setComments] = useState<ForumCommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const incrementComments = useForumStore((s) => s.incrementComments);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    fetchForumComments(supabase, postId)
      .then((data) => {
        if (isMounted) setComments(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // Realtime: nové/zmazané komentáre od iných používateľov sa prejavia okamžite
    const channel = supabase
      .channel(`forum_comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchForumComments(supabase, postId).then((data) => {
            if (isMounted) setComments(data);
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  async function handleAddComment(text: string) {
    if (!currentUserId) return;
    const supabase = createClient();
    await createForumComment(supabase, postId, currentUserId, text);
    incrementComments(postId, 1);
    // lokálny zoznam sa aktualizuje aj cez realtime, no pre okamžitú odozvu refetchneme
    const updated = await fetchForumComments(supabase, postId);
    setComments(updated);
  }

  async function handleDeleteComment(commentId: string) {
    const supabase = createClient();
    await deleteForumComment(supabase, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    incrementComments(postId, -1);
  }

  function canDeleteComment(comment: ForumCommentType): boolean {
    if (isOwner) return true;
    return currentUserId === comment.author_id;
  }

  return (
    <div className="mt-4 border-t border-neutral-100 pt-4">
      {isLoading ? (
        <p className="text-sm text-neutral-400">Načítavam komentáre...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Zatiaľ žiadne komentáre. Buďte prvý!
        </p>
      ) : (
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <ForumComment
              key={comment.id}
              comment={comment}
              canDelete={canDeleteComment(comment)}
              onDelete={handleDeleteComment}
            />
          ))}
        </AnimatePresence>
      )}

      {currentUserId && <CommentForm onSubmit={handleAddComment} />}
    </div>
  );
}
