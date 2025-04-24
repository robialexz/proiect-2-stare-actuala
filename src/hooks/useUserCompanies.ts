import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { companyService } from "@/lib/company-service";
import { Company, CompanyUserRole } from "@/models/company";

export const useUserCompanies = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, CompanyUserRole>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funcție pentru încărcarea companiilor utilizatorului
  const loadUserCompanies = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userCompanies = await companyService.getUserCompanies(user.id);
      setCompanies(userCompanies);

      // Obținem rolurile utilizatorului în fiecare companie
      const roles: Record<string, CompanyUserRole> = {};
      
      for (const company of userCompanies) {
        const role = await companyService.getUserCompanyRole(user.id, company.id);
        if (role) {
          roles[company.id] = role;
        }
      }
      
      setUserRoles(roles);

      // Selectăm prima companie dacă nu există una selectată
      if (userCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(userCompanies[0]);
      }
    } catch (error: any) {
      console.error("Error loading user companies:", error);
      setError(error.message || "An error occurred while loading your companies");
      toast({
        title: t("userCompanies.errors.loadError", "Error"),
        description: t(
          "userCompanies.errors.loadErrorDescription",
          "An error occurred while loading your companies."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedCompany, toast, t]);

  // Funcție pentru selectarea unei companii
  const selectCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      // Salvăm selecția în localStorage pentru persistență
      localStorage.setItem("selectedCompanyId", companyId);
    }
  };

  // Funcție pentru verificarea dacă utilizatorul este admin într-o companie
  const isCompanyAdmin = (companyId: string): boolean => {
    return userRoles[companyId] === CompanyUserRole.ADMIN;
  };

  // Funcție pentru verificarea dacă utilizatorul are un anumit rol într-o companie
  const hasRole = (companyId: string, role: CompanyUserRole): boolean => {
    return userRoles[companyId] === role;
  };

  // Efect pentru încărcarea inițială a companiilor utilizatorului
  useEffect(() => {
    if (user) {
      loadUserCompanies();
      
      // Încercăm să restaurăm compania selectată din localStorage
      const savedCompanyId = localStorage.getItem("selectedCompanyId");
      if (savedCompanyId) {
        const savedCompany = companies.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setSelectedCompany(savedCompany);
        }
      }
    }
  }, [user, loadUserCompanies]);

  return {
    companies,
    selectedCompany,
    userRoles,
    loading,
    error,
    loadUserCompanies,
    selectCompany,
    isCompanyAdmin,
    hasRole,
  };
};
