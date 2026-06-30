import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchAllForumPosts, fetchForums, getCurrentAppUser } from "@/lib/supabase/forum";
import { canCreateForumOrPost, hasFullForumAccess } from "@/types/roles";
import { ForbiddenForum } from "@/components/forum/ForbiddenForum";
import { AdminForumPostsList } from "./AdminForumPostsList";

export const metadata = {
  title: "Prispevky | Správa Fóra",
};

export default async function AdminForumPostsPage() {
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  if (!appUser || !canCreateForumOrPost(appUser.roleName)) {
    return <ForbiddenForum message="Nemáš oprávnenie vstúpiť do tejto sekcie." />;
  }

  const [posts, forums] = await Promise.all([
    fetchAllForumPosts(supabase, appUser.id),
    fetchForums(supabase),
  ]);

  const forumNameById = new Map(forums.map((f) => [f.id, f.name]));

  return (
    <div className="px-4 py-8 sm:px-6">
      <Link
        href="/admin/forum"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-[#C2185B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na fóra
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[#C2185B]">
        Všetky prispevky
      </h1>

      <AdminForumPostsList
        initialPosts={posts}
        forumNameById={Object.fromEntries(forumNameById)}
        currentUserId={appUser.id}
        hasFullAccess={hasFullForumAccess(appUser.roleName)}
      />
    </div>
  );
}
