import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  gradient?: string;
  animationType?: "fade" | "slide" | "bounce" | "typewriter" | "none";
  staggerChildren?: number;
  delay?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  highlightWords?: string[];
  highlightClassName?: string;
}

/**
 * AnimatedText - A component for animated text with various effects
 * 
 * @param text - The text to animate
 * @param className - Additional classes for the text container
 * @param gradient - CSS gradient string for text (e.g., "from-indigo-500 via-blue-500 to-cyan-500")
 * @param animationType - Type of animation (default: "fade")
 * @param staggerChildren - Delay between each character animation in seconds (default: 0.03)
 * @param delay - Initial delay before animation starts in seconds (default: 0)
 * @param duration - Duration of each character animation in seconds (default: 0.5)
 * @param as - HTML element to render (default: "p")
 * @param highlightWords - Array of words to highlight
 * @param highlightClassName - Classes to apply to highlighted words
 */
const AnimatedText = ({
  text,
  className = "",
  gradient = "",
  animationType = "fade",
  staggerChildren = 0.03,
  delay = 0,
  duration = 0.5,
  as = "p",
  highlightWords = [],
  highlightClassName = "text-primary font-semibold",
}: AnimatedTextProps) => {
  // Split text into words and then characters for animation
  const words = text.split(" ");
  
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  // Different animation variants based on type
  const getItemVariants = () => {
    switch (animationType) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration } },
        };
      case "slide":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration } },
        };
      case "bounce":
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
              type: "spring", 
              stiffness: 200, 
              damping: 10, 
              duration 
            } 
          },
        };
      case "typewriter":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration: duration * 0.5 } },
        };
      case "none":
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
        };
    }
  };

  const itemVariants = getItemVariants();

  // Create the component based on the 'as' prop
  const Component = as;

  // Apply gradient if provided
  const textClasses = gradient 
    ? cn("bg-clip-text text-transparent bg-gradient-to-r", gradient, className)
    : className;

  return (
    <motion.div
      className="inline-block"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Component className={textClasses}>
        {words.map((word, wordIndex) => {
          // Check if this word should be highlighted
          const isHighlighted = highlightWords.includes(word);
          const wordClassName = isHighlighted ? highlightClassName : "";
          
          return (
            <React.Fragment key={`word-${wordIndex}`}>
              <span className={wordClassName}>
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={`char-${wordIndex}-${charIndex}`}
                    style={{ display: "inline-block" }}
                    variants={itemVariants}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
              {wordIndex < words.length - 1 && " "}
            </React.Fragment>
          );
        })}
      </Component>
    </motion.div>
  );
};

export default AnimatedText;
