import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  Users,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  ArrowRight,
  Download,
  Filter,
  RefreshCw,
  Layers,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";

// Mock data for demonstration
const mockInventoryData = {
  totalItems: 1248,
  lowStockItems: 32,
  pendingDeliveries: 8,
  suppliers: 36,
  itemsGrowth: 12,
  deliveriesGrowth: -3,
  suppliersGrowth: 5,
  lowStockGrowth: 15,
};

const mockChartData = {
  inventoryTrends: [
    { month: "Jan", value: 800 },
    { month: "Feb", value: 900 },
    { month: "Mar", value: 950 },
    { month: "Apr", value: 1000 },
    { month: "May", value: 950 },
    { month: "Jun", value: 1100 },
    { month: "Jul", value: 1200 },
    { month: "Aug", value: 1248 },
  ],
  categoryDistribution: [
    { category: "Construction", value: 35 },
    { category: "Electrical", value: 25 },
    { category: "Plumbing", value: 20 },
    { category: "HVAC", value: 15 },
    { category: "Other", value: 5 },
  ],
  supplierPerformance: [
    { supplier: "Supplier A", onTime: 95, quality: 90 },
    { supplier: "Supplier B", onTime: 85, quality: 95 },
    { supplier: "Supplier C", onTime: 90, quality: 85 },
    { supplier: "Supplier D", onTime: 80, quality: 80 },
    { supplier: "Supplier E", onTime: 75, quality: 90 },
  ],
};

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  // Mock refresh function
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                {t("statistics.pageTitle", "Statistici și Analiză")}
              </h1>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 relative group overflow-hidden"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading
                  ? t("common.refreshing", "Se actualizează...")
                  : t("common.refresh", "Actualizează datele")}
              </Button>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-900 to-slate-900/95">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatisticsCard
                title={t("statistics.totalItems", "Total Articole")}
                value={mockInventoryData.totalItems}
                icon={<Package className="h-5 w-5 text-indigo-400" />}
                trend={{
                  value: mockInventoryData.itemsGrowth,
                  isPositive: true,
                  label: t("statistics.lastMonth", "față de luna trecută"),
                }}
                gradientFrom="from-indigo-500"
                gradientTo="to-blue-500"
                isLoading={isLoading}
              />
              <StatisticsCard
                title={t("statistics.lowStock", "Stoc Redus")}
                value={mockInventoryData.lowStockItems}
                icon={<AlertCircle className="h-5 w-5 text-amber-400" />}
                trend={{
                  value: mockInventoryData.lowStockGrowth,
                  isPositive: false,
                  label: t("statistics.lastMonth", "față de luna trecută"),
                }}
                gradientFrom="from-amber-500"
                gradientTo="to-yellow-500"
                isLoading={isLoading}
              />
              <StatisticsCard
                title={t("statistics.pendingDeliveries", "Livrări în Așteptare")}
                value={mockInventoryData.pendingDeliveries}
                icon={<Clock className="h-5 w-5 text-cyan-400" />}
                trend={{
                  value: mockInventoryData.deliveriesGrowth,
                  isPositive: true,
                  label: t("statistics.lastWeek", "față de săptămâna trecută"),
                }}
                gradientFrom="from-cyan-500"
                gradientTo="to-blue-500"
                isLoading={isLoading}
              />
              <StatisticsCard
                title={t("statistics.suppliers", "Furnizori")}
                value={mockInventoryData.suppliers}
                icon={<Truck className="h-5 w-5 text-purple-400" />}
                trend={{
                  value: mockInventoryData.suppliersGrowth,
                  isPositive: true,
                  label: t("statistics.lastQuarter", "față de trimestrul trecut"),
                }}
                gradientFrom="from-purple-500"
                gradientTo="to-indigo-500"
                isLoading={isLoading}
              />
            </div>

            {/* Tabs for different statistics views */}
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-1 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/80 data-[state=active]:to-blue-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Active tab glow effect */}
                  {activeTab === "overview" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center">
                    <span
                      className={`p-1 rounded-md ${
                        activeTab === "overview"
                          ? "bg-white/10"
                          : "bg-slate-700/50 group-hover:bg-slate-700"
                      } mr-2`}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </span>
                    {t("statistics.tabs.overview", "Prezentare generală")}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600/80 data-[state=active]:to-blue-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                >
                  {activeTab === "inventory" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center">
                    <span
                      className={`p-1 rounded-md ${
                        activeTab === "inventory"
                          ? "bg-white/10"
                          : "bg-slate-700/50 group-hover:bg-slate-700"
                      } mr-2`}
                    >
                      <Package className="h-4 w-4" />
                    </span>
                    {t("statistics.tabs.inventory", "Inventar")}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="suppliers"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                >
                  {activeTab === "suppliers" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center">
                    <span
                      className={`p-1 rounded-md ${
                        activeTab === "suppliers"
                          ? "bg-white/10"
                          : "bg-slate-700/50 group-hover:bg-slate-700"
                      } mr-2`}
                    >
                      <Truck className="h-4 w-4" />
                    </span>
                    {t("statistics.tabs.suppliers", "Furnizori")}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="financial"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/80 data-[state=active]:to-emerald-600/80 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 relative overflow-hidden group"
                >
                  {activeTab === "financial" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center">
                    <span
                      className={`p-1 rounded-md ${
                        activeTab === "financial"
                          ? "bg-white/10"
                          : "bg-slate-700/50 group-hover:bg-slate-700"
                      } mr-2`}
                    >
                      <DollarSign className="h-4 w-4" />
                    </span>
                    {t("statistics.tabs.financial", "Financiar")}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab Content */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title={t("statistics.charts.inventoryTrends", "Tendințe Inventar")}
                    description={t(
                      "statistics.charts.inventoryTrendsDesc",
                      "Evoluția numărului total de articole în ultimele 8 luni"
                    )}
                    showControls={true}
                    showDateRange={true}
                    showDownload={true}
                    dateRangeText="Ultimele 8 luni"
                    isLoading={isLoading}
                    gradientFrom="from-indigo-500"
                    gradientTo="to-blue-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <LineChart className="h-12 w-12 text-indigo-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>

                  <ChartCard
                    title={t("statistics.charts.categoryDistribution", "Distribuție pe Categorii")}
                    description={t(
                      "statistics.charts.categoryDistributionDesc",
                      "Procentul de articole pe fiecare categorie"
                    )}
                    showControls={true}
                    showDownload={true}
                    showFilter={true}
                    isLoading={isLoading}
                    gradientFrom="from-purple-500"
                    gradientTo="to-indigo-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <PieChart className="h-12 w-12 text-purple-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>
                </div>

                <ChartCard
                  title={t("statistics.charts.supplierPerformance", "Performanța Furnizorilor")}
                  description={t(
                    "statistics.charts.supplierPerformanceDesc",
                    "Evaluarea furnizorilor în funcție de livrarea la timp și calitatea produselor"
                  )}
                  showControls={true}
                  showDownload={true}
                  showFilter={true}
                  showDateRange={true}
                  dateRangeText="Ultimele 3 luni"
                  isLoading={isLoading}
                  gradientFrom="from-cyan-500"
                  gradientTo="to-blue-500"
                >
                  <div className="h-64 flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-cyan-400 opacity-50" />
                    <span className="ml-4 text-slate-400">
                      {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                    </span>
                  </div>
                </ChartCard>
              </TabsContent>

              {/* Inventory Tab Content */}
              <TabsContent value="inventory" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ChartCard
                    title={t("statistics.charts.stockLevels", "Niveluri de Stoc")}
                    description={t(
                      "statistics.charts.stockLevelsDesc",
                      "Nivelurile actuale de stoc pentru articolele principale"
                    )}
                    showControls={true}
                    showFilter={true}
                    isLoading={isLoading}
                    gradientFrom="from-cyan-500"
                    gradientTo="to-blue-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-cyan-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>

                  <ChartCard
                    title={t("statistics.charts.stockMovement", "Mișcări de Stoc")}
                    description={t(
                      "statistics.charts.stockMovementDesc",
                      "Intrări și ieșiri de stoc în timp"
                    )}
                    showControls={true}
                    showDateRange={true}
                    dateRangeText="Ultimele 30 zile"
                    isLoading={isLoading}
                    gradientFrom="from-indigo-500"
                    gradientTo="to-blue-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <LineChart className="h-12 w-12 text-indigo-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>

                  <ChartCard
                    title={t("statistics.charts.lowStockItems", "Articole cu Stoc Redus")}
                    description={t(
                      "statistics.charts.lowStockItemsDesc",
                      "Articole care necesită reaprovizionare"
                    )}
                    showControls={true}
                    showFilter={true}
                    isLoading={isLoading}
                    gradientFrom="from-amber-500"
                    gradientTo="to-yellow-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <AlertCircle className="h-12 w-12 text-amber-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>
                </div>
              </TabsContent>

              {/* Suppliers Tab Content */}
              <TabsContent value="suppliers" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title={t("statistics.charts.supplierDeliveries", "Livrări Furnizori")}
                    description={t(
                      "statistics.charts.supplierDeliveriesDesc",
                      "Numărul de livrări pe furnizor în ultimele 6 luni"
                    )}
                    showControls={true}
                    showDateRange={true}
                    showDownload={true}
                    dateRangeText="Ultimele 6 luni"
                    isLoading={isLoading}
                    gradientFrom="from-purple-500"
                    gradientTo="to-indigo-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-purple-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>

                  <ChartCard
                    title={t("statistics.charts.supplierRatings", "Evaluări Furnizori")}
                    description={t(
                      "statistics.charts.supplierRatingsDesc",
                      "Evaluarea furnizorilor pe baza performanței"
                    )}
                    showControls={true}
                    showFilter={true}
                    isLoading={isLoading}
                    gradientFrom="from-cyan-500"
                    gradientTo="to-blue-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <PieChart className="h-12 w-12 text-cyan-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>
                </div>
              </TabsContent>

              {/* Financial Tab Content */}
              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title={t("statistics.charts.inventoryValue", "Valoare Inventar")}
                    description={t(
                      "statistics.charts.inventoryValueDesc",
                      "Evoluția valorii totale a inventarului"
                    )}
                    showControls={true}
                    showDateRange={true}
                    showDownload={true}
                    dateRangeText="Ultimul an"
                    isLoading={isLoading}
                    gradientFrom="from-green-500"
                    gradientTo="to-emerald-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <LineChart className="h-12 w-12 text-green-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>

                  <ChartCard
                    title={t("statistics.charts.purchaseCosts", "Costuri Achiziții")}
                    description={t(
                      "statistics.charts.purchaseCostsDesc",
                      "Costurile de achiziție pe categorii"
                    )}
                    showControls={true}
                    showFilter={true}
                    showDateRange={true}
                    dateRangeText="Ultimele 6 luni"
                    isLoading={isLoading}
                    gradientFrom="from-amber-500"
                    gradientTo="to-yellow-500"
                  >
                    <div className="h-64 flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-amber-400 opacity-50" />
                      <span className="ml-4 text-slate-400">
                        {t("statistics.charts.placeholder", "Aici va fi afișat un grafic")}
                      </span>
                    </div>
                  </ChartCard>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action buttons */}
            <div className="flex justify-end mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mr-4"
              >
                <Button
                  variant="outline"
                  className="gap-2 border-slate-700 hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  {t("statistics.exportReport", "Exportă raport")}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 border-0">
                  {t("statistics.viewDetailedAnalytics", "Vezi analiză detaliată")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default StatisticsPage;
