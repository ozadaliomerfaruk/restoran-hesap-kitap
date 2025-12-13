/**
 * Kullanıcı Yönetimi - Tipler
 */

import type {
  RestaurantUser,
  UserPermissions,
  PermissionLevel,
} from "../../types";

// Modül bilgileri
export interface ModuleInfo {
  key: keyof UserPermissions["modules"];
  label: string;
  icon: string;
}

export const MODULES: ModuleInfo[] = [
  { key: "dashboard", label: "Ana Sayfa", icon: "home" },
  { key: "kasalar", label: "Kasalar", icon: "wallet" },
  { key: "cariler", label: "Cariler", icon: "users" },
  { key: "personel", label: "Personel", icon: "user-check" },
  { key: "islemler", label: "İşlemler", icon: "file-text" },
  { key: "raporlar", label: "Raporlar", icon: "bar-chart" },
  {
    key: "tekrarlayan_odemeler",
    label: "Tekrarlayan Ödemeler",
    icon: "repeat",
  },
  { key: "cek_senet", label: "Çek/Senet", icon: "credit-card" },
  { key: "gunluk_satis", label: "Günlük Satış", icon: "shopping-cart" },
  { key: "ayarlar", label: "Ayarlar", icon: "settings" },
];

// Yetki seviyesi bilgileri
export interface PermissionLevelInfo {
  value: PermissionLevel;
  label: string;
  description: string;
}

export const PERMISSION_LEVELS: PermissionLevelInfo[] = [
  {
    value: "readonly",
    label: "Sadece Okuma",
    description: "Verileri görüntüleyebilir, değişiklik yapamaz",
  },
  {
    value: "own",
    label: "Kendi Kayıtları",
    description:
      "Ekleme yapabilir, sadece kendi eklediğini düzenleyebilir/silebilir",
  },
  {
    value: "full",
    label: "Tam Yetki",
    description: "Ekleme, düzenleme ve silme işlemlerini yapabilir",
  },
];

// Rol bilgileri
export interface RoleInfo {
  value: RestaurantUser["role"];
  label: string;
  color: string;
}

export const ROLES: RoleInfo[] = [
  { value: "admin", label: "Yönetici", color: "#ef4444" },
  { value: "muhasebeci", label: "Muhasebeci", color: "#3b82f6" },
  { value: "satin_almaci", label: "Satın Almacı", color: "#10b981" },
  { value: "kasiyer", label: "Kasiyer", color: "#f59e0b" },
];

// Form state
export interface KullaniciFormData {
  role: RestaurantUser["role"];
  permissions: UserPermissions;
}

// Davet form
export interface DavetFormData {
  email: string;
  role: RestaurantUser["role"];
  permissions: UserPermissions;
}
