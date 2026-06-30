import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchForum, getCurrentAppUser } from "@/lib/supabase/forum";
import { canCreateForumOrPost, hasFullForumAccess } from "@/types/roles";
import { ForumPostsFeed } from "./components/ForumPostsFeed";
import { ForbiddenForum } from "@/components/forum/ForbiddenForum";

interface ForumDetailPageProps {
  params: Promise<{ forumId: string }>;
}

export default async function ForumDetailPage({ params }: ForumDetailPageProps) {
  const { forumId } = await params;
  const supabase = await createClient();
  const appUser = await getCurrentAppUser(supabase);

  if (!appUser) {
    return (
      <ForbiddenForum message="Nemáš oprávnenie vstúpiť do tejto sekcie. Prihlás sa, prosím." />
    );
  }

  const forum = await fetchForum(supabase, forumId);
  if (!forum) {
    notFound();
  }

  return (
    <ForumPostsFeed
      forum={forum}
      currentUserId={appUser.id}
      canPost={canCreateForumOrPost(appUser.roleName)}
      hasFullAccess={hasFullForumAccess(appUser.roleName)}
    />
  );
}
