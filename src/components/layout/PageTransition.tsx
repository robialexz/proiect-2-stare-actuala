import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TransitionType = 
  | "fade" 
  | "slide-up" 
  | "slide-down" 
  | "slide-left" 
  | "slide-right" 
  | "scale" 
  | "rotate" 
  | "none";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

/**
 * PageTransition - A component for animating page transitions
 * 
 * @param children - The content to be animated
 * @param className - Additional classes for the container
 * @param type - Type of transition animation
 * @param duration - Duration of the animation in seconds
 * @param delay - Delay before the animation starts in seconds
 * @param staggerChildren - Whether to stagger the animation of children
 * @param staggerDelay - Delay between each child animation in seconds
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  type = "fade",
  duration = 0.5,
  delay = 0,
  staggerChildren = false,
  staggerDelay = 0.1,
}) => {
  // Define animation variants based on transition type
  const getVariants = () => {
    switch (type) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0,
            transition: { duration: duration / 2 }
          }
        };
      case "slide-up":
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0, 
            y: -50,
            transition: { duration: duration / 2 }
          }
        };
      case "slide-down":
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0, 
            y: 50,
            transition: { duration: duration / 2 }
          }
        };
      case "slide-left":
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0, 
            x: -50,
            transition: { duration: duration / 2 }
          }
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0, 
            x: 50,
            transition: { duration: duration / 2 }
          }
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0, 
            scale: 1.2,
            transition: { duration: duration / 2 }
          }
        };
      case "rotate":
        return {
          hidden: { opacity: 0, rotate: -5, scale: 0.95 },
          visible: { 
            opacity: 1, 
            rotate: 0,
            scale: 1,
            transition: { 
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
            }
          },
          exit: { 
            opacity: 0, 
            rotate: 5,
            scale: 0.95,
            transition: { duration: duration / 2 }
          }
        };
      case "none":
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
          exit: { opacity: 1 }
        };
    }
  };

  // Child variants for staggered animations
  const childVariants = staggerChildren ? {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: duration / 2 }
    }
  } : {};

  const variants = getVariants();

  return (
    <motion.div
      className={cn("w-full", className)}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
    >
      {staggerChildren ? (
        React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={childVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        children
      )}
    </motion.div>
  );
};

export default PageTransition;
