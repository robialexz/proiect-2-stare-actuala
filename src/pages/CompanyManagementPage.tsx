import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyList } from "@/components/companies";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { companyService } from "@/lib/company-service";

const CompanyManagementPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "">("");
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);

  // Verificăm dacă utilizatorul este admin de site
  useEffect(() => {
    const checkSiteAdmin = async () => {
      if (user) {
        try {
          const isAdmin = await companyService.isSiteAdmin(user.id);
          setIsSiteAdmin(isAdmin);

          if (!isAdmin) {
            toast({
              title: "Acces restricționat",
              description: "Nu aveți permisiunea de a accesa această pagină.",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Eroare la verificarea rolului de admin:", error);
          toast({
            title: "Eroare",
            description: "A apărut o eroare la verificarea permisiunilor.",
            variant: "destructive",
          });
        }
      }
    };

    checkSiteAdmin();
  }, [user, navigate, toast]);

  // Încărcăm companiile
  useEffect(() => {
    const loadCompanies = async () => {
      if (isSiteAdmin) {
        try {
          setLoading(true);
          const response = await companyService.getAllCompanies();
          setCompanies(response.data);
        } catch (error) {
          console.error("Eroare la încărcarea companiilor:", error);
          toast({
            title: "Eroare",
            description: "A apărut o eroare la încărcarea companiilor.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadCompanies();
  }, [isSiteAdmin, toast]);

  // Filtrăm companiile după termen de căutare și status
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description &&
        company.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter ? company.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Funcție pentru a adăuga o companie nouă
  const handleAddCompany = () => {
    navigate("/companies/add");
  };

  // Funcție pentru a edita o companie
  const handleEditCompany = (id: string) => {
    navigate(`/companies/edit/${id}`);
  };

  // Funcție pentru a șterge o companie
  const handleDeleteCompany = async (id: string) => {
    if (
      window.confirm(
        "Sigur doriți să ștergeți această companie? Această acțiune nu poate fi anulată."
      )
    ) {
      try {
        await companyService.deleteCompany(id);
        setCompanies(companies.filter((company) => company.id !== id));
        toast({
          title: "Succes",
          description: "Compania a fost ștearsă cu succes.",
        });
      } catch (error) {
        console.error("Eroare la ștergerea companiei:", error);
        toast({
          title: "Eroare",
          description: "A apărut o eroare la ștergerea companiei.",
          variant: "destructive",
        });
      }
    }
  };

  // Funcție pentru a gestiona utilizatorii unei companii
  const handleManageUsers = (id: string) => {
    navigate(`/companies/${id}/users`);
  };

  // Funcție pentru a gestiona setările unei companii
  const handleManageSettings = (id: string) => {
    navigate(`/companies/${id}/settings`);
  };

  // Funcție pentru a afișa iconița de status
  const renderStatusIcon = (status: CompanyStatus) => {
    switch (status) {
      case CompanyStatus.ACTIVE:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case CompanyStatus.INACTIVE:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case CompanyStatus.PENDING:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case CompanyStatus.SUSPENDED:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case CompanyStatus.TRIAL:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!isSiteAdmin) {
    return null; // Nu afișăm nimic dacă utilizatorul nu este admin de site
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Administrare Companii</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <CompanyList
          onAddCompany={handleAddCompany}
          onEditCompany={handleEditCompany}
          onDeleteCompany={handleDeleteCompany}
          onManageUsers={handleManageUsers}
          onManageSettings={handleManageSettings}
        />
      )}
    </div>
  );
};

export default CompanyManagementPage;
