import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/services/api/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import { companyService } from "@/lib/company-service";
import {
  Company,
  CompanyStatus,
  CompanyFilters,
  CompanySort,
  CompanyPagination
} from "@/models/company";

export const useCompanies = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CompanyFilters>({});
  const [sort, setSort] = useState<CompanySort>({
    field: "name",
    direction: "asc",
  });
  const [pagination, setPagination] = useState<CompanyPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Funcție pentru încărcarea companiilor
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination: newPagination } = await companyService.getAllCompanies(
        filters,
        sort,
        pagination
      );

      setCompanies(data);
      setPagination(newPagination);
    } catch (error: any) {
      console.error("Error loading companies:", error);
      setError(error.message || "An error occurred while loading companies");
      toast({
        title: t("companies.errors.loadError", "Error"),
        description: t(
          "companies.errors.loadErrorDescription",
          "An error occurred while loading companies."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sort, pagination, toast, t]);

  // Funcție pentru crearea unei companii
  const createCompany = async (company: Partial<Company>) => {
    try {
      const newCompany = await companyService.createCompany(company);
      
      toast({
        title: t("companies.success.created", "Success"),
        description: t(
          "companies.success.createdDescription",
          "Company has been created successfully."
        ),
      });
      
      // Reîncărcăm companiile
      await loadCompanies();
      
      return { success: true, data: newCompany };
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: t("companies.errors.createError", "Error"),
        description: t(
          "companies.errors.createErrorDescription",
          "An error occurred while creating the company."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea unei companii
  const updateCompany = async (id: string, company: Partial<Company>) => {
    try {
      const updatedCompany = await companyService.updateCompany(id, company);
      
      toast({
        title: t("companies.success.updated", "Success"),
        description: t(
          "companies.success.updatedDescription",
          "Company has been updated successfully."
        ),
      });
      
      // Reîncărcăm companiile
      await loadCompanies();
      
      return { success: true, data: updatedCompany };
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast({
        title: t("companies.errors.updateError", "Error"),
        description: t(
          "companies.errors.updateErrorDescription",
          "An error occurred while updating the company."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru ștergerea unei companii
  const deleteCompany = async (id: string) => {
    try {
      await companyService.deleteCompany(id);
      
      toast({
        title: t("companies.success.deleted", "Success"),
        description: t(
          "companies.success.deletedDescription",
          "Company has been deleted successfully."
        ),
      });
      
      // Reîncărcăm companiile
      await loadCompanies();
      
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting company:", error);
      toast({
        title: t("companies.errors.deleteError", "Error"),
        description: t(
          "companies.errors.deleteErrorDescription",
          "An error occurred while deleting the company."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea statusului unei companii
  const updateCompanyStatus = async (id: string, status: CompanyStatus) => {
    try {
      const updatedCompany = await companyService.updateCompany(id, { status });
      
      toast({
        title: t("companies.success.statusUpdated", "Success"),
        description: t(
          "companies.success.statusUpdatedDescription",
          "Company status has been updated successfully."
        ),
      });
      
      // Reîncărcăm companiile
      await loadCompanies();
      
      return { success: true, data: updatedCompany };
    } catch (error: any) {
      console.error("Error updating company status:", error);
      toast({
        title: t("companies.errors.updateStatusError", "Error"),
        description: t(
          "companies.errors.updateStatusErrorDescription",
          "An error occurred while updating the company status."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Efect pentru încărcarea inițială a companiilor
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Efect pentru filtrarea companiilor
  useEffect(() => {
    // Aplicăm filtrele locale
    let filtered = [...companies];

    if (filters.name) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(company => company.status === filters.status);
    }

    if (filters.subscription_plan) {
      filtered = filtered.filter(company =>
        company.subscription_plan?.toLowerCase().includes(filters.subscription_plan!.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
    }));
  }, [companies, filters]);

  // Calculăm companiile pentru pagina curentă
  const paginatedCompanies = filteredCompanies.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  // Obținem statusurile unice
  const statuses = Object.values(CompanyStatus);

  // Obținem planurile de abonament unice
  const subscriptionPlans = [
    ...new Set(
      companies
        .map(company => company.subscription_plan)
        .filter(Boolean) as string[]
    ),
  ];

  return {
    companies,
    filteredCompanies,
    paginatedCompanies,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    statuses,
    subscriptionPlans,
    loadCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    updateCompanyStatus,
  };
};
