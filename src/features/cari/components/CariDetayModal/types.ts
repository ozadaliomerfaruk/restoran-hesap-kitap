/**
 * CariDetayModal Types
 */

import { Cari, Islem } from "../../../../types";

export interface IslemKalemi {
  id: string;
  urun_adi: string;
  quantity: number;
  unit: string;
  unit_price: number;
  kdv_rate: number;
  total_price: number;
}

export interface CariDetayModalProps {
  visible: boolean;
  onClose: () => void;
  cari: Cari | null;
}

export interface CariInfoCardProps {
  cari: Cari;
  balanceInfo: { text: string; color: string };
}

export interface CariIslemListProps {
  islemler: Islem[];
  onIslemPress: (islem: Islem) => void;
}

export interface IslemDetayModalProps {
  visible: boolean;
  islem: Islem | null;
  kalemler: IslemKalemi[];
  loadingKalemler: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface IslemEditModalProps {
  visible: boolean;
  islem: Islem | null;
  kalemler: IslemKalemi[];
  onClose: () => void;
  onSave: (data: {
    amount: number;
    date: string;
    description: string;
    kalemler: IslemKalemi[];
  }) => Promise<void>;
  saving: boolean;
}

export interface CariMenuModalProps {
  visible: boolean;
  cariName: string;
  includeInReports: boolean;
  onClose: () => void;
  onEditName: () => void;
  onToggleReports: () => void;
  onArchive: () => void;
  onDelete: () => void;
}
