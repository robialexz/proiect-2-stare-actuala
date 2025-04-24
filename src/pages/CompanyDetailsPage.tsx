import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyDetails } from '@/components/companies';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { companyService } from '@/lib/company-service';
import { ArrowLeft } from 'lucide-react';

const CompanyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Verificăm dacă utilizatorul este admin de site
  useEffect(() => {
    const checkSiteAdmin = async () => {
      if (user) {
        try {
          const isAdmin = await companyService.isSiteAdmin(user.id);
          setIsSiteAdmin(isAdmin);
          
          if (!isAdmin) {
            toast({
              title: 'Acces restricționat',
              description: 'Nu aveți permisiunea de a accesa această pagină.',
              variant: 'destructive'
            });
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Eroare la verificarea rolului de admin:', error);
          toast({
            title: 'Eroare',
            description: 'A apărut o eroare la verificarea permisiunilor.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkSiteAdmin();
  }, [user, navigate, toast]);
  
  const handleBack = () => {
    navigate('/companies');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isSiteAdmin || !id) {
    return null; // Nu afișăm nimic dacă utilizatorul nu este admin de site sau nu avem ID
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi la lista de companii
        </Button>
      </div>
      
      <CompanyDetails companyId={id} onBack={handleBack} />
    </div>
  );
};

export default CompanyDetailsPage;
