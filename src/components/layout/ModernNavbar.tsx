import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  Info,
  FileText,
  DollarSign,
  Mail,
  Package,
  LayoutDashboard,
  Users,
  BarChart3,
  PlusCircle,
  Upload,
  Calendar,
  Folder,
  BookOpen,
  Layers,
  Briefcase,
  Clock,
  Search,
  Bell,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import SettingsModal from "./SettingsModal";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
}

const ModernNavbar = ({
  isLoggedIn = false,
  userName = "Guest User",
  userAvatar = "",
}: NavbarProps) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define links for the main navigation
  const navLinks = [
    { name: "Acasă", path: "/", icon: <Home size={18} /> },
    { name: "Despre noi", path: "/about", icon: <Info size={18} /> },
    { name: "Termeni", path: "/terms", icon: <FileText size={18} /> },
    { name: "Prețuri", path: "/pricing", icon: <DollarSign size={18} /> },
    { name: "Contact", path: "/contact", icon: <Mail size={18} /> },
  ];

  // Main buttons that will be displayed directly in the navigation bar
  const mainButtons = [
    {
      name: "Prezentare",
      path: "/overview",
      icon: <Home size={18} />,
      description: "Vizualizare generală a proiectelor și activităților",
    },
    // Am eliminat butonul "Panou Control" pentru a evita duplicarea cu cel din sidebar
    {
      name: "Proiecte",
      path: "/projects",
      icon: <Briefcase size={18} />,
      description: "Gestionarea proiectelor active și arhivate",
    },
    {
      name: "Inventar",
      path: "/warehouse-inventory",
      icon: <Package size={18} />,
      description: "Administrarea materialelor și stocurilor",
    },
  ];

  // Categories of buttons for dropdowns
  const buttonCategories = [
    {
      id: "projects",
      name: "Management Proiecte",
      icon: <Layers size={18} />,
      items: [
        { name: "Proiecte", path: "/projects", icon: <Briefcase size={18} /> },
        { name: "Program", path: "/schedule", icon: <Calendar size={18} /> },
        { name: "Documente", path: "/documents", icon: <Folder size={18} /> },
        { name: "Sarcini", path: "/tasks", icon: <CheckCircle2 size={18} /> },
      ],
    },
    {
      id: "inventory",
      name: "Management Inventar",
      icon: <Package size={18} />,
      items: [
        {
          name: "Inventar Depozit",
          path: "/warehouse-inventory",
          icon: <Building2 size={18} />,
        },
        {
          name: "Inventar Proiect",
          path: "/project-inventory",
          icon: <Package size={18} />,
        },
        {
          name: "Adaugă Material",
          path: "/add-material",
          icon: <PlusCircle size={18} />,
        },
        {
          name: "Încarcă Excel",
          path: "/upload-excel",
          icon: <Upload size={18} />,
        },
      ],
    },
    {
      id: "team",
      name: "Echipă & Furnizori",
      icon: <Users size={18} />,
      items: [
        { name: "Echipe", path: "/teams", icon: <Users size={18} /> },
        { name: "Furnizori", path: "/suppliers", icon: <Users size={18} /> },
      ],
    },
    {
      id: "finance",
      name: "Financiar & Raportare",
      icon: <BarChart3 size={18} />,
      items: [
        { name: "Buget", path: "/budget", icon: <DollarSign size={18} /> },
        { name: "Rapoarte", path: "/reports", icon: <BarChart3 size={18} /> },
        { name: "Resurse", path: "/resources", icon: <BookOpen size={18} /> },
      ],
    },
    {
      id: "help",
      name: "Ajutor & Setări",
      icon: <HelpCircle size={18} />,
      items: [
        { name: "Tutorial", path: "/tutorial", icon: <HelpCircle size={18} /> },
        { name: "Setări", path: "/settings", icon: <Settings size={18} /> },
      ],
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      // Handle error appropriately
    }
    navigate("/");
  };

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-slate-700/50"
            : "bg-slate-900 border-b border-slate-800/50"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              variants={logoVariants}
            >
              <Link to="/" className="flex items-center">
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    rotate: [0, -2, 2, -2, 0],
                    transition: { duration: 0.5 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg opacity-30 blur-sm group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative flex items-center">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
                      Inventory
                    </span>
                    <span className="text-2xl font-bold text-white">Pro</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Only show marketing links when not logged in */}
              {!isLoggedIn &&
                navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link
                      to={link.path}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                        isActive(link.path)
                          ? "text-white bg-primary/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      {link.icon && <span>{link.icon}</span>}
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

              {/* Main buttons for logged in users */}
              {isLoggedIn && (
                <>
                  {/* Main buttons directly in the bar */}
                  {mainButtons.map((button) => (
                    <motion.div
                      key={button.path}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <Link
                        to={button.path}
                        className={cn(
                          "px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 relative group overflow-hidden",
                          isActive(button.path)
                            ? "text-white bg-gradient-to-r from-indigo-600/80 to-blue-600/80"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                        )}
                      >
                        {/* Background glow effect for active items */}
                        {isActive(button.path) && (
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

                        {/* Hover effect */}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>

                        {/* Icon and text */}
                        <span className="relative z-10 flex items-center gap-1">
                          {button.icon && <span>{button.icon}</span>}
                          {button.name}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800/90 backdrop-blur-sm text-xs text-slate-300 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 border border-slate-700/50">
                          {button.description}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 border-4 border-transparent border-t-slate-800/90"></div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Category buttons in dropdowns */}
                  {buttonCategories.map((category) => (
                    <motion.div key={category.id} variants={itemVariants}>
                      <DropdownMenu
                        onOpenChange={(open) => {
                          if (open) setActiveCategory(category.id);
                          else setActiveCategory(null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex items-center gap-1",
                              activeCategory === category.id
                                ? "text-white bg-primary/20"
                                : "text-slate-400 hover:text-white"
                            )}
                          >
                            <motion.span
                              className="flex items-center gap-1"
                              whileHover={{ y: -1 }}
                            >
                              {category.icon && (
                                <span className="mr-1">{category.icon}</span>
                              )}
                              {category.name}
                              <motion.span
                                animate={{
                                  rotate:
                                    activeCategory === category.id ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown size={16} />
                              </motion.span>
                            </motion.span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 p-2 rounded-xl shadow-xl"
                        >
                          <AnimatePresence>
                            {category.items.map((item, index) => (
                              <motion.div
                                key={item.path}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                  duration: 0.2,
                                  delay: index * 0.05,
                                }}
                              >
                                <DropdownMenuItem
                                  className={cn(
                                    "flex items-center gap-2 p-2 m-1 rounded-md transition-all relative group overflow-hidden",
                                    isActive(item.path)
                                      ? "text-white bg-gradient-to-r from-indigo-600/80 to-blue-600/80"
                                      : "text-slate-300 hover:text-white hover:bg-slate-700/80"
                                  )}
                                  onClick={() => navigate(item.path)}
                                >
                                  {/* Background glow effect for active items */}
                                  {isActive(item.path) && (
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

                                  {/* Icon and text */}
                                  <span className="relative z-10 flex items-center gap-2">
                                    {item.icon && (
                                      <span
                                        className={cn(
                                          "p-1 rounded-md",
                                          isActive(item.path)
                                            ? "bg-white/10"
                                            : "bg-slate-700/50 group-hover:bg-slate-700"
                                        )}
                                      >
                                        {item.icon}
                                      </span>
                                    )}
                                    {item.name}
                                  </span>

                                  {/* Right arrow indicator */}
                                  <motion.span
                                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    initial={{ x: -5 }}
                                    animate={{ x: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight size={14} />
                                  </motion.span>
                                </DropdownMenuItem>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <motion.div variants={itemVariants}>
                <LanguageSwitcher />
              </motion.div>

              {/* User Menu */}
              {isLoggedIn ? (
                <motion.div variants={itemVariants}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                      >
                        <Avatar className="h-10 w-10 border-2 border-primary/30 hover:border-primary transition-colors">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 p-3 mt-1 rounded-xl shadow-xl"
                    >
                      <div className="flex items-center gap-3 p-2 mb-2 bg-gradient-to-r from-slate-800 to-slate-700/50 rounded-lg border border-slate-700/30">
                        <Avatar className="h-10 w-10 ring-2 ring-indigo-500/30">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                            {userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {userName}
                          </span>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                            <span className="text-xs text-green-400">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="bg-slate-700/50 my-2" />
                      <div className="space-y-1">
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 m-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all group"
                          onClick={() => navigate("/profile")}
                        >
                          <span className="p-1.5 rounded-md bg-slate-700/50 group-hover:bg-indigo-500/20 transition-colors">
                            <User size={16} className="text-indigo-400" />
                          </span>
                          <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 m-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all group"
                          onClick={() => setSettingsOpen(true)}
                        >
                          <span className="p-1.5 rounded-md bg-slate-700/50 group-hover:bg-cyan-500/20 transition-colors">
                            <Settings size={16} className="text-cyan-400" />
                          </span>
                          <span>Setări</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700/50 my-2" />
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 m-1 rounded-md text-rose-400 hover:text-rose-300 hover:bg-red-900/20 transition-all group"
                          onClick={handleLogout}
                        >
                          <span className="p-1.5 rounded-md bg-slate-700/50 group-hover:bg-red-500/20 transition-colors">
                            <LogOut size={16} className="text-red-400" />
                          </span>
                          <span>Deconectare</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      onClick={() => navigate("/login")}
                    >
                      <LogIn className="h-5 w-5 mr-1" />
                      Conectare
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => navigate("/register")}
                    >
                      Înregistrare
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.div variants={itemVariants} className="md:hidden">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
              className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {/* Only show marketing links when not logged in */}
                {!isLoggedIn &&
                  navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      variants={mobileItemVariants}
                      custom={index}
                    >
                      <Link
                        to={link.path}
                        className={cn(
                          "px-3 py-2 rounded-md text-base font-medium flex items-center gap-2",
                          isActive(link.path)
                            ? "text-white bg-primary/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.icon && <span>{link.icon}</span>}
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}

                {isLoggedIn && (
                  <>
                    {/* Main buttons */}
                    <div className="pt-2 pb-1">
                      <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Pagini Principale
                      </p>
                    </div>
                    {mainButtons.map((button, index) => (
                      <motion.div
                        key={button.path}
                        variants={mobileItemVariants}
                        custom={index}
                      >
                        <Link
                          to={button.path}
                          className={cn(
                            "px-3 py-2 rounded-md text-base font-medium flex items-center gap-2",
                            isActive(button.path)
                              ? "text-white bg-primary/20"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {button.icon && <span>{button.icon}</span>}
                          {button.name}
                        </Link>
                      </motion.div>
                    ))}

                    {/* Categories */}
                    {buttonCategories.map((category, categoryIndex) => (
                      <div key={category.id}>
                        <div className="pt-4 pb-1">
                          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            {category.icon && <span>{category.icon}</span>}
                            {category.name}
                          </p>
                        </div>
                        {category.items.map((item, itemIndex) => (
                          <motion.div
                            key={item.path}
                            variants={mobileItemVariants}
                            custom={categoryIndex + itemIndex}
                          >
                            <Link
                              to={item.path}
                              className={cn(
                                "px-3 py-2 rounded-md text-base font-medium flex items-center gap-2",
                                isActive(item.path)
                                  ? "text-white bg-primary/20"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.icon && <span>{item.icon}</span>}
                              {item.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ))}

                    {/* User section */}
                    <div className="pt-4 pb-3 border-t border-slate-800">
                      <div className="flex items-center px-3">
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userAvatar} alt={userName} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-white">
                            {userName}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <Link
                          to="/profile"
                          className="px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User size={16} />
                          Profil
                        </Link>
                        <button
                          className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSettingsOpen(true);
                          }}
                        >
                          <Settings size={16} />
                          Setări
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 flex items-center gap-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut size={16} />
                          Deconectare
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from being hidden under the navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default ModernNavbar;
