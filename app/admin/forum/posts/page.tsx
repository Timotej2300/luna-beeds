import { createClient } from "@/lib/supabase/server";
import { fetchForumPosts, getCurrentAppUser } from "@/lib/supabase/forum";
import { hasForumAccess, isOwner } from "@/types/roles";
import { ForbiddenForum } from "@/app/(shop)/forum/components/ForbiddenForum";
import { AdminForumPostsList } from "./AdminForumPostsList";

export const metadata = {
  title: "Prispevky | Správa Fóra",
};

export default async function AdminForumPostsPage() {
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  if (!appUser || !hasForumAccess(appUser.roleName)) {
    return <ForbiddenForum />;
  }

  const posts = await fetchForumPosts(supabase, appUser.id);

  return (
    <div className="px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-[#C2185B]">
        Všetky prispevky
      </h1>

      <AdminForumPostsList
        initialPosts={posts}
        currentUserId={appUser.id}
        isOwner={isOwner(appUser.roleName)}
      />
    </div>
  );
}
