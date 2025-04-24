import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TenderFilters as TenderFiltersType,
  TenderStatus,
} from "@/models/tender";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Filter, X } from "lucide-react";

interface TenderFiltersProps {
  filters: TenderFiltersType;
  onFiltersChange: (filters: TenderFiltersType) => void;
}

/**
 * Componenta pentru filtrarea licitațiilor
 */
export default function TenderFilters({
  filters,
  onFiltersChange,
}: TenderFiltersProps) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState<TenderFiltersType>(filters);

  /**
   * Actualizează filtrele locale
   */
  const updateLocalFilters = (key: keyof TenderFiltersType, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Aplică filtrele
   */
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  /**
   * Resetează filtrele
   */
  const resetFilters = () => {
    const resetedFilters: TenderFiltersType = {};
    setLocalFilters(resetedFilters);
    onFiltersChange(resetedFilters);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("tenders.filters.title", "Filtre")}
        </h3>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("tenders.filters.search", "Caută licitații...")}
            value={localFilters.search || ""}
            onChange={(e) => updateLocalFilters("search", e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["status", "options"]}>
        <AccordionItem value="status">
          <AccordionTrigger>
            {t("tenders.filters.status", "Status")}
          </AccordionTrigger>
          <AccordionContent>
            <Select
              value={localFilters.status || ""}
              onValueChange={(value) =>
                updateLocalFilters(
                  "status",
                  value ? (value as TenderStatus) : undefined
                )
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "tenders.filters.selectStatus",
                    "Selectează status"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("tenders.filters.allStatuses", "Toate statusurile")}
                </SelectItem>
                <SelectItem value="active">
                  {t("tenders.status.active", "Activă")}
                </SelectItem>
                <SelectItem value="closed">
                  {t("tenders.status.closed", "Închisă")}
                </SelectItem>
                <SelectItem value="awarded">
                  {t("tenders.status.awarded", "Atribuită")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("tenders.status.cancelled", "Anulată")}
                </SelectItem>
                <SelectItem value="draft">
                  {t("tenders.status.draft", "Ciornă")}
                </SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="authority">
          <AccordionTrigger>
            {t("tenders.filters.authority", "Autoritate contractantă")}
          </AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder={t(
                "tenders.filters.authorityPlaceholder",
                "Caută autoritate..."
              )}
              value={localFilters.authority || ""}
              onChange={(e) => updateLocalFilters("authority", e.target.value)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger>
            {t("tenders.filters.location", "Locație")}
          </AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder={t(
                "tenders.filters.locationPlaceholder",
                "Caută locație..."
              )}
              value={localFilters.location || ""}
              onChange={(e) => updateLocalFilters("location", e.target.value)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="value">
          <AccordionTrigger>
            {t("tenders.filters.value", "Valoare estimată")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("tenders.filters.minValue", "Valoare minimă")}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minValue || ""}
                  onChange={(e) =>
                    updateLocalFilters(
                      "minValue",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("tenders.filters.maxValue", "Valoare maximă")}</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={localFilters.maxValue || ""}
                  onChange={(e) =>
                    updateLocalFilters(
                      "maxValue",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="date">
          <AccordionTrigger>
            {t("tenders.filters.date", "Dată publicare")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("tenders.filters.fromDate", "De la")}</Label>
                <Input
                  type="date"
                  value={localFilters.fromDate || ""}
                  onChange={(e) =>
                    updateLocalFilters("fromDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("tenders.filters.toDate", "Până la")}</Label>
                <Input
                  type="date"
                  value={localFilters.toDate || ""}
                  onChange={(e) => updateLocalFilters("toDate", e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="options">
          <AccordionTrigger>
            {t("tenders.filters.options", "Opțiuni")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyFavorites"
                  checked={localFilters.onlyFavorites || false}
                  onCheckedChange={(checked) =>
                    updateLocalFilters("onlyFavorites", checked)
                  }
                />
                <Label htmlFor="onlyFavorites">
                  {t(
                    "tenders.filters.onlyFavorites",
                    "Doar licitații favorite"
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyRelevant"
                  checked={localFilters.onlyRelevant || false}
                  onCheckedChange={(checked) =>
                    updateLocalFilters("onlyRelevant", checked)
                  }
                />
                <Label htmlFor="onlyRelevant">
                  {t(
                    "tenders.filters.onlyRelevant",
                    "Doar licitații relevante"
                  )}
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} className="w-full">
          {t("tenders.filters.apply", "Aplică filtre")}
        </Button>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <X className="h-4 w-4 mr-2" />
          {t("tenders.filters.reset", "Resetează filtre")}
        </Button>
      </div>
    </div>
  );
}
