"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CommentFormProps {
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function CommentForm({ onSubmit, disabled }: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Napiste komentár..."
        disabled={disabled}
        className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[#C2185B] disabled:bg-neutral-50"
      />
      <motion.button
        type="submit"
        disabled={!text.trim() || isSubmitting || disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FFB6D9] px-4 py-2 text-sm font-semibold text-[#C2185B] transition-colors hover:bg-[#FF9EC9] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Pridať komentár
      </motion.button>
    </form>
  );
}
