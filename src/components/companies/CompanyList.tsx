import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/hooks';
import { CompanyStatus } from '@/models/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Users, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface CompanyListProps {
  onAddCompany?: () => void;
  onEditCompany?: (id: string) => void;
  onDeleteCompany?: (id: string) => void;
  onManageUsers?: (id: string) => void;
  onManageSettings?: (id: string) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  onAddCompany,
  onEditCompany,
  onDeleteCompany,
  onManageUsers,
  onManageSettings
}) => {
  const navigate = useNavigate();
  const {
    companies,
    filteredCompanies,
    paginatedCompanies,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    statuses,
    loadCompanies,
    deleteCompany,
    updateCompanyStatus
  } = useCompanies();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | ''>('');

  // Funcție pentru a actualiza filtrele
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters({ ...filters, name: value });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as CompanyStatus | '');
    setFilters({ ...filters, status: value ? (value as CompanyStatus) : undefined });
  };

  // Funcție pentru a gestiona paginarea
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Funcții pentru acțiuni
  const handleAddCompany = () => {
    if (onAddCompany) {
      onAddCompany();
    } else {
      navigate('/companies/add');
    }
  };

  const handleEditCompany = (id: string) => {
    if (onEditCompany) {
      onEditCompany(id);
    } else {
      navigate(`/companies/edit/${id}`);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți această companie?')) {
      if (onDeleteCompany) {
        onDeleteCompany(id);
      } else {
        await deleteCompany(id);
      }
    }
  };

  const handleManageUsers = (id: string) => {
    if (onManageUsers) {
      onManageUsers(id);
    } else {
      navigate(`/companies/${id}/users`);
    }
  };

  const handleManageSettings = (id: string) => {
    if (onManageSettings) {
      onManageSettings(id);
    } else {
      navigate(`/companies/${id}/settings`);
    }
  };

  const handleUpdateStatus = async (id: string, status: CompanyStatus) => {
    await updateCompanyStatus(id, status);
  };

  // Funcție pentru a afișa statusul companiei
  const renderStatus = (status: CompanyStatus) => {
    switch (status) {
      case CompanyStatus.ACTIVE:
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Activă</span>
          </div>
        );
      case CompanyStatus.INACTIVE:
        return (
          <div className="flex items-center text-gray-600">
            <XCircle className="h-4 w-4 mr-1" />
            <span>Inactivă</span>
          </div>
        );
      case CompanyStatus.PENDING:
        return (
          <div className="flex items-center text-yellow-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>În așteptare</span>
          </div>
        );
      case CompanyStatus.SUSPENDED:
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="h-4 w-4 mr-1" />
            <span>Suspendată</span>
          </div>
        );
      case CompanyStatus.TRIAL:
        return (
          <div className="flex items-center text-blue-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Trial</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          <p>A apărut o eroare la încărcarea companiilor.</p>
          <p>{error}</p>
          <Button onClick={() => loadCompanies()} className="mt-4">
            Reîncarcă
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Companii</h2>
        <Button onClick={handleAddCompany}>
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Companie
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Caută companii..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrează după status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate statusurile</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {paginatedCompanies.length === 0 ? (
        <div className="text-center py-10">
          <Building className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Nu există companii</h3>
          <p className="mt-2 text-gray-500">
            Nu am găsit nicio companie care să corespundă criteriilor de căutare.
          </p>
          <Button onClick={handleAddCompany} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Adaugă prima companie
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCompanies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{company.name}</span>
                  {renderStatus(company.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{company.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {company.email && (
                      <div>
                        <Label className="text-xs text-gray-500">Email</Label>
                        <p className="truncate">{company.email}</p>
                      </div>
                    )}
                    {company.phone && (
                      <div>
                        <Label className="text-xs text-gray-500">Telefon</Label>
                        <p>{company.phone}</p>
                      </div>
                    )}
                    {company.city && (
                      <div>
                        <Label className="text-xs text-gray-500">Oraș</Label>
                        <p>{company.city}</p>
                      </div>
                    )}
                    {company.subscription_plan && (
                      <div>
                        <Label className="text-xs text-gray-500">Abonament</Label>
                        <p>{company.subscription_plan}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleManageUsers(company.id)}>
                      <Users className="h-4 w-4 mr-1" />
                      Utilizatori
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleManageSettings(company.id)}>
                      <Settings className="h-4 w-4 mr-1" />
                      Setări
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditCompany(company.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editează
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteCompany(company.id)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Șterge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginare */}
      {filteredCompanies.length > pagination.pageSize && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            
            {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }).map((_, index) => (
              <Button
                key={index}
                variant={pagination.page === index + 1 ? "default" : "outline"}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Următor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
