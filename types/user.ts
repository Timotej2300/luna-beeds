import type { Role } from "./roles";

/**
 * Reprezentuje záznam z public.admin_users + joinovanú rolu.
 * Iba používatelia s riadkom v admin_users majú administratívnu rolu;
 * ostatní (bežní zákazníci) majú iba public.profiles.
 */
export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  company_email: string;
  private_email: string | null;
  role_id: string | null;
  role: Role | null;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

/**
 * Aktuálne prihlásený používateľ vo fóre - môže to byť admin (s rolou)
 * alebo bežný zákazník (bez role_name). Fórum je čitateľné a komentovateľné
 * pre OBOCH, ale fóra/príspevky vytvárajú len používatelia s rolou
 * z FORUM_CREATOR_ROLES (pozri types/roles.ts).
 */
export interface AppUser {
  id: string;
  email: string | null;
  displayName: string;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  roleName: string | null;
  roleColor: string | null;
  roleIcon: string | null;
}
