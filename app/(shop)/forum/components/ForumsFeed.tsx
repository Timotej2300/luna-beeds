"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createForum,
  deleteForum,
  fetchForums,
  updateForum,
} from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";
import { ForumCategoryCard } from "@/components/forum/ForumCategoryCard";
import { ForumCategoryFormModal } from "@/components/forum/ForumCategoryFormModal";
import type { Forum } from "@/types/forum";

interface ForumsFeedProps {
  currentUserId: string;
  canManage: boolean;
}

export function ForumsFeed({ currentUserId, canManage }: ForumsFeedProps) {
  const forums = useForumStore((s) => s.forums);
  const setForums = useForumStore((s) => s.setForums);
  const addForum = useForumStore((s) => s.addForum);
  const updateForumInStore = useForumStore((s) => s.updateForum);
  const removeForum = useForumStore((s) => s.removeForum);
  const isLoading = useForumStore((s) => s.isLoadingForums);
  const setLoading = useForumStore((s) => s.setLoadingForums);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    setLoading(true);
    fetchForums(supabase)
      .then((data) => {
        if (isMounted) setForums(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const channel = supabase
      .channel("forums_list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forums" },
        () => {
          fetchForums(supabase).then((data) => {
            if (isMounted) setForums(data);
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateOrUpdate(
    name: string,
    description: string,
    icon: string
  ) {
    const supabase = createClient();
    if (editingForum) {
      await updateForum(supabase, editingForum.id, name, description, icon);
      updateForumInStore(editingForum.id, { name, description, icon });
    } else {
      const id = await createForum(supabase, currentUserId, name, description, icon);
      addForum({
        id,
        name,
        description,
        icon,
        created_by: currentUserId,
        created_at: new Date().toISOString(),
        posts_count: 0,
      });
    }
  }

  async function handleDelete(forumId: string) {
    if (!confirm("Naozaj chcete zmazať toto fórum? Zmažú sa aj všetky jeho prispevky.")) {
      return;
    }
    const supabase = createClient();
    await deleteForum(supabase, forumId);
    removeForum(forumId);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-[#C2185B] sm:text-3xl"
        >
          Forum
        </motion.h1>

        {canManage && (
          <motion.button
            type="button"
            onClick={() => {
              setEditingForum(null);
              setIsModalOpen(true);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-full bg-[#C2185B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#A01650]"
          >
            <Plus className="h-4 w-4" />
            Nové fórum
          </motion.button>
        )}
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-neutral-400">
          Načítavam fóra...
        </p>
      ) : forums.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">
          Zatiaľ tu nie sú žiadne fóra.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forums.map((forum) => (
            <ForumCategoryCard
              key={forum.id}
              forum={forum}
              canManage={canManage}
              onEdit={(f) => {
                setEditingForum(f);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ForumCategoryFormModal
        isOpen={isModalOpen}
        editingForum={editingForum}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
}
