"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ForumCardProps {
  children: ReactNode;
}

/**
 * Vizuálny rám karty prispevku - replikuje ASCII layout zo zadania:
 * horný divider s nadpisom "FORUM", obsah, spodný divider.
 * Samotný obsah (nadpis prispevku, text, galéria, autor, akcie) renderuje ForumPost.tsx,
 * ktorý je vložený ako children.
 */
export function ForumCard({ children }: ForumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 px-1 pb-2">
        <span className="h-px flex-1 bg-[#FFB6D9]/40" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#C2185B]/70">
          Forum
        </span>
        <span className="h-px flex-1 bg-[#FFB6D9]/40" />
      </div>
      {children}
    </motion.div>
  );
}
