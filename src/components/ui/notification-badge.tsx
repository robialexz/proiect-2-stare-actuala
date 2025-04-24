import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "danger" | "warning" | "success";
  pulse?: boolean;
  onClick?: () => void;
}

/**
 * NotificationBadge - A modern badge component for displaying notification counts
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  className,
  size = "md",
  variant = "primary",
  pulse = true,
  onClick,
}) => {
  // Don't render if count is 0
  if (count === 0) return null;

  // Determine the display count
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Determine size classes
  const sizeClasses = {
    sm: "h-4 min-w-4 text-[0.65rem]",
    md: "h-5 min-w-5 text-xs",
    lg: "h-6 min-w-6 text-sm",
  };

  // Determine variant classes
  const variantClasses = {
    primary: "bg-indigo-500 text-white",
    secondary: "bg-cyan-500 text-white",
    danger: "bg-rose-500 text-white",
    warning: "bg-amber-500 text-white",
    success: "bg-green-500 text-white",
  };

  // Pulse animation
  const pulseAnimation = pulse ? (
    <span
      className={cn(
        "absolute inset-0 rounded-full animate-ping opacity-75",
        {
          "bg-indigo-400": variant === "primary",
          "bg-cyan-400": variant === "secondary",
          "bg-rose-400": variant === "danger",
          "bg-amber-400": variant === "warning",
          "bg-green-400": variant === "success",
        }
      )}
    />
  ) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full px-1.5",
          sizeClasses[size],
          variantClasses[variant],
          "font-semibold leading-none",
          className
        )}
        onClick={onClick}
      >
        {pulseAnimation}
        <span className="relative z-10">{displayCount}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationBadge;
