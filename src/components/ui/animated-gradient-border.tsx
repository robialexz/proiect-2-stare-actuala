import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientBorderProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  gradientColors?: string;
  borderWidth?: number;
  borderRadius?: string;
  isAnimated?: boolean;
  animationDuration?: number;
  onClick?: () => void;
}

/**
 * AnimatedGradientBorder - A component that wraps its children with an animated gradient border
 * 
 * @param children - The content to be wrapped
 * @param className - Additional classes for the content container
 * @param containerClassName - Additional classes for the outer container
 * @param borderClassName - Additional classes for the border element
 * @param gradientColors - CSS gradient string for the border (default: indigo to blue)
 * @param borderWidth - Width of the border in pixels (default: 1)
 * @param borderRadius - Border radius (default: 'rounded-xl')
 * @param isAnimated - Whether the border should animate (default: true)
 * @param animationDuration - Duration of the animation in seconds (default: 3)
 * @param onClick - Optional click handler
 */
const AnimatedGradientBorder = ({
  children,
  className = "",
  containerClassName = "",
  borderClassName = "",
  gradientColors = "from-indigo-500 via-blue-500 to-cyan-500",
  borderWidth = 1,
  borderRadius = "rounded-xl",
  isAnimated = true,
  animationDuration = 3,
  onClick,
}: AnimatedGradientBorderProps) => {
  return (
    <motion.div
      className={cn(
        "relative p-[1px] group overflow-hidden",
        borderRadius,
        containerClassName
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      {/* Gradient border */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          gradientColors,
          borderClassName
        )}
        style={{ padding: borderWidth }}
        animate={
          isAnimated
            ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }
            : undefined
        }
        transition={
          isAnimated
            ? {
                duration: animationDuration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }
            : undefined
        }
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 bg-slate-800 h-full",
          borderRadius,
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedGradientBorder;
