"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteForumPost } from "@/lib/supabase/forum";
import type { ForumPost } from "@/types/forum";

interface AdminForumPostsListProps {
  initialPosts: ForumPost[];
  forumNameById: Record<string, string>;
  currentUserId: string;
  hasFullAccess: boolean;
}

export function AdminForumPostsList({
  initialPosts,
  forumNameById,
  currentUserId,
  hasFullAccess,
}: AdminForumPostsListProps) {
  const [posts, setPosts] = useState(initialPosts);

  async function handleDelete(postId: string) {
    if (!confirm("Naozaj chcete zmazať tento prispevok?")) return;
    const supabase = createClient();
    await deleteForumPost(supabase, postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-neutral-400">Zatiaľ žiadne prispevky.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#FFB6D9]/40 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-neutral-500">
            <th className="px-5 py-3 font-medium">Fórum</th>
            <th className="px-5 py-3 font-medium">Nadpis</th>
            <th className="px-5 py-3 font-medium">Autor</th>
            <th className="px-5 py-3 font-medium">Dátum</th>
            <th className="px-5 py-3 font-medium">❤️</th>
            <th className="px-5 py-3 font-medium">💬</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const canDelete = hasFullAccess || post.author_id === currentUserId;
            const authorName = post.author
              ? `${post.author.first_name} ${post.author.last_name}`.trim()
              : "Neznámy";

            return (
              <motion.tr
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-neutral-50 last:border-0 hover:bg-[#FFF6FA]"
              >
                <td className="px-5 py-3 text-neutral-500">
                  {forumNameById[post.forum_id] ?? "—"}
                </td>
                <td className="max-w-xs truncate px-5 py-3 font-medium text-neutral-800">
                  {post.title}
                </td>
                <td className="px-5 py-3 text-neutral-600">{authorName}</td>
                <td className="px-5 py-3 text-neutral-500">
                  {new Date(post.created_at).toLocaleDateString("sk-SK")}
                </td>
                <td className="px-5 py-3 text-neutral-600">
                  {post.likes_count}
                </td>
                <td className="px-5 py-3 text-neutral-600">
                  {post.comments_count}
                </td>
                <td className="px-5 py-3 text-right">
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="rounded-full p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="Zmazať prispevok"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
