"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import type { Forum } from "@/types/forum";

interface ForumCategoryCardProps {
  forum: Forum;
  canManage: boolean;
  onEdit: (forum: Forum) => void;
  onDelete: (forumId: string) => void;
}

export function ForumCategoryCard({
  forum,
  canManage,
  onEdit,
  onDelete,
}: ForumCategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-[#FFB6D9]/30 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <Link href={`/forum/${forum.id}`} className="block">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFE9F3] text-xl">
            {forum.icon || "💬"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-neutral-900">
              {forum.name}
            </h3>
            {forum.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">
                {forum.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500">
          <MessageSquare className="h-4 w-4" />
          {forum.posts_count} {forum.posts_count === 1 ? "prispevok" : "prispevkov"}
        </div>
      </Link>

      {canManage && (
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEdit(forum);
            }}
            className="rounded-full bg-white p-1.5 text-neutral-400 shadow-sm hover:bg-neutral-100 hover:text-[#C2185B]"
            aria-label="Upraviť fórum"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete(forum.id);
            }}
            className="rounded-full bg-white p-1.5 text-neutral-400 shadow-sm hover:bg-red-50 hover:text-red-500"
            aria-label="Zmazať fórum"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
