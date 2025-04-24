import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Tipuri pentru temă
export type ThemeMode = "light" | "dark" | "system";
export type ThemeColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "indigo";
export type ThemeRadius = "none" | "sm" | "md" | "lg" | "full";
export type ThemeAnimation = "none" | "subtle" | "medium" | "high";

export interface ThemeSettings {
  mode: ThemeMode;
  color: ThemeColor;
  radius: ThemeRadius;
  animation: ThemeAnimation;
  fontSize: number; // 100 = 100% (normal), 90 = 90% (smaller), 110 = 110% (larger)
  reducedMotion: boolean;
  highContrast: boolean;
}

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  systemTheme: "light" | "dark";
  effectiveTheme: "light" | "dark";
}

// Tema implicită
const defaultTheme: ThemeSettings = {
  mode: "system",
  color: "indigo",
  radius: "md",
  animation: "medium",
  fontSize: 100,
  reducedMotion: false,
  highContrast: false,
};

// Context pentru temă
const EnhancedThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

// Provider pentru temă
export const EnhancedThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Încărcăm tema din localStorage sau folosim tema implicită
  const [theme, setThemeState] = useState<ThemeSettings>(() => {
    try {
      const storedTheme = localStorage.getItem("enhanced_theme");

      if (!storedTheme) {
        return defaultTheme;
      }

      // Verificăm dacă este un string simplu ('dark' sau 'light')
      if (storedTheme === "dark" || storedTheme === "light") {
        // Convertim string-ul simplu în obiect ThemeSettings
        return {
          ...defaultTheme,
          mode: storedTheme as "dark" | "light",
        };
      }

      // Încercăm să parsăm ca JSON
      return JSON.parse(storedTheme);
    } catch (error) {
      // Removed console statement

      // În caz de eroare, ștergem valoarea invalidă din localStorage
      localStorage.removeItem("enhanced_theme");

      return defaultTheme;
    }
  });

  // Starea pentru tema sistemului
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Calculăm tema efectivă (light sau dark)
  const effectiveTheme = theme.mode === "system" ? systemTheme : theme.mode;

  // Funcție pentru a actualiza tema
  const setTheme = useCallback((newTheme: Partial<ThemeSettings>) => {
    setThemeState((prevTheme) => {
      const updatedTheme = { ...prevTheme, ...newTheme };

      // Salvăm tema în localStorage
      try {
        localStorage.setItem("enhanced_theme", JSON.stringify(updatedTheme));
      } catch (error) {
        // Removed console statement
      }

      return updatedTheme;
    });
  }, []);

  // Funcție pentru a reseta tema la valorile implicite
  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);

    // Salvăm tema în localStorage
    try {
      localStorage.setItem("enhanced_theme", JSON.stringify(defaultTheme));
    } catch (error) {
      // Removed console statement
    }
  }, []);

  // Actualizăm clasa documentului când se schimbă tema
  useEffect(() => {
    // Actualizăm clasa pentru modul light/dark
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(effectiveTheme);

    // Setăm atributul data-theme
    document.documentElement.setAttribute("data-theme", effectiveTheme);

    // Actualizăm clasa pentru culoare
    document.documentElement.classList.remove(
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-red",
      "theme-indigo"
    );
    document.documentElement.classList.add(`theme-${theme.color}`);

    // Actualizăm clasa pentru raza de colț
    document.documentElement.classList.remove(
      "radius-none",
      "radius-sm",
      "radius-md",
      "radius-lg",
      "radius-full"
    );
    document.documentElement.classList.add(`radius-${theme.radius}`);

    // Actualizăm clasa pentru animații
    document.documentElement.classList.remove(
      "animation-none",
      "animation-subtle",
      "animation-medium",
      "animation-high"
    );
    document.documentElement.classList.add(`animation-${theme.animation}`);

    // Actualizăm clasa pentru dimensiunea fontului
    document.documentElement.style.fontSize = `${theme.fontSize}%`;

    // Actualizăm clasa pentru reducerea mișcării
    if (theme.reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }

    // Actualizăm clasa pentru contrast ridicat
    if (theme.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Actualizăm meta tag-ul pentru culoarea temei
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        effectiveTheme === "dark" ? "#0f172a" : "#ffffff"
      );
    }

    // Aplicăm variabilele CSS pentru tema curentă
    document.body.style.setProperty("--theme-applied", effectiveTheme);

    // Actualizăm culoarea de fundal a documentului
    document.body.style.backgroundColor =
      effectiveTheme === "dark" ? "hsl(222, 47%, 11%)" : "hsl(0, 0%, 100%)";

    // Actualizăm culoarea textului
    document.body.style.color =
      effectiveTheme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(222, 47%, 11%)";

    // Actualizăm culorile pentru elementele de interfață
    const rootStyle = document.documentElement.style;

    if (effectiveTheme === "dark") {
      // Setăm variabilele CSS pentru tema întunecată
      rootStyle.setProperty("--background", "222 47% 11%");
      rootStyle.setProperty("--foreground", "0 0% 100%");
      rootStyle.setProperty("--card", "223 47% 14%");
      rootStyle.setProperty("--card-foreground", "0 0% 100%");
      rootStyle.setProperty("--popover", "223 47% 14%");
      rootStyle.setProperty("--popover-foreground", "0 0% 100%");
      rootStyle.setProperty("--primary", "234 89% 74%");
      rootStyle.setProperty("--primary-foreground", "0 0% 100%");
      rootStyle.setProperty("--secondary", "199 89% 48%");
      rootStyle.setProperty("--secondary-foreground", "0 0% 100%");
      rootStyle.setProperty("--muted", "223 47% 20%");
      rootStyle.setProperty("--muted-foreground", "215 20% 65%");
      rootStyle.setProperty("--accent", "262 83% 58%");
      rootStyle.setProperty("--accent-foreground", "0 0% 100%");
      rootStyle.setProperty("--destructive", "0 84% 60%");
      rootStyle.setProperty("--destructive-foreground", "0 0% 100%");
      rootStyle.setProperty("--border", "217 19% 27%");
      rootStyle.setProperty("--input", "217 19% 27%");
      rootStyle.setProperty("--ring", "224 76% 48%");
    } else {
      // Setăm variabilele CSS pentru tema luminoasă
      rootStyle.setProperty("--background", "0 0% 100%");
      rootStyle.setProperty("--foreground", "222 47% 11%");
      rootStyle.setProperty("--card", "210 40% 98%");
      rootStyle.setProperty("--card-foreground", "222 47% 11%");
      rootStyle.setProperty("--popover", "0 0% 100%");
      rootStyle.setProperty("--popover-foreground", "222 47% 11%");
      rootStyle.setProperty("--primary", "234 89% 54%");
      rootStyle.setProperty("--primary-foreground", "0 0% 100%");
      rootStyle.setProperty("--secondary", "199 89% 38%");
      rootStyle.setProperty("--secondary-foreground", "0 0% 100%");
      rootStyle.setProperty("--muted", "210 40% 96%");
      rootStyle.setProperty("--muted-foreground", "215 16% 47%");
      rootStyle.setProperty("--accent", "262 83% 48%");
      rootStyle.setProperty("--accent-foreground", "0 0% 100%");
      rootStyle.setProperty("--destructive", "0 84% 60%");
      rootStyle.setProperty("--destructive-foreground", "0 0% 100%");
      rootStyle.setProperty("--border", "214 32% 91%");
      rootStyle.setProperty("--input", "214 32% 91%");
      rootStyle.setProperty("--ring", "224 76% 48%");
    }
  }, [theme, effectiveTheme]);

  // Ascultăm schimbările de temă ale sistemului
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Ascultăm schimbările de preferințe pentru reducerea mișcării
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !theme.reducedMotion) {
        setTheme({ reducedMotion: true });
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    // Verificăm starea inițială
    if (mediaQuery.matches && !theme.reducedMotion) {
      setTheme({ reducedMotion: true });
    }

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme.reducedMotion, setTheme]);

  return (
    <EnhancedThemeContext.Provider
      value={{
        theme,
        setTheme,
        resetTheme,
        systemTheme,
        effectiveTheme,
      }}
    >
      {children}
    </EnhancedThemeContext.Provider>
  );
};

// Hook pentru utilizarea temei
export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);

  if (!context) {
    throw new Error(
      "useEnhancedTheme must be used within a EnhancedThemeProvider"
    );
  }

  return context;
};

export default {
  EnhancedThemeProvider,
  useEnhancedTheme,
};
