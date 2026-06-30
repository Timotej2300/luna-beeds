import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Forum,
  ForumAuthorRow,
  ForumComment,
  ForumPost,
  ForumPostRow,
  ForumRow,
} from "@/types/forum";
import type { AppUser } from "@/types/user";

/**
 * POZNÁMKA K AUTOROM: forum_posts.author_id a forum_comments.author_id
 * odkazujú na auth.users(id), NIE na admin_users(id) - keďže príspevky
 * a fóra môžu vytvárať len admin role, ale komentovať/lajkovať môže aj
 * bežný zákazník (iba profiles, žiadny admin_users riadok). Meno a rola
 * autora sa preto dotahujú cez RPC funkciu `get_forum_authors`, ktorá
 * (cez SECURITY DEFINER) zjednocuje admin_users (s rolou) a profiles
 * (zákazníci, role: null) a bezpečne obíde RLS politiku na profiles,
 * ktorá by inak bránila čítaniu cudzích mien. Pozri
 * supabase/migrations/forum_rls.sql.
 */

const POST_SELECT = `
  id,
  forum_id,
  author_id,
  title,
  content,
  created_at,
  updated_at,
  forum_images ( id, post_id, url, position, created_at ),
  forum_likes ( user_id ),
  forum_comments ( id )
`;

/**
 * Načíta aktuálne prihláseného používateľa. Vracia AppUser pre KAŽDÉHO
 * prihláseného používateľa - admina (s rolou) aj bežného zákazníka
 * (iba auth.users + profiles, roleName: null). Fórum je čitateľné pre
 * oboch; vytváranie fór/príspevkov sa obmedzuje cez roleName
 * (pozri types/roles.ts -> canCreateForumOrPost).
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

  if (adminUser) {
    const role = (adminUser as any).role ?? null;
    return {
      id: user.id,
      email: user.email ?? null,
      displayName: `${adminUser.first_name} ${adminUser.last_name}`.trim(),
      isAdmin: true,
      adminUser: { ...(adminUser as any), role },
      roleName: role?.name ?? null,
      roleColor: role?.color ?? null,
      roleIcon: role?.icon ?? null,
    };
  }

  // Bežný zákazník - skús dotiahnuť meno z profiles, inak fallback na e-mail
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    profile?.email ||
    user.email ||
    "Používateľ";

  return {
    id: user.id,
    email: user.email ?? null,
    displayName,
    isAdmin: false,
    adminUser: null,
    roleName: null,
    roleColor: null,
    roleIcon: null,
  };
}

// ---------------------------------------------------------------------------
// FORUMS (kategórie)
// ---------------------------------------------------------------------------

function mapForumRow(row: ForumRow): Forum {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    created_by: row.created_by,
    created_at: row.created_at,
    posts_count: row.forum_posts?.length ?? 0,
  };
}

export async function fetchForums(supabase: SupabaseClient): Promise<Forum[]> {
  const { data, error } = await supabase
    .from("forums")
    .select("id, name, description, icon, created_by, created_at, forum_posts ( id )")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as ForumRow[]).map(mapForumRow);
}

export async function fetchForum(
  supabase: SupabaseClient,
  forumId: string
): Promise<Forum | null> {
  const { data, error } = await supabase
    .from("forums")
    .select("id, name, description, icon, created_by, created_at, forum_posts ( id )")
    .eq("id", forumId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapForumRow(data as unknown as ForumRow);
}

export async function createForum(
  supabase: SupabaseClient,
  createdBy: string,
  name: string,
  description: string,
  icon: string
): Promise<string> {
  const { data, error } = await supabase
    .from("forums")
    .insert({ created_by: createdBy, name, description, icon })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateForum(
  supabase: SupabaseClient,
  forumId: string,
  name: string,
  description: string,
  icon: string
): Promise<void> {
  const { error } = await supabase
    .from("forums")
    .update({ name, description, icon })
    .eq("id", forumId);

  if (error) throw error;
}

export async function deleteForum(
  supabase: SupabaseClient,
  forumId: string
): Promise<void> {
  const { error } = await supabase.from("forums").delete().eq("id", forumId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// FORUM POSTS
// ---------------------------------------------------------------------------

function mapPostRow(
  row: ForumPostRow,
  currentUserId: string | null,
  authorsById: Map<string, ForumAuthorRow>
): ForumPost {
  const authorRow = authorsById.get(row.author_id) ?? null;
  const author = authorRow
    ? {
        id: authorRow.id,
        first_name: authorRow.first_name ?? "",
        last_name: authorRow.last_name ?? "",
        role_name: authorRow.role_name,
        role_color: authorRow.role_color,
        role_icon: authorRow.role_icon,
      }
    : null;

  return {
    id: row.id,
    forum_id: row.forum_id,
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

async function fetchAuthorsByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, ForumAuthorRow>> {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  const map = new Map<string, ForumAuthorRow>();
  if (uniqueIds.length === 0) return map;

  const { data, error } = await supabase.rpc("get_forum_authors", {
    author_ids: uniqueIds,
  });

  if (error) throw error;
  (data ?? []).forEach((row: any) => map.set(row.id, row));
  return map;
}

export async function fetchForumPosts(
  supabase: SupabaseClient,
  forumId: string,
  currentUserId: string | null
): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(POST_SELECT)
    .eq("forum_id", forumId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as unknown as ForumPostRow[];
  const authorsById = await fetchAuthorsByIds(
    supabase,
    rows.map((r) => r.author_id)
  );
  return rows.map((row) => mapPostRow(row, currentUserId, authorsById));
}

/** Naprieč VŠETKÝMI fórami - pre admin moderáciu na /admin/forum/posts. */
export async function fetchAllForumPosts(
  supabase: SupabaseClient,
  currentUserId: string | null
): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as unknown as ForumPostRow[];
  const authorsById = await fetchAuthorsByIds(
    supabase,
    rows.map((r) => r.author_id)
  );
  return rows.map((row) => mapPostRow(row, currentUserId, authorsById));
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
  const row = data as unknown as ForumPostRow;
  const authorsById = await fetchAuthorsByIds(supabase, [row.author_id]);
  return mapPostRow(row, currentUserId, authorsById);
}

export async function createForumPost(
  supabase: SupabaseClient,
  forumId: string,
  authorId: string,
  title: string,
  content: string
): Promise<string> {
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({ forum_id: forumId, author_id: authorId, title, content })
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

// ---------------------------------------------------------------------------
// LIKES
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// COMMENTS
// ---------------------------------------------------------------------------

export async function fetchForumComments(
  supabase: SupabaseClient,
  postId: string
): Promise<ForumComment[]> {
  const { data, error } = await supabase
    .from("forum_comments")
    .select("id, post_id, author_id, text, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const authorsById = await fetchAuthorsByIds(
    supabase,
    rows.map((r: any) => r.author_id)
  );

  return rows.map((row: any) => {
    const authorRow = authorsById.get(row.author_id) ?? null;
    return {
      id: row.id,
      post_id: row.post_id,
      author_id: row.author_id,
      text: row.text,
      created_at: row.created_at,
      author: authorRow
        ? {
            id: authorRow.id,
            first_name: authorRow.first_name ?? "",
            last_name: authorRow.last_name ?? "",
            role_name: authorRow.role_name,
            role_color: authorRow.role_color,
            role_icon: authorRow.role_icon,
          }
        : null,
    };
  });
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
