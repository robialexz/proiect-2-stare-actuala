import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "tilt" | "none";
  glowColor?: string;
  borderColor?: string;
  onClick?: () => void;
}

/**
 * GlassCard - A modern glass-like card component with hover effects
 * 
 * @param children - The content of the card
 * @param className - Additional classes for the card
 * @param hoverEffect - Type of hover effect (default: "lift")
 * @param glowColor - Color for the glow effect (default: "from-indigo-500/20 to-blue-500/20")
 * @param borderColor - Color for the border effect (default: "from-indigo-500/50 to-blue-500/50")
 * @param onClick - Optional click handler
 */
const GlassCard = ({
  children,
  className = "",
  hoverEffect = "lift",
  glowColor = "from-indigo-500/20 to-blue-500/20",
  borderColor = "from-indigo-500/50 to-blue-500/50",
  onClick,
}: GlassCardProps) => {
  // Define hover animations based on the selected effect
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case "lift":
        return { y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" };
      case "glow":
        return {};
      case "border":
        return {};
      case "scale":
        return { scale: 1.02 };
      case "tilt":
        return { rotateX: 5, rotateY: 5 };
      case "none":
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden backdrop-blur-sm bg-slate-800/80 border border-slate-700/50",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={getHoverAnimation()}
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      {hoverEffect === "glow" && (
        <motion.div
          className={cn(
            "absolute -inset-1 bg-gradient-to-r rounded-xl opacity-0 blur-xl z-0",
            glowColor
          )}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Border effect on hover */}
      {hoverEffect === "border" && (
        <motion.div
          className={cn(
            "absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 z-0",
            borderColor
          )}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-[1px] bg-slate-800 rounded-[10px]" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
