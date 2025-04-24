import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Package,
  Users,
  AlertCircle,
  FileText,
  Clock,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bell,
  Settings,
  Building,
  Truck,
  ShoppingCart,
  Layers,
  Briefcase,
  CheckCircle2,
  XCircle,
  CircleEllipsis,
} from "lucide-react";

const DashboardPage = () => {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Date pentru grafice și statistici
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentDate);

  // Loader simplu
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificări</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Setări</span>
          </Button>
          <Button variant="default" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Nou</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
          <TabsTrigger value="projects">Proiecte</TabsTrigger>
          <TabsTrigger value="analytics">Analiză</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Statistici principale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Materiale",
                value: "1,234",
                change: "+12%",
                trend: "up",
                icon: <Package className="h-5 w-5" />,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
              },
              {
                title: "Stoc Redus",
                value: "28",
                change: "-5%",
                trend: "down",
                icon: <AlertCircle className="h-5 w-5" />,
                color: "text-amber-500",
                bgColor: "bg-amber-500/10",
              },
              {
                title: "Utilizatori Activi",
                value: "42",
                change: "+8%",
                trend: "up",
                icon: <Users className="h-5 w-5" />,
                color: "text-green-500",
                bgColor: "bg-green-500/10",
              },
              {
                title: "Rapoarte Generate",
                value: "156",
                change: "+24%",
                trend: "up",
                icon: <FileText className="h-5 w-5" />,
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
              },
            ].map((stat, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`${stat.bgColor} p-2 rounded-full ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span
                      className={
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }
                    >
                      {stat.change} față de luna trecută
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activitate recentă și Acțiuni rapide */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Activitate recentă */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Activitate Recentă</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    Astăzi
                  </Badge>
                </div>
                <CardDescription>
                  Ultimele acțiuni efectuate în sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {[
                    {
                      user: "Alexandru Popescu",
                      action: "a adăugat un material nou",
                      target: "Ciment Portland 42.5R",
                      time: "acum 35 minute",
                      icon: <Package className="h-4 w-4 text-green-500" />,
                      avatar: "/avatars/01.png",
                      initials: "AP",
                      color: "bg-green-500",
                    },
                    {
                      user: "Maria Ionescu",
                      action: "a actualizat stocul pentru",
                      target: "Cărămidă Porotherm 25",
                      time: "acum 2 ore",
                      icon: <Package className="h-4 w-4 text-blue-500" />,
                      avatar: "/avatars/02.png",
                      initials: "MI",
                      color: "bg-blue-500",
                    },
                    {
                      user: "Andrei Dumitrescu",
                      action: "a generat un raport",
                      target: "Inventar Trimestrial",
                      time: "acum 3 ore",
                      icon: <FileText className="h-4 w-4 text-purple-500" />,
                      avatar: "/avatars/03.png",
                      initials: "AD",
                      color: "bg-purple-500",
                    },
                    {
                      user: "Elena Vasilescu",
                      action: "a marcat ca epuizat",
                      target: "Adeziv gresie și faianță",
                      time: "acum 5 ore",
                      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
                      avatar: "/avatars/04.png",
                      initials: "EV",
                      color: "bg-amber-500",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-4 p-4 border-b last:border-0"
                    >
                      <Avatar>
                        <AvatarImage
                          src={activity.avatar}
                          alt={activity.user}
                        />
                        <AvatarFallback className={activity.color}>
                          {activity.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="font-semibold">{activity.user}</span>{" "}
                          {activity.action}{" "}
                          <span className="font-medium text-muted-foreground">
                            {activity.target}
                          </span>
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </div>
                      </div>
                      <div className="rounded-full p-1 bg-muted">
                        {activity.icon}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 text-sm">
                <Button variant="ghost" size="sm" className="w-full">
                  Vezi toate activitățile
                </Button>
              </CardFooter>
            </Card>

            {/* Acțiuni rapide */}
            <Card>
              <CardHeader>
                <CardTitle>Acțiuni Rapide</CardTitle>
                <CardDescription>Comenzi frecvent utilizate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    label: "Adaugă material nou",
                    icon: <Package className="h-4 w-4 mr-2" />,
                    path: "/materials/add",
                  },
                  {
                    label: "Generează raport",
                    icon: <FileText className="h-4 w-4 mr-2" />,
                    path: "/reports/generate",
                  },
                  {
                    label: "Actualizează stoc",
                    icon: <Layers className="h-4 w-4 mr-2" />,
                    path: "/inventory/update",
                  },
                  {
                    label: "Adaugă utilizator",
                    icon: <Users className="h-4 w-4 mr-2" />,
                    path: "/users/add",
                  },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(action.path)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Proiecte recente și Companii */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Proiecte recente */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Proiecte Recente</CardTitle>
                <CardDescription>Ultimele proiecte actualizate</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {[
                    {
                      name: "Construcție Bloc Rezidențial",
                      status: "În progres",
                      progress: 65,
                      deadline: "15 Dec 2023",
                      statusColor: "text-amber-500 bg-amber-500/10",
                    },
                    {
                      name: "Renovare Sediu Central",
                      status: "Finalizat",
                      progress: 100,
                      deadline: "30 Nov 2023",
                      statusColor: "text-green-500 bg-green-500/10",
                    },
                    {
                      name: "Extindere Hală Producție",
                      status: "În progres",
                      progress: 35,
                      deadline: "22 Ian 2024",
                      statusColor: "text-amber-500 bg-amber-500/10",
                    },
                    {
                      name: "Modernizare Rețea Electrică",
                      status: "Întârziat",
                      progress: 20,
                      deadline: "10 Dec 2023",
                      statusColor: "text-red-500 bg-red-500/10",
                    },
                  ].map((project, i) => (
                    <div
                      key={i}
                      className="flex flex-col space-y-2 p-4 border-b last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Termen: {project.deadline}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={project.statusColor}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progres</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 text-sm">
                <Button variant="ghost" size="sm" className="w-full">
                  Vezi toate proiectele
                </Button>
              </CardFooter>
            </Card>

            {/* Companii */}
            <Card>
              <CardHeader>
                <CardTitle>Companii</CardTitle>
                <CardDescription>Companiile cu care colaborezi</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {[
                    {
                      name: "Construct SRL",
                      role: "Administrator",
                      icon: <Building className="h-8 w-8 text-blue-500" />,
                      color: "bg-blue-500/10",
                    },
                    {
                      name: "Imobiliare Pro",
                      role: "Membru",
                      icon: <Building className="h-8 w-8 text-green-500" />,
                      color: "bg-green-500/10",
                    },
                    {
                      name: "Logistică Transport",
                      role: "Vizitator",
                      icon: <Truck className="h-8 w-8 text-amber-500" />,
                      color: "bg-amber-500/10",
                    },
                  ].map((company, i) => (
                    <div
                      key={i}
                      className="flex items-center p-4 border-b last:border-0"
                    >
                      <div className={`mr-4 p-2 rounded-lg ${company.color}`}>
                        {company.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{company.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {company.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 text-sm">
                <Button variant="ghost" size="sm" className="w-full">
                  Gestionează companiile
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Proiecte Active</CardTitle>
                  <CardDescription>
                    Gestionează proiectele tale curente
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Proiect Nou
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    name: "Construcție Bloc Rezidențial",
                    description:
                      "Construcție bloc cu 24 de apartamente în zona centrală",
                    status: "În progres",
                    progress: 65,
                    deadline: "15 Dec 2023",
                    team: 8,
                    materials: 42,
                    statusColor: "text-amber-500 bg-amber-500/10",
                  },
                  {
                    name: "Renovare Sediu Central",
                    description:
                      "Renovare completă a sediului central al companiei",
                    status: "Finalizat",
                    progress: 100,
                    deadline: "30 Nov 2023",
                    team: 5,
                    materials: 28,
                    statusColor: "text-green-500 bg-green-500/10",
                  },
                  {
                    name: "Extindere Hală Producție",
                    description: "Extindere hală de producție cu 500mp",
                    status: "În progres",
                    progress: 35,
                    deadline: "22 Ian 2024",
                    team: 12,
                    materials: 67,
                    statusColor: "text-amber-500 bg-amber-500/10",
                  },
                  {
                    name: "Modernizare Rețea Electrică",
                    description:
                      "Modernizarea rețelei electrice pentru complexul industrial",
                    status: "Întârziat",
                    progress: 20,
                    deadline: "10 Dec 2023",
                    team: 6,
                    materials: 31,
                    statusColor: "text-red-500 bg-red-500/10",
                  },
                ].map((project, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={project.statusColor}
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progres</span>
                            <span className="font-medium">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              Termen:{" "}
                              <span className="font-medium">
                                {project.deadline}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              Echipă:{" "}
                              <span className="font-medium">
                                {project.team} persoane
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              Materiale:{" "}
                              <span className="font-medium">
                                {project.materials}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 flex justify-between">
                      <Button variant="ghost" size="sm">
                        Vezi detalii
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Raport
                        </Button>
                        <Button variant="outline" size="sm">
                          <Package className="h-4 w-4 mr-1" />
                          Materiale
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilizare Materiale</CardTitle>
                <CardDescription>
                  Top 5 materiale utilizate în ultimele 30 de zile
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {[
                    {
                      name: "Ciment Portland 42.5R",
                      quantity: 1250,
                      unit: "kg",
                      percentage: 85,
                    },
                    {
                      name: "Cărămidă Porotherm 25",
                      quantity: 850,
                      unit: "buc",
                      percentage: 70,
                    },
                    {
                      name: "Oțel Beton PC52",
                      quantity: 750,
                      unit: "kg",
                      percentage: 65,
                    },
                    {
                      name: "Adeziv gresie și faianță",
                      quantity: 500,
                      unit: "kg",
                      percentage: 45,
                    },
                    {
                      name: "Polistiren expandat 10cm",
                      quantity: 350,
                      unit: "mp",
                      percentage: 30,
                    },
                  ].map((material, i) => (
                    <div
                      key={i}
                      className="flex flex-col p-4 border-b last:border-0"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-medium">{material.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {material.quantity} {material.unit}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {material.percentage}%
                        </span>
                      </div>
                      <Progress value={material.percentage} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stare Inventar</CardTitle>
                <CardDescription>Situația curentă a stocurilor</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      title: "Stoc Normal",
                      value: 156,
                      percentage: 78,
                      icon: <CheckCircle2 className="h-5 w-5" />,
                      color: "text-green-500",
                      bgColor: "bg-green-500/10",
                    },
                    {
                      title: "Stoc Redus",
                      value: 28,
                      percentage: 14,
                      icon: <AlertCircle className="h-5 w-5" />,
                      color: "text-amber-500",
                      bgColor: "bg-amber-500/10",
                    },
                    {
                      title: "Stoc Epuizat",
                      value: 12,
                      percentage: 6,
                      icon: <XCircle className="h-5 w-5" />,
                      color: "text-red-500",
                      bgColor: "bg-red-500/10",
                    },
                    {
                      title: "În Comandă",
                      value: 4,
                      percentage: 2,
                      icon: <CircleEllipsis className="h-5 w-5" />,
                      color: "text-blue-500",
                      bgColor: "bg-blue-500/10",
                    },
                  ].map((item, i) => (
                    <Card key={i} className={`border ${item.bgColor}`}>
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className={`${item.color} mb-2`}>{item.icon}</div>
                        <h3 className="text-lg font-bold">{item.value}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.title}
                        </p>
                        <p className={`text-xs mt-1 ${item.color}`}>
                          {item.percentage}%
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activitate Lunară</CardTitle>
              <CardDescription>
                Statistici de utilizare pentru ultimele 6 luni
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center p-8">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Grafic Activitate Lunară
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Aici ar fi afișat un grafic cu activitatea lunară, incluzând
                    numărul de materiale adăugate, actualizări de stoc și
                    rapoarte generate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
