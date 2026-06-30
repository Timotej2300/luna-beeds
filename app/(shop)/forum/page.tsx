import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/supabase/forum";
import { canCreateForumOrPost } from "@/types/roles";
import { ForumsFeed } from "./components/ForumsFeed";
import { ForbiddenForum } from "@/components/forum/ForbiddenForum";

export const metadata = {
  title: "Forum | Luna&Beeds",
};

export default async function ForumIndexPage() {
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  // Fórum vidí každý prihlásený používateľ (zákazník aj admin).
  // Neprihlásený používateľ -> 403.
  if (!appUser) {
    return (
      <ForbiddenForum message="Nemáš oprávnenie vstúpiť do tejto sekcie. Prihlás sa, prosím." />
    );
  }

  return (
    <ForumsFeed
      currentUserId={appUser.id}
      canManage={canCreateForumOrPost(appUser.roleName)}
    />
  );
}
