import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Download,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  Users,
  Package,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  Layers,
  Settings,
  AlertCircle,
  Sparkles,
  Workflow,
  FolderPlus,
  PackagePlus,
  CreditCard,
  Rocket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import EmailWidget from "@/components/dashboard/EmailWidget";

const HomePage = () => {
  const { user, userProfile, isLoading } = useAuth();
  const { t } = useTranslation();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Set greeting based on time of day
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Format time
      setCurrentTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );

      // Set greeting based on time of day
      if (hours >= 5 && hours < 12) {
        setGreeting(t("Good morning"));
      } else if (hours >= 12 && hours < 18) {
        setGreeting(t("Good afternoon"));
      } else {
        setGreeting(t("Good evening"));
      }
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [t]);

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Dashboard stats
  const stats = [
    {
      title: t("Active Projects"),
      value: "24",
      change: "+3",
      icon: <Layers className="h-5 w-5 text-primary" />,
      color: "bg-primary/10",
    },
    {
      title: t("Inventory Items"),
      value: "1,248",
      change: "+12%",
      icon: <Package className="h-5 w-5 text-secondary" />,
      color: "bg-secondary/10",
    },
    {
      title: t("Team Members"),
      value: "36",
      change: "+2",
      icon: <Users className="h-5 w-5 text-accent" />,
      color: "bg-accent/10",
    },
    {
      title: t("Pending Deliveries"),
      value: "8",
      change: "-3",
      icon: <Clock className="h-5 w-5 text-warning" />,
      color: "bg-warning/10",
    },
  ];

  // Determinăm ce conținut să afișăm înainte de render pentru a evita flickering
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    } else if (user) {
      return (
        <section className="py-8 bg-slate-800/30">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-slate-400 mb-1">
                    {currentTime}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                    {greeting},{" "}
                    {userProfile?.displayName ||
                      user.email?.split("@")[0] ||
                      t("User")}
                  </h1>
                  <p className="text-slate-400">
                    {t("Welcome back to your inventory dashboard")}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString()}
                  </Button>
                  <Button className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {t("View Reports")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700">
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Welcome Card */}
            <WelcomeCard
              userName={userProfile?.displayName || user?.email || ""}
              className="bg-slate-800 border border-slate-700 rounded-xl mb-6"
            />

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2">
                {/* Quick Actions */}
                <QuickActions className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                {/* Projects Overview */}
                <ProjectsOverview className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                {/* Recent Activity */}
                <RecentActivity className="bg-slate-800 border border-slate-700 rounded-xl p-4" />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1">
                {/* Notifications Panel */}
                <NotificationsPanel className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                {/* Calendar Widget */}
                <CalendarWidget className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                {/* Email Widget */}
                <EmailWidget className="bg-slate-800 border border-slate-700 rounded-xl p-4" />
              </div>
            </div>
          </div>
        </section>
      );
    } else {
      return (
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-r from-indigo-600/30 to-blue-600/30 blur-3xl rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
            <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwYzkuOTQgMCAxOCA4LjA2IDE4IDE4aDEuNWE0LjUgNC41IDAgMDA0LjUtNC41IDQuNSA0LjUgMCAwMC00LjUtNC41SDM2djEuNWE0LjUgNC41IDAgMDA0LjUgNC41IDQuNSA0LjUgMCAwMDQuNS00LjVIMTh2LTEuNU0wIDE4YzAtOS45NCA4LjA2LTE4IDE4LTE4djE4SDBaIiBmaWxsPSIjMjAyNDJlIiBmaWxsLW9wYWNpdHk9XCIuMlwiLz48L2c+PC9zdmc+')] opacity-20"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div
                className="lg:w-1/2 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative inline-block mb-4">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0 px-3 py-1.5 text-sm font-medium">
                    <span className="relative z-10">
                      Revolutionizing Inventory Management
                    </span>
                  </Badge>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-50 blur-sm rounded-full"></div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                  Streamline Your{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                      Project Materials
                    </span>
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"></div>
                  </span>{" "}
                  With Precision
                </h1>

                <p className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-xl mx-auto lg:mx-0">
                  A powerful platform designed for construction and
                  engineering teams to track, manage, and optimize inventory
                  with real-time insights and AI-powered analytics.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium px-8 w-full sm:w-auto group"
                      onClick={() =>
                        (window.location.href = user
                          ? "/dashboard"
                          : "/register")
                      }
                    >
                      <span className="relative z-10 flex items-center">
                        {user ? "Go to Dashboard" : "Încearcă acum"}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-indigo-500/50 text-white hover:bg-indigo-500/10 w-full sm:w-auto group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
                        Download App
                      </span>
                      <span className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-blue-500 text-xs px-2 py-0.5 rounded-bl-md font-medium">
                        Coming Soon...
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </Button>
                  </motion.div>
                </div>

                <div className="mt-8 flex items-center justify-center lg:justify-start text-sm text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>No credit card required</span>
                  <span className="mx-2">•</span>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>14-day free trial</span>
                </div>
              </motion.div>

              {/* Dashboard preview */}
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  {/* Dashboard preview with animated glow */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-xl opacity-70 blur-lg"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />

                  {/* Dashboard preview content */}
                  <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden relative z-10">
                    {/* Dashboard header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-gradient-to-r from-slate-800 to-slate-800/70">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-sm font-medium text-blue-100/80 flex items-center">
                        <Settings className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                        InventoryPro Dashboard
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="p-6">
                      {/* Stats cards */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Stat card 1 */}
                        <motion.div
                          className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden group"
                          whileHover={{
                            y: -5,
                            boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/5 rounded-full blur-xl transform translate-x-5 -translate-y-5 group-hover:translate-x-3 transition-transform"></div>
                          <div className="text-sm text-blue-200/70 flex items-center">
                            <Package className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                            Total Items
                          </div>
                          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                            1,248
                          </div>
                          <div className="text-xs text-green-400 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12% this month
                          </div>
                        </motion.div>

                        {/* Stat card 2 */}
                        <motion.div
                          className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden group"
                          whileHover={{
                            y: -5,
                            boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 rounded-full blur-xl transform translate-x-5 -translate-y-5 group-hover:translate-x-3 transition-transform"></div>
                          <div className="text-sm text-blue-200/70 flex items-center">
                            <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                            Projects
                          </div>
                          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                            24
                          </div>
                          <div className="text-xs text-green-400 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +3 new
                          </div>
                        </motion.div>

                        {/* Stat card 3 */}
                        <motion.div
                          className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden group"
                          whileHover={{
                            y: -5,
                            boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/5 rounded-full blur-xl transform translate-x-5 -translate-y-5 group-hover:translate-x-3 transition-transform"></div>
                          <div className="text-sm text-blue-200/70 flex items-center">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                            Suppliers
                          </div>
                          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                            36
                          </div>
                          <div className="text-xs text-green-400 mt-1 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            All active
                          </div>
                        </motion.div>
                      </div>

                      {/* Inventory status */}
                      <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-5 mb-6 border border-slate-700/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-5">
                          <div className="text-sm font-medium flex items-center">
                            <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-400" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                              Inventory Status
                            </span>
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-slate-700/70 text-blue-200/70 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-blue-400" />
                            Last updated: Today
                          </div>
                        </div>
                        <div className="space-y-4">
                          {/* Progress bar 1 */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                Steel Pipes
                              </div>
                              <div className="text-sm font-medium text-green-400 flex items-center">
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                In Stock
                              </div>
                            </div>
                            <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "70%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>

                          {/* Progress bar 2 */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm flex items-center">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                Concrete Mix
                              </div>
                              <div className="text-sm font-medium text-yellow-400 flex items-center">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                Low Stock
                              </div>
                            </div>
                            <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "20%" }}
                                transition={{ duration: 1, delay: 0.7 }}
                              />
                            </div>
                          </div>

                          {/* Progress bar 3 */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm flex items-center">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                Electrical Wiring
                              </div>
                              <div className="text-sm font-medium text-blue-400 flex items-center">
                                <Package className="w-3.5 h-3.5 mr-1" />
                                Ordered
                              </div>
                            </div>
                            <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "45%" }}
                                transition={{ duration: 1, delay: 0.9 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <ModernNavbar
        isLoggedIn={!!user}
        userName={userProfile?.displayName || user?.email || ""}
        userAvatar=""
      />

      <main className="pt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default HomePage;
