import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Plus,
  FileUp,
  BarChart3,
  Users,
  Package,
  Truck,
  Calendar,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionProps {
  className?: string;
}

const QuickActions = ({ className = "" }: QuickActionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      name: t("Add Material"),
      icon: <Plus className="h-5 w-5" />,
      color: "from-indigo-500/20 to-blue-500/20",
      textColor: "text-indigo-400",
      borderColor: "from-indigo-500/30 to-blue-500/30",
      onClick: () => navigate("/add-material"),
    },
    {
      name: t("Upload Excel"),
      icon: <FileUp className="h-5 w-5" />,
      color: "from-cyan-500/20 to-blue-500/20",
      textColor: "text-cyan-400",
      borderColor: "from-cyan-500/30 to-blue-500/30",
      onClick: () => navigate("/upload-excel"),
    },
    {
      name: t("View Reports"),
      icon: <BarChart3 className="h-5 w-5" />,
      color: "from-purple-500/20 to-indigo-500/20",
      textColor: "text-purple-400",
      borderColor: "from-purple-500/30 to-indigo-500/30",
      onClick: () => navigate("/reports"),
    },
    {
      name: t("Team Management"),
      icon: <Users className="h-5 w-5" />,
      color: "from-green-500/20 to-emerald-500/20",
      textColor: "text-green-400",
      borderColor: "from-green-500/30 to-emerald-500/30",
      onClick: () => navigate("/teams"),
    },
    {
      name: t("Inventory"),
      icon: <Package className="h-5 w-5" />,
      color: "from-blue-500/20 to-sky-500/20",
      textColor: "text-blue-400",
      borderColor: "from-blue-500/30 to-sky-500/30",
      onClick: () => navigate("/inventory-management"),
    },
    {
      name: t("Suppliers"),
      icon: <Truck className="h-5 w-5" />,
      color: "from-amber-500/20 to-yellow-500/20",
      textColor: "text-amber-400",
      borderColor: "from-amber-500/30 to-yellow-500/30",
      onClick: () => navigate("/suppliers"),
    },
    {
      name: t("Schedule"),
      icon: <Calendar className="h-5 w-5" />,
      color: "from-indigo-500/20 to-violet-500/20",
      textColor: "text-indigo-400",
      borderColor: "from-indigo-500/30 to-violet-500/30",
      onClick: () => navigate("/schedule"),
    },
    {
      name: t("Documents"),
      icon: <FileText className="h-5 w-5" />,
      color: "from-cyan-500/20 to-teal-500/20",
      textColor: "text-cyan-400",
      borderColor: "from-cyan-500/30 to-teal-500/30",
      onClick: () => navigate("/documents"),
    },
  ];

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          {t("Quick Actions")}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative group"
          >
            {/* Background glow effect */}
            <motion.div
              className={`absolute -inset-0.5 bg-gradient-to-r ${action.borderColor} rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300`}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />

            <Button
              variant="outline"
              className={`relative w-full h-28 flex flex-col items-center justify-center gap-3 border-slate-700/50 bg-gradient-to-br ${action.color} hover:bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden group`}
              onClick={action.onClick}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-slate-800/80 to-slate-900/80 opacity-80"
                whileHover={{ opacity: 0.5 }}
                transition={{ duration: 0.3 }}
              />

              {/* Icon with animated background */}
              <motion.div
                className={`relative z-10 p-3 rounded-lg bg-slate-800/50 ${action.textColor} group-hover:scale-110 transition-transform duration-300`}
                whileHover={{
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 },
                }}
              >
                <div className="text-2xl">{action.icon}</div>
              </motion.div>

              {/* Text with animated underline */}
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-sm font-medium ${action.textColor}`}>
                  {action.name}
                </span>
                <motion.div
                  className={`h-0.5 w-0 bg-gradient-to-r ${action.borderColor} rounded-full mt-1 group-hover:w-full transition-all duration-300`}
                />
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
