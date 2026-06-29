/**
 * Role definované v public.roles (supabase/migrations).
 * Tieto názvy musia presne sedieť so stĺpcom `roles.name` v databáze.
 */
export const ROLE_NAMES = {
  VLASTNIK: "Vlastník",
  SPOLUVLASTNIK: "Spoluvlastník",
  MANAZER: "Manažér",
  OBCHODNY_MANAZER: "Obchodný manažér",
  SPRAVA: "Správa",
  DESIGN: "Design",
  QA: "QA",
} as const;

/**
 * Role, ktoré majú prístup do Fóra.
 * Zadanie spomína "Designer" a "Sprava Fora" - v existujúcej DB seed dátach
 * sa volajú "Design" a "Správa". "Sprava Fora" je nová rola špecifická pre
 * fórum a je doplnená v migrácii supabase/migrations/forum_rls.sql.
 */
export const FORUM_ALLOWED_ROLES = [
  "Vlastník",
  "Design",
  "Správa",
  "Správa Fóra",
] as const;

export type ForumAllowedRole = (typeof FORUM_ALLOWED_ROLES)[number];

export interface Role {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
  hierarchy: number;
  permissions: string[];
  created_at: string;
}

export function hasForumAccess(roleName: string | null | undefined): boolean {
  if (!roleName) return false;
  return (FORUM_ALLOWED_ROLES as readonly string[]).includes(roleName);
}

export function isOwner(roleName: string | null | undefined): boolean {
  return roleName === ROLE_NAMES.VLASTNIK;
}
