/**
 * Hook pentru utilizarea materialelor
 * Acest fișier conține un hook pentru interacțiunea cu materialele
 * Optimizat pentru performanță și reducerea re-renderizărilor
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/services/api/supabase-client";
import { useToast } from "@/components/ui/use-toast";

// Constante pentru caching și sincronizare offline
const CACHE_KEY_MATERIALS = "materials_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minute
const OFFLINE_QUEUE_KEY = "materials_offline_queue";
const NETWORK_STATUS_KEY = "network_status";

// Definim tipurile pentru materiale
export interface Material {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  price?: number;
  quantity?: number;
  project_id?: string;
  supplier_id?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  status?: "in_stock" | "low_stock" | "out_of_stock" | "ordered";
  location?: string;
  barcode?: string;
  tags?: string[];
}

export interface MaterialWithDetails extends Material {
  project_name?: string;
  supplier_name?: string;
}

export interface MaterialFilter {
  category?: string;
  status?: string;
  project_id?: string;
  supplier_id?: string;
  searchTerm?: string;
}

export interface MaterialSort {
  field: keyof Material;
  direction: "asc" | "desc";
}

/**
 * Hook pentru utilizarea materialelor
 * @returns Funcții și stare pentru interacțiunea cu materialele
 */
// Tipuri pentru operațiunile offline
type OfflineOperation = {
  id: string;
  operation: "create" | "update" | "delete";
  data: any;
  timestamp: number;
};

export const useMaterials = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<
    MaterialWithDetails[]
  >([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [filter, setFilter] = useState<MaterialFilter>({});
  const [sort, setSort] = useState<MaterialSort>({
    field: "name",
    direction: "asc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Monitorizăm starea conexiunii
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      localStorage.setItem(NETWORK_STATUS_KEY, "online");
      toast({
        title: t("network.online", "Online"),
        description: t(
          "network.onlineDescription",
          "You are now online. Changes will be synchronized."
        ),
        variant: "default",
      });

      // Încercăm să sincronizăm operațiunile offline
      syncOfflineOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      localStorage.setItem(NETWORK_STATUS_KEY, "offline");
      toast({
        title: t("network.offline", "Offline"),
        description: t(
          "network.offlineDescription",
          "You are now offline. Changes will be saved locally."
        ),
        variant: "warning",
      });
    };

    // Verificăm starea inițială
    setIsOnline(navigator.onLine);

    // Adăugăm event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Încărcăm operațiunile offline din localStorage
    loadOfflineQueue();

    // Curățăm event listeners la demontare
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [t, toast]);

  // Încarcă operațiunile offline din localStorage
  const loadOfflineQueue = useCallback(() => {
    try {
      const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueData) {
        const queue = JSON.parse(queueData) as OfflineOperation[];
        setOfflineQueue(queue);

        // Notificăm utilizatorul dacă există operațiuni în așteptare
        if (queue.length > 0) {
          toast({
            title: t("offline.pendingOperations", "Pending operations"),
            description: t(
              "offline.pendingOperationsDescription",
              `You have ${queue.length} pending operations that will be synchronized when you are online.`
            ),
            variant: "warning",
          });
        }
      }
    } catch (error) {
      console.warn("Error loading offline queue:", error);
    }
  }, [t, toast]);

  // Salvează operațiunile offline în localStorage
  const saveOfflineQueue = useCallback((queue: OfflineOperation[]) => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.warn("Error saving offline queue:", error);
    }
  }, []);

  // Adaugă o operațiune în coada offline
  const addToOfflineQueue = useCallback(
    (operation: OfflineOperation) => {
      setOfflineQueue((prevQueue) => {
        const newQueue = [...prevQueue, operation];
        saveOfflineQueue(newQueue);
        return newQueue;
      });
    },
    [saveOfflineQueue]
  );

  // Sincronizează operațiunile offline cu serverul
  const syncOfflineOperations = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0 || isSyncing) {
      return;
    }

    setIsSyncing(true);

    try {
      // Sortăm operațiunile după timestamp pentru a le executa în ordinea corectă
      const sortedQueue = [...offlineQueue].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Procesăm fiecare operațiune
      const failedOperations: OfflineOperation[] = [];

      for (const operation of sortedQueue) {
        try {
          switch (operation.operation) {
            case "create":
              await supabase.from("materials").insert([operation.data]);
              break;
            case "update":
              await supabase
                .from("materials")
                .update(operation.data)
                .eq("id", operation.id);
              break;
            case "delete":
              await supabase.from("materials").delete().eq("id", operation.id);
              break;
          }
        } catch (error) {
          console.error(
            `Failed to sync operation ${operation.operation} for ${operation.id}:`,
            error
          );
          failedOperations.push(operation);
        }
      }

      // Actualizăm coada cu operațiunile care au eșuat
      setOfflineQueue(failedOperations);
      saveOfflineQueue(failedOperations);

      // Reîncărcăm materialele pentru a reflecta schimbările
      if (sortedQueue.length > failedOperations.length) {
        fetchMaterials(true);

        // Notificăm utilizatorul
        toast({
          title: t("offline.syncComplete", "Synchronization complete"),
          description: t(
            "offline.syncCompleteDescription",
            `Successfully synchronized ${
              sortedQueue.length - failedOperations.length
            } operations.`
          ),
          variant: "default",
        });
      }

      // Notificăm utilizatorul dacă au rămas operațiuni eșuate
      if (failedOperations.length > 0) {
        toast({
          title: t("offline.syncPartial", "Partial synchronization"),
          description: t(
            "offline.syncPartialDescription",
            `${failedOperations.length} operations failed to synchronize and will be retried later.`
          ),
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error synchronizing offline operations:", error);
      toast({
        title: t("offline.syncError", "Synchronization error"),
        description: t(
          "offline.syncErrorDescription",
          "An error occurred while synchronizing your changes."
        ),
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [
    isOnline,
    offlineQueue,
    isSyncing,
    saveOfflineQueue,
    fetchMaterials,
    t,
    toast,
  ]);

  /**
   * Verifică dacă există date în cache și dacă sunt valide
   * @returns Datele din cache sau null dacă nu există sau sunt expirate
   */
  const getFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY_MATERIALS);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

      return isExpired ? null : data;
    } catch (error) {
      console.warn("Error reading from cache:", error);
      return null;
    }
  }, []);

  /**
   * Salvează datele în cache
   * @param data Datele de salvat
   */
  const saveToCache = useCallback((data: MaterialWithDetails[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY_MATERIALS, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Error saving to cache:", error);
    }
  }, []);

  /**
   * Funcție utilitară pentru reîncercarea operațiunilor eșuate
   * @param operation Funcția de executat
   * @param maxRetries Numărul maxim de reîncercări
   * @param delay Întârzierea între reîncercări (ms)
   * @returns Rezultatul operațiunii
   */
  const retryOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(
          `Operation failed (attempt ${attempt + 1}/${maxRetries}):`,
          error
        );

        // Așteptăm înainte de a reîncerca (cu backoff exponențial)
        if (attempt < maxRetries - 1) {
          const backoffDelay = delay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    // Dacă am ajuns aici, toate încercările au eșuat
    throw lastError;
  };

  /**
   * Încarcă materialele
   * @param forceRefresh Forțează reîmprospătarea datelor, ignorând cache-ul
   * @param retries Numărul de reîncercări în caz de eșec
   */
  const fetchMaterials = useCallback(
    async (forceRefresh = false, retries = 3) => {
      setIsLoading(true);
      setError(null);

      try {
        // Verificăm cache-ul dacă nu forțăm reîmprospătarea
        if (!forceRefresh) {
          const cachedMaterials = getFromCache();
          if (cachedMaterials) {
            setMaterials(cachedMaterials);

            // Aplicăm filtrarea pentru termenul de căutare
            if (filter.searchTerm) {
              const searchTerm = filter.searchTerm.toLowerCase();
              const filtered = cachedMaterials.filter(
                (material) =>
                  material.name.toLowerCase().includes(searchTerm) ||
                  material.description?.toLowerCase().includes(searchTerm) ||
                  material.category?.toLowerCase().includes(searchTerm) ||
                  material.project_name?.toLowerCase().includes(searchTerm) ||
                  material.supplier_name?.toLowerCase().includes(searchTerm)
              );
              setFilteredMaterials(filtered);
            } else {
              setFilteredMaterials(cachedMaterials);
            }

            // Actualizăm paginarea
            setPagination((prev) => ({
              ...prev,
              total: filteredMaterials.length,
              totalPages: Math.ceil(filteredMaterials.length / prev.limit),
            }));

            setIsLoading(false);
            return;
          }
        }

        // Dacă nu avem date în cache sau forțăm reîmprospătarea, facem cererea la API
        // Folosim mecanismul de retry pentru a gestiona eșecurile temporare
        const fetchFromAPI = async () => {
          let query = supabase.from("materials").select(`
            *,
            projects:project_id (name),
            suppliers:supplier_id (name)
          `);

          // Aplicăm filtrele
          if (filter.category) {
            query = query.eq("category", filter.category);
          }

          if (filter.status) {
            query = query.eq("status", filter.status);
          }

          if (filter.project_id) {
            query = query.eq("project_id", filter.project_id);
          }

          if (filter.supplier_id) {
            query = query.eq("supplier_id", filter.supplier_id);
          }

          // Aplicăm sortarea
          query = query.order(sort.field, {
            ascending: sort.direction === "asc",
          });

          const { data, error } = await query;

          if (error) {
            throw error;
          }

          return data;
        };

        // Executăm operațiunea cu retry
        const data = await retryOperation(fetchFromAPI, retries);

        // Transformăm datele pentru a include informațiile suplimentare
        const transformedData: MaterialWithDetails[] = data.map(
          (item: any) => ({
            ...item,
            project_name: item.projects?.name,
            supplier_name: item.suppliers?.name,
          })
        );

        // Salvăm datele în cache
        saveToCache(transformedData);

        setMaterials(transformedData);

        // Aplicăm filtrarea pentru termenul de căutare
        if (filter.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase();
          const filtered = transformedData.filter(
            (material) =>
              material.name.toLowerCase().includes(searchTerm) ||
              material.description?.toLowerCase().includes(searchTerm) ||
              material.category?.toLowerCase().includes(searchTerm) ||
              material.project_name?.toLowerCase().includes(searchTerm) ||
              material.supplier_name?.toLowerCase().includes(searchTerm)
          );
          setFilteredMaterials(filtered);
        } else {
          setFilteredMaterials(transformedData);
        }

        // Actualizăm paginarea
        setPagination((prev) => ({
          ...prev,
          total: filteredMaterials.length,
          totalPages: Math.ceil(filteredMaterials.length / prev.limit),
        }));
      } catch (error: any) {
        console.error("Error loading materials after retries:", error);
        setError(error.message || "An error occurred while loading materials");
        toast({
          title: t("inventory.errors.loadError", "Error"),
          description: t(
            "inventory.errors.loadErrorDescription",
            "An error occurred while loading materials."
          ),
          variant: "destructive",
        });

        // Încercăm să folosim datele din cache chiar dacă am forțat reîmprospătarea
        // dar cererea a eșuat
        if (forceRefresh) {
          const cachedMaterials = getFromCache();
          if (cachedMaterials) {
            setMaterials(cachedMaterials);
            setFilteredMaterials(cachedMaterials);
            toast({
              title: t("inventory.warnings.usingCache", "Using cached data"),
              description: t(
                "inventory.warnings.usingCacheDescription",
                "Could not fetch fresh data. Using cached data instead."
              ),
              variant: "warning",
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      filter,
      sort,
      toast,
      t,
      filteredMaterials.length,
      getFromCache,
      saveToCache,
      retryOperation,
    ]
  );

  /**
   * Încarcă un material după ID
   * @param id ID-ul materialului
   * @param forceRefresh Forțează reîmprospătarea datelor, ignorând cache-ul
   * @param retries Numărul de reîncercări în caz de eșec
   */
  const fetchMaterial = useCallback(
    async (id: string, forceRefresh = false, retries = 3) => {
      setIsLoading(true);
      setError(null);

      try {
        // Verificăm mai întâi în materialele deja încărcate
        if (!forceRefresh) {
          const existingMaterial = materials.find((m) => m.id === id);
          if (existingMaterial) {
            setSelectedMaterial(existingMaterial);
            setIsLoading(false);
            return existingMaterial;
          }

          // Verificăm cache-ul specific pentru acest material
          const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
          try {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
              const { data, timestamp } = JSON.parse(cachedData);
              const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

              if (!isExpired) {
                setSelectedMaterial(data);
                setIsLoading(false);
                return data;
              }
            }
          } catch (cacheError) {
            console.warn("Error reading material from cache:", cacheError);
          }
        }

        // Dacă nu am găsit în cache sau forțăm reîmprospătarea, facem cererea la API
        // Folosim mecanismul de retry pentru a gestiona eșecurile temporare
        const fetchFromAPI = async () => {
          const { data, error } = await supabase
            .from("materials")
            .select(
              `
            *,
            projects:project_id (name),
            suppliers:supplier_id (name)
          `
            )
            .eq("id", id)
            .single();

          if (error) {
            throw error;
          }

          return data;
        };

        // Executăm operațiunea cu retry
        const data = await retryOperation(fetchFromAPI, retries);

        // Transformăm datele pentru a include informațiile suplimentare
        const transformedData: MaterialWithDetails = {
          ...data,
          project_name: data.projects?.name,
          supplier_name: data.suppliers?.name,
        };

        // Salvăm în cache
        try {
          const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: transformedData,
              timestamp: Date.now(),
            })
          );
        } catch (cacheError) {
          console.warn("Error saving material to cache:", cacheError);
        }

        setSelectedMaterial(transformedData);
        return transformedData;
      } catch (error: any) {
        console.error("Error loading material after retries:", error);
        setError(
          error.message || "An error occurred while loading the material"
        );
        toast({
          title: t("inventory.errors.loadError", "Error"),
          description: t(
            "inventory.errors.loadErrorDescription",
            "An error occurred while loading the material."
          ),
          variant: "destructive",
        });

        // Încercăm să folosim datele din cache chiar dacă am forțat reîmprospătarea
        // dar cererea a eșuat
        if (forceRefresh) {
          try {
            const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
              const { data } = JSON.parse(cachedData);
              setSelectedMaterial(data);
              toast({
                title: t("inventory.warnings.usingCache", "Using cached data"),
                description: t(
                  "inventory.warnings.usingCacheDescription",
                  "Could not fetch fresh data. Using cached data instead."
                ),
                variant: "warning",
              });
              return data;
            }
          } catch (cacheError) {
            console.warn("Error reading material from cache:", cacheError);
          }
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, t, materials, retryOperation]
  );

  /**
   * Invalidează cache-ul pentru materiale
   */
  const invalidateCache = useCallback(() => {
    try {
      // Ștergem cache-ul principal
      localStorage.removeItem(CACHE_KEY_MATERIALS);

      // Încercăm să ștergem și cache-ul pentru materialele individuale
      // Găsim toate cheile care încep cu CACHE_KEY_MATERIALS_
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${CACHE_KEY_MATERIALS}_`)) {
          keysToRemove.push(key);
        }
      }

      // Ștergem cheile găsite
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Error invalidating cache:", error);
    }
  }, []);

  /**
   * Creează un material nou
   * @param data Datele materialului
   */
  const createMaterial = useCallback(
    async (data: Partial<Material>) => {
      setIsLoading(true);
      setError(null);

      // Generăm un ID temporar dacă nu este furnizat
      const materialData = {
        ...data,
        id:
          data.id ||
          `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };

      try {
        // Verificăm dacă suntem online
        if (!isOnline) {
          // Adăugăm operațiunea în coada offline
          addToOfflineQueue({
            id: materialData.id as string,
            operation: "create",
            data: materialData,
            timestamp: Date.now(),
          });

          // Adăugăm materialul în starea locală
          const newMaterial = materialData as MaterialWithDetails;
          setMaterials((prev) => [...prev, newMaterial]);

          // Actualizăm materialele filtrate
          if (
            !filter.searchTerm ||
            newMaterial.name
              .toLowerCase()
              .includes(filter.searchTerm.toLowerCase()) ||
            newMaterial.description
              ?.toLowerCase()
              .includes(filter.searchTerm.toLowerCase())
          ) {
            setFilteredMaterials((prev) => [...prev, newMaterial]);
          }

          toast({
            title: t("inventory.success.createOfflineTitle", "Created offline"),
            description: t(
              "inventory.success.createOfflineDescription",
              "Material created offline. It will be synchronized when you are online."
            ),
            variant: "default",
          });

          setIsLoading(false);
          return newMaterial;
        }

        // Dacă suntem online, facem cererea la API
        const { data: result, error } = await supabase
          .from("materials")
          .insert([materialData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: t("inventory.success.createTitle", "Success"),
          description: t(
            "inventory.success.createDescription",
            "Material created successfully."
          ),
        });

        // Invalidăm cache-ul și reîncărcăm materialele
        invalidateCache();
        fetchMaterials(true); // Forțăm reîmprospătarea

        return result;
      } catch (error: any) {
        console.error("Error creating material:", error);
        setError(
          error.message || "An error occurred while creating the material"
        );

        // Dacă suntem offline și cererea a eșuat, încercăm să salvăm offline
        if (!navigator.onLine) {
          // Adăugăm operațiunea în coada offline
          addToOfflineQueue({
            id: materialData.id as string,
            operation: "create",
            data: materialData,
            timestamp: Date.now(),
          });

          // Adăugăm materialul în starea locală
          const newMaterial = materialData as MaterialWithDetails;
          setMaterials((prev) => [...prev, newMaterial]);

          // Actualizăm materialele filtrate
          if (
            !filter.searchTerm ||
            newMaterial.name
              .toLowerCase()
              .includes(filter.searchTerm.toLowerCase()) ||
            newMaterial.description
              ?.toLowerCase()
              .includes(filter.searchTerm.toLowerCase())
          ) {
            setFilteredMaterials((prev) => [...prev, newMaterial]);
          }

          toast({
            title: t("inventory.success.createOfflineTitle", "Created offline"),
            description: t(
              "inventory.success.createOfflineDescription",
              "Material created offline. It will be synchronized when you are online."
            ),
            variant: "default",
          });

          return newMaterial;
        } else {
          toast({
            title: t("inventory.errors.createError", "Error"),
            description: t(
              "inventory.errors.createErrorDescription",
              "An error occurred while creating the material."
            ),
            variant: "destructive",
          });
          return null;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchMaterials,
      toast,
      t,
      invalidateCache,
      isOnline,
      addToOfflineQueue,
      filter.searchTerm,
    ]
  );

  /**
   * Actualizează un material
   * @param id ID-ul materialului
   * @param data Datele actualizate
   */
  const updateMaterial = useCallback(
    async (id: string, data: Partial<Material>) => {
      setIsLoading(true);
      setError(null);

      // Adăugăm timestamp-ul de actualizare
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      try {
        // Verificăm dacă suntem online
        if (!isOnline) {
          // Adăugăm operațiunea în coada offline
          addToOfflineQueue({
            id,
            operation: "update",
            data: updateData,
            timestamp: Date.now(),
          });

          // Actualizăm materialul în starea locală
          const existingMaterial = materials.find((m) => m.id === id);
          if (existingMaterial) {
            const updatedMaterial = {
              ...existingMaterial,
              ...updateData,
            };

            // Actualizăm materialele
            setMaterials((prev) =>
              prev.map((m) => (m.id === id ? updatedMaterial : m))
            );

            // Actualizăm materialele filtrate
            setFilteredMaterials((prev) =>
              prev.map((m) => (m.id === id ? updatedMaterial : m))
            );

            // Actualizăm materialul selectat dacă este cel curent
            if (selectedMaterial?.id === id) {
              setSelectedMaterial(updatedMaterial);
            }

            // Invalidăm cache-ul specific pentru acest material
            try {
              const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
              localStorage.removeItem(cacheKey);
            } catch (cacheError) {
              console.warn("Error removing material from cache:", cacheError);
            }
          }

          toast({
            title: t("inventory.success.updateOfflineTitle", "Updated offline"),
            description: t(
              "inventory.success.updateOfflineDescription",
              "Material updated offline. It will be synchronized when you are online."
            ),
            variant: "default",
          });

          setIsLoading(false);
          return existingMaterial
            ? { ...existingMaterial, ...updateData }
            : null;
        }

        // Dacă suntem online, facem cererea la API
        const { data: result, error } = await supabase
          .from("materials")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: t("inventory.success.updateTitle", "Success"),
          description: t(
            "inventory.success.updateDescription",
            "Material updated successfully."
          ),
        });

        // Invalidăm cache-ul specific pentru acest material
        try {
          const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
          localStorage.removeItem(cacheKey);
        } catch (cacheError) {
          console.warn("Error removing material from cache:", cacheError);
        }

        // Invalidăm cache-ul general și reîncărcăm materialele
        invalidateCache();
        fetchMaterials(true); // Forțăm reîmprospătarea

        return result;
      } catch (error: any) {
        console.error("Error updating material:", error);
        setError(
          error.message || "An error occurred while updating the material"
        );

        // Dacă suntem offline și cererea a eșuat, încercăm să salvăm offline
        if (!navigator.onLine) {
          // Adăugăm operațiunea în coada offline
          addToOfflineQueue({
            id,
            operation: "update",
            data: updateData,
            timestamp: Date.now(),
          });

          // Actualizăm materialul în starea locală
          const existingMaterial = materials.find((m) => m.id === id);
          if (existingMaterial) {
            const updatedMaterial = {
              ...existingMaterial,
              ...updateData,
            };

            // Actualizăm materialele
            setMaterials((prev) =>
              prev.map((m) => (m.id === id ? updatedMaterial : m))
            );

            // Actualizăm materialele filtrate
            setFilteredMaterials((prev) =>
              prev.map((m) => (m.id === id ? updatedMaterial : m))
            );

            // Actualizăm materialul selectat dacă este cel curent
            if (selectedMaterial?.id === id) {
              setSelectedMaterial(updatedMaterial);
            }

            // Invalidăm cache-ul specific pentru acest material
            try {
              const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
              localStorage.removeItem(cacheKey);
            } catch (cacheError) {
              console.warn("Error removing material from cache:", cacheError);
            }
          }

          toast({
            title: t("inventory.success.updateOfflineTitle", "Updated offline"),
            description: t(
              "inventory.success.updateOfflineDescription",
              "Material updated offline. It will be synchronized when you are online."
            ),
            variant: "default",
          });

          return existingMaterial
            ? { ...existingMaterial, ...updateData }
            : null;
        } else {
          toast({
            title: t("inventory.errors.updateError", "Error"),
            description: t(
              "inventory.errors.updateErrorDescription",
              "An error occurred while updating the material."
            ),
            variant: "destructive",
          });
          return null;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchMaterials,
      toast,
      t,
      invalidateCache,
      isOnline,
      addToOfflineQueue,
      materials,
      selectedMaterial,
    ]
  );

  /**
   * Șterge un material
   * @param id ID-ul materialului
   */
  const deleteMaterial = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Verificăm dacă suntem online
        if (!isOnline) {
          // Adăugăm operațiunea în coada offline
          addToOfflineQueue({
            id,
            operation: "delete",
            data: null,
            timestamp: Date.now(),
          });

          // Ștergem materialul din starea locală
          setMaterials((prev) => prev.filter((m) => m.id !== id));
          setFilteredMaterials((prev) => prev.filter((m) => m.id !== id));

          // Ștergem materialul din selecție dacă este selectat
          if (selectedMaterial?.id === id) {
            setSelectedMaterial(null);
          }

          // Invalidăm cache-ul specific pentru acest material
          try {
            const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
            localStorage.removeItem(cacheKey);
          } catch (cacheError) {
            console.warn("Error removing material from cache:", cacheError);
          }

          toast({
            title: t("inventory.success.deleteOfflineTitle", "Deleted offline"),
            description: t(
              "inventory.success.deleteOfflineDescription",
              "Material deleted offline. It will be synchronized when you are online."
            ),
            variant: "default",
          });

          setIsLoading(false);
          return true;
        }

        // Dacă suntem online, facem cererea la API
        const { error } = await supabase
          .from("materials")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        toast({
          title: t("inventory.success.deleteTitle", "Success"),
          description: t(
            "inventory.success.deleteDescription",
            "Material deleted successfully."
          ),
        });

        // Ștergem materialul din selecție dacă este selectat
        if (selectedMaterial?.id === id) {
          setSelectedMaterial(null);
        }

        // Invalidăm cache-ul specific pentru acest material
        try {
          const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
          localStorage.removeItem(cacheKey);
        } catch (cacheError) {
          console.warn("Error removing material from cache:", cacheError);
        }

        // Invalidăm cache-ul general și reîncărcăm materialele
        invalidateCache();
        fetchMaterials(true); // Forțăm reîmprospătarea

        return true;
      } catch (error: any) {
        console.error("Error deleting material:", error);
        setError(
          error.message || "An error occurred while deleting the material"
        );

        // Dacă suntem offline și cererea a eșuat, încercăm să salvăm offline
        if (!navigator.onLine) {
          // Adăugăm operațiunea în coada offline
          addToOfflineQueue({
            id,
            operation: "delete",
            data: null,
            timestamp: Date.now(),
          });

          // Ștergem materialul din starea locală
          setMaterials((prev) => prev.filter((m) => m.id !== id));
          setFilteredMaterials((prev) => prev.filter((m) => m.id !== id));

          // Ștergem materialul din selecție dacă este selectat
          if (selectedMaterial?.id === id) {
            setSelectedMaterial(null);
          }

          // Invalidăm cache-ul specific pentru acest material
          try {
            const cacheKey = `${CACHE_KEY_MATERIALS}_${id}`;
            localStorage.removeItem(cacheKey);
          } catch (cacheError) {
            console.warn("Error removing material from cache:", cacheError);
          }

          toast({
            title: t("inventory.success.deleteOfflineTitle", "Deleted offline"),
            description: t(
              "inventory.success.deleteOfflineDescription",
              "Material deleted offline. It will be synchronized when you are online."
            ),
            variant: "default",
          });

          return true;
        } else {
          toast({
            title: t("inventory.errors.deleteError", "Error"),
            description: t(
              "inventory.errors.deleteErrorDescription",
              "An error occurred while deleting the material."
            ),
            variant: "destructive",
          });
          return false;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchMaterials,
      toast,
      t,
      invalidateCache,
      selectedMaterial,
      isOnline,
      addToOfflineQueue,
    ]
  );

  /**
   * Setează filtrul pentru materiale
   * @param newFilter Noul filtru
   */
  const setMaterialFilter = useCallback((newFilter: MaterialFilter) => {
    setFilter(newFilter);
  }, []);

  /**
   * Șterge filtrul
   */
  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);

  /**
   * Setează sortarea pentru materiale
   * @param newSort Noua sortare
   */
  const setMaterialSort = useCallback((newSort: MaterialSort) => {
    setSort(newSort);
  }, []);

  /**
   * Setează paginarea pentru materiale
   * @param newPagination Noua paginare
   */
  const setMaterialPagination = useCallback(
    (newPagination: Partial<typeof pagination>) => {
      setPagination((prev) => ({
        ...prev,
        ...newPagination,
      }));
    },
    []
  );

  /**
   * Selectează un material
   * @param material Materialul selectat
   */
  const selectMaterial = useCallback((material: MaterialWithDetails | null) => {
    setSelectedMaterial(material);
  }, []);

  /**
   * Șterge eroarea
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Obține materialele pentru un proiect
   * @param projectId ID-ul proiectului
   * @returns Lista de materiale
   */
  const getMaterialsByProject = useCallback(
    (projectId: string) => {
      return filteredMaterials.filter(
        (material) => material.project_id === projectId
      );
    },
    [filteredMaterials]
  );

  /**
   * Obține materialele pentru un furnizor
   * @param supplierId ID-ul furnizorului
   * @returns Lista de materiale
   */
  const getMaterialsBySupplier = useCallback(
    (supplierId: string) => {
      return filteredMaterials.filter(
        (material) => material.supplier_id === supplierId
      );
    },
    [filteredMaterials]
  );

  /**
   * Obține materialele pentru o categorie
   * @param category Categoria
   * @returns Lista de materiale
   */
  const getMaterialsByCategory = useCallback(
    (category: string) => {
      return filteredMaterials.filter(
        (material) => material.category === category
      );
    },
    [filteredMaterials]
  );

  /**
   * Obține materialele pentru un status
   * @param status Statusul
   * @returns Lista de materiale
   */
  const getMaterialsByStatus = useCallback(
    (status: string) => {
      return filteredMaterials.filter((material) => material.status === status);
    },
    [filteredMaterials]
  );

  /**
   * Obține numărul de materiale pentru fiecare categorie
   * @returns Numărul de materiale pentru fiecare categorie
   */
  const getMaterialCountByCategory = useCallback(() => {
    const counts: Record<string, number> = {};

    filteredMaterials.forEach((material) => {
      const category = material.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [filteredMaterials]);

  /**
   * Obține numărul de materiale pentru fiecare status
   * @returns Numărul de materiale pentru fiecare status
   */
  const getMaterialCountByStatus = useCallback(() => {
    const counts: Record<string, number> = {};

    filteredMaterials.forEach((material) => {
      const status = material.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }, [filteredMaterials]);

  /**
   * Obține valoarea totală a materialelor
   * @returns Valoarea totală
   */
  const getTotalMaterialValue = useCallback(() => {
    return filteredMaterials.reduce((total, material) => {
      return total + (material.price || 0) * (material.quantity || 0);
    }, 0);
  }, [filteredMaterials]);

  // Încărcăm materialele la montare
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Folosim useMemo pentru a calcula materialele filtrate doar când se schimbă materialele sau filtrul
  const memoizedFilteredMaterials = useMemo(() => {
    if (!filter.searchTerm) {
      return materials;
    }

    const searchTerm = filter.searchTerm.toLowerCase();
    return materials.filter(
      (material) =>
        material.name.toLowerCase().includes(searchTerm) ||
        material.description?.toLowerCase().includes(searchTerm) ||
        material.category?.toLowerCase().includes(searchTerm) ||
        material.project_name?.toLowerCase().includes(searchTerm) ||
        material.supplier_name?.toLowerCase().includes(searchTerm)
    );
  }, [materials, filter.searchTerm]);

  // Actualizăm materialele filtrate când se schimbă rezultatul memoizat
  useEffect(() => {
    setFilteredMaterials(memoizedFilteredMaterials);

    // Actualizăm paginarea
    setPagination((prev) => ({
      ...prev,
      total: memoizedFilteredMaterials.length,
      totalPages: Math.ceil(memoizedFilteredMaterials.length / prev.limit),
    }));
  }, [memoizedFilteredMaterials]);

  // Calculăm materialele pentru pagina curentă folosind useMemo
  const paginatedMaterials = useMemo(() => {
    return filteredMaterials.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit
    );
  }, [filteredMaterials, pagination.page, pagination.limit]);

  /**
   * Forțează sincronizarea operațiunilor offline
   */
  const forceSyncOfflineOperations = useCallback(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineOperations();
      return true;
    }
    return false;
  }, [isOnline, offlineQueue.length, syncOfflineOperations]);

  /**
   * Obține numărul de operațiuni offline în așteptare
   */
  const getPendingOperationsCount = useCallback(() => {
    return offlineQueue.length;
  }, [offlineQueue.length]);

  /**
   * Verifică dacă există operațiuni offline pentru un material
   * @param id ID-ul materialului
   */
  const hasPendingOperations = useCallback(
    (id: string) => {
      return offlineQueue.some((op) => op.id === id);
    },
    [offlineQueue]
  );

  /**
   * Obține operațiunile offline pentru un material
   * @param id ID-ul materialului
   */
  const getPendingOperationsForMaterial = useCallback(
    (id: string) => {
      return offlineQueue.filter((op) => op.id === id);
    },
    [offlineQueue]
  );

  // Returnăm funcțiile și starea
  return {
    // Stare
    materials,
    filteredMaterials,
    paginatedMaterials,
    selectedMaterial,
    isLoading,
    error,
    filter,
    pagination,
    sort,
    isOnline,
    isSyncing,
    offlineQueue,

    // Funcții
    fetchMaterials,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    setFilter: setMaterialFilter,
    clearFilter,
    selectMaterial,
    clearError,
    setSort: setMaterialSort,
    setPagination: setMaterialPagination,
    getMaterialsByProject,
    getMaterialsBySupplier,
    getMaterialsByCategory,
    getMaterialsByStatus,
    getMaterialCountByCategory,
    getMaterialCountByStatus,
    getTotalMaterialValue,

    // Funcții pentru operațiuni offline
    forceSyncOfflineOperations,
    getPendingOperationsCount,
    hasPendingOperations,
    getPendingOperationsForMaterial,
  };
};

export default useMaterials;
