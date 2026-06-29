import type { Role } from "./roles";

/**
 * Reprezentuje záznam z public.admin_users + joinovanú rolu.
 * Iba používatelia s riadkom v admin_users majú prístup do administratívnych
 * sekcií vrátane Fóra - bežní zákazníci (iba public.profiles) prístup nemajú.
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

export interface AppUser {
  id: string;
  email: string | null;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  roleName: string | null;
}
