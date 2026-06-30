/**
 * Role definované v public.roles (supabase/migrations).
 * Tieto názvy musia presne sedieť so stĺpcom `roles.name` v databáze.
 */
export const ROLE_NAMES = {
  VLASTNIK: "Vlastník",
  SPOLUVLASTNIK: "Spoluvlastník",
  SPRAVA: "Správa",
  SPRAVA_WEBU: "Správa Webu",
  MANAZER: "Manažér",
  OBCHODNY_MANAZER: "Obchodný manažér",
  QA: "QA",
  DESIGN: "Design",
} as const;

/**
 * Role, ktoré môžu vytvárať FÓRA (kategórie) a PRÍSPEVKY v nich.
 * Toto sú všetky administratívne role v systéme.
 */
export const FORUM_CREATOR_ROLES = [
  "Vlastník",
  "Spoluvlastník",
  "Správa",
  "Správa Webu",
  "Manažér",
  "Obchodný manažér",
  "QA",
  "Design",
] as const;

export type ForumCreatorRole = (typeof FORUM_CREATOR_ROLES)[number];

/**
 * Role s plnými právami - môžu upraviť/zmazať čokoľvek (cudzie príspevky,
 * komentáre, celé fóra), nie len svoj vlastný obsah.
 */
export const FORUM_FULL_ACCESS_ROLES = ["Vlastník", "Správa Webu"] as const;

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

/**
 * Čítanie fóra, príspevkov, komentárov a lajkovanie/komentovanie
 * je dostupné každému prihlásenému používateľovi - táto funkcia
 * existuje len pre symetriu API, vždy vráti true (kontrola prihlásenia
 * sa rieši samostatne podľa existencie session, nie podľa role).
 */
export function canViewForum(): boolean {
  return true;
}

export function canCreateForumOrPost(roleName: string | null | undefined): boolean {
  if (!roleName) return false;
  return (FORUM_CREATOR_ROLES as readonly string[]).includes(roleName);
}

export function hasFullForumAccess(roleName: string | null | undefined): boolean {
  if (!roleName) return false;
  return (FORUM_FULL_ACCESS_ROLES as readonly string[]).includes(roleName);
}

export function isOwner(roleName: string | null | undefined): boolean {
  return roleName === ROLE_NAMES.VLASTNIK;
}
