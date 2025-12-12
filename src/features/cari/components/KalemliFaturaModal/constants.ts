/**
 * KalemliFaturaModal Constants
 */

export const kdvOranlari = [
  { value: "0", label: "%0" },
  { value: "1", label: "%1" },
  { value: "10", label: "%10" },
  { value: "20", label: "%20" },
];

export const birimler = [
  { value: "kg", label: "kg" },
  { value: "gr", label: "gr" },
  { value: "lt", label: "lt" },
  { value: "ml", label: "ml" },
  { value: "adet", label: "adet" },
  { value: "paket", label: "paket" },
  { value: "kutu", label: "kutu" },
  { value: "koli", label: "koli" },
  { value: "bidon", label: "bidon" },
  { value: "porsiyon", label: "porsiyon" },
  { value: "deste", label: "deste" },
];

// Helper fonksiyonlar
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseAmount = (value: string): number => {
  const normalized = value.replace(",", ".");
  return parseFloat(normalized) || 0;
};
