// Kategoriler Feature - Types

import { Kategori } from "../../types";

// Tab tipi
export type KategoriTab = "gelir" | "gider";

// Hiyerarşik kategori (children ile)
export interface HierarchicalKategori extends Kategori {
  children?: Kategori[];
}

// Form state
export interface KategoriFormState {
  name: string;
  type: KategoriTab;
  parentId: string | null;
}

// Form modal props
export interface KategoriFormModalProps {
  visible: boolean;
  editingKategori: Kategori | null;
  formState: KategoriFormState;
  parentCategories: Kategori[];
  loading: boolean;
  onNameChange: (name: string) => void;
  onTypeChange: (type: KategoriTab) => void;
  onParentChange: (parentId: string | null) => void;
  onSave: () => void;
  onClose: () => void;
}
