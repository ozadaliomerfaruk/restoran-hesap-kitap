// ==========================================
// TEMEL TİPLER
// ==========================================

export interface Restaurant {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "muhasebeci" | "satin_almaci" | "kasiyer";
  restaurant_id: string;
  plan: "free" | "pro" | "premium";
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantUser {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: "admin" | "muhasebeci" | "satin_almaci" | "kasiyer";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// KASA
// ==========================================

export interface Kasa {
  id: string;
  restaurant_id: string;
  name: string;
  type: "nakit" | "banka" | "kredi_karti" | "birikim";
  currency: "TRY" | "USD" | "EUR";
  balance: number;
  is_active: boolean;
  is_archived: boolean;
  exclude_from_profit?: boolean;
  created_at: string;
  updated_at: string;
}

export type KasaType = Kasa["type"];

// ==========================================
// CARİ HESAP
// ==========================================

export interface Cari {
  id: string;
  restaurant_id: string;
  name: string;
  type: "tedarikci" | "musteri";
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
  balance: number;
  initial_balance: number;
  include_in_reports: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type CariType = Cari["type"];

// ==========================================
// KATEGORİ
// ==========================================

export interface Kategori {
  id: string;
  restaurant_id?: string;
  name: string;
  parent_id?: string;
  type: "gelir" | "gider";
  is_default: boolean;
  created_at: string;
  // UI için
  children?: Kategori[];
}

// ==========================================
// İŞLEMLER
// ==========================================

export interface Islem {
  id: string;
  restaurant_id: string;
  type:
    | "gelir"
    | "gider"
    | "transfer"
    | "odeme"
    | "tahsilat"
    | "iade"
    | "satis"
    | "musteri_iade";
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  kasa_hedef_id?: string; // Transfer için hedef kasa
  cari_id?: string;
  kategori_id?: string;
  personel_id?: string;
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  kasa?: Kasa;
  kasa_hedef?: Kasa;
  cari?: Cari;
  kategori?: Kategori;
  personel?: Personel;
}

export type IslemType = Islem["type"];

// ==========================================
// İŞLEM KALEMLERİ (Kalemli Alış)
// ==========================================

export interface IslemKalemi {
  id: string;
  islem_id: string;
  urun_id?: string;
  urun_adi: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  kdv_rate: number;
  kategori_id?: string;
  created_at: string;
  // Joined
  urun?: Urun;
  kategori?: Kategori;
}

// ==========================================
// ÜRÜNLER
// ==========================================

export interface Urun {
  id: string;
  restaurant_id: string;
  name: string;
  kategori_id?: string;
  unit: string; // kg, adet, litre vb.
  default_price?: number;
  kdv_rate?: number; // KDV oranı: 0, 1, 10, 20
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  kategori?: Kategori;
}

// ==========================================
// PERSONEL
// ==========================================

export interface Personel {
  id: string;
  restaurant_id: string;
  name: string;
  phone?: string;
  position?: string;
  start_date?: string;
  salary?: number;
  balance: number;
  annual_leave_days: number;
  used_leave_days: number;
  include_in_reports: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonelIslem {
  id: string;
  restaurant_id: string;
  personel_id: string;
  type:
    | "maas"
    | "avans"
    | "prim"
    | "mesai"
    | "tazminat"
    | "komisyon"
    | "odeme"
    | "kesinti"
    | "diger"
    | "tahsilat";
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  personel?: Personel;
  kasa?: Kasa;
}

export type PersonelIslemType = PersonelIslem["type"];

// ==========================================
// İZİNLER
// ==========================================

export interface Izin {
  id: string;
  restaurant_id: string;
  personel_id: string;
  type: "yillik" | "hastalik" | "mazeret" | "ucretsiz";
  start_date: string;
  end_date: string;
  days: number;
  description?: string;
  created_at: string;
  // Joined
  personel?: Personel;
}

export type IzinType = Izin["type"];

// ==========================================
// TEKRARLAYAN ÖDEMELER
// ==========================================

export interface TekrarlayanOdeme {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  amount: number;
  kategori_id?: string;
  period:
    | "gunluk"
    | "haftalik"
    | "aylik"
    | "2aylik"
    | "3aylik"
    | "6aylik"
    | "yillik";
  start_date: string;
  end_date?: string;
  next_date: string;
  reminder_days: number;
  auto_create: boolean;
  is_active: boolean;
  kasa_id?: string;
  cari_id?: string;
  last_processed_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  kasa?: Kasa;
  cari?: Cari;
  kategori?: Kategori;
}

export type OdemePeriod = TekrarlayanOdeme["period"];

// ==========================================
// ÇEK / SENET
// ==========================================

export interface CekSenet {
  id: string;
  restaurant_id: string;
  type: "cek" | "senet";
  direction: "alacak" | "borc"; // alacak = alınan, borc = verilen
  amount: number;
  due_date: string;
  cari_id?: string;
  kasa_id?: string;
  bank_name?: string;
  document_no?: string; // Çek/Senet numarası
  status: "beklemede" | "tahsil_edildi" | "odendi" | "karsilıksiz" | "iptal";
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined
  cari?: Cari;
  kasa?: Kasa;
}

export type CekSenetType = CekSenet["type"];
export type CekSenetDirection = CekSenet["direction"];
export type CekSenetStatus = CekSenet["status"];

// ==========================================
// TAKSİTLER
// ==========================================

export interface Taksit {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  paid_count: number;
  remaining_amount: number;
  kasa_id?: string;
  kategori_id?: string;
  start_date: string;
  next_payment_date?: string;
  is_completed: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  kasa?: Kasa;
  kategori?: Kategori;
  odemeler?: TaksitOdemesi[];
}

export interface TaksitOdemesi {
  id: string;
  taksit_id: string;
  restaurant_id: string;
  installment_no: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  is_paid: boolean;
  islem_id?: string;
  created_at: string;
  // Joined
  taksit?: Taksit;
  islem?: Islem;
}

// ==========================================
// GÜNLÜK SATIŞ
// ==========================================

export interface GunlukSatis {
  id: string;
  restaurant_id: string;
  date: string;
  total_amount: number;
  cash_amount: number;
  card_amount: number;
  online_amount: number;
  customer_count?: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  detaylar?: GunlukSatisDetay[];
}

export interface GunlukSatisDetay {
  id: string;
  gunluk_satis_id: string;
  menu_item_id?: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Joined
  menu_item?: MenuItem;
}

// ==========================================
// MENÜ TANIMLARI
// ==========================================

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  category?: string; // ana yemek, tatlı, içecek vb. (opsiyonel)
  price: number;
  unit: string; // adet, porsiyon, kg, lt vb.
  is_active: boolean;
  include_in_invoice: boolean; // satış faturasında gösterilsin mi
  created_at: string;
  updated_at: string;
}

// Ürün Kategorileri (Dinamik)
export interface UrunKategorisi {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

// ==========================================
// SATIŞ KAYITLARI (Ürün Bazlı Takip)
// Bu modül gelir/gideri ETKİLEMEZ
// ==========================================

export interface SatisKaydi {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  date: string;
  quantity: number;
  unit_price: number;
  total_price: number; // quantity * unit_price (DB'de generated)
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  menu_item?: MenuItem;
}

export type CreateSatisKaydiInput = Omit<
  SatisKaydi,
  | "id"
  | "created_at"
  | "updated_at"
  | "created_by"
  | "total_price"
  | "menu_item"
>;
export type CreateMenuItemInput = Omit<
  MenuItem,
  "id" | "created_at" | "updated_at"
>;

// ==========================================
// ANIMSATICILAR (Tek Seferlik Hatırlatıcı)
// ==========================================

export interface Animsatici {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  amount?: number;
  due_date: string;
  reminder_time?: string;
  reminder_days_before: number;
  is_completed: boolean;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// ABONELİK / PLAN
// ==========================================

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan: "free" | "pro" | "premium";
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  // Limitler
  cari_limit: number;
  personel_limit: number;
  kasa_nakit_limit: number;
  kasa_banka_limit: number;
  kasa_kredi_limit: number;
  kasa_birikim_limit: number;
  kategori_limit: number;
  tekrarlayan_odeme_limit: number;
  restoran_limit: number;
  kullanici_limit: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// AKTİVİTE LOGU
// ==========================================

export interface ActivityLog {
  id: string;
  restaurant_id: string;
  user_id: string;
  action: "create" | "update" | "delete" | "archive";
  table_name: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  // Joined
  user?: Profile;
}

// ==========================================
// DASHBOARD / RAPOR TİPLERİ
// ==========================================

export interface DashboardSummary {
  totalGelir: number;
  totalGider: number;
  netKar: number;
  kasaBakiyeleri: {
    kasa: Kasa;
    bakiye: number;
  }[];
  tedarikciBorclari: number;
  musteriAlacaklari: number;
  personelBorclari: number;
  krediKartiBorcu: number;
  yaklasanOdemeler: TekrarlayanOdeme[];
  yaklasanTaksitler: TaksitOdemesi[];
  yaklasanCekSenetler: CekSenet[];
}

export interface RaporFiltre {
  startDate: string;
  endDate: string;
  kasaIds?: string[];
  cariIds?: string[];
  kategoriIds?: string[];
  islemTypes?: IslemType[];
}

// ==========================================
// FORM TİPLERİ (Opsiyonel - UI için)
// ==========================================

export type CreateKasaInput = Omit<
  Kasa,
  "id" | "created_at" | "updated_at" | "balance"
>;
export type CreateCariInput = Omit<
  Cari,
  "id" | "created_at" | "updated_at" | "balance"
>;
export type CreateIslemInput = Omit<
  Islem,
  "id" | "created_at" | "updated_at" | "created_by" | "restaurant_id"
>;
export type CreatePersonelInput = Omit<
  Personel,
  "id" | "created_at" | "updated_at" | "balance"
>;
export type CreateTekrarlayanOdemeInput = Omit<
  TekrarlayanOdeme,
  "id" | "created_at" | "updated_at"
>;
export type CreateCekSenetInput = Omit<
  CekSenet,
  "id" | "created_at" | "updated_at"
>;
export type CreateTaksitInput = Omit<
  Taksit,
  | "id"
  | "created_at"
  | "updated_at"
  | "paid_count"
  | "remaining_amount"
  | "is_completed"
>;
export type CreateGunlukSatisInput = Omit<
  GunlukSatis,
  "id" | "created_at" | "updated_at" | "created_by"
>;
export type CreateAnimsaticiInput = Omit<
  Animsatici,
  "id" | "created_at" | "updated_at" | "is_completed" | "completed_at"
>;
