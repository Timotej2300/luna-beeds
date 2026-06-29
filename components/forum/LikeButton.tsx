"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toggleForumLike } from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";

interface LikeButtonProps {
  postId: string;
  likedByMe: boolean;
  likesCount: number;
  currentUserId: string | null;
}

export function LikeButton({
  postId,
  likedByMe,
  likesCount,
  currentUserId,
}: LikeButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toggleLikeOptimistic = useForumStore((s) => s.toggleLikeOptimistic);

  async function handleClick() {
    if (!currentUserId || isSubmitting) return;
    setIsSubmitting(true);

    // Optimistická aktualizácia - Realtime potvrdí/zosynchronizuje skutočný stav
    toggleLikeOptimistic(postId, !likedByMe);

    try {
      const supabase = createClient();
      await toggleForumLike(supabase, postId, currentUserId, likedByMe);
    } catch (error) {
      // rollback pri zlyhaní
      toggleLikeOptimistic(postId, likedByMe);
      console.error("Nepodarilo sa uložiť like:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!currentUserId || isSubmitting}
      className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-[#C2185B] disabled:cursor-not-allowed disabled:opacity-60"
      aria-pressed={likedByMe}
      aria-label={likedByMe ? "Odobrať like" : "Páči sa mi to"}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={likedByMe ? "liked" : "unliked"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.span
              animate={likedByMe ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className="h-5 w-5"
                fill={likedByMe ? "#C2185B" : "none"}
                stroke={likedByMe ? "#C2185B" : "currentColor"}
              />
            </motion.span>
          </motion.span>
        </AnimatePresence>
      </span>
      <span>{likesCount}</span>
    </button>
  );
}
