import React, { createContext, useContext } from "react";

// Definim tipul pentru contextul offline
interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingOperationsCount: number;
  toggleOfflineMode: () => void;
  syncData: () => Promise<void>;
}

// Creăm contextul
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Provider pentru contextul offline - simplificat, fără funcționalitate reală
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Valori implicite pentru contextul offline
  const value = {
    isOnline: true, // Întotdeauna online
    isOfflineMode: false, // Modul offline dezactivat
    pendingOperationsCount: 0, // Nicio operațiune în așteptare
    toggleOfflineMode: () => {}, // Funcție goală
    syncData: async () => {}, // Funcție goală
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

// Hook pentru utilizarea contextului offline
export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
