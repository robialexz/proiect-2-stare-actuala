import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { companyService } from "@/lib/company-service";
import {
  Company,
  CompanyUser,
  CompanyUserRole,
  CompanyStatus,
  CompanyUserFilters,
  CompanyUserSort,
  CompanyUserPagination
} from "@/models/company";

export const useCompany = (companyId?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userFilters, setUserFilters] = useState<CompanyUserFilters>({});
  const [userSort, setUserSort] = useState<CompanyUserSort>({
    field: "created_at",
    direction: "desc",
  });
  const [userPagination, setUserPagination] = useState<CompanyUserPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Funcție pentru încărcarea detaliilor companiei
  const loadCompany = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const companyData = await companyService.getCompanyById(companyId);
      setCompany(companyData);
    } catch (error: any) {
      console.error("Error loading company:", error);
      setError(error.message || "An error occurred while loading company details");
      toast({
        title: t("company.errors.loadError", "Error"),
        description: t(
          "company.errors.loadErrorDescription",
          "An error occurred while loading company details."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, toast, t]);

  // Funcție pentru încărcarea utilizatorilor companiei
  const loadCompanyUsers = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, pagination: newPagination } = await companyService.getCompanyUsers(
        companyId,
        userFilters,
        userSort,
        userPagination
      );

      setUsers(data);
      setUserPagination(newPagination);
    } catch (error: any) {
      console.error("Error loading company users:", error);
      setError(error.message || "An error occurred while loading company users");
      toast({
        title: t("company.errors.loadUsersError", "Error"),
        description: t(
          "company.errors.loadUsersErrorDescription",
          "An error occurred while loading company users."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, userFilters, userSort, userPagination, toast, t]);

  // Funcție pentru actualizarea companiei
  const updateCompany = async (data: Partial<Company>) => {
    if (!companyId) return { success: false, error: "No company ID provided" };

    try {
      const updatedCompany = await companyService.updateCompany(companyId, data);
      
      toast({
        title: t("company.success.updated", "Success"),
        description: t(
          "company.success.updatedDescription",
          "Company has been updated successfully."
        ),
      });
      
      setCompany(updatedCompany);
      
      return { success: true, data: updatedCompany };
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast({
        title: t("company.errors.updateError", "Error"),
        description: t(
          "company.errors.updateErrorDescription",
          "An error occurred while updating the company."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru adăugarea unui utilizator la companie
  const addUserToCompany = async (userId: string, role: CompanyUserRole, isAdmin: boolean) => {
    if (!companyId) return { success: false, error: "No company ID provided" };

    try {
      const newUser = await companyService.addUserToCompany(companyId, userId, role, isAdmin);
      
      toast({
        title: t("company.success.userAdded", "Success"),
        description: t(
          "company.success.userAddedDescription",
          "User has been added to the company successfully."
        ),
      });
      
      // Reîncărcăm utilizatorii
      await loadCompanyUsers();
      
      return { success: true, data: newUser };
    } catch (error: any) {
      console.error("Error adding user to company:", error);
      toast({
        title: t("company.errors.addUserError", "Error"),
        description: t(
          "company.errors.addUserErrorDescription",
          "An error occurred while adding the user to the company."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea rolului unui utilizator
  const updateUserRole = async (userId: string, role: CompanyUserRole, isAdmin: boolean) => {
    if (!companyId) return { success: false, error: "No company ID provided" };

    try {
      const updatedUser = await companyService.updateCompanyUserRole(companyId, userId, role, isAdmin);
      
      toast({
        title: t("company.success.userRoleUpdated", "Success"),
        description: t(
          "company.success.userRoleUpdatedDescription",
          "User role has been updated successfully."
        ),
      });
      
      // Reîncărcăm utilizatorii
      await loadCompanyUsers();
      
      return { success: true, data: updatedUser };
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: t("company.errors.updateUserRoleError", "Error"),
        description: t(
          "company.errors.updateUserRoleErrorDescription",
          "An error occurred while updating the user role."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru eliminarea unui utilizator din companie
  const removeUserFromCompany = async (userId: string) => {
    if (!companyId) return { success: false, error: "No company ID provided" };

    try {
      await companyService.removeUserFromCompany(companyId, userId);
      
      toast({
        title: t("company.success.userRemoved", "Success"),
        description: t(
          "company.success.userRemovedDescription",
          "User has been removed from the company successfully."
        ),
      });
      
      // Reîncărcăm utilizatorii
      await loadCompanyUsers();
      
      return { success: true };
    } catch (error: any) {
      console.error("Error removing user from company:", error);
      toast({
        title: t("company.errors.removeUserError", "Error"),
        description: t(
          "company.errors.removeUserErrorDescription",
          "An error occurred while removing the user from the company."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru trimiterea unei invitații
  const sendInvitation = async (email: string, role: CompanyUserRole, isAdmin: boolean) => {
    if (!companyId) return { success: false, error: "No company ID provided" };

    try {
      const invitation = await companyService.sendCompanyInvitation({
        company_id: companyId,
        email,
        role,
        is_admin: isAdmin
      });
      
      toast({
        title: t("company.success.invitationSent", "Success"),
        description: t(
          "company.success.invitationSentDescription",
          "Invitation has been sent successfully."
        ),
      });
      
      return { success: true, data: invitation };
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: t("company.errors.sendInvitationError", "Error"),
        description: t(
          "company.errors.sendInvitationErrorDescription",
          "An error occurred while sending the invitation."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Efect pentru încărcarea inițială a companiei și a utilizatorilor
  useEffect(() => {
    if (companyId) {
      loadCompany();
      loadCompanyUsers();
    }
  }, [companyId, loadCompany, loadCompanyUsers]);

  // Efect pentru filtrarea utilizatorilor
  useEffect(() => {
    // Aplicăm filtrele locale
    let filtered = [...users];

    if (userFilters.role) {
      filtered = filtered.filter(user => user.role === userFilters.role);
    }

    if (userFilters.is_admin !== undefined) {
      filtered = filtered.filter(user => user.is_admin === userFilters.is_admin);
    }

    if (userFilters.search) {
      const searchTerm = userFilters.search.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.user?.email?.toLowerCase().includes(searchTerm) ||
          user.user?.display_name?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
    setUserPagination(prev => ({
      ...prev,
      total: filtered.length,
    }));
  }, [users, userFilters]);

  // Calculăm utilizatorii pentru pagina curentă
  const paginatedUsers = filteredUsers.slice(
    (userPagination.page - 1) * userPagination.pageSize,
    userPagination.page * userPagination.pageSize
  );

  // Obținem rolurile unice
  const roles = Object.values(CompanyUserRole);

  return {
    company,
    users,
    filteredUsers,
    paginatedUsers,
    loading,
    error,
    userFilters,
    setUserFilters,
    userSort,
    setUserSort,
    userPagination,
    setUserPagination,
    roles,
    loadCompany,
    loadCompanyUsers,
    updateCompany,
    addUserToCompany,
    updateUserRole,
    removeUserFromCompany,
    sendInvitation,
  };
};
