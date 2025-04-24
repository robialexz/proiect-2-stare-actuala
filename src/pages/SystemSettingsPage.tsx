import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Mail, 
  Shield, 
  Database, 
  FileText, 
  Upload, 
  Clock,
  BellRing,
  Palette,
  Globe,
  Users
} from 'lucide-react';

// Definim tipurile pentru setările sistemului
interface SystemSettings {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  updated_at: string;
}

interface GroupedSettings {
  [category: string]: SystemSettings[];
}

const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});

  // Funcție pentru încărcarea setărilor sistemului
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Obținem setările din baza de date
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Grupăm setările după categorie
        const grouped: GroupedSettings = {};
        const values: Record<string, string> = {};
        
        data.forEach((setting: SystemSettings) => {
          if (!grouped[setting.category]) {
            grouped[setting.category] = [];
          }
          
          grouped[setting.category].push(setting);
          values[setting.key] = setting.value;
        });
        
        setSettings(grouped);
        setFormValues(values);
        setOriginalValues(values);
      }
      
      toast({
        title: t('systemSettings.loadSuccess', 'Settings loaded'),
        description: t('systemSettings.loadSuccessDescription', 'System settings have been loaded successfully.'),
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: 'destructive',
        title: t('systemSettings.loadError', 'Error loading settings'),
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm setările la montarea componentei
  useEffect(() => {
    fetchSettings();
  }, []);

  // Funcție pentru actualizarea valorii unei setări
  const handleSettingChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Funcție pentru actualizarea valorii unui switch
  const handleSwitchChange = (key: string, checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [key]: checked ? 'true' : 'false'
    }));
  };

  // Funcție pentru salvarea setărilor
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Identificăm setările care au fost modificate
      const changedSettings = Object.entries(formValues)
        .filter(([key, value]) => value !== originalValues[key])
        .map(([key, value]) => ({ key, value }));
      
      if (changedSettings.length === 0) {
        toast({
          title: t('systemSettings.noChanges', 'No changes to save'),
          description: t('systemSettings.noChangesDescription', 'No settings have been modified.'),
        });
        return;
      }
      
      // Actualizăm setările în baza de date
      for (const setting of changedSettings) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: setting.value, updated_at: new Date().toISOString() })
          .eq('key', setting.key);
        
        if (error) throw error;
      }
      
      // Actualizăm valorile originale
      setOriginalValues(formValues);
      
      toast({
        title: t('systemSettings.saveSuccess', 'Settings saved'),
        description: t('systemSettings.saveSuccessDescription', 'System settings have been saved successfully.'),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: t('systemSettings.saveError', 'Error saving settings'),
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Funcție pentru resetarea setărilor la valorile originale
  const resetSettings = () => {
    setFormValues(originalValues);
    toast({
      title: t('systemSettings.resetSuccess', 'Settings reset'),
      description: t('systemSettings.resetSuccessDescription', 'Settings have been reset to their original values.'),
    });
  };

  // Funcție pentru a verifica dacă există modificări
  const hasChanges = () => {
    return Object.entries(formValues).some(([key, value]) => value !== originalValues[key]);
  };

  // Funcție pentru a obține iconul pentru o categorie
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general':
        return <Settings className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'logging':
        return <FileText className="h-5 w-5" />;
      case 'storage':
        return <Upload className="h-5 w-5" />;
      case 'notifications':
        return <BellRing className="h-5 w-5" />;
      case 'appearance':
        return <Palette className="h-5 w-5" />;
      case 'localization':
        return <Globe className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  // Funcție pentru a obține titlul pentru o categorie
  const getCategoryTitle = (category: string) => {
    return t(`systemSettings.categories.${category.toLowerCase()}`, category);
  };

  // Funcție pentru a obține descrierea pentru o categorie
  const getCategoryDescription = (category: string) => {
    return t(`systemSettings.descriptions.${category.toLowerCase()}`, `Settings for ${category}`);
  };

  // Funcție pentru a renderiza un control de setare
  const renderSettingControl = (setting: SystemSettings) => {
    const key = setting.key;
    const value = formValues[key] || '';
    
    // Verificăm dacă setarea este un boolean
    if (value === 'true' || value === 'false') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={key}
            checked={value === 'true'}
            onCheckedChange={(checked) => handleSwitchChange(key, checked)}
          />
          <Label htmlFor={key}>{value === 'true' ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}</Label>
        </div>
      );
    }
    
    // Verificăm dacă setarea este un număr
    if (!isNaN(Number(value))) {
      return (
        <Input
          id={key}
          type="number"
          value={value}
          onChange={(e) => handleSettingChange(key, e.target.value)}
        />
      );
    }
    
    // Setare text implicită
    return (
      <Input
        id={key}
        value={value}
        onChange={(e) => handleSettingChange(key, e.target.value)}
      />
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('systemSettings.title', 'System Settings')}
          </h1>
          <p className="text-muted-foreground">
            {t('systemSettings.subtitle', 'Configure and manage system settings')}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetSettings} disabled={!hasChanges() || loading || saving}>
            {t('systemSettings.reset', 'Reset')}
          </Button>
          <Button onClick={fetchSettings} disabled={loading || saving}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {t('systemSettings.refresh', 'Refresh')}
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges() || loading || saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('systemSettings.save', 'Save Changes')}
          </Button>
        </div>
      </div>

      {/* Tabs for different setting categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10">
          {Object.keys(settings).map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {getCategoryIcon(category)}
              <span className="ml-2 hidden md:inline">{getCategoryTitle(category)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(settings).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category.toLowerCase()} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  {getCategoryIcon(category)}
                  <CardTitle className="ml-2">{getCategoryTitle(category)}</CardTitle>
                </div>
                <CardDescription>
                  {getCategoryDescription(category)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <Label htmlFor={setting.key}>
                      {t(`systemSettings.settings.${setting.key}`, setting.key)}
                    </Label>
                    {renderSettingControl(setting)}
                    <p className="text-sm text-muted-foreground">
                      {t(`systemSettings.settingDescriptions.${setting.key}`, setting.description)}
                    </p>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {t('systemSettings.lastUpdated', 'Last updated')}: {' '}
                  {categorySettings.length > 0 
                    ? new Date(categorySettings[0].updated_at).toLocaleString() 
                    : t('systemSettings.never', 'Never')}
                </div>
                <Button onClick={saveSettings} disabled={!hasChanges() || loading || saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t('systemSettings.save', 'Save Changes')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SystemSettingsPage;
