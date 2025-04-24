import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { 
  Tender, 
  TenderFilters, 
  TenderSort, 
  TenderPagination,
  TenderDocument,
  TenderNote
} from "@/models/tender";
import { supabase } from "@/lib/supabase";

/**
 * Hook pentru gestionarea licitațiilor
 */
export function useTenders() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // State pentru licitații
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<TenderNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  /**
   * Încarcă licitațiile din Supabase
   */
  const loadTenders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Construim query-ul de bază
      let query = supabase
        .from("tenders")
        .select("*", { count: "exact" });
      
      // Aplicăm filtrele
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},reference_number.ilike.${searchTerm}`);
      }
      
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters.authority) {
        query = query.ilike("contracting_authority", `%${filters.authority}%`);
      }
      
      if (filters.cpvCode) {
        query = query.eq("cpv_code", filters.cpvCode);
      }
      
      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      
      if (filters.minValue) {
        query = query.gte("estimated_value", filters.minValue);
      }
      
      if (filters.maxValue) {
        query = query.lte("estimated_value", filters.maxValue);
      }
      
      if (filters.fromDate) {
        query = query.gte("publication_date", filters.fromDate);
      }
      
      if (filters.toDate) {
        query = query.lte("publication_date", filters.toDate);
      }
      
      if (filters.onlyFavorites) {
        query = query.eq("is_favorite", true);
      }
      
      if (filters.onlyRelevant) {
        query = query.eq("is_relevant", true);
      }
      
      // Aplicăm sortarea
      query = query.order(sort.field, { ascending: sort.direction === "asc" });
      
      // Aplicăm paginarea
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
      
      // Executăm query-ul
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Actualizăm state-ul
      setTenders(data as Tender[]);
      setPagination({
        ...pagination,
        total: count || 0
      });
    } catch (err) {
      console.error("Error loading tenders:", err);
      setError(t('tenders.errors.loadFailed', 'Failed to load tenders'));
      toast({
        variant: 'destructive',
        title: t('tenders.errors.loadFailed', 'Failed to load tenders'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sort, pagination, t, toast]);

  /**
   * Încarcă o licitație după ID
   */
  const loadTenderById = useCallback(async (tenderId: string) => {
    setLoading(true);
    
    try {
      // Obținem licitația
      const { data, error } = await supabase
        .from("tenders")
        .select("*")
        .eq("id", tenderId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Obținem documentele licitației
      const { data: documents, error: documentsError } = await supabase
        .from("tender_documents")
        .select("*")
        .eq("tender_id", tenderId);
      
      if (documentsError) {
        console.error("Error loading tender documents:", documentsError);
      }
      
      // Actualizăm state-ul
      setSelectedTender({
        ...data as Tender,
        documents: documents as TenderDocument[] || []
      });
      
      return data as Tender;
    } catch (err) {
      console.error("Error loading tender:", err);
      toast({
        variant: 'destructive',
        title: t('tenders.errors.loadTenderFailed', 'Failed to load tender'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  /**
   * Încarcă notele unei licitații
   */
  const loadNotes = useCallback(async (tenderId: string) => {
    setLoadingNotes(true);
    
    try {
      const { data, error } = await supabase
        .from("tender_notes")
        .select("*")
        .eq("tender_id", tenderId)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setNotes(data as TenderNote[]);
    } catch (err) {
      console.error("Error loading notes:", err);
      toast({
        variant: 'destructive',
        title: t('tenders.errors.loadNotesFailed', 'Failed to load notes'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoadingNotes(false);
    }
  }, [t, toast]);

  /**
   * Adaugă o notă la o licitație
   */
  const addNote = useCallback(async (tenderId: string, content: string) => {
    try {
      // Obținem ID-ul utilizatorului curent
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        throw new Error("User not authenticated");
      }
      
      const userId = userData.user.id;
      
      // Adăugăm nota
      const { data, error } = await supabase
        .from("tender_notes")
        .insert({
          tender_id: tenderId,
          user_id: userId,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Actualizăm state-ul
      setNotes(prev => [data as TenderNote, ...prev]);
      
      toast({
        title: t('tenders.success.noteAdded', 'Note added'),
        description: t('tenders.success.noteAddedDesc', 'Your note has been added successfully')
      });
      
      return true;
    } catch (err) {
      console.error("Error adding note:", err);
      toast({
        variant: 'destructive',
        title: t('tenders.errors.addNoteFailed', 'Failed to add note'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    }
  }, [t, toast]);

  /**
   * Verifică dacă utilizatorul este abonat la o licitație
   */
  const checkSubscription = useCallback(async (tenderId: string) => {
    setLoadingSubscription(true);
    
    try {
      // Obținem ID-ul utilizatorului curent
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        return false;
      }
      
      const userId = userData.user.id;
      
      // Verificăm abonamentul
      const { data, error } = await supabase
        .from("tender_subscriptions")
        .select("*")
        .eq("tender_id", tenderId)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      setIsSubscribed(!!data);
      return !!data;
    } catch (err) {
      console.error("Error checking subscription:", err);
      return false;
    } finally {
      setLoadingSubscription(false);
    }
  }, []);

  /**
   * Abonează sau dezabonează utilizatorul de la o licitație
   */
  const toggleSubscription = useCallback(async (tenderId: string) => {
    try {
      // Obținem ID-ul utilizatorului curent
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        throw new Error("User not authenticated");
      }
      
      const userId = userData.user.id;
      
      if (isSubscribed) {
        // Dezabonăm utilizatorul
        const { error } = await supabase
          .from("tender_subscriptions")
          .delete()
          .eq("tender_id", tenderId)
          .eq("user_id", userId);
        
        if (error) {
          throw error;
        }
        
        setIsSubscribed(false);
        
        toast({
          title: t('tenders.success.unsubscribed', 'Unsubscribed'),
          description: t('tenders.success.unsubscribedDesc', 'You have been unsubscribed from this tender')
        });
      } else {
        // Abonăm utilizatorul
        const { error } = await supabase
          .from("tender_subscriptions")
          .insert({
            tender_id: tenderId,
            user_id: userId,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          throw error;
        }
        
        setIsSubscribed(true);
        
        toast({
          title: t('tenders.success.subscribed', 'Subscribed'),
          description: t('tenders.success.subscribedDesc', 'You have been subscribed to this tender')
        });
      }
      
      return true;
    } catch (err) {
      console.error("Error toggling subscription:", err);
      toast({
        variant: 'destructive',
        title: t('tenders.errors.subscriptionFailed', 'Subscription failed'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    }
  }, [isSubscribed, t, toast]);

  /**
   * Marchează o licitație ca favorită
   */
  const toggleFavorite = useCallback(async (tenderId: string, isFavorite: boolean) => {
    try {
      // Actualizăm licitația
      const { error } = await supabase
        .from("tenders")
        .update({ is_favorite: isFavorite })
        .eq("id", tenderId);
      
      if (error) {
        throw error;
      }
      
      // Actualizăm state-ul
      setTenders(prev => 
        prev.map(tender => 
          tender.id === tenderId 
            ? { ...tender, is_favorite: isFavorite } 
            : tender
        )
      );
      
      if (selectedTender && selectedTender.id === tenderId) {
        setSelectedTender(prev => 
          prev ? { ...prev, is_favorite: isFavorite } : null
        );
      }
      
      toast({
        title: isFavorite 
          ? t('tenders.success.addedToFavorites', 'Added to favorites')
          : t('tenders.success.removedFromFavorites', 'Removed from favorites'),
        description: isFavorite
          ? t('tenders.success.addedToFavoritesDesc', 'The tender has been added to your favorites')
          : t('tenders.success.removedFromFavoritesDesc', 'The tender has been removed from your favorites')
      });
      
      return true;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast({
        variant: 'destructive',
        title: t('tenders.errors.favoriteFailed', 'Failed to update favorite status'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    }
  }, [selectedTender, t, toast]);

  /**
   * Marchează o licitație ca relevantă
   */
  const toggleRelevant = useCallback(async (tenderId: string, isRelevant: boolean) => {
    try {
      // Actualizăm licitația
      const { error } = await supabase
        .from("tenders")
        .update({ is_relevant: isRelevant })
        .eq("id", tenderId);
      
      if (error) {
        throw error;
      }
      
      // Actualizăm state-ul
      setTenders(prev => 
        prev.map(tender => 
          tender.id === tenderId 
            ? { ...tender, is_relevant: isRelevant } 
            : tender
        )
      );
      
      if (selectedTender && selectedTender.id === tenderId) {
        setSelectedTender(prev => 
          prev ? { ...prev, is_relevant: isRelevant } : null
        );
      }
      
      toast({
        title: isRelevant 
          ? t('tenders.success.markedAsRelevant', 'Marked as relevant')
          : t('tenders.success.markedAsIrrelevant', 'Marked as irrelevant'),
        description: isRelevant
          ? t('tenders.success.markedAsRelevantDesc', 'The tender has been marked as relevant')
          : t('tenders.success.markedAsIrrelevantDesc', 'The tender has been marked as irrelevant')
      });
      
      return true;
    } catch (err) {
      console.error("Error toggling relevant:", err);
      toast({
        variant: 'destructive',
        title: t('tenders.errors.relevantFailed', 'Failed to update relevance status'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    }
  }, [selectedTender, t, toast]);

  /**
   * Descarcă un document al licitației
   */
  const downloadDocument = useCallback((document: TenderDocument) => {
    // Deschidem documentul într-o nouă fereastră
    window.open(document.url, '_blank');
    
    toast({
      title: t('tenders.success.documentDownloaded', 'Document downloaded'),
      description: t('tenders.success.documentDownloadedDesc', 'The document has been downloaded successfully')
    });
    
    return true;
  }, [t, toast]);

  // Încărcăm licitațiile la montarea componentei sau când se schimbă filtrele, sortarea sau paginarea
  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  return {
    tenders,
    selectedTender,
    filters,
    sort,
    pagination,
    loading,
    error,
    notes,
    loadingNotes,
    isSubscribed,
    loadingSubscription,
    setFilters,
    setSort,
    setPagination,
    loadTenders,
    loadTenderById,
    loadNotes,
    addNote,
    checkSubscription,
    toggleSubscription,
    toggleFavorite,
    toggleRelevant,
    downloadDocument,
    setSelectedTender
  };
}
