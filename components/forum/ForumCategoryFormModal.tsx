"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import type { Forum } from "@/types/forum";

const ICON_OPTIONS = ["💬", "🌸", "💎", "🎨", "📦", "❓", "📢", "✨"];

interface ForumCategoryFormModalProps {
  isOpen: boolean;
  editingForum: Forum | null;
  onClose: () => void;
  onSubmit: (name: string, description: string, icon: string) => Promise<void>;
}

export function ForumCategoryFormModal({
  isOpen,
  editingForum,
  onClose,
  onSubmit,
}: ForumCategoryFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingForum) {
      setName(editingForum.name);
      setDescription(editingForum.description ?? "");
      setIcon(editingForum.icon ?? ICON_OPTIONS[0]);
    } else {
      setName("");
      setDescription("");
      setIcon(ICON_OPTIONS[0]);
    }
  }, [editingForum, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), description.trim(), icon);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#C2185B]">
                {editingForum ? "Upraviť fórum" : "Nové fórum"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100"
                aria-label="Zatvoriť"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIcon(opt)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors ${
                      icon === opt
                        ? "bg-[#C2185B] text-white"
                        : "bg-[#FFE9F3] hover:bg-[#FFB6D9]/60"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Názov fóra"
                maxLength={80}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#C2185B]"
                required
                autoFocus
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Krátky popis (nepovinné)"
                rows={3}
                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#C2185B]"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
              >
                Zrušiť
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex items-center gap-2 rounded-full bg-[#C2185B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#A01650] disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingForum ? "Uložiť" : "Vytvoriť"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
