import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tender, TenderSort, TenderPagination } from "@/models/tender";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowUpDown,
  Calendar,
  Building,
  MapPin,
  Tag,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import TenderDetailsDialog from "./TenderDetailsDialog";

interface TendersListProps {
  tenders: Tender[];
  pagination: TenderPagination;
  onPaginationChange: (pagination: TenderPagination) => void;
  sort: TenderSort;
  onSortChange: (sort: TenderSort) => void;
}

/**
 * Componenta pentru afișarea listei de licitații
 */
export default function TendersList({
  tenders,
  pagination,
  onPaginationChange,
  sort,
  onSortChange,
}: TendersListProps) {
  const { t } = useTranslation();
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  /**
   * Schimbă sortarea
   */
  const handleSortChange = (field: string) => {
    if (sort.field === field) {
      // Dacă este același câmp, schimbăm direcția
      onSortChange({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      // Dacă este un câmp nou, setăm direcția implicită
      onSortChange({
        field,
        direction: "desc",
      });
    }
  };

  /**
   * Schimbă pagina
   */
  const handlePageChange = (page: number) => {
    onPaginationChange({
      ...pagination,
      page,
    });
  };

  /**
   * Schimbă numărul de elemente pe pagină
   */
  const handlePageSizeChange = (pageSize: number) => {
    onPaginationChange({
      ...pagination,
      pageSize,
      page: 1, // Resetăm pagina la 1 când schimbăm numărul de elemente pe pagină
    });
  };

  /**
   * Calculează numărul total de pagini
   */
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  /**
   * Generează paginile care trebuie afișate
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Dacă avem mai puține pagini decât maxim, le afișăm pe toate
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Altfel, afișăm prima pagină, ultima pagină și paginile din jurul paginii curente
      pages.push(1);

      let startPage = Math.max(2, pagination.page - 1);
      let endPage = Math.min(totalPages - 1, pagination.page + 1);

      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  /**
   * Obține clasa CSS pentru badge-ul de status
   */
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
      case "awarded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default:
        return "";
    }
  };

  /**
   * Obține iconul pentru badge-ul de status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "closed":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "awarded":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "draft":
        return <FileText className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">
              {t("tenders.list.title", "Licitații")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "tenders.list.showing",
                "Afișare {{start}} - {{end}} din {{total}} licitații",
                {
                  start: Math.min(
                    (pagination.page - 1) * pagination.pageSize + 1,
                    pagination.total
                  ),
                  end: Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total
                  ),
                  total: pagination.total,
                }
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={sort.field}
              onValueChange={(value) => handleSortChange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t("tenders.list.sortBy", "Sortează după")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publication_date">
                  {t("tenders.list.sortByPublicationDate", "Dată publicare")}
                </SelectItem>
                <SelectItem value="closing_date">
                  {t("tenders.list.sortByClosingDate", "Dată închidere")}
                </SelectItem>
                <SelectItem value="estimated_value">
                  {t("tenders.list.sortByValue", "Valoare estimată")}
                </SelectItem>
                <SelectItem value="title">
                  {t("tenders.list.sortByTitle", "Titlu")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                handleSortChange(sort.field)
              }
              title={
                sort.direction === "asc"
                  ? t("tenders.list.sortAscending", "Crescător")
                  : t("tenders.list.sortDescending", "Descrescător")
              }
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {tenders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {t("tenders.list.noTenders", "Nu există licitații disponibile")}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {tenders.map((tender) => (
                <div
                  key={tender.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start justify-between">
                        <h4
                          className="text-lg font-medium hover:text-primary cursor-pointer"
                          onClick={() => setSelectedTender(tender)}
                        >
                          {tender.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge
                            className={`flex items-center ${getStatusBadgeClass(
                              tender.status
                            )}`}
                          >
                            {getStatusIcon(tender.status)}
                            {t(
                              `tenders.status.${tender.status}`,
                              tender.status
                            )}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tender.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {t("tenders.list.published", "Publicat")}: {formatDate(tender.publication_date)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {t("tenders.list.closing", "Închidere")}: {formatDate(tender.closing_date)}
                        </div>
                        {tender.estimated_value && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {formatCurrency(
                              tender.estimated_value,
                              tender.currency || "RON"
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {tender.contracting_authority}
                          {tender.authority_type && (
                            <span className="ml-1 text-xs">
                              ({tender.authority_type})
                            </span>
                          )}
                        </div>
                        {tender.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {tender.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedTender(tender)}
                      >
                        {t("tenders.list.viewDetails", "Vezi detalii")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={tender.is_favorite ? "text-yellow-500" : ""}
                        title={
                          tender.is_favorite
                            ? t(
                                "tenders.list.removeFromFavorites",
                                "Elimină de la favorite"
                              )
                            : t(
                                "tenders.list.addToFavorites",
                                "Adaugă la favorite"
                              )
                        }
                      >
                        {tender.is_favorite ? (
                          <Star className="h-5 w-5 fill-current" />
                        ) : (
                          <Star className="h-5 w-5" />
                        )}
                      </Button>
                      {tender.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title={t(
                            "tenders.list.openExternalLink",
                            "Deschide link extern"
                          )}
                        >
                          <a
                            href={tender.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("tenders.list.itemsPerPage", "Elemente pe pagină")}:
            </span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.page - 1)}
                  isActive={pagination.page > 1}
                  className={
                    pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink
                      isActive={pagination.page === page}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.page + 1)}
                  isActive={pagination.page < totalPages}
                  className={
                    pagination.page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {selectedTender && (
        <TenderDetailsDialog
          tender={selectedTender}
          open={!!selectedTender}
          onClose={() => setSelectedTender(null)}
        />
      )}
    </>
  );
}
