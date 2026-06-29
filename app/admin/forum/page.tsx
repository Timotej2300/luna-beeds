import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/supabase/forum";
import { hasForumAccess } from "@/types/roles";
import { ForbiddenForum } from "@/app/(shop)/forum/components/ForbiddenForum";

export const metadata = {
  title: "Správa Fóra | Luna&Beeds Admin",
};

export default async function AdminForumPage() {
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  if (!appUser || !hasForumAccess(appUser.roleName)) {
    return <ForbiddenForum />;
  }

  const [{ count: postsCount }, { count: commentsCount }] = await Promise.all([
    supabase.from("forum_posts").select("*", { count: "exact", head: true }),
    supabase.from("forum_comments").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-[#C2185B]">Správa Fóra</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#FFB6D9]/40 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">Prispevky</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {postsCount ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-[#FFB6D9]/40 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">Komentáre</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {commentsCount ?? 0}
          </p>
        </div>
      </div>

      <Link
        href="/admin/forum/posts"
        className="mt-6 inline-flex items-center rounded-full bg-[#C2185B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A01650]"
      >
        Zobraziť všetky prispevky
      </Link>
    </div>
  );
}
