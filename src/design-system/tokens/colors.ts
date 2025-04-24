/**
 * Sistem de culori pentru aplicație
 * Acest fișier definește paleta de culori și variabilele CSS pentru temă
 */

// Paleta de culori de bază
export const palette = {
  // Culori primare
  purple: {
    50: "hsl(280, 100%, 97%)",
    100: "hsl(280, 95%, 94%)",
    200: "hsl(280, 90%, 87%)",
    300: "hsl(280, 85%, 78%)",
    400: "hsl(280, 80%, 68%)",
    500: "hsl(280, 75%, 60%)",
    600: "hsl(280, 70%, 50%)",
    700: "hsl(280, 75%, 40%)",
    800: "hsl(280, 80%, 30%)",
    900: "hsl(280, 85%, 20%)",
    950: "hsl(280, 90%, 10%)",
  },

  // Culori secundare
  cyan: {
    50: "hsl(190, 100%, 97%)",
    100: "hsl(190, 95%, 94%)",
    200: "hsl(190, 90%, 87%)",
    300: "hsl(190, 85%, 78%)",
    400: "hsl(190, 80%, 68%)",
    500: "hsl(190, 95%, 55%)",
    600: "hsl(190, 90%, 45%)",
    700: "hsl(190, 85%, 35%)",
    800: "hsl(190, 80%, 25%)",
    900: "hsl(190, 85%, 15%)",
    950: "hsl(190, 90%, 10%)",
  },

  // Culori de accent
  pink: {
    50: "hsl(335, 100%, 97%)",
    100: "hsl(335, 95%, 94%)",
    200: "hsl(335, 90%, 87%)",
    300: "hsl(335, 85%, 78%)",
    400: "hsl(335, 80%, 68%)",
    500: "hsl(335, 80%, 60%)",
    600: "hsl(335, 75%, 50%)",
    700: "hsl(335, 70%, 40%)",
    800: "hsl(335, 75%, 30%)",
    900: "hsl(335, 80%, 20%)",
    950: "hsl(335, 85%, 10%)",
  },

  // Culori de stare
  success: {
    50: "hsl(142, 100%, 97%)",
    100: "hsl(142, 95%, 94%)",
    200: "hsl(142, 90%, 87%)",
    300: "hsl(142, 85%, 78%)",
    400: "hsl(142, 80%, 68%)",
    500: "hsl(142, 70%, 45%)",
    600: "hsl(142, 65%, 40%)",
    700: "hsl(142, 70%, 30%)",
    800: "hsl(142, 75%, 20%)",
    900: "hsl(142, 80%, 15%)",
    950: "hsl(142, 85%, 10%)",
  },

  warning: {
    50: "hsl(38, 100%, 97%)",
    100: "hsl(38, 95%, 94%)",
    200: "hsl(38, 90%, 87%)",
    300: "hsl(38, 85%, 78%)",
    400: "hsl(38, 80%, 68%)",
    500: "hsl(38, 92%, 50%)",
    600: "hsl(38, 87%, 45%)",
    700: "hsl(38, 82%, 35%)",
    800: "hsl(38, 77%, 25%)",
    900: "hsl(38, 82%, 15%)",
    950: "hsl(38, 87%, 10%)",
  },

  error: {
    50: "hsl(0, 100%, 97%)",
    100: "hsl(0, 95%, 94%)",
    200: "hsl(0, 90%, 87%)",
    300: "hsl(0, 85%, 78%)",
    400: "hsl(0, 80%, 68%)",
    500: "hsl(0, 70%, 50%)",
    600: "hsl(0, 65%, 45%)",
    700: "hsl(0, 70%, 35%)",
    800: "hsl(0, 75%, 25%)",
    900: "hsl(0, 80%, 15%)",
    950: "hsl(0, 85%, 10%)",
  },

  info: {
    50: "hsl(200, 100%, 97%)",
    100: "hsl(200, 95%, 94%)",
    200: "hsl(200, 90%, 87%)",
    300: "hsl(200, 85%, 78%)",
    400: "hsl(200, 80%, 68%)",
    500: "hsl(200, 90%, 50%)",
    600: "hsl(200, 85%, 45%)",
    700: "hsl(200, 80%, 35%)",
    800: "hsl(200, 75%, 25%)",
    900: "hsl(200, 80%, 15%)",
    950: "hsl(200, 85%, 10%)",
  },

  // Nuanțe de gri
  gray: {
    50: "hsl(220, 20%, 98%)",
    100: "hsl(220, 15%, 95%)",
    200: "hsl(220, 15%, 90%)",
    300: "hsl(220, 10%, 80%)",
    400: "hsl(220, 10%, 70%)",
    500: "hsl(220, 10%, 50%)",
    600: "hsl(220, 10%, 40%)",
    700: "hsl(220, 15%, 30%)",
    800: "hsl(220, 20%, 20%)",
    900: "hsl(220, 25%, 10%)",
    950: "hsl(220, 30%, 5%)",
  },
};

// Exportăm culorile pentru utilizare în aplicație
export const colors = {
  // Culori de bază pentru compatibilitate cu codul existent
  primary: palette.purple[500],
  secondary: palette.cyan[500],
  accent: palette.pink[500],
  background: palette.gray[950],
  surface: palette.gray[900],
  card: palette.gray[900],
  border: palette.gray[700],
  text: palette.gray[50],
  muted: palette.gray[400],
  error: palette.error[500],
  warning: palette.warning[500],
  success: palette.success[500],
  info: palette.info[500],

  // Tema luminoasă
  light: {
    background: palette.gray[50],
    surface: palette.gray[100],
    card: palette.gray[50],
    border: palette.gray[200],
    text: palette.gray[950],
    muted: palette.gray[600],
  },

  // Paleta completă pentru utilizare avansată
  palette,
};
