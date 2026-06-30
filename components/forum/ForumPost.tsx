"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Pencil, Trash2, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteForumPost, updateForumPost } from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";
import { RoleBadge } from "./RoleBadge";
import { ForumImageGallery } from "./ForumImageGallery";
import { LikeButton } from "./LikeButton";
import { ForumComments } from "./ForumComments";
import { ForumCard } from "./ForumCard";
import type { ForumPost as ForumPostType } from "@/types/forum";

interface ForumPostProps {
  post: ForumPostType;
  currentUserId: string | null;
  hasFullAccess: boolean;
}

export function ForumPost({ post, currentUserId, hasFullAccess }: ForumPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const removePost = useForumStore((s) => s.removePost);
  const updatePostInStore = useForumStore((s) => s.updatePost);

  const canEdit = currentUserId === post.author_id || hasFullAccess;
  const canDelete = currentUserId === post.author_id || hasFullAccess;

  const authorName = post.author
    ? `${post.author.first_name} ${post.author.last_name}`.trim()
    : "Neznámy autor";

  const date = new Date(post.created_at).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleSaveEdit() {
    if (!editTitle.trim() || !editContent.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      await updateForumPost(supabase, post.id, editTitle.trim(), editContent.trim());
      updatePostInStore(post.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Nepodarilo sa upraviť prispevok:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Naozaj chcete zmazať tento prispevok?")) return;
    try {
      const supabase = createClient();
      await deleteForumPost(supabase, post.id);
      removePost(post.id);
    } catch (error) {
      console.error("Nepodarilo sa zmazať prispevok:", error);
    }
  }

  return (
    <ForumCard>
      <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-2xl border border-[#FFB6D9]/30 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-5 sm:p-6">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-base font-semibold outline-none focus:border-[#C2185B]"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-[#C2185B]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(post.title);
                  setEditContent(post.content);
                }}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" /> Zrušiť
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-1 rounded-full bg-[#C2185B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A01650] disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Uložiť
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-neutral-900">
                {post.title}
              </h3>

              {(canEdit || canDelete) && (
                <div className="flex flex-shrink-0 gap-1">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-[#C2185B]"
                      aria-label="Upraviť prispevok"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-full p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="Zmazať prispevok"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {post.content}
            </p>

            <ForumImageGallery images={post.images} />
          </>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">
              👤 {authorName}
            </span>
            <RoleBadge
              roleName={post.author?.role_name ?? null}
              roleColor={post.author?.role_color}
              roleIcon={post.author?.role_icon}
            />
            <span className="text-xs text-neutral-400">{date}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-5">
          <LikeButton
            postId={post.id}
            likedByMe={post.liked_by_me}
            likesCount={post.likes_count}
            currentUserId={currentUserId}
          />

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-[#C2185B]"
          >
            <MessageCircle className="h-5 w-5" />
            {post.comments_count} Komentárov
          </button>
        </div>

        {showComments && (
          <ForumComments
            postId={post.id}
            postAuthorId={post.author_id}
            currentUserId={currentUserId}
            hasFullAccess={hasFullAccess}
          />
        )}
      </div>
    </motion.article>
    </ForumCard>
  );
}
