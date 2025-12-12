// Tekrarlayan Ödemeler Constants

export const periodLabels: Record<string, string> = {
  gunluk: "Günlük",
  haftalik: "Haftalık",
  aylik: "Aylık",
  "2aylik": "2 Ayda Bir",
  "3aylik": "3 Ayda Bir",
  "6aylik": "6 Ayda Bir",
  yillik: "Yıllık",
};

// Tarih kontrol fonksiyonları
export const isOverdue = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  return dueDate < today;
};

export const isDueSoon = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  return dueDate <= threeDaysLater && dueDate >= today;
};
