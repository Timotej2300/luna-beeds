"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createForumPost,
  fetchForumPost,
  uploadForumImage,
} from "@/lib/supabase/forum";
import { useForumStore } from "@/store/forum";

const MAX_IMAGES = 10;

interface ForumComposerProps {
  forumId: string;
  currentUserId: string;
}

export function ForumComposer({ forumId, currentUserId }: ForumComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPost = useForumStore((s) => s.addPost);

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, MAX_IMAGES - images.length);
    if (newFiles.length === 0) return;

    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [
      ...prev,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const postId = await createForumPost(
        supabase,
        forumId,
        currentUserId,
        title.trim(),
        content.trim()
      );

      for (let i = 0; i < images.length; i++) {
        await uploadForumImage(supabase, postId, images[i], i);
      }

      const fullPost = await fetchForumPost(supabase, postId, currentUserId);
      if (fullPost) addPost(fullPost);

      setTitle("");
      setContent("");
      setImages([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setError("Prispevok sa nepodarilo publikovať. Skúste to znova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[#FFB6D9]/40 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-[#C2185B]">
        Nový prispevok
      </h2>

      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nadpis"
          maxLength={150}
          className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#C2185B]"
          required
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O čom chcete písať?"
          rows={4}
          className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#C2185B]"
          required
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((src, index) => (
              <div
                key={src}
                className="group relative aspect-square overflow-hidden rounded-lg bg-[#FFE9F3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Odstrániť obrázok"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <label
            className={`flex cursor-pointer items-center gap-2 text-sm font-medium text-[#C2185B] ${
              images.length >= MAX_IMAGES ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <ImagePlus className="h-5 w-5" />
            Pridať obrázky ({images.length}/{MAX_IMAGES})
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
              disabled={images.length >= MAX_IMAGES}
            />
          </label>

          <motion.button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-full bg-[#C2185B] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#A01650] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Publikovať
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
