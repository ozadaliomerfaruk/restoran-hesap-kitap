/**
 * KalemliFaturaModal Types
 */

import { Cari, Urun, Kategori } from "../../../../types";

export interface Kalem {
  id: string;
  urun_id: string | null;
  urun_adi: string;
  quantity: string;
  unit: string;
  unit_price: string;
  kdv_rate: string;
  kategori_id: string | null;
}

export interface KalemliFaturaModalProps {
  visible: boolean;
  onClose: () => void;
  cari: Cari | null;
}

export type FaturaTipi = "alis" | "iade";

export interface KalemCardProps {
  kalem: Kalem;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Kalem, value: string | null) => void;
  onSelectUrun: (kalemId: string) => void;
  activeBirimKalemId: string | null;
  setActiveBirimKalemId: (id: string | null) => void;
  activeKdvKalemId: string | null;
  setActiveKdvKalemId: (id: string | null) => void;
}

export interface UrunSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUrun: (urun: Urun) => void;
  urunler: Urun[];
  kategoriler: Kategori[];
  onAddUrun: (urun: Partial<Urun>) => Promise<void>;
}

export interface FaturaFormProps {
  faturaTipi: FaturaTipi;
  setFaturaTipi: (tipi: FaturaTipi) => void;
  formDate: string;
  setFormDate: (date: string) => void;
  formDescription: string;
  setFormDescription: (desc: string) => void;
}

export interface FaturaSummaryProps {
  araToplam: number;
  toplamKdv: number;
  genelToplam: number;
  loading: boolean;
  onSave: () => void;
  faturaTipi: FaturaTipi;
}
