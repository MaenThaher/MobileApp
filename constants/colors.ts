// In this file, I took all of the web variables from globals.css and converted them to hex codes for React Native compatibility
// The referenced stack overflow for the idea is in the docs [But yeah I did the conversion with AI ;)]

// Main Colors
export const background = "#0f1419"; // hsl(210, 30%, 8%)
export const foreground = "#e8eaed"; // hsl(210, 20%, 95%)
export const muted = "#8a949e"; // hsl(210, 15%, 60%)
export const mutedForeground = "#8a949e"; // Alias for muted

// Accents
export const primary = "#3b82f6"; // hsl(217, 91%, 60%)
export const primaryForeground = "#e8eaed"; // hsl(210, 20%, 95%)
export const accent = "#818cf8"; // hsl(250, 70%, 60%)
export const accentForeground = "#e8eaed"; // hsl(210, 20%, 95%)

// Chat Bubbles
export const chatUser = primary; // User bubble (uses primary)
export const chatAiBubble = "#252e3a"; // hsl(217, 25%, 18%)
export const chatAiText = foreground; // AI bubble text

// Sidebar
export const sidebarBg = "#171d25"; // hsl(210, 25%, 10%)
export const sidebarText = foreground;
export const sidebarActive = primary;

// Surfaces & Borders
export const card = "#1a1f26"; // hsl(210, 25%, 12%)
export const cardForeground = foreground;
export const border = "#2a3441"; // hsl(210, 25%, 18%)
export const input = "#2a3441"; // hsl(210, 25%, 18%)
export const ring = primary; // hsl(217, 91%, 60%)

export const secondary = "#1f2832"; // hsl(210, 25%, 15%)
export const secondaryForeground = foreground;

export const destructive = "#ef4444"; // hsl(0, 84.2%, 60.2%)
export const destructiveForeground = foreground;

// Additional colors for mobile
export const surface = "#ffffff"; // White surface for cards/modals (light mode alternative)
export const white = "#ffffff";
export const error = destructive;

// Border radius
export const radius = 12;

/**
 * Theme object matching globals.css structure
 * For easier migration and reference
 */
export const theme = {
  background,
  foreground,
  muted,
  mutedForeground,
  primary,
  primaryForeground,
  accent,
  accentForeground,
  chatUser,
  chatAiBubble,
  chatAiText,
  sidebarBg,
  sidebarText,
  sidebarActive,
  card,
  cardForeground,
  border,
  input,
  ring,
  secondary,
  secondaryForeground,
  destructive,
  destructiveForeground,
  surface,
  white,
  error,
  radius,
} as const;
