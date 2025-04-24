import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";

interface AnimatedRoutesProps {
  routes: {
    path: string;
    element: React.ReactNode;
    transitionType?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "rotate" | "none";
  }[];
}

/**
 * AnimatedRoutes - A component for adding animations to route transitions
 * 
 * @param routes - Array of route objects with path, element, and optional transitionType
 */
const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ routes }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PageTransition type={route.transitionType || "fade"}>
                {route.element}
              </PageTransition>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
