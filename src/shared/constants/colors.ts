/**
 * Renk Paleti - Design System
 */

export const colors = {
  // Primary - Ana marka rengi (Yeşil)
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  // Secondary - İkincil renk (Mor)
  secondary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },

  // Gray - Nötr renkler
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Semantic Colors
  success: {
    light: "#d1fae5",
    main: "#10b981",
    dark: "#059669",
    text: "#065f46",
  },

  warning: {
    light: "#fef3c7",
    main: "#f59e0b",
    dark: "#d97706",
    text: "#92400e",
  },

  error: {
    light: "#fee2e2",
    main: "#ef4444",
    dark: "#dc2626",
    text: "#991b1b",
  },

  info: {
    light: "#dbeafe",
    main: "#3b82f6",
    dark: "#2563eb",
    text: "#1e40af",
  },

  // Backgrounds
  background: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
  },

  // Text
  text: {
    primary: "#111827",
    secondary: "#374151",
    tertiary: "#6b7280",
    disabled: "#9ca3af",
    inverse: "#ffffff",
  },

  // Borders
  border: {
    light: "#f3f4f6",
    default: "#e5e7eb",
    dark: "#d1d5db",
  },

  // Kasa Tipleri
  kasa: {
    nakit: { bg: "#dcfce7", icon: "#16a34a" },
    banka: { bg: "#dbeafe", icon: "#2563eb" },
    krediKarti: { bg: "#fef3c7", icon: "#d97706" },
    birikim: { bg: "#f3e8ff", icon: "#9333ea" },
  },

  // İşlem Tipleri
  islem: {
    gelir: { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
    gider: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
    odeme: { bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" },
    tahsilat: { bg: "#f3e8ff", text: "#9333ea", border: "#c4b5fd" },
    transfer: { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
  },

  // Cari Tipleri
  cari: {
    musteri: { bg: "#dbeafe", icon: "#2563eb" },
    tedarikci: { bg: "#fef3c7", icon: "#d97706" },
  },
} as const;

export type ColorPalette = typeof colors;
