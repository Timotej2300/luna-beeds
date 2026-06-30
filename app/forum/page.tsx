import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/supabase/forum";
import { canCreateForumOrPost } from "@/types/roles";
import { ForbiddenForum } from "@/components/forum/ForbiddenForum";
import { ForumsFeed } from "@/app/(shop)/forum/components/ForumsFeed";

export const metadata = {
  title: "Správa Fóra | Luna&Beeds Admin",
};

export default async function AdminForumPage() {
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  // Správu fór (vytváranie/úprava) majú iba admin role - bežný zákazník sem nemá prístup.
  if (!appUser || !canCreateForumOrPost(appUser.roleName)) {
    return (
      <ForbiddenForum message="Nemáš oprávnenie vstúpiť do tejto sekcie." />
    );
  }

  return (
    <div>
      <div className="px-4 pt-6 sm:px-6">
        <Link
          href="/admin/forum/posts"
          className="text-sm font-medium text-[#C2185B] hover:underline"
        >
          Zobraziť všetky prispevky naprieč fórami →
        </Link>
      </div>
      <ForumsFeed currentUserId={appUser.id} canManage />
    </div>
  );
}
