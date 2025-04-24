import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  Search,
  FileText,
  Package,
  Users,
  Calendar,
  Settings,
  BarChart,
  Database,
  Folder,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseService } from "@/services";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  url: string;
  category: "projects" | "inventory" | "reports" | "settings" | "users";
}

export function GlobalSearch() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Funcție pentru a căuta în baza de date
  const searchDatabase = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];

    try {
      // Căutare proiecte
      const projectsResponse = await supabaseService.select("projects", "*", {
        search: query,
      });

      if (projectsResponse.status === "success" && projectsResponse.data) {
        const projects = projectsResponse.data;
        projects.forEach((project: any) => {
          results.push({
            id: `project-${project.id}`,
            title: project.name || "Proiect fără nume",
            description: project.description || "",
            icon: <FileText className="h-4 w-4" />,
            url: `/projects/${project.id}`,
            category: "projects",
          });
        });
      }

      // Căutare materiale
      const materialsResponse = await supabaseService.select("materials", "*", {
        search: query,
      });

      if (materialsResponse.status === "success" && materialsResponse.data) {
        const materials = materialsResponse.data;
        materials.forEach((material: any) => {
          results.push({
            id: `inventory-${material.id}`,
            title: material.name || "Material fără nume",
            description: `${material.quantity || 0} ${material.unit || "buc"}`,
            icon: <Package className="h-4 w-4" />,
            url: `/inventory?item=${material.id}`,
            category: "inventory",
          });
        });
      }

      // Căutare rapoarte
      const reportsResponse = await supabaseService.select("reports", "*", {
        search: query,
      });

      if (reportsResponse.status === "success" && reportsResponse.data) {
        const reports = reportsResponse.data;
        reports.forEach((report: any) => {
          results.push({
            id: `report-${report.id}`,
            title: report.name || "Raport fără nume",
            description: report.description || "",
            icon: <BarChart className="h-4 w-4" />,
            url: `/reports/${report.id}`,
            category: "reports",
          });
        });
      }

      return results;
    } catch (error) {
      console.error("Eroare la căutare:", error);
      return [];
    }
  };

  // Deschide dialogul de căutare cu shortcut (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Efectuăm căutarea când se schimbă query-ul
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Adăugăm o mică întârziere pentru a evita prea multe cereri
    const timer = setTimeout(async () => {
      try {
        const searchResults = await searchDatabase(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error("Eroare la căutare:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Gestionăm selecția unui rezultat
  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    navigate(result.url);
  };

  // Grupăm rezultatele pe categorii
  const projectResults = results.filter((r) => r.category === "projects");
  const inventoryResults = results.filter((r) => r.category === "inventory");
  const reportResults = results.filter((r) => r.category === "reports");
  const userResults = results.filter((r) => r.category === "users");
  const settingsResults = results.filter((r) => r.category === "settings");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Caută în aplicație...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Caută proiecte, materiale, rapoarte..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          ref={inputRef}
        />
        <CommandList>
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 text-center text-sm"
              >
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-2 text-muted-foreground">Se caută...</p>
              </motion.div>
            ) : (
              <>
                <CommandEmpty>Nu s-au găsit rezultate.</CommandEmpty>

                {projectResults.length > 0 && (
                  <CommandGroup heading="Proiecte">
                    {projectResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {inventoryResults.length > 0 && (
                  <CommandGroup heading="Inventar">
                    {inventoryResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {reportResults.length > 0 && (
                  <CommandGroup heading="Rapoarte">
                    {reportResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                          <BarChart className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {userResults.length > 0 && (
                  <CommandGroup heading="Utilizatori">
                    {userResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success/10 text-success">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {settingsResults.length > 0 && (
                  <CommandGroup heading="Setări">
                    {settingsResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">
                              {result.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {searchQuery && results.length > 0 && (
                  <div className="py-2 px-2 text-xs text-muted-foreground border-t">
                    <p>
                      Apasă <kbd className="px-1 rounded bg-muted">↑</kbd>{" "}
                      <kbd className="px-1 rounded bg-muted">↓</kbd> pentru a
                      naviga și{" "}
                      <kbd className="px-1 rounded bg-muted">Enter</kbd> pentru
                      a selecta
                    </p>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </CommandList>
      </CommandDialog>
    </>
  );
}
