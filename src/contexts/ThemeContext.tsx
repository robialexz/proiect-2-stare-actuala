import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Încercăm să obținem tema din localStorage sau folosim 'dark' ca valoare implicită
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as Theme) || "dark";
  });

  // Actualizăm atributul data-theme pe elementul html când se schimbă tema
  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      // Setăm atributul data-theme
      root.setAttribute("data-theme", systemTheme);

      // Actualizăm clasele pentru Tailwind
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);

      // Aplicăm variabilele CSS pentru tema curentă
      document.body.style.setProperty("--theme-applied", systemTheme);

      // Actualizăm culoarea de fundal a documentului
      document.body.style.backgroundColor =
        systemTheme === "dark" ? "hsl(222, 47%, 11%)" : "hsl(0, 0%, 100%)";

      // Actualizăm culoarea textului
      document.body.style.color =
        systemTheme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(222, 47%, 11%)";
    } else {
      // Setăm atributul data-theme
      root.setAttribute("data-theme", theme);

      // Actualizăm clasele pentru Tailwind
      root.classList.remove("light", "dark");
      root.classList.add(theme);

      // Aplicăm variabilele CSS pentru tema curentă
      document.body.style.setProperty("--theme-applied", theme);

      // Actualizăm culoarea de fundal a documentului
      document.body.style.backgroundColor =
        theme === "dark" ? "hsl(222, 47%, 11%)" : "hsl(0, 0%, 100%)";

      // Actualizăm culoarea textului
      document.body.style.color =
        theme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(222, 47%, 11%)";
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Ascultăm schimbările de preferință de sistem
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        const root = window.document.documentElement;
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.setAttribute("data-theme", systemTheme);
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Funcție pentru a comuta între teme
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "light";

      // Dacă tema este "system", comutăm la tema opusă celei de sistem
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      return systemTheme === "dark" ? "light" : "dark";
    });
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
