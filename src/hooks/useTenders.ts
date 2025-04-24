import { useState, useEffect, useCallback } from "react";
import { tenderService } from "@/lib/tender-service";
import {
  Tender,
  TenderDocument,
  TenderFilters,
  TenderSort,
  TenderPagination,
  TenderAlert,
  TenderNote,
} from "@/models/tender";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export function useTenders() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [filters, setFilters] = useState<TenderFilters>({});
  const [sort, setSort] = useState<TenderSort>({
    field: "publication_date",
    direction: "desc",
  });
  const [pagination, setPagination] = useState<TenderPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [alerts, setAlerts] = useState<TenderAlert[]>([]);
  const [notes, setNotes] = useState<TenderNote[]>([]);
  const [loading, setLoading] = useState({
    tenders: false,
    tender: false,
    alerts: false,
    notes: false,
    operation: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Încărcăm licitațiile - folosim date mock pentru a evita erorile Supabase
  const loadTenders = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tenders: true }));
    setError(null);

    try {
      // În loc să apelăm serviciul, folosim date mock
      setTimeout(() => {
        const mockTenders: Tender[] = [
          {
            id: "1",
            title: "Renovare clădire administrativă",
            description:
              "Renovare completă a clădirii administrative din centrul orașului",
            reference_number: "SEAP-2023-001",
            publication_date: "2023-10-01",
            closing_date: "2023-11-15",
            estimated_value: 1500000,
            currency: "RON",
            contracting_authority: "Primăria București",
            authority_type: "Local",
            cpv_code: "45000000-7",
            cpv_description: "Lucrări de construcții",
            location: "București",
            status: "active",
            url: "https://example.com/tender/1",
            source: "SEAP",
            created_at: "2023-10-01T10:00:00Z",
            updated_at: "2023-10-01T10:00:00Z",
            is_favorite: false,
            is_relevant: true,
            documents: [
              {
                id: "1-1",
                tender_id: "1",
                name: "Caiet de sarcini",
                description: "Caiet de sarcini pentru renovare",
                url: "https://example.com/docs/1-1",
                type: "pdf",
                size: 1024,
                upload_date: "2023-10-01T10:00:00Z",
              },
            ],
          },
          {
            id: "2",
            title: "Furnizare echipamente IT",
            description: "Furnizare de echipamente IT pentru școli",
            reference_number: "SEAP-2023-002",
            publication_date: "2023-10-05",
            closing_date: "2023-11-20",
            estimated_value: 800000,
            currency: "RON",
            contracting_authority: "Ministerul Educației",
            authority_type: "Central",
            cpv_code: "30000000-9",
            cpv_description: "Echipamente IT",
            location: "Național",
            status: "active",
            url: "https://example.com/tender/2",
            source: "SEAP",
            created_at: "2023-10-05T10:00:00Z",
            updated_at: "2023-10-05T10:00:00Z",
            is_favorite: true,
            is_relevant: true,
            documents: [
              {
                id: "2-1",
                tender_id: "2",
                name: "Specificații tehnice",
                description: "Specificații tehnice pentru echipamente IT",
                url: "https://example.com/docs/2-1",
                type: "pdf",
                size: 2048,
                upload_date: "2023-10-05T10:00:00Z",
              },
            ],
          },
          {
            id: "3",
            title: "Construcție pod rutier",
            description: "Construcție pod rutier peste râul Dâmbovița",
            reference_number: "SEAP-2023-003",
            publication_date: "2023-09-15",
            closing_date: "2023-11-30",
            estimated_value: 5000000,
            currency: "RON",
            contracting_authority: "CNAIR",
            authority_type: "Central",
            cpv_code: "45221110-6",
            cpv_description: "Lucrări de construcție de poduri",
            location: "București",
            status: "active",
            url: "https://example.com/tender/3",
            source: "SEAP",
            created_at: "2023-09-15T10:00:00Z",
            updated_at: "2023-09-15T10:00:00Z",
            is_favorite: false,
            is_relevant: false,
            documents: [
              {
                id: "3-1",
                tender_id: "3",
                name: "Proiect tehnic",
                description: "Proiect tehnic pentru construcția podului",
                url: "https://example.com/docs/3-1",
                type: "pdf",
                size: 5120,
                upload_date: "2023-09-15T10:00:00Z",
              },
            ],
          },
          {
            id: "4",
            title: "Servicii de consultanță",
            description:
              "Servicii de consultanță pentru implementarea proiectelor cu fonduri europene",
            reference_number: "SEAP-2023-004",
            publication_date: "2023-10-10",
            closing_date: "2023-12-10",
            estimated_value: 300000,
            currency: "RON",
            contracting_authority: "ADR București-Ilfov",
            authority_type: "Regional",
            cpv_code: "79400000-8",
            cpv_description: "Consultanță în afaceri și management",
            location: "București",
            status: "active",
            url: "https://example.com/tender/4",
            source: "SEAP",
            created_at: "2023-10-10T10:00:00Z",
            updated_at: "2023-10-10T10:00:00Z",
            is_favorite: false,
            is_relevant: true,
            documents: [
              {
                id: "4-1",
                tender_id: "4",
                name: "Termeni de referință",
                description:
                  "Termeni de referință pentru serviciile de consultanță",
                url: "https://example.com/docs/4-1",
                type: "pdf",
                size: 1536,
                upload_date: "2023-10-10T10:00:00Z",
              },
            ],
          },
          {
            id: "5",
            title: "Achiziție autobuze electrice",
            description:
              "Achiziție de autobuze electrice pentru transportul public",
            reference_number: "SEAP-2023-005",
            publication_date: "2023-09-20",
            closing_date: "2023-12-20",
            estimated_value: 10000000,
            currency: "RON",
            contracting_authority: "STB",
            authority_type: "Local",
            cpv_code: "34144910-0",
            cpv_description: "Autobuze electrice",
            location: "București",
            status: "active",
            url: "https://example.com/tender/5",
            source: "SEAP",
            created_at: "2023-09-20T10:00:00Z",
            updated_at: "2023-09-20T10:00:00Z",
            is_favorite: true,
            is_relevant: true,
            documents: [
              {
                id: "5-1",
                tender_id: "5",
                name: "Specificații tehnice",
                description: "Specificații tehnice pentru autobuzele electrice",
                url: "https://example.com/docs/5-1",
                type: "pdf",
                size: 3072,
                upload_date: "2023-09-20T10:00:00Z",
              },
            ],
          },
        ];

        // Aplicăm filtrele
        let filteredTenders = [...mockTenders];

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTenders = filteredTenders.filter(
            (tender) =>
              tender.title.toLowerCase().includes(searchLower) ||
              (tender.description &&
                tender.description.toLowerCase().includes(searchLower)) ||
              tender.reference_number.toLowerCase().includes(searchLower)
          );
        }

        if (filters.status) {
          filteredTenders = filteredTenders.filter(
            (tender) => tender.status === filters.status
          );
        }

        if (filters.onlyFavorites) {
          filteredTenders = filteredTenders.filter(
            (tender) => tender.is_favorite
          );
        }

        if (filters.onlyRelevant) {
          filteredTenders = filteredTenders.filter(
            (tender) => tender.is_relevant
          );
        }

        // Sortăm rezultatele
        filteredTenders.sort((a, b) => {
          const aValue = a[sort.field as keyof Tender];
          const bValue = b[sort.field as keyof Tender];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sort.direction === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }

          if (typeof aValue === "number" && typeof bValue === "number") {
            return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
          }

          return 0;
        });

        setTenders(filteredTenders);
        setPagination({
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: filteredTenders.length,
        });

        setLoading((prev) => ({ ...prev, tenders: false }));
      }, 1000); // Simulăm un delay de 1 secundă pentru a arăta loading state
    } catch (err) {
      setError(t("tenders.errors.loadFailed", "Failed to load tenders"));
      toast({
        variant: "destructive",
        title: t("tenders.errors.loadFailed", "Failed to load tenders"),
        description: err instanceof Error ? err.message : String(err),
      });
      setLoading((prev) => ({ ...prev, tenders: false }));
    }
  }, [filters, sort, pagination, t, toast]);

  // Încărcăm licitațiile la inițializare și când se schimbă filtrele, sortarea sau paginarea
  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  // Obținem o licitație după ID
  const getTenderById = useCallback(
    async (tenderId: string) => {
      setLoading((prev) => ({ ...prev, tender: true }));

      try {
        const tender = await tenderService.getTenderById(tenderId);
        setSelectedTender(tender);

        // Încărcăm notele licitației
        if (tender) {
          await loadNotes(tenderId);
        }

        return tender;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.getTenderFailed",
            "Failed to get tender details"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, tender: false }));
      }
    },
    [t, toast]
  );

  // Încărcăm alertele
  const loadAlerts = useCallback(async () => {
    setLoading((prev) => ({ ...prev, alerts: true }));

    try {
      const alertsData = await tenderService.getAlerts();
      setAlerts(alertsData);
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("tenders.errors.loadAlertsFailed", "Failed to load alerts"),
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading((prev) => ({ ...prev, alerts: false }));
    }
  }, [t, toast]);

  // Încărcăm notele unei licitații - cu gestionare îmbunătățită a erorilor
  const loadNotes = useCallback(
    async (tenderId: string) => {
      setLoading((prev) => ({ ...prev, notes: true }));

      try {
        // Adăugăm un timeout pentru a preveni blocarea la încărcare
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout loading notes")), 5000);
        });

        // Folosim Promise.race pentru a implementa un timeout
        const notesData = (await Promise.race([
          tenderService.getNotes(tenderId),
          timeoutPromise,
        ])) as TenderNote[];

        setNotes(notesData);
      } catch (err) {
        console.error("Error loading notes:", err);

        // Setăm note goale pentru a evita blocarea interfeței
        setNotes([]);

        toast({
          variant: "destructive",
          title: t("tenders.errors.loadNotesFailed", "Failed to load notes"),
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setLoading((prev) => ({ ...prev, notes: false }));
      }
    },
    [t, toast]
  );

  // Marchează o licitație ca favorită
  const toggleFavorite = useCallback(
    async (tenderId: string, isFavorite: boolean) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        await tenderService.toggleFavorite(tenderId, isFavorite);

        // Actualizăm licitația în lista de licitații
        setTenders((prev) =>
          prev.map((tender) =>
            tender.id === tenderId
              ? { ...tender, is_favorite: isFavorite }
              : tender
          )
        );

        // Actualizăm licitația selectată dacă este cazul
        if (selectedTender && selectedTender.id === tenderId) {
          setSelectedTender((prev) =>
            prev ? { ...prev, is_favorite: isFavorite } : null
          );
        }

        toast({
          title: isFavorite
            ? t("tenders.success.addedToFavorites", "Added to favorites")
            : t(
                "tenders.success.removedFromFavorites",
                "Removed from favorites"
              ),
          description: isFavorite
            ? t(
                "tenders.success.addedToFavoritesDesc",
                "The tender has been added to your favorites"
              )
            : t(
                "tenders.success.removedFromFavoritesDesc",
                "The tender has been removed from your favorites"
              ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.toggleFavoriteFailed",
            "Failed to update favorite status"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [selectedTender, t, toast]
  );

  // Marchează o licitație ca relevantă
  const toggleRelevant = useCallback(
    async (tenderId: string, isRelevant: boolean) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        await tenderService.toggleRelevant(tenderId, isRelevant);

        // Actualizăm licitația în lista de licitații
        setTenders((prev) =>
          prev.map((tender) =>
            tender.id === tenderId
              ? { ...tender, is_relevant: isRelevant }
              : tender
          )
        );

        // Actualizăm licitația selectată dacă este cazul
        if (selectedTender && selectedTender.id === tenderId) {
          setSelectedTender((prev) =>
            prev ? { ...prev, is_relevant: isRelevant } : null
          );
        }

        toast({
          title: isRelevant
            ? t("tenders.success.markedAsRelevant", "Marked as relevant")
            : t("tenders.success.markedAsIrrelevant", "Marked as irrelevant"),
          description: isRelevant
            ? t(
                "tenders.success.markedAsRelevantDesc",
                "The tender has been marked as relevant"
              )
            : t(
                "tenders.success.markedAsIrrelevantDesc",
                "The tender has been marked as irrelevant"
              ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.toggleRelevantFailed",
            "Failed to update relevance status"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [selectedTender, t, toast]
  );

  // Adaugă o notă la o licitație
  const addNote = useCallback(
    async (tenderId: string, content: string) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        const note = await tenderService.addNote(tenderId, content);

        // Actualizăm lista de note
        setNotes((prev) => [note, ...prev]);

        toast({
          title: t("tenders.success.noteAdded", "Note added"),
          description: t(
            "tenders.success.noteAddedDesc",
            "Your note has been added to the tender"
          ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t("tenders.errors.addNoteFailed", "Failed to add note"),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  // Creează o alertă
  const createAlert = useCallback(
    async (alert: Partial<TenderAlert>) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        const newAlert = await tenderService.createAlert(alert);

        // Actualizăm lista de alerte
        setAlerts((prev) => [newAlert, ...prev]);

        toast({
          title: t("tenders.success.alertCreated", "Alert created"),
          description: t(
            "tenders.success.alertCreatedDesc",
            "Your alert has been created successfully"
          ),
        });

        return newAlert;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.createAlertFailed",
            "Failed to create alert"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  // Actualizează o alertă
  const updateAlert = useCallback(
    async (alertId: string, alert: Partial<TenderAlert>) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        const updatedAlert = await tenderService.updateAlert(alertId, alert);

        // Actualizăm lista de alerte
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updatedAlert : a))
        );

        toast({
          title: t("tenders.success.alertUpdated", "Alert updated"),
          description: t(
            "tenders.success.alertUpdatedDesc",
            "Your alert has been updated successfully"
          ),
        });

        return updatedAlert;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.updateAlertFailed",
            "Failed to update alert"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  // Șterge o alertă
  const deleteAlert = useCallback(
    async (alertId: string) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        await tenderService.deleteAlert(alertId);

        // Actualizăm lista de alerte
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));

        toast({
          title: t("tenders.success.alertDeleted", "Alert deleted"),
          description: t(
            "tenders.success.alertDeletedDesc",
            "Your alert has been deleted successfully"
          ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.deleteAlertFailed",
            "Failed to delete alert"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  // Abonează utilizatorul la o licitație
  const subscribeTender = useCallback(
    async (tenderId: string) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        await tenderService.subscribeTender(tenderId);

        toast({
          title: t("tenders.success.subscribed", "Subscribed"),
          description: t(
            "tenders.success.subscribedDesc",
            "You have subscribed to this tender"
          ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t("tenders.errors.subscribeFailed", "Failed to subscribe"),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  // Dezabonează utilizatorul de la o licitație
  const unsubscribeTender = useCallback(
    async (tenderId: string) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        await tenderService.unsubscribeTender(tenderId);

        toast({
          title: t("tenders.success.unsubscribed", "Unsubscribed"),
          description: t(
            "tenders.success.unsubscribedDesc",
            "You have unsubscribed from this tender"
          ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t("tenders.errors.unsubscribeFailed", "Failed to unsubscribe"),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  // Verifică dacă utilizatorul este abonat la o licitație - cu gestionare îmbunătățită a erorilor
  const checkSubscription = useCallback(async (tenderId: string) => {
    try {
      // Adăugăm un timeout pentru a preveni blocarea la verificarea abonamentului
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn("Timeout checking subscription, defaulting to false");
          resolve(false);
        }, 3000);
      });

      // Folosim Promise.race pentru a implementa un timeout
      return await Promise.race([
        tenderService.isSubscribed(tenderId),
        timeoutPromise,
      ]);
    } catch (err) {
      console.error("Failed to check subscription:", err);
      return false;
    }
  }, []);

  // Descarcă un document al licitației
  const downloadDocument = useCallback(
    async (document: TenderDocument) => {
      setLoading((prev) => ({ ...prev, operation: true }));

      try {
        await tenderService.downloadDocument(document);

        toast({
          title: t("tenders.success.documentDownloaded", "Document downloaded"),
          description: t(
            "tenders.success.documentDownloadedDesc",
            "The document has been downloaded successfully"
          ),
        });

        return true;
      } catch (err) {
        toast({
          variant: "destructive",
          title: t(
            "tenders.errors.downloadDocumentFailed",
            "Failed to download document"
          ),
          description: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, operation: false }));
      }
    },
    [t, toast]
  );

  return {
    tenders,
    selectedTender,
    filters,
    sort,
    pagination,
    alerts,
    notes,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    loadTenders,
    getTenderById,
    loadAlerts,
    loadNotes,
    toggleFavorite,
    toggleRelevant,
    addNote,
    createAlert,
    updateAlert,
    deleteAlert,
    subscribeTender,
    unsubscribeTender,
    checkSubscription,
    downloadDocument,
    setSelectedTender,
  };
}
