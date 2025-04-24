import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Date utilities
import {
  format,
  subMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { ro } from "date-fns/locale";

// Icons
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Package,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  Download,
  FileText,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  ChevronUp,
  ChevronDown,
  Briefcase,
  Building,
  Truck,
  Hammer,
  Wrench,
  Clipboard,
  FileText as FileSpreadsheet,
  FileText as FilePdf,
  Share2,
  Printer,
  Mail,
  Settings,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

// Recharts components
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
} from "recharts";

// Types
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  isLoading?: boolean;
  color?: "default" | "primary" | "success" | "warning" | "danger";
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  manager: string;
  team: string[];
}

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier: string;
  project: string;
}

interface Supplier {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  reliability: number;
  lastOrder: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hoursLogged: number;
  projectsAssigned: number;
  efficiency: number;
}

interface AnalyticsData {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalMaterials: number;
    totalSuppliers: number;
    totalTeamMembers: number;
    totalBudget: number;
    totalSpent: number;
    totalHours: number;
  };
  trends: {
    projects: { month: string; count: number }[];
    materials: { month: string; count: number }[];
    costs: { month: string; amount: number }[];
    hours: { month: string; hours: number }[];
  };
  distributions: {
    projectStatus: { status: string; count: number }[];
    materialCategories: { category: string; count: number }[];
    budgetAllocation: { category: string; amount: number }[];
    teamEfficiency: { team: string; efficiency: number }[];
  };
  topItems: {
    projects: Project[];
    materials: Material[];
    suppliers: Supplier[];
    teamMembers: TeamMember[];
  };
}

// Componenta pentru card statistic
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  isLoading = false,
  color = "default",
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "success":
        return "bg-green-500/10 text-green-500";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500";
      case "danger":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTrendIcon = () => {
    if (!change) return null;

    if (change.trend === "up") {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (change.trend === "down") {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendClass = () => {
    if (!change) return "";

    if (change.trend === "up") {
      return "text-green-500";
    } else if (change.trend === "down") {
      return "text-red-500";
    }
    return "text-muted-foreground";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${getColorClasses()}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className="flex items-center mt-1">
                {getTrendIcon()}
                <p className={`text-xs ${getTrendClass()}`}>{change.value}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Componenta pentru tabel cu proiecte
const ProjectsTable: React.FC<{
  projects: Project[];
  isLoading: boolean;
}> = ({ projects, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default">Activ</Badge>;
      case "completed":
        return <Badge variant="success">Finalizat</Badge>;
      case "delayed":
        return <Badge variant="warning">Întârziat</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Anulat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proiect</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progres</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Manager</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>{getStatusBadge(project.status)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={project.progress} className="h-2" />
                <span className="text-xs">{project.progress}%</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{project.spent.toLocaleString()} RON</div>
                <div className="text-xs text-muted-foreground">
                  din {project.budget.toLocaleString()} RON
                </div>
              </div>
            </TableCell>
            <TableCell>{project.manager}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Componenta pentru tabel cu materiale
const MaterialsTable: React.FC<{
  materials: Material[];
  isLoading: boolean;
}> = ({ materials, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Material</TableHead>
          <TableHead>Categorie</TableHead>
          <TableHead>Cantitate</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Furnizor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={material.id}>
            <TableCell className="font-medium">{material.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{material.category}</Badge>
            </TableCell>
            <TableCell>
              {material.quantity} {material.unit}
            </TableCell>
            <TableCell>{material.cost.toLocaleString()} RON</TableCell>
            <TableCell>{material.supplier}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Componenta pentru grafic de bare
const BarChartComponent: React.FC<{
  data: any[];
  xKey: string;
  yKey: string;
  name: string;
  isLoading: boolean;
  colors?: string[];
}> = ({ data, xKey, yKey, name, isLoading, colors = ["#4f46e5"] }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#374151" : "#e5e7eb"}
        />
        <XAxis
          dataKey={xKey}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <YAxis
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            borderRadius: "0.375rem",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
        <Bar
          dataKey={yKey}
          name={name}
          fill={colors[0]}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Componenta pentru grafic liniar
const LineChartComponent: React.FC<{
  data: any[];
  xKey: string;
  yKey: string;
  name: string;
  isLoading: boolean;
  color?: string;
}> = ({ data, xKey, yKey, name, isLoading, color = "#4f46e5" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#374151" : "#e5e7eb"}
        />
        <XAxis
          dataKey={xKey}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <YAxis
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            borderRadius: "0.375rem",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={yKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Componenta pentru grafic circular
const PieChartComponent: React.FC<{
  data: any[];
  nameKey: string;
  valueKey: string;
  isLoading: boolean;
  colors?: string[];
}> = ({
  data,
  nameKey,
  valueKey,
  isLoading,
  colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"],
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={100}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            borderRadius: "0.375rem",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Componenta pentru grafic de arie
const AreaChartComponent: React.FC<{
  data: any[];
  xKey: string;
  yKey: string;
  name: string;
  isLoading: boolean;
  color?: string;
}> = ({ data, xKey, yKey, name, isLoading, color = "#4f46e5" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#374151" : "#e5e7eb"}
        />
        <XAxis
          dataKey={xKey}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <YAxis
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            borderRadius: "0.375rem",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey={yKey}
          name={name}
          stroke={color}
          fill={color}
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Componenta principală AnalyticsPage
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { theme } = useTheme();

  // State pentru filtre și date
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalMaterials: 0,
      totalSuppliers: 0,
      totalTeamMembers: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalHours: 0,
    },
    trends: {
      projects: [],
      materials: [],
      costs: [],
      hours: [],
    },
    distributions: {
      projectStatus: [],
      materialCategories: [],
      budgetAllocation: [],
      teamEfficiency: [],
    },
    topItems: {
      projects: [],
      materials: [],
      suppliers: [],
      teamMembers: [],
    },
  });

  // Funcție pentru încărcarea datelor
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulăm un apel API cu un timeout
      setTimeout(() => {
        // Date pentru statistici
        const stats = {
          totalProjects: 42,
          activeProjects: 18,
          completedProjects: 24,
          totalMaterials: 1250,
          totalSuppliers: 35,
          totalTeamMembers: 68,
          totalBudget: 1250000,
          totalSpent: 875000,
          totalHours: 12450,
        };

        // Date pentru tendințe
        const trends = {
          projects: [
            { month: "Ian", count: 5 },
            { month: "Feb", count: 8 },
            { month: "Mar", count: 12 },
            { month: "Apr", count: 10 },
            { month: "Mai", count: 15 },
            { month: "Iun", count: 18 },
            { month: "Iul", count: 14 },
            { month: "Aug", count: 12 },
            { month: "Sep", count: 20 },
            { month: "Oct", count: 22 },
            { month: "Nov", count: 25 },
            { month: "Dec", count: 28 },
          ],
          materials: [
            { month: "Ian", count: 120 },
            { month: "Feb", count: 145 },
            { month: "Mar", count: 180 },
            { month: "Apr", count: 165 },
            { month: "Mai", count: 210 },
            { month: "Iun", count: 230 },
            { month: "Iul", count: 200 },
            { month: "Aug", count: 190 },
            { month: "Sep", count: 250 },
            { month: "Oct", count: 270 },
            { month: "Nov", count: 290 },
            { month: "Dec", count: 310 },
          ],
          costs: [
            { month: "Ian", amount: 65000 },
            { month: "Feb", amount: 72000 },
            { month: "Mar", amount: 85000 },
            { month: "Apr", amount: 78000 },
            { month: "Mai", amount: 92000 },
            { month: "Iun", amount: 98000 },
            { month: "Iul", amount: 88000 },
            { month: "Aug", amount: 82000 },
            { month: "Sep", amount: 105000 },
            { month: "Oct", amount: 115000 },
            { month: "Nov", amount: 125000 },
            { month: "Dec", amount: 135000 },
          ],
          hours: [
            { month: "Ian", hours: 950 },
            { month: "Feb", hours: 1050 },
            { month: "Mar", hours: 1200 },
            { month: "Apr", hours: 1100 },
            { month: "Mai", hours: 1300 },
            { month: "Iun", hours: 1400 },
            { month: "Iul", hours: 1250 },
            { month: "Aug", hours: 1150 },
            { month: "Sep", hours: 1500 },
            { month: "Oct", hours: 1600 },
            { month: "Nov", hours: 1700 },
            { month: "Dec", hours: 1800 },
          ],
        };

        // Date pentru distribuții
        const distributions = {
          projectStatus: [
            { status: "Active", count: 18 },
            { status: "Completed", count: 24 },
            { status: "Delayed", count: 5 },
            { status: "Cancelled", count: 3 },
          ],
          materialCategories: [
            { category: "Lemn", count: 350 },
            { category: "Metal", count: 280 },
            { category: "Plastic", count: 220 },
            { category: "Sticlă", count: 150 },
            { category: "Altele", count: 250 },
          ],
          budgetAllocation: [
            { category: "Materiale", amount: 450000 },
            { category: "Manoperă", amount: 320000 },
            { category: "Transport", amount: 85000 },
            { category: "Echipamente", amount: 120000 },
            { category: "Altele", amount: 75000 },
          ],
          teamEfficiency: [
            { team: "Echipa A", efficiency: 92 },
            { team: "Echipa B", efficiency: 88 },
            { team: "Echipa C", efficiency: 95 },
            { team: "Echipa D", efficiency: 85 },
            { team: "Echipa E", efficiency: 90 },
          ],
        };

        // Date pentru top items
        const topItems = {
          projects: [
            {
              id: "1",
              name: "Proiect Renovare Sediu",
              status: "active",
              progress: 75,
              budget: 250000,
              spent: 187500,
              startDate: "2023-05-15",
              endDate: "2023-12-31",
              manager: "Alexandru Popescu",
              team: ["Echipa A"],
            },
            {
              id: "2",
              name: "Construcție Depozit",
              status: "active",
              progress: 60,
              budget: 350000,
              spent: 210000,
              startDate: "2023-06-01",
              endDate: "2024-02-28",
              manager: "Maria Ionescu",
              team: ["Echipa B"],
            },
            {
              id: "3",
              name: "Modernizare Birouri",
              status: "completed",
              progress: 100,
              budget: 120000,
              spent: 115000,
              startDate: "2023-03-10",
              endDate: "2023-07-15",
              manager: "Ion Vasilescu",
              team: ["Echipa C"],
            },
            {
              id: "4",
              name: "Instalare Sistem HVAC",
              status: "active",
              progress: 40,
              budget: 85000,
              spent: 34000,
              startDate: "2023-08-01",
              endDate: "2023-11-30",
              manager: "Elena Dumitrescu",
              team: ["Echipa D"],
            },
            {
              id: "5",
              name: "Amenajare Spațiu Verde",
              status: "completed",
              progress: 100,
              budget: 45000,
              spent: 42000,
              startDate: "2023-04-15",
              endDate: "2023-06-30",
              manager: "Mihai Popa",
              team: ["Echipa E"],
            },
          ],
          materials: [
            {
              id: "1",
              name: "Placaj 18mm",
              category: "Lemn",
              quantity: 250,
              unit: "buc",
              cost: 37500,
              supplier: "Lemn Expert SRL",
              project: "Proiect Renovare Sediu",
            },
            {
              id: "2",
              name: "Profil Aluminiu",
              category: "Metal",
              quantity: 500,
              unit: "m",
              cost: 25000,
              supplier: "MetalCom SA",
              project: "Construcție Depozit",
            },
            {
              id: "3",
              name: "Vopsea Lavabilă",
              category: "Altele",
              quantity: 300,
              unit: "l",
              cost: 12000,
              supplier: "ColorMaster",
              project: "Modernizare Birouri",
            },
            {
              id: "4",
              name: "Cablaj Electric",
              category: "Altele",
              quantity: 1000,
              unit: "m",
              cost: 15000,
              supplier: "ElectroPlus",
              project: "Instalare Sistem HVAC",
            },
            {
              id: "5",
              name: "Țeavă PVC",
              category: "Plastic",
              quantity: 350,
              unit: "m",
              cost: 8750,
              supplier: "PlasticPro",
              project: "Amenajare Spațiu Verde",
            },
          ],
          suppliers: [
            {
              id: "1",
              name: "Lemn Expert SRL",
              totalOrders: 28,
              totalSpent: 125000,
              reliability: 95,
              lastOrder: "2023-10-15",
            },
            {
              id: "2",
              name: "MetalCom SA",
              totalOrders: 35,
              totalSpent: 180000,
              reliability: 92,
              lastOrder: "2023-10-22",
            },
            {
              id: "3",
              name: "ColorMaster",
              totalOrders: 42,
              totalSpent: 85000,
              reliability: 98,
              lastOrder: "2023-10-18",
            },
            {
              id: "4",
              name: "ElectroPlus",
              totalOrders: 25,
              totalSpent: 110000,
              reliability: 90,
              lastOrder: "2023-10-10",
            },
            {
              id: "5",
              name: "PlasticPro",
              totalOrders: 30,
              totalSpent: 75000,
              reliability: 94,
              lastOrder: "2023-10-05",
            },
          ],
          teamMembers: [
            {
              id: "1",
              name: "Alexandru Popescu",
              role: "Manager Proiect",
              avatar: "",
              hoursLogged: 850,
              projectsAssigned: 3,
              efficiency: 95,
            },
            {
              id: "2",
              name: "Maria Ionescu",
              role: "Manager Proiect",
              avatar: "",
              hoursLogged: 820,
              projectsAssigned: 2,
              efficiency: 92,
            },
            {
              id: "3",
              name: "Ion Vasilescu",
              role: "Inginer",
              avatar: "",
              hoursLogged: 780,
              projectsAssigned: 4,
              efficiency: 88,
            },
            {
              id: "4",
              name: "Elena Dumitrescu",
              role: "Designer",
              avatar: "",
              hoursLogged: 720,
              projectsAssigned: 3,
              efficiency: 90,
            },
            {
              id: "5",
              name: "Mihai Popa",
              role: "Tehnician",
              avatar: "",
              hoursLogged: 680,
              projectsAssigned: 5,
              efficiency: 85,
            },
          ],
        };

        // Actualizăm starea cu datele încărcate
        setAnalyticsData({
          stats,
          trends,
          distributions,
          topItems,
        });

        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Eroare la încărcarea datelor:", error);
      toast({
        title: "Eroare",
        description:
          "A apărut o eroare la încărcarea datelor. Încercați din nou.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  // Încărcăm datele la montarea componentei și când se schimbă filtrele
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData, dateRange, projectFilter]);

  // Funcție pentru exportul datelor
  const handleExport = (format: string) => {
    toast({
      title: "Export inițiat",
      description: `Raportul va fi exportat în format ${format.toUpperCase()}.`,
    });
  };

  // Funcție pentru actualizarea datelor
  const handleRefresh = () => {
    loadAnalyticsData();
    toast({
      title: "Actualizare",
      description: "Datele au fost actualizate cu succes.",
    });
  };

  // Calculăm valorile pentru cardurile statistice
  const statCards = useMemo(
    () => [
      {
        title: "Total Proiecte",
        value: analyticsData.stats.totalProjects,
        icon: <BarChart3 className="h-4 w-4" />,
        change: {
          value: "+15% față de luna trecută",
          trend: "up" as const,
        },
        color: "primary" as const,
      },
      {
        title: "Materiale Utilizate",
        value: analyticsData.stats.totalMaterials.toLocaleString(),
        icon: <Package className="h-4 w-4" />,
        change: {
          value: "+8% față de luna trecută",
          trend: "up" as const,
        },
        color: "success" as const,
      },
      {
        title: "Ore Lucrate",
        value: analyticsData.stats.totalHours.toLocaleString(),
        icon: <Clock className="h-4 w-4" />,
        change: {
          value: "+12% față de luna trecută",
          trend: "up" as const,
        },
        color: "warning" as const,
      },
      {
        title: "Cost Total",
        value: `${analyticsData.stats.totalSpent.toLocaleString()} RON`,
        icon: <DollarSign className="h-4 w-4" />,
        change: {
          value: "+10% față de luna trecută",
          trend: "up" as const,
        },
        color: "danger" as const,
      },
    ],
    [analyticsData.stats]
  );

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analiză și Rapoarte
          </h1>
          <p className="text-muted-foreground">
            Monitorizați performanța proiectelor și analizați datele importante.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filtru de dată */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "P", { locale: ro })} -{" "}
                      {format(dateRange.to, "P", { locale: ro })}
                    </>
                  ) : (
                    format(dateRange.from, "P", { locale: ro })
                  )
                ) : (
                  "Selectați perioada"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => setDateRange(range as any)}
                numberOfMonths={2}
                locale={ro}
              />
            </PopoverContent>
          </Popover>

          {/* Filtru de proiect */}
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toate proiectele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate proiectele</SelectItem>
              <SelectItem value="active">Proiecte active</SelectItem>
              <SelectItem value="completed">Proiecte finalizate</SelectItem>
              <SelectItem value="delayed">Proiecte întârziate</SelectItem>
            </SelectContent>
          </Select>

          {/* Butoane de acțiune */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport("pdf")}
            >
              <FilePdf className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport("excel")}
            >
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carduri statistice */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            change={card.change}
            isLoading={isLoading}
            color={card.color}
          />
        ))}
      </div>

      {/* Tabs pentru diferite vizualizări */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Prezentare generală
          </TabsTrigger>
          <TabsTrigger value="projects">
            <BarChart3 className="h-4 w-4 mr-2" />
            Proiecte
          </TabsTrigger>
          <TabsTrigger value="materials">
            <Package className="h-4 w-4 mr-2" />
            Materiale
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Echipă
          </TabsTrigger>
        </TabsList>

        {/* Tab: Prezentare generală */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Grafic proiecte lunare */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Proiecte lunare</CardTitle>
                <CardDescription>
                  Numărul de proiecte pe luni în ultimul an
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={analyticsData.trends.projects}
                  xKey="month"
                  yKey="count"
                  name="Proiecte"
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Grafic distribuție materiale */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuția materialelor</CardTitle>
                <CardDescription>Tipuri de materiale utilizate</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={analyticsData.distributions.materialCategories}
                  nameKey="category"
                  valueKey="count"
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Grafic ore lucrate */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ore lucrate lunar</CardTitle>
                <CardDescription>
                  Evoluția orelor lucrate în ultimele luni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChartComponent
                  data={analyticsData.trends.hours}
                  xKey="month"
                  yKey="hours"
                  name="Ore"
                  isLoading={isLoading}
                  color="#f59e0b"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Proiecte */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proiecte active și finalizate</CardTitle>
              <CardDescription>
                Detalii despre proiectele în desfășurare și finalizate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Distribuție status proiecte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChartComponent
                        data={analyticsData.distributions.projectStatus}
                        nameKey="status"
                        valueKey="count"
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Alocarea bugetului
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChartComponent
                        data={analyticsData.distributions.budgetAllocation}
                        nameKey="category"
                        valueKey="amount"
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Top proiecte</h3>
                  <ProjectsTable
                    projects={analyticsData.topItems.projects}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Materiale */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza materialelor</CardTitle>
              <CardDescription>
                Utilizarea materialelor în proiecte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Evoluție utilizare materiale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LineChartComponent
                        data={analyticsData.trends.materials}
                        xKey="month"
                        yKey="count"
                        name="Materiale"
                        isLoading={isLoading}
                        color="#10b981"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Evoluție costuri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LineChartComponent
                        data={analyticsData.trends.costs}
                        xKey="month"
                        yKey="amount"
                        name="Cost (RON)"
                        isLoading={isLoading}
                        color="#ef4444"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Top materiale</h3>
                  <MaterialsTable
                    materials={analyticsData.topItems.materials}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Echipă */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performanța echipei</CardTitle>
              <CardDescription>
                Analiza performanței membrilor echipei
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Eficiența echipelor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChartComponent
                        data={analyticsData.distributions.teamEfficiency}
                        xKey="team"
                        yKey="efficiency"
                        name="Eficiență (%)"
                        isLoading={isLoading}
                        colors={["#3b82f6"]}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Ore lucrate pe echipe
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AreaChartComponent
                        data={analyticsData.trends.hours}
                        xKey="month"
                        yKey="hours"
                        name="Ore"
                        isLoading={isLoading}
                        color="#8b5cf6"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Top membri echipă
                  </h3>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Membru</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Ore lucrate</TableHead>
                          <TableHead>Proiecte</TableHead>
                          <TableHead>Eficiență</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.topItems.teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={member.avatar}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>
                                    {member.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {member.name}
                              </div>
                            </TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.hoursLogged}</TableCell>
                            <TableCell>{member.projectsAssigned}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={member.efficiency}
                                  className="h-2 w-20"
                                />
                                <span>{member.efficiency}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
