/**
 * Spacing - Design System
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,

  // Semantic
  screenPadding: 16,
  cardPadding: 16,
  cardPaddingSmall: 12,
  sectionGap: 24,
  itemGap: 12,
  inputGap: 16,
  buttonGap: 12,
  modalPadding: 16,
  modalHeaderHeight: 56,
  modalFooterHeight: 72,
} as const;

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,

  // Semantic
  card: 12,
  button: 8,
  buttonSmall: 6,
  input: 8,
  modal: 16,
  badge: 6,
  avatar: 9999,
} as const;

export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,

  // Semantic
  button: 18,
  buttonSmall: 16,
  input: 20,
  tabBar: 24,
  header: 24,
  listItem: 20,
  closeButton: 24,
} as const;

export const componentSize = {
  buttonSmall: 36,
  buttonMedium: 44,
  buttonLarge: 52,
  inputSmall: 40,
  inputMedium: 48,
  inputLarge: 56,
  listItemSmall: 48,
  listItemMedium: 56,
  listItemLarge: 72,
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 56,
  headerHeight: 56,
  tabBarHeight: 60,
  minTouchTarget: 44,
} as const;
