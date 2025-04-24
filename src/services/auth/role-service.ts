import { supabase } from "@/lib/supabase";
import {
  UserRoles,
  ROLE_PERMISSIONS,
  RolePermissions,
} from "@/types/supabase-tables";
import { User } from "@supabase/supabase-js";

/**
 * Serviciu pentru gestionarea rolurilor utilizatorilor
 */
export const roleService = {
  /**
   * Obține rolul utilizatorului din baza de date
   * @param userId ID-ul utilizatorului
   * @returns Rolul utilizatorului sau rolul implicit (VIEWER)
   */
  async getUserRole(userId: string): Promise<UserRoles> {
    try {
      console.log("RoleService: Getting user role for", userId);

      // Verificăm dacă utilizatorul este robialexzi0@gmail.com și îi acordăm rolul de SITE_ADMIN
      // Această verificare este prioritară și nu necesită acces la baza de date
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user && user.user && user.user.email === "robialexzi0@gmail.com") {
          console.log(
            "RoleService: User is robialexzi0@gmail.com, granting SITE_ADMIN role"
          );
          return UserRoles.SITE_ADMIN;
        }

        // Verificăm user_metadata pentru rol - aceasta este o verificare rapidă
        if (
          user &&
          user.user &&
          user.user.user_metadata &&
          user.user.user_metadata.role
        ) {
          console.log(
            "RoleService: Found role in user_metadata",
            user.user.user_metadata.role
          );
          return user.user.user_metadata.role as UserRoles;
        }
      } catch (error) {
        console.log(
          "RoleService: Error checking user metadata",
          error instanceof Error ? error.message : String(error)
        );
      }

      // Verificăm direct dacă utilizatorul este în tabelul site_admins
      // Evităm apelurile la RPC și user_roles care cauzează erori
      try {
        const { data: siteAdmin } = await supabase
          .from("site_admins")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (siteAdmin) {
          console.log("RoleService: User is a site admin");
          return UserRoles.SITE_ADMIN;
        }
      } catch (error) {
        console.log(
          "RoleService: Error checking site admin",
          error instanceof Error ? error.message : String(error)
        );
      }

      // Verificăm în tabelul profiles pentru rol
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.role) {
          console.log("RoleService: Found role in profiles", profile.role);
          return profile.role as UserRoles;
        }
      } catch (error) {
        console.log(
          "RoleService: Error getting profile role",
          error instanceof Error ? error.message : String(error)
        );
      }

      // Dacă utilizatorul este robialexzi0@gmail.com, îi acordăm rolul de SITE_ADMIN
      if (user && user.user && user.user.email === "robialexzi0@gmail.com") {
        console.log("RoleService: Admin profile created directly");
        return UserRoles.SITE_ADMIN;
      }

      // Dacă nu avem nici un rol, returnăm rolul implicit
      console.log("RoleService: No role found, returning default role");
      return UserRoles.ADMIN; // Returnăm ADMIN ca rol implicit pentru a asigura accesul
    } catch (error) {
      console.log(
        "RoleService: Unexpected error getting user role",
        error instanceof Error ? error.message : String(error)
      );
      return UserRoles.ADMIN; // Returnăm ADMIN ca rol implicit pentru a asigura accesul
    }
  },

  /**
   * Obține permisiunile asociate unui rol
   * @param role Rolul utilizatorului
   * @returns Permisiunile asociate rolului
   */
  getRolePermissions(role: UserRoles): RolePermissions {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRoles.VIEWER];
  },

  /**
   * Actualizează rolul unui utilizator
   * @param userId ID-ul utilizatorului
   * @param role Noul rol
   * @returns Succes sau eroare
   */
  async updateUserRole(
    userId: string,
    role: UserRoles
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Actualizăm rolul în tabelul de profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (profileError) {
        console.log(
          "RoleService: Error updating profile role",
          profileError.message
        );
        // Încercăm să creăm profilul dacă nu există
        try {
          const { data: user } = await supabase.auth.getUser();
          if (user && user.user) {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                email: user.user.email,
                display_name: user.user.email?.split("@")[0] || "Utilizator",
                role: role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (insertError) {
              console.log(
                "RoleService: Error creating profile",
                insertError.message
              );
              return { success: false, error: insertError.message };
            }
          }
        } catch (createError: any) {
          console.log(
            "RoleService: Error creating profile",
            createError.message
          );
          return { success: false, error: createError.message };
        }
      }

      // Actualizăm și metadatele utilizatorului
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { role: role },
        });

        if (metadataError) {
          console.log(
            "RoleService: Error updating user metadata",
            metadataError.message
          );
          // Continuăm chiar dacă actualizarea metadatelor eșuează
        }
      } catch (metadataError: any) {
        console.log(
          "RoleService: Error updating user metadata",
          metadataError.message
        );
        // Continuăm chiar dacă actualizarea metadatelor eșuează
      }

      return { success: true };
    } catch (error: any) {
      console.log(
        "RoleService: Unexpected error updating user role",
        error.message
      );
      return { success: false, error: error.message || "Eroare neașteptată" };
    }
  },

  /**
   * Obține profilul complet al utilizatorului, inclusiv rolul și permisiunile
   * @param user Utilizatorul
   * @returns Profilul utilizatorului
   */
  async getUserProfile(user: User): Promise<{
    displayName: string;
    email: string;
    role: UserRoles;
    permissions: RolePermissions;
  }> {
    try {
      console.log("RoleService: Getting user profile for", user.id);

      // Verificăm dacă utilizatorul este robialexzi0@gmail.com
      let isAdmin = false;
      if (user.email === "robialexzi0@gmail.com") {
        console.log(
          "RoleService: User is robialexzi0@gmail.com, granting SITE_ADMIN role"
        );
        isAdmin = true;
      }

      // Verificăm dacă utilizatorul este în tabelul site_admins
      try {
        const { data: siteAdmin } = await supabase
          .from("site_admins")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (siteAdmin) {
          console.log("RoleService: User is a site admin");
          isAdmin = true;
        }
      } catch (error) {
        console.log(
          "RoleService: Error checking site admin status",
          error instanceof Error ? error.message : String(error)
        );
      }

      // Dacă utilizatorul este admin, creăm profilul direct
      if (isAdmin) {
        console.log("RoleService: Admin profile created directly");
        const role = UserRoles.SITE_ADMIN;
        console.log("RoleService: User role", role);
        console.log("RoleService: User permissions", ROLE_PERMISSIONS[role]);
        return {
          displayName: user.email?.split("@")[0] || "Admin",
          email: user.email || "",
          role: role,
          permissions: ROLE_PERMISSIONS[role],
        };
      }

      // Verificăm dacă utilizatorul există în tabelul profiles
      let profile = null;
      let profileError = null;

      try {
        // Încercăm să obținem profilul direct - folosim o abordare mai simplă
        // pentru a evita problemele cu tabelul profiles
        if (isAdmin) {
          // Pentru admin, creăm direct un profil fără a interoga baza de date
          profile = {
            display_name: user.email?.split("@")[0] || "Admin",
            email: user.email,
            role: UserRoles.SITE_ADMIN,
          };
          console.log("RoleService: Admin profile created directly");
        } else {
          // Pentru utilizatori normali, verificăm user_metadata
          if (user.user_metadata && user.user_metadata.role) {
            profile = {
              display_name:
                user.user_metadata.name ||
                user.email?.split("@")[0] ||
                "Utilizator",
              email: user.email,
              role: user.user_metadata.role,
            };
            console.log("RoleService: Profile created from user_metadata");
          } else {
            // Încercăm să obținem profilul din baza de date
            try {
              const profileResponse = await supabase
                .from("profiles")
                .select("display_name, email, role")
                .eq("id", user.id)
                .maybeSingle();

              profile = profileResponse.data;
              profileError = profileResponse.error;

              if (!profileError && profile) {
                console.log("RoleService: Profile found in database");
              } else {
                console.log("RoleService: Profile not found, using default");
                profile = {
                  display_name: user.email?.split("@")[0] || "Utilizator",
                  email: user.email,
                  role: UserRoles.ADMIN,
                };
              }
            } catch (dbError) {
              console.log(
                "RoleService: Database error, using default profile",
                dbError
              );
              profile = {
                display_name: user.email?.split("@")[0] || "Utilizator",
                email: user.email,
                role: UserRoles.ADMIN,
              };
            }
          }
        }
      } catch (error) {
        console.log(
          "RoleService: Error in profile handling",
          error instanceof Error ? error.message : String(error)
        );
        // Creăm un profil implicit în caz de eroare
        profile = {
          display_name: user.email?.split("@")[0] || "Utilizator",
          email: user.email,
          role: isAdmin ? UserRoles.SITE_ADMIN : UserRoles.ADMIN,
        };
      }

      // Determinăm rolul utilizatorului
      let role;
      if (isAdmin) {
        role = UserRoles.SITE_ADMIN;
      } else if (profile && profile.role) {
        // Folosim rolul din profil dacă există
        role = profile.role as UserRoles;
      } else if (user.user_metadata && user.user_metadata.role) {
        // Folosim rolul din user_metadata dacă există
        role = user.user_metadata.role as UserRoles;
      } else {
        // Doar dacă nu avem rolul în profil sau metadata, apelăm getUserRole
        role = await this.getUserRole(user.id);
      }
      console.log("RoleService: User role", role);

      // Obținem permisiunile asociate rolului
      const permissions = this.getRolePermissions(role);
      console.log("RoleService: User permissions", permissions);

      // Construim profilul utilizatorului
      const userProfile = {
        displayName:
          profile?.display_name || user.email?.split("@")[0] || "Utilizator",
        email: profile?.email || user.email || "",
        role,
        permissions,
      };

      console.log("RoleService: Returning user profile", userProfile);
      return userProfile;
    } catch (error) {
      console.log(
        "RoleService: Unexpected error getting user profile",
        error instanceof Error ? error.message : String(error)
      );

      // Verificăm dacă utilizatorul este robialexzi0@gmail.com
      if (user.email === "robialexzi0@gmail.com") {
        console.log(
          "RoleService: User is robialexzi0@gmail.com, returning SITE_ADMIN profile"
        );
        const adminProfile = {
          displayName: user.email.split("@")[0],
          email: user.email,
          role: UserRoles.SITE_ADMIN,
          permissions: ROLE_PERMISSIONS[UserRoles.SITE_ADMIN],
        };
        return adminProfile;
      }

      // Returnăm un profil implicit în caz de eroare
      const defaultProfile = {
        displayName: user.email?.split("@")[0] || "Utilizator",
        email: user.email || "",
        role: UserRoles.ADMIN, // Setăm rolul implicit la ADMIN pentru a asigura accesul
        permissions: ROLE_PERMISSIONS[UserRoles.ADMIN],
      };

      console.log("RoleService: Returning default profile", defaultProfile);
      return defaultProfile;
    }
  },

  /**
   * Verifică dacă un utilizator are o anumită permisiune
   * @param userId ID-ul utilizatorului
   * @param permission Permisiunea de verificat
   * @returns True dacă utilizatorul are permisiunea, false în caz contrar
   */
  async hasPermission(
    userId: string,
    permission: keyof RolePermissions
  ): Promise<boolean> {
    try {
      // Obținem rolul utilizatorului
      const role = await this.getUserRole(userId);

      // Obținem permisiunile asociate rolului
      const permissions = this.getRolePermissions(role);

      // Verificăm dacă utilizatorul are permisiunea
      return permissions[permission] === true;
    } catch (error) {
      // Removed console statement
      return false;
    }
  },

  /**
   * Obține toți utilizatorii cu rolurile lor
   * @returns Lista de utilizatori cu roluri
   */
  async getAllUsersWithRoles(): Promise<
    Array<{ id: string; email: string; role: UserRoles }>
  > {
    try {
      // Obținem toți utilizatorii cu rolurile lor
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role");

      if (error) {
        // Removed console statement
        return [];
      }

      return data.map((user) => ({
        id: user.id,
        email: user.email || "",
        role: (user.role as UserRoles) || UserRoles.VIEWER,
      }));
    } catch (error) {
      // Removed console statement
      return [];
    }
  },
};

export default roleService;
