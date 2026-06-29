"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import type { ForumComment as ForumCommentType } from "@/types/forum";

interface ForumCommentProps {
  comment: ForumCommentType;
  canDelete: boolean;
  onDelete: (commentId: string) => void;
}

export function ForumComment({ comment, canDelete, onDelete }: ForumCommentProps) {
  const authorName = comment.author
    ? `${comment.author.first_name} ${comment.author.last_name}`.trim()
    : "Neznámy autor";

  const date = new Date(comment.created_at).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex gap-3 border-b border-neutral-100 py-3 last:border-0"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FFE9F3] text-sm font-semibold text-[#C2185B]">
        {authorName.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-800">
            👤 {authorName}
          </span>
          <RoleBadge
            roleName={comment.author?.role_name ?? null}
            roleColor={comment.author?.role_color}
            roleIcon={comment.author?.role_icon}
          />
          <span className="text-xs text-neutral-400">{date}</span>
        </div>

        <p className="mt-1 text-sm text-neutral-700">{comment.text}</p>
      </div>

      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          className="flex-shrink-0 self-start rounded-full p-1.5 text-neutral-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          aria-label="Zmazať komentár"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}
