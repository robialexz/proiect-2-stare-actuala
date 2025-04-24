import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeCardProps {
  userName: string;
  className?: string;
}

const WelcomeCard = ({ userName, className = "" }: WelcomeCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className={`${className} relative overflow-hidden group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 rounded-xl"></div>

      {/* Animated background glow */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full blur-xl transform -translate-x-5 translate-y-5"></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/10 shadow-lg"
            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              {t("Welcome to InventoryPro")}
            </h2>
            <div className="h-0.5 w-1/2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mt-1"></div>
          </div>
        </div>

        <p className="text-slate-300 mb-6 leading-relaxed">
          {t("Hello")}{" "}
          <span className="font-semibold text-white">
            {userName.split("@")[0] || t("User")}
          </span>
          ,{" "}
          {t(
            "discover how our platform can help you manage your inventory more efficiently."
          )}
        </p>

        <div className="flex flex-wrap gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 border-0 relative overflow-hidden group"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative z-10 flex items-center">
                {t("Take a tour")}
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 hover:text-white relative group"
            >
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              {t("Watch tutorial")}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
