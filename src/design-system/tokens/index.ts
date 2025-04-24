/**
 * Design System Tokens
 * Acest fișier exportă toate token-urile de design pentru a fi utilizate în aplicație
 */

import { colors, palette } from './colors';
import { typography } from './typography';
import { spacing, sizes, borderRadius, shadows } from './spacing';
import animations from './animations';

// Exportăm toate token-urile
export const tokens = {
  colors,
  palette,
  typography,
  spacing,
  sizes,
  borderRadius,
  shadows,
  animations,
};

// Exportăm individual pentru utilizare directă
export {
  colors,
  palette,
  typography,
  spacing,
  sizes,
  borderRadius,
  shadows,
  animations,
};

export default tokens;
