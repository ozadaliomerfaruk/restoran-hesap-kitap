// Arşiv Feature Types

export type ArsivTabType = "cariler" | "personel" | "hesaplar";

export interface ArchivedItem {
  id: string;
  name: string;
  type?: string;
  balance: number;
  is_archived: boolean;
  created_at: string;
}

export interface ArsivState {
  cariler: ArchivedItem[];
  personeller: ArchivedItem[];
  kasalar: ArchivedItem[];
}
