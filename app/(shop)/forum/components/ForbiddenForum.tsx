"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export function ForbiddenForum() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[#FFB6D9]/40 bg-white px-8 py-10 text-center shadow-sm"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE9F3]">
          <ShieldAlert className="h-7 w-7 text-[#C2185B]" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">403</h1>
        <p className="text-sm text-neutral-600">
          Nemáš oprávnenie vstúpiť do tejto sekcie.
        </p>
      </motion.div>
    </div>
  );
}
