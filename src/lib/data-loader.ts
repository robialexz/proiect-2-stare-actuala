/**
 * Serviciu pentru încărcarea optimizată a datelor
 * Acest serviciu oferă funcții pentru încărcarea și gestionarea datelor
 */

import { cacheService } from "./cache-service";
import { supabaseService } from "../services";
import { offlineService } from "./offline-service";
import { supabase } from "./supabase";

// Namespace pentru cache-ul de date
const DATA_CACHE_NAMESPACE = "data";

// Durata implicită de expirare a cache-ului (5 minute)
const DEFAULT_CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Încarcă date din Supabase cu suport pentru cache și offline
 * @param table Numele tabelului
 * @param columns Coloanele de selectat
 * @param options Opțiuni pentru interogare
 * @param cacheKey Cheia pentru cache (opțional, implicit numele tabelului)
 * @param expireIn Durata de expirare în milisecunde (opțional)
 */
export async function loadData<T>(
  table: string,
  columns: string,
  options: any = {},
  cacheKey?: string,
  expireIn: number = DEFAULT_CACHE_EXPIRY
): Promise<T[]> {
  // Generăm cheia de cache dacă nu este specificată
  const key = cacheKey || `${table}_${columns}_${JSON.stringify(options)}`;

  try {
    // Verificăm dacă datele sunt în cache
    const cachedData = cacheService.get<T[]>(key, {
      namespace: DATA_CACHE_NAMESPACE,
    });

    if (cachedData) {
      // Removed console statement
      return cachedData;
    }

    // Verificăm dacă suntem offline
    if (!offlineService.isOnline()) {
      // Removed console statement

      // Verificăm dacă avem date offline
      const offlineData = offlineService.getOfflineData<T[]>(key);

      if (offlineData) {
        // Removed console statement
        return offlineData;
      }

      // Removed console statement
      return [];
    }

    // Încărcăm datele din Supabase
    // Removed console statement

    try {
      // Încercăm să obținem sesiunea curentă pentru a verifica autentificarea
      const { data: sessionData } = await supabase.auth.getSession();

      // Dacă nu avem o sesiune validă și suntem în modul de dezvoltare, generam date de test
      if (!sessionData?.session) {
        // Removed console statement

        // Încercăm să obținem sesiunea din localStorage sau sessionStorage
        try {
          const localSession =
            localStorage.getItem("supabase.auth.token") ||
            sessionStorage.getItem("supabase.auth.token");
          if (localSession) {
            const parsedSession = JSON.parse(localSession);
            if (parsedSession?.currentSession?.access_token) {
              // Removed console statement
              // Adaugăm manual token-ul la header-ul de autorizare pentru Supabase
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

              // Configurăm un header personalizat pentru cerere
              const customHeaders = {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${parsedSession.currentSession.access_token}`,
              };

              // Folosim fetch direct cu header-urile personalizate
              // Removed console statement
              const directResponse = await fetch(
                `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(
                  columns
                )}`,
                {
                  method: "GET",
                  headers: customHeaders,
                }
              );

              if (directResponse.ok) {
                const data = await directResponse.json();
                // Removed console statement
                return data as T[];
              }
            }
          }
        } catch (localSessionError) {
          // Removed console statement
        }

        // Returnăm un array gol dacă nu avem sesiune
        return [];
      }
    } catch (sessionError) {
      // Removed console statement
      // Continuăm oricum, poate avem acces public la date
    }

    const response = await supabaseService.select(table, columns, options);

    if (response.status === "error") {
      // Removed console statement

      // Verificăm dacă eroarea este de autentificare (401)
      if (
        response.error?.code === "401" ||
        response.error?.message?.includes("JWT")
      ) {
        // Removed console statement

        try {
          // Încercăm să reîmprospătăm sesiunea
          const { data: refreshData } = await supabase.auth.refreshSession();

          if (refreshData?.session) {
            // Removed console statement
            // Reîncercam cererea după reîmprospătarea sesiunii
            const retryResponse = await supabaseService.select(
              table,
              columns,
              options
            );
            if (retryResponse.status === "success") {
              return (retryResponse.data as T[]) || [];
            }
          } else {
            // Returnăm un array gol dacă reîmprospătarea eșuează
            return [];
          }
        } catch (refreshError) {
          // Removed console statement
        }
      }

      // Verificăm dacă avem date offline ca fallback în caz de eroare
      const offlineData = offlineService.getOfflineData<T[]>(key);
      if (offlineData) {
        // Removed console statement
        return offlineData;
      }

      // Returnăm un array gol ca ultim fallback
      return [];

      throw new Error(response.error?.message || "Unknown error");
    }

    const data = (response.data as T[]) || [];

    // Salvăm datele în cache doar dacă avem date valide
    if (data && Array.isArray(data)) {
      cacheService.set(key, data, {
        namespace: DATA_CACHE_NAMESPACE,
        ttl: expireIn,
      });

      // Salvăm datele pentru utilizare offline
      offlineService.storeOfflineData(key, data);
    }

    return data;
  } catch (error) {
    // Removed console statement

    // Încercăm să recuperăm date din cache sau offline în caz de eroare
    const cachedData = cacheService.get<T[]>(key, {
      namespace: DATA_CACHE_NAMESPACE,
    });

    if (cachedData) {
      // Removed console statement
      return cachedData;
    }

    const offlineData = offlineService.getOfflineData<T[]>(key);
    if (offlineData) {
      // Removed console statement
      return offlineData;
    }

    // Dacă nu avem date de rezervă, aruncăm eroarea
    throw error;
  }
}

/**
 * Preîncarcă date pentru utilizare ulterioară
 * @param table Numele tabelului
 * @param columns Coloanele de selectat
 * @param options Opțiuni pentru interogare
 * @param cacheKey Cheia pentru cache (opțional)
 * @param expireIn Durata de expirare în milisecunde (opțional)
 */
export async function preloadData<T>(
  table: string,
  columns: string,
  options: any = {},
  cacheKey?: string,
  expireIn: number = DEFAULT_CACHE_EXPIRY
): Promise<void> {
  try {
    // Generăm cheia de cache dacă nu este specificată
    const key = cacheKey || `${table}_${columns}_${JSON.stringify(options)}`;

    // Verificăm dacă datele sunt deja în cache
    const cachedData = cacheService.get<T[]>(key, {
      namespace: DATA_CACHE_NAMESPACE,
    });

    if (cachedData) {
      // Removed console statement
      return;
    }

    // Preîncărcăm datele
    // Removed console statement
    await loadData<T>(table, columns, options, key, expireIn);

    // Removed console statement
  } catch (error) {
    // Removed console statement
  }
}

/**
 * Invalidează cache-ul pentru o anumită cheie
 * @param cacheKey Cheia pentru cache
 */
export function invalidateCache(cacheKey: string): void {
  cacheService.delete(cacheKey, {
    namespace: DATA_CACHE_NAMESPACE,
  });
  // Removed console statement
}

/**
 * Invalidează tot cache-ul de date
 */
export function invalidateAllCache(): void {
  cacheService.clearNamespace(DATA_CACHE_NAMESPACE);
  // Removed console statement
}

// Exportăm toate funcțiile într-un singur obiect
export const dataLoader = {
  loadData,
  preloadData,
  invalidateCache,
  invalidateAllCache,
};
