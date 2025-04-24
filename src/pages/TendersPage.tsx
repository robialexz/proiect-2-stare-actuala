import React from "react";
import { useTranslation } from "react-i18next";
import { useTenders } from "@/hooks/useTenders";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TendersList from "@/components/tenders/TendersList";
import TenderFilters from "@/components/tenders/TenderFilters";

/**
 * Pagina de licitații
 */
export default function TendersPage() {
  const { t } = useTranslation();
  const {
    tenders,
    filters,
    sort,
    pagination,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    loadTenders,
  } = useTenders();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("tenders.pageTitle", "Licitații")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "tenders.pageDescription",
              "Explorează și gestionează licitațiile disponibile"
            )}
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            {t("tenders.tabs.all", "Toate licitațiile")}
          </TabsTrigger>
          <TabsTrigger value="favorites">
            {t("tenders.tabs.favorites", "Favorite")}
          </TabsTrigger>
          <TabsTrigger value="relevant">
            {t("tenders.tabs.relevant", "Relevante")}
          </TabsTrigger>
          <TabsTrigger value="subscribed">
            {t("tenders.tabs.subscribed", "Abonamente")}
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <TenderFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setPagination({ ...pagination, page: 1 });
                }}
              />
            </Card>
          </div>

          <div className="lg:col-span-3">
            <TabsContent value="all" className="mt-0">
              {renderContent()}
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              {renderContent("favorites")}
            </TabsContent>

            <TabsContent value="relevant" className="mt-0">
              {renderContent("relevant")}
            </TabsContent>

            <TabsContent value="subscribed" className="mt-0">
              {renderContent("subscribed")}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );

  /**
   * Renderează conținutul în funcție de tab-ul selectat
   */
  function renderContent(tab?: string) {
    // Dacă avem o eroare, afișăm un mesaj de eroare
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("tenders.errors.loadFailed", "Eroare")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    // Dacă se încarcă, afișăm un skeleton loader
    if (loading) {
      return (
        <Card className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Filtrăm licitațiile în funcție de tab-ul selectat
    let filteredTenders = [...tenders];
    if (tab === "favorites") {
      filteredTenders = filteredTenders.filter((tender) => tender.is_favorite);
    } else if (tab === "relevant") {
      filteredTenders = filteredTenders.filter((tender) => tender.is_relevant);
    }

    // Afișăm lista de licitații
    return (
      <TendersList
        tenders={filteredTenders}
        pagination={pagination}
        onPaginationChange={setPagination}
        sort={sort}
        onSortChange={setSort}
      />
    );
  }
}
