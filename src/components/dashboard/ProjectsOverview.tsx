import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  progress: number;
  status: "active" | "completed" | "on-hold";
  dueDate: string;
}

interface ProjectsOverviewProps {
  className?: string;
}

const ProjectsOverview = ({ className = "" }: ProjectsOverviewProps) => {
  const { t } = useTranslation();

  // Mock projects data
  const projects: Project[] = [
    {
      id: "1",
      name: "Office Building Renovation",
      progress: 75,
      status: "active",
      dueDate: "2023-12-15",
    },
    {
      id: "2",
      name: "Residential Complex Phase 1",
      progress: 45,
      status: "active",
      dueDate: "2024-03-20",
    },
    {
      id: "3",
      name: "Highway Bridge Repair",
      progress: 90,
      status: "active",
      dueDate: "2023-11-30",
    },
    {
      id: "4",
      name: "Shopping Mall Extension",
      progress: 20,
      status: "on-hold",
      dueDate: "2024-05-10",
    },
  ];

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return {
          bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
          text: "text-green-400",
          border: "border-green-500/30",
          icon: "text-green-400",
        };
      case "completed":
        return {
          bg: "bg-gradient-to-r from-indigo-500/20 to-blue-500/20",
          text: "text-indigo-400",
          border: "border-indigo-500/30",
          icon: "text-indigo-400",
        };
      case "on-hold":
        return {
          bg: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
          text: "text-amber-400",
          border: "border-amber-500/30",
          icon: "text-amber-400",
        };
      default:
        return {
          bg: "bg-slate-700/50",
          text: "text-slate-300",
          border: "border-slate-600/30",
          icon: "text-slate-400",
        };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (progress >= 40) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    return "bg-gradient-to-r from-amber-500 to-yellow-500";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          {t("Active Projects")}
        </h2>
        <div className="flex-grow"></div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 relative group overflow-hidden"
          >
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            <Plus className="h-4 w-4" />
            {t("New Project")}
          </Button>
        </motion.div>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => {
          const statusColors = getStatusColor(project.status);
          return (
            <motion.div
              key={project.id}
              className="relative p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{
                y: -3,
                transition: { duration: 0.2 },
              }}
            >
              {/* Subtle gradient background */}
              <div
                className={`absolute inset-0 ${statusColors.bg} opacity-30`}
              ></div>

              {/* Animated border on hover */}
              <motion.div
                className={`absolute inset-0 rounded-xl ${statusColors.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-white">{project.name}</h3>
                  <Badge
                    className={`${statusColors.bg} ${statusColors.text} border ${statusColors.border} shadow-sm`}
                  >
                    {project.status === "active"
                      ? t("Active")
                      : project.status === "completed"
                      ? t("Completed")
                      : t("On Hold")}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{t("Progress")}</span>
                    <span className={statusColors.text}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressColor(project.progress)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-slate-600 mr-1.5"></span>
                    {t("Due")}:{" "}
                    <span className="ml-1 text-slate-300">
                      {formatDate(project.dueDate)}
                    </span>
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-full ${statusColors.bg} ${statusColors.text} hover:bg-opacity-80`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="mt-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 group"
          >
            {t("View all projects")}
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsOverview;
