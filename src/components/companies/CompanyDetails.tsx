import React, { useState } from 'react';
import { useCompany } from '@/hooks';
import { Company, CompanyStatus } from '@/models/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CompanyUsersList } from './CompanyUsersList';

interface CompanyDetailsProps {
  companyId: string;
  onEdit?: (company: Company) => void;
  onBack?: () => void;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  companyId,
  onEdit,
  onBack
}) => {
  const {
    company,
    loading,
    error,
    loadCompany,
    updateCompany
  } = useCompany(companyId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});
  const [activeTab, setActiveTab] = useState('details');

  // Inițializăm editedCompany când se încarcă compania
  React.useEffect(() => {
    if (company) {
      setEditedCompany(company);
    }
  }, [company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (company) {
      setEditedCompany(company);
    }
  };

  const handleSave = async () => {
    if (!company) return;

    try {
      const result = await updateCompany(editedCompany);
      if (result.success) {
        setIsEditing(false);
        if (onEdit && result.data) {
          onEdit(result.data as Company);
        }
      }
    } catch (error) {
      console.error('Error updating company:', error);
    }
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
          <p>A apărut o eroare la încărcarea detaliilor companiei.</p>
          <p>{error}</p>
          <Button onClick={() => loadCompany()} className="mt-4">
            Reîncarcă
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p>Nu s-au găsit detalii pentru această companie.</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              Înapoi
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={`${company.name} logo`} 
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <div className="flex items-center text-sm text-gray-500">
              {renderStatus(company.status)}
              {company.subscription_plan && (
                <>
                  <span className="mx-2">•</span>
                  <span>{company.subscription_plan}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Anulează
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvează
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editează
            </Button>
          )}
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Înapoi
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Detalii</TabsTrigger>
          <TabsTrigger value="users">Utilizatori</TabsTrigger>
          <TabsTrigger value="subscription">Abonament</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informații Generale</CardTitle>
              <CardDescription>Detaliile de bază ale companiei</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nume Companie</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editedCompany.name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editedCompany.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CompanyStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={editedCompany.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Descriere</h3>
                    <p className="mt-1">{company.description || 'Nicio descriere disponibilă'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informații de Contact</CardTitle>
              <CardDescription>Detaliile de contact ale companiei</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={editedCompany.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editedCompany.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={editedCompany.website || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1">{company.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                        <p className="mt-1">{company.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Website</h3>
                        <p className="mt-1">
                          <a 
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adresă</CardTitle>
              <CardDescription>Adresa companiei</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresă</Label>
                    <Input
                      id="address"
                      name="address"
                      value={editedCompany.address || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Oraș</Label>
                    <Input
                      id="city"
                      name="city"
                      value={editedCompany.city || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Cod Poștal</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={editedCompany.postal_code || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Țară</Label>
                    <Input
                      id="country"
                      name="country"
                      value={editedCompany.country || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Adresă</h3>
                    <p className="mt-1">
                      {company.address ? (
                        <>
                          {company.address}
                          {company.city && `, ${company.city}`}
                          {company.postal_code && `, ${company.postal_code}`}
                          {company.country && `, ${company.country}`}
                        </>
                      ) : (
                        'Nicio adresă disponibilă'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informații Fiscale</CardTitle>
              <CardDescription>Detaliile fiscale ale companiei</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Cod Fiscal</Label>
                    <Input
                      id="tax_id"
                      name="tax_id"
                      value={editedCompany.tax_id || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Număr de Înregistrare</Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      value={editedCompany.registration_number || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.tax_id && (
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Cod Fiscal</h3>
                        <p className="mt-1">{company.tax_id}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.registration_number && (
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Număr de Înregistrare</h3>
                        <p className="mt-1">{company.registration_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <CompanyUsersList companyId={companyId} />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalii Abonament</CardTitle>
              <CardDescription>Informații despre abonamentul companiei</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="subscription_plan">Plan Abonament</Label>
                    <Input
                      id="subscription_plan"
                      name="subscription_plan"
                      value={editedCompany.subscription_plan || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subscription_start_date">Data Început</Label>
                    <Input
                      id="subscription_start_date"
                      name="subscription_start_date"
                      type="date"
                      value={editedCompany.subscription_start_date ? new Date(editedCompany.subscription_start_date).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subscription_end_date">Data Sfârșit</Label>
                    <Input
                      id="subscription_end_date"
                      name="subscription_end_date"
                      type="date"
                      value={editedCompany.subscription_end_date ? new Date(editedCompany.subscription_end_date).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Plan Abonament</h3>
                      <p className="mt-1">{company.subscription_plan || 'Niciun plan de abonament'}</p>
                    </div>
                  </div>
                  
                  {(company.subscription_start_date || company.subscription_end_date) && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Perioadă Abonament</h3>
                        <p className="mt-1">
                          {company.subscription_start_date ? new Date(company.subscription_start_date).toLocaleDateString() : 'N/A'}
                          {' - '}
                          {company.subscription_end_date ? new Date(company.subscription_end_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetails;
