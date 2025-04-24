/**
 * Sistem de animații și tranziții pentru aplicație
 * Acest fișier definește duratele, timing functions și keyframes pentru animații
 */

// Durate pentru tranziții și animații
export const durations = {
  instant: '0ms',
  fastest: '50ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
  
  // Durate specifice
  page: '300ms',
  modal: '250ms',
  tooltip: '150ms',
  notification: '200ms',
  button: '150ms',
  hover: '100ms',
};

// Timing functions pentru tranziții și animații
export const easings = {
  // Funcții standard
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Funcții personalizate
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  
  // Funcții speciale
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Tranziții predefinite
export const transitions = {
  default: `${durations.normal} ${easings.easeInOut}`,
  fast: `${durations.fast} ${easings.easeOut}`,
  slow: `${durations.slow} ${easings.easeInOut}`,
  
  // Tranziții specifice
  button: `${durations.button} ${easings.easeOut}`,
  hover: `${durations.hover} ${easings.easeOut}`,
  modal: `${durations.modal} ${easings.easeInOut}`,
  page: `${durations.page} ${easings.easeInOut}`,
  tooltip: `${durations.tooltip} ${easings.easeOut}`,
  notification: `${durations.notification} ${easings.easeOut}`,
  
  // Tranziții pentru proprietăți specifice
  color: `color ${durations.fast} ${easings.easeOut}`,
  backgroundColor: `background-color ${durations.fast} ${easings.easeOut}`,
  opacity: `opacity ${durations.fast} ${easings.easeOut}`,
  transform: `transform ${durations.fast} ${easings.easeOut}`,
  boxShadow: `box-shadow ${durations.fast} ${easings.easeOut}`,
  border: `border ${durations.fast} ${easings.easeOut}`,
  
  // Tranziții pentru toate proprietățile
  all: `all ${durations.normal} ${easings.easeInOut}`,
};

// Keyframes pentru animații
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
  },
  slideInFromTop: {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideOutToTop: {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(-10px)', opacity: 0 },
  },
  slideInFromBottom: {
    from: { transform: 'translateY(10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideOutToBottom: {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(10px)', opacity: 0 },
  },
  slideInFromLeft: {
    from: { transform: 'translateX(-10px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideOutToLeft: {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(-10px)', opacity: 0 },
  },
  slideInFromRight: {
    from: { transform: 'translateX(10px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideOutToRight: {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(10px)', opacity: 0 },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  ping: {
    '75%, 100%': { transform: 'scale(2)', opacity: 0 },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  },
};

// Animații predefinite
export const animations = {
  fadeIn: `fadeIn ${durations.normal} ${easings.easeOut} forwards`,
  fadeOut: `fadeOut ${durations.normal} ${easings.easeIn} forwards`,
  scaleIn: `scaleIn ${durations.normal} ${easings.spring} forwards`,
  scaleOut: `scaleOut ${durations.normal} ${easings.easeIn} forwards`,
  slideInFromTop: `slideInFromTop ${durations.normal} ${easings.easeOut} forwards`,
  slideOutToTop: `slideOutToTop ${durations.normal} ${easings.easeIn} forwards`,
  slideInFromBottom: `slideInFromBottom ${durations.normal} ${easings.easeOut} forwards`,
  slideOutToBottom: `slideOutToBottom ${durations.normal} ${easings.easeIn} forwards`,
  slideInFromLeft: `slideInFromLeft ${durations.normal} ${easings.easeOut} forwards`,
  slideOutToLeft: `slideOutToLeft ${durations.normal} ${easings.easeIn} forwards`,
  slideInFromRight: `slideInFromRight ${durations.normal} ${easings.easeOut} forwards`,
  slideOutToRight: `slideOutToRight ${durations.normal} ${easings.easeIn} forwards`,
  pulse: `pulse ${durations.slow} ${easings.easeInOut} infinite`,
  spin: `spin ${durations.slowest} ${easings.linear} infinite`,
  ping: `ping ${durations.slow} ${easings.easeOut} infinite`,
  bounce: `bounce ${durations.slow} ${easings.easeInOut} infinite`,
};

// Exportăm toate valorile
export default {
  durations,
  easings,
  transitions,
  keyframes,
  animations,
};
