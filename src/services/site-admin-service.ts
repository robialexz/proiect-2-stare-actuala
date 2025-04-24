/**
 * Serviciu pentru gestionarea administratorilor de site
 */

import { supabase } from "@/services/api/supabase-client";
import { SupabaseTables } from "@/types/supabase-tables";

export interface SiteAdmin {
  id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

/**
 * Serviciu pentru gestionarea administratorilor de site
 */
export const siteAdminService = {
  /**
   * Obține toți administratorii de site
   * @returns Lista de administratori de site
   */
  async getAllSiteAdmins(): Promise<SiteAdmin[]> {
    try {
      const { data, error } = await supabase
        .from(SupabaseTables.SITE_ADMINS)
        .select("*, user:profiles(id, email, display_name)");

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Eroare la obținerea administratorilor de site:", error);
      throw error;
    }
  },

  /**
   * Verifică dacă un utilizator este administrator de site
   * @param userId ID-ul utilizatorului
   * @returns true dacă utilizatorul este administrator de site, false în caz contrar
   */
  async isSiteAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(SupabaseTables.SITE_ADMINS)
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 este codul pentru "nu s-a găsit niciun rezultat"
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error("Eroare la verificarea rolului de admin de site:", error);
      return false;
    }
  },

  /**
   * Adaugă un utilizator ca administrator de site
   * @param userId ID-ul utilizatorului
   * @returns Administratorul de site adăugat
   */
  async addSiteAdmin(userId: string): Promise<SiteAdmin> {
    try {
      const { data, error } = await supabase
        .from(SupabaseTables.SITE_ADMINS)
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Eroare la adăugarea administratorului de site:", error);
      throw error;
    }
  },

  /**
   * Elimină un utilizator din lista de administratori de site
   * @param userId ID-ul utilizatorului
   */
  async removeSiteAdmin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(SupabaseTables.SITE_ADMINS)
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Eroare la eliminarea administratorului de site:", error);
      throw error;
    }
  },
};

export default siteAdminService;
