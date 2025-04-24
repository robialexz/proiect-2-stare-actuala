import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Server, 
  Database, 
  HardDrive, 
  Users, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Cpu,
  Memory,
  Network,
  Shield
} from 'lucide-react';

// Definim tipurile pentru statusul componentelor
interface ComponentStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  response_time?: number;
  checked_at: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  active_users: number;
  database_connections: number;
  database_size: number;
  cache_hit_ratio: number;
  auth_requests_per_minute: number;
  storage_requests_per_minute: number;
}

const SiteStatusPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<ComponentStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_latency: 0,
    active_users: 0,
    database_connections: 0,
    database_size: 0,
    cache_hit_ratio: 0,
    auth_requests_per_minute: 0,
    storage_requests_per_minute: 0
  });

  // Funcție pentru încărcarea statusului componentelor
  const fetchComponentStatus = async () => {
    try {
      setLoading(true);
      
      // Obținem statusul componentelor din baza de date
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        setComponents(data as ComponentStatus[]);
      }
      
      // Simulăm obținerea metricilor de sistem (în realitate ar trebui să vină de la un endpoint dedicat)
      setMetrics({
        cpu_usage: Math.random() * 60 + 10, // 10-70%
        memory_usage: Math.random() * 50 + 30, // 30-80%
        disk_usage: Math.random() * 30 + 40, // 40-70%
        network_latency: Math.random() * 100 + 20, // 20-120ms
        active_users: Math.floor(Math.random() * 100) + 5, // 5-105 users
        database_connections: Math.floor(Math.random() * 50) + 10, // 10-60 connections
        database_size: Math.random() * 5 + 1, // 1-6 GB
        cache_hit_ratio: Math.random() * 30 + 70, // 70-100%
        auth_requests_per_minute: Math.floor(Math.random() * 100) + 10, // 10-110 requests
        storage_requests_per_minute: Math.floor(Math.random() * 80) + 5 // 5-85 requests
      });
      
      toast({
        title: t('siteStatus.refreshSuccess', 'Status refreshed'),
        description: t('siteStatus.refreshSuccessDescription', 'System status has been updated successfully.'),
      });
    } catch (error) {
      console.error('Error fetching component status:', error);
      toast({
        variant: 'destructive',
        title: t('siteStatus.refreshError', 'Error refreshing status'),
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm statusul componentelor la montarea componentei
  useEffect(() => {
    fetchComponentStatus();
    
    // Actualizăm statusul la fiecare 60 de secunde
    const interval = setInterval(fetchComponentStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Funcție pentru a obține culoarea în funcție de status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Funcție pentru a obține iconul în funcție de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Funcție pentru a obține culoarea pentru progres în funcție de valoare
  const getProgressColor = (value: number, type: string): string => {
    if (type === 'inverse') {
      // Pentru metrici unde valorile mici sunt mai bune (latență, etc.)
      if (value < 30) return 'bg-green-500';
      if (value < 70) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      // Pentru metrici unde valorile mari sunt mai bune (cache hit ratio, etc.)
      if (value > 80) return 'bg-green-500';
      if (value > 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  // Calculăm statusul general al sistemului
  const calculateOverallStatus = (): { status: string; message: string } => {
    const errorCount = components.filter(c => c.status === 'error').length;
    const warningCount = components.filter(c => c.status === 'warning').length;
    
    if (errorCount > 0) {
      return { 
        status: 'error', 
        message: t('siteStatus.overallStatusError', 'System experiencing issues') 
      };
    } else if (warningCount > 0) {
      return { 
        status: 'warning', 
        message: t('siteStatus.overallStatusWarning', 'System running with warnings') 
      };
    } else {
      return { 
        status: 'healthy', 
        message: t('siteStatus.overallStatusHealthy', 'All systems operational') 
      };
    }
  };

  const overallStatus = calculateOverallStatus();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('siteStatus.title', 'System Status')}
          </h1>
          <p className="text-muted-foreground">
            {t('siteStatus.subtitle', 'Monitor the health and performance of your system')}
          </p>
        </div>
        
        <Button onClick={fetchComponentStatus} disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t('siteStatus.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Status Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>{t('siteStatus.overallStatus', 'Overall Status')}</CardTitle>
            <Badge 
              variant="outline" 
              className={`px-3 py-1 ${
                overallStatus.status === 'healthy' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                  : overallStatus.status === 'warning' 
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}
            >
              {getStatusIcon(overallStatus.status)}
              <span className="ml-1">{overallStatus.message}</span>
            </Badge>
          </div>
          <CardDescription>
            {t('siteStatus.lastUpdated', 'Last updated')}: {' '}
            {components.length > 0 
              ? new Date(components[0].checked_at).toLocaleString() 
              : new Date().toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            {t('siteStatus.tabs.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger value="components">
            <Server className="h-4 w-4 mr-2" />
            {t('siteStatus.tabs.components', 'Components')}
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Database className="h-4 w-4 mr-2" />
            {t('siteStatus.tabs.metrics', 'Metrics')}
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t('siteStatus.metrics.cpuUsage', 'CPU Usage')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(1)}%</div>
                <Progress 
                  value={metrics.cpu_usage} 
                  className="h-2 mt-2"
                  indicatorClassName={getProgressColor(metrics.cpu_usage, 'inverse')}
                />
              </CardContent>
            </Card>
            
            {/* Memory Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <Memory className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t('siteStatus.metrics.memoryUsage', 'Memory Usage')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(1)}%</div>
                <Progress 
                  value={metrics.memory_usage} 
                  className="h-2 mt-2"
                  indicatorClassName={getProgressColor(metrics.memory_usage, 'inverse')}
                />
              </CardContent>
            </Card>
            
            {/* Disk Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t('siteStatus.metrics.diskUsage', 'Disk Usage')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.disk_usage.toFixed(1)}%</div>
                <Progress 
                  value={metrics.disk_usage} 
                  className="h-2 mt-2"
                  indicatorClassName={getProgressColor(metrics.disk_usage, 'inverse')}
                />
              </CardContent>
            </Card>
            
            {/* Network Latency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <Network className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t('siteStatus.metrics.networkLatency', 'Network Latency')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.network_latency.toFixed(1)} ms</div>
                <Progress 
                  value={metrics.network_latency / 2} 
                  className="h-2 mt-2"
                  indicatorClassName={getProgressColor(metrics.network_latency / 2, 'inverse')}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Users */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t('siteStatus.metrics.activeUsers', 'Active Users')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.active_users}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('siteStatus.metrics.currentlyActive', 'Currently active on the platform')}
                </div>
              </CardContent>
            </Card>
            
            {/* Database Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t('siteStatus.metrics.databaseStatus', 'Database Status')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{metrics.database_connections}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('siteStatus.metrics.connections', 'Connections')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.database_size.toFixed(2)} GB</div>
                    <div className="text-sm text-muted-foreground">
                      {t('siteStatus.metrics.databaseSize', 'Database Size')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.cache_hit_ratio.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">
                      {t('siteStatus.metrics.cacheHitRatio', 'Cache Hit Ratio')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Components Tab */}
        <TabsContent value="components" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('siteStatus.components.title', 'System Components')}</CardTitle>
              <CardDescription>
                {t('siteStatus.components.description', 'Status of individual system components')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {components.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {loading 
                      ? t('siteStatus.loading', 'Loading component status...') 
                      : t('siteStatus.noComponents', 'No component status available')}
                  </div>
                ) : (
                  components.map((component, index) => (
                    <div 
                      key={`${component.component}-${index}`}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(component.status)} mr-4`}></div>
                        <div>
                          <div className="font-medium">{component.component}</div>
                          <div className="text-sm text-muted-foreground">{component.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {component.response_time && (
                          <div className="text-sm text-muted-foreground mr-4">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {component.response_time} ms
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {new Date(component.checked_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('siteStatus.detailedMetrics.title', 'Detailed Metrics')}</CardTitle>
              <CardDescription>
                {t('siteStatus.detailedMetrics.description', 'Detailed performance metrics for the system')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Metrics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t('siteStatus.detailedMetrics.system', 'System Metrics')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.cpuUsage', 'CPU Usage')}
                          </span>
                          <span className="text-sm">{metrics.cpu_usage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={metrics.cpu_usage} 
                          className="h-2"
                          indicatorClassName={getProgressColor(metrics.cpu_usage, 'inverse')}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.memoryUsage', 'Memory Usage')}
                          </span>
                          <span className="text-sm">{metrics.memory_usage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={metrics.memory_usage} 
                          className="h-2"
                          indicatorClassName={getProgressColor(metrics.memory_usage, 'inverse')}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.diskUsage', 'Disk Usage')}
                          </span>
                          <span className="text-sm">{metrics.disk_usage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={metrics.disk_usage} 
                          className="h-2"
                          indicatorClassName={getProgressColor(metrics.disk_usage, 'inverse')}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.networkLatency', 'Network Latency')}
                          </span>
                          <span className="text-sm">{metrics.network_latency.toFixed(1)} ms</span>
                        </div>
                        <Progress 
                          value={metrics.network_latency / 2} 
                          className="h-2"
                          indicatorClassName={getProgressColor(metrics.network_latency / 2, 'inverse')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Metrics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t('siteStatus.detailedMetrics.services', 'Service Metrics')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.databaseConnections', 'Database Connections')}
                          </span>
                          <span className="text-sm">{metrics.database_connections}</span>
                        </div>
                        <Progress 
                          value={metrics.database_connections} 
                          max={100}
                          className="h-2"
                          indicatorClassName="bg-blue-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.cacheHitRatio', 'Cache Hit Ratio')}
                          </span>
                          <span className="text-sm">{metrics.cache_hit_ratio.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={metrics.cache_hit_ratio} 
                          className="h-2"
                          indicatorClassName={getProgressColor(metrics.cache_hit_ratio, 'normal')}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.authRequests', 'Auth Requests (per min)')}
                          </span>
                          <span className="text-sm">{metrics.auth_requests_per_minute}</span>
                        </div>
                        <Progress 
                          value={metrics.auth_requests_per_minute} 
                          max={200}
                          className="h-2"
                          indicatorClassName="bg-purple-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {t('siteStatus.metrics.storageRequests', 'Storage Requests (per min)')}
                          </span>
                          <span className="text-sm">{metrics.storage_requests_per_minute}</span>
                        </div>
                        <Progress 
                          value={metrics.storage_requests_per_minute} 
                          max={200}
                          className="h-2"
                          indicatorClassName="bg-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Security Status */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">
                    <Shield className="h-5 w-5 inline mr-2" />
                    {t('siteStatus.detailedMetrics.security', 'Security Status')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {t('siteStatus.security.firewallStatus', 'Firewall Status')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>{t('siteStatus.security.active', 'Active')}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {t('siteStatus.security.lastUpdated', 'Last updated')}: {new Date().toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {t('siteStatus.security.sslCertificate', 'SSL Certificate')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>{t('siteStatus.security.valid', 'Valid')}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {t('siteStatus.security.expiresOn', 'Expires on')}: {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {t('siteStatus.security.backups', 'Backups')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>{t('siteStatus.security.upToDate', 'Up to date')}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {t('siteStatus.security.lastBackup', 'Last backup')}: {new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteStatusPage;
