/**
 * Supabase Provider
 *
 * This file provides hooks to access the Supabase client throughout the application.
 * It re-exports the Supabase client from services/api/supabase-client.ts to maintain
 * a single instance of the client and provides additional utility functions.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/api/supabase-client";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook to access the Supabase client
 * @returns The Supabase client instance
 */
export function useSupabaseClient() {
  return supabase;
}

/**
 * Hook pentru a asculta schimbări în timp real pentru un tabel
 * @param table Numele tabelului
 * @param event Tipul de eveniment (INSERT, UPDATE, DELETE sau *)
 * @param callback Funcția apelată când se primesc date noi
 * @param filter Filtru opțional pentru înregistrări
 * @returns O funcție pentru dezabonare
 */
export function useRealtimeSubscription<T = any>(
  table: string,
  event: "INSERT" | "UPDATE" | "DELETE" | "*",
  callback: (payload: {
    new: T | null;
    old: T | null;
    eventType: "INSERT" | "UPDATE" | "DELETE";
  }) => void,
  filter?: Record<string, any>
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Creăm un canal pentru tabel
    let channelQuery = supabase.channel(`public:${table}`);

    // Configurăm filtrul pentru evenimentele din tabel
    let filterConfig: any = {
      event,
      schema: "public",
      table,
    };

    // Adăugăm filtrul dacă este specificat
    if (filter) {
      const filterString = Object.entries(filter)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join(",");

      if (filterString) {
        filterConfig.filter = filterString;
      }
    }

    // Configurăm abonamentul
    channelQuery = channelQuery.on(
      "postgres_changes",
      filterConfig,
      (payload) => {
        // Transformăm payload-ul pentru a fi mai ușor de utilizat
        callback({
          new: (payload.new as T) || null,
          old: (payload.old as T) || null,
          eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
        });
      }
    );

    // Pornim abonamentul
    const subscription = channelQuery.subscribe();

    // Salvăm canalul pentru a-l putea închide mai târziu
    setChannel(channelQuery);

    // Curățăm abonamentul când componenta este demontată
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, callback, filter]);

  // Returnăm o funcție pentru dezabonare
  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
  }, [channel]);

  return unsubscribe;
}

/**
 * Hook pentru a verifica starea conexiunii Supabase
 * @returns Starea conexiunii
 */
export function useSupabaseConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Verificăm starea conexiunii la montare
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("_realtime")
          .select("*")
          .limit(1);
        setIsConnected(!error);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();

    // Configurăm un interval pentru a verifica periodic conexiunea
    const interval = setInterval(checkConnection, 30000); // 30 secunde

    // Curățăm intervalul la demontare
    return () => clearInterval(interval);
  }, []);

  return isConnected;
}

export default useSupabaseClient;
