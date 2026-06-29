import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/supabase/forum";
import { hasForumAccess, isOwner } from "@/types/roles";
import { ForumFeed } from "./components/ForumFeed";
import { ForbiddenForum } from "./components/ForbiddenForum";

export const metadata = {
  title: "Forum | Luna&Beeds",
};

export default async function ForumPage() {
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  // Iba Vlastník, Designer (Design), Správa a Správa Fóra majú prístup.
  // Neprihlásený používateľ alebo iná rola -> 403.
  if (!appUser || !hasForumAccess(appUser.roleName)) {
    return <ForbiddenForum />;
  }

  return (
    <ForumFeed
      currentUserId={appUser.id}
      isOwner={isOwner(appUser.roleName)}
    />
  );
}
