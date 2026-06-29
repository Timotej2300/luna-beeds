import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ForumComment,
  ForumPost,
  ForumPostRow,
} from "@/types/forum";
import { hasForumAccess } from "@/types/roles";
import type { AppUser } from "@/types/user";

const POST_SELECT = `
  id,
  author_id,
  title,
  content,
  created_at,
  updated_at,
  forum_images ( id, post_id, url, position, created_at ),
  forum_likes ( user_id ),
  forum_comments ( id ),
  author:admin_users!forum_posts_author_id_fkey (
    id,
    first_name,
    last_name,
    role:roles ( name, color, icon )
  )
`;

/**
 * Načíta aktuálne prihláseného používateľa a zistí, či má prístup do administrácie
 * (tj. má záznam v admin_users) a akú má rolu. Bežní zákazníci (iba auth.users +
 * profiles) vrátia isAdmin: false, roleName: null.
 */
export async function getCurrentAppUser(
  supabase: SupabaseClient
): Promise<AppUser | null> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select(
      `id, first_name, last_name, company_email, private_email, role_id, created_at,
       role:roles ( id, name, color, icon, description, hierarchy, permissions, created_at )`
    )
    .eq("id", user.id)
    .maybeSingle();

  const role = (adminUser?.role as any) ?? null;

  return {
    id: user.id,
    email: user.email ?? null,
    isAdmin: !!adminUser,
    adminUser: adminUser ? { ...(adminUser as any), role } : null,
    roleName: role?.name ?? null,
  };
}

/** Skontroluje, či má aktuálny používateľ prístup do Fóra. Vracia AppUser alebo null. */
export async function requireForumAccess(
  supabase: SupabaseClient
): Promise<AppUser | null> {
  const appUser = await getCurrentAppUser(supabase);
  if (!appUser || !hasForumAccess(appUser.roleName)) return null;
  return appUser;
}

function mapPostRow(row: ForumPostRow, currentUserId: string | null): ForumPost {
  const author = row.author
    ? {
        id: row.author.id,
        first_name: row.author.first_name ?? "",
        last_name: row.author.last_name ?? "",
        role_name: row.author.role?.name ?? null,
        role_color: row.author.role?.color ?? null,
        role_icon: row.author.role?.icon ?? null,
      }
    : null;

  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author,
    images: (row.forum_images ?? []).slice().sort((a, b) => a.position - b.position),
    likes_count: row.forum_likes?.length ?? 0,
    comments_count: row.forum_comments?.length ?? 0,
    liked_by_me: currentUserId
      ? (row.forum_likes ?? []).some((l) => l.user_id === currentUserId)
      : false,
  };
}

export async function fetchForumPosts(
  supabase: SupabaseClient,
  currentUserId: string | null
): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as ForumPostRow[]).map((row) =>
    mapPostRow(row, currentUserId)
  );
}

export async function fetchForumPost(
  supabase: SupabaseClient,
  postId: string,
  currentUserId: string | null
): Promise<ForumPost | null> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapPostRow(data as unknown as ForumPostRow, currentUserId);
}

export async function createForumPost(
  supabase: SupabaseClient,
  authorId: string,
  title: string,
  content: string
): Promise<string> {
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({ author_id: authorId, title, content })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateForumPost(
  supabase: SupabaseClient,
  postId: string,
  title: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from("forum_posts")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw error;
}

export async function deleteForumPost(
  supabase: SupabaseClient,
  postId: string
): Promise<void> {
  const { error } = await supabase.from("forum_posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function uploadForumImage(
  supabase: SupabaseClient,
  postId: string,
  file: File,
  position: number
): Promise<void> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("forum-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("forum-images")
    .getPublicUrl(path);

  const { error: insertError } = await supabase.from("forum_images").insert({
    post_id: postId,
    url: publicUrlData.publicUrl,
    position,
  });

  if (insertError) throw insertError;
}

export async function toggleForumLike(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("forum_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("forum_likes")
      .insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function fetchForumComments(
  supabase: SupabaseClient,
  postId: string
): Promise<ForumComment[]> {
  const { data, error } = await supabase
    .from("forum_comments")
    .select(
      `id, post_id, author_id, text, created_at,
       author:admin_users!forum_comments_author_id_fkey (
         id, first_name, last_name,
         role:roles ( name, color, icon )
       )`
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    text: row.text,
    created_at: row.created_at,
    author: row.author
      ? {
          id: row.author.id,
          first_name: row.author.first_name ?? "",
          last_name: row.author.last_name ?? "",
          role_name: row.author.role?.name ?? null,
          role_color: row.author.role?.color ?? null,
          role_icon: row.author.role?.icon ?? null,
        }
      : null,
  }));
}

export async function createForumComment(
  supabase: SupabaseClient,
  postId: string,
  authorId: string,
  text: string
): Promise<void> {
  const { error } = await supabase
    .from("forum_comments")
    .insert({ post_id: postId, author_id: authorId, text });
  if (error) throw error;
}

export async function deleteForumComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<void> {
  const { error } = await supabase
    .from("forum_comments")
    .delete()
    .eq("id", commentId);
  if (error) throw error;
}
