/**
 * Typography - Design System
 */

export const typography = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 30,
    "5xl": 36,
  },

  weight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const textStyles = {
  h1: {
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.bold,
    lineHeight: typography.size["4xl"] * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    lineHeight: typography.size["3xl"] * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size["2xl"] * typography.lineHeight.tight,
  },
  h4: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.xl * typography.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.normal,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
  },
  body: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.normal,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.normal,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  labelSmall: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.normal,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  buttonLarge: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
  },
  button: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  buttonSmall: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.xl * typography.lineHeight.tight,
  },
  sectionHeader: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  input: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.normal,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
} as const;
