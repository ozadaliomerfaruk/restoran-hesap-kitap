// Çek/Senet Constants

import { CekSenetStatus } from "../../types";

export const statusLabels: Record<CekSenetStatus, string> = {
  beklemede: "Beklemede",
  tahsil_edildi: "Tahsil Edildi",
  odendi: "Ödendi",
  karsilıksiz: "Karşılıksız",
  iptal: "İptal",
};

export const statusColors: Record<CekSenetStatus, string> = {
  beklemede: "#f59e0b",
  tahsil_edildi: "#10b981",
  odendi: "#10b981",
  karsilıksiz: "#ef4444",
  iptal: "#6b7280",
};

export const COLORS = {
  alacak: {
    icon: "#10b981",
    bg: "#dcfce7",
    text: "#10b981",
  },
  borc: {
    icon: "#ef4444",
    bg: "#fee2e2",
    text: "#ef4444",
  },
  primary: "#6366f1",
};
