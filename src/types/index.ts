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
  role: 'admin' | 'muhasebeci' | 'satin_almaci' | 'kasiyer';
  restaurant_id: string;
  plan: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface Kasa {
  id: string;
  restaurant_id: string;
  name: string;
  type: 'nakit' | 'banka' | 'kredi_karti' | 'birikim';
  currency: 'TRY' | 'USD' | 'EUR';
  balance: number;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cari {
  id: string;
  restaurant_id: string;
  name: string;
  type: 'tedarikci' | 'musteri';
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

export interface Kategori {
  id: string;
  restaurant_id: string;
  name: string;
  parent_id?: string;
  type: 'gelir' | 'gider';
  is_default: boolean;
  created_at: string;
}

export interface Islem {
  id: string;
  restaurant_id: string;
  type: 'gelir' | 'gider' | 'transfer' | 'odeme' | 'tahsilat';
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  kasa_hedef_id?: string;
  cari_id?: string;
  kategori_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  kasa?: Kasa;
  cari?: Cari;
  kategori?: Kategori;
}

export type KasaType = Kasa['type'];
export type CariType = Cari['type'];
export type IslemType = Islem['type'];

// Personel
export interface Personel {
  id: string;
  restaurant_id: string;
  name: string;
  phone?: string;
  position?: string;
  salary?: number;
  start_date?: string;
  balance?: number;
  annual_leave_days?: number;
  used_leave_days?: number;
  include_in_reports?: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonelIslem {
  id: string;
  restaurant_id: string;
  personel_id: string;
  type: 'maas' | 'avans' | 'prim' | 'kesinti';
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  created_by: string;
  created_at: string;
  // Joined
  personel?: Personel;
  kasa?: Kasa;
}

export interface Izin {
  id: string;
  restaurant_id: string;
  personel_id: string;
  type: 'yillik' | 'hastalik' | 'mazeret' | 'ucretsiz';
  start_date: string;
  end_date: string;
  description?: string;
  status: 'beklemede' | 'onaylandi' | 'reddedildi';
  created_at: string;
  // Joined
  personel?: Personel;
}

export type IzinType = Izin['type'];
export type IzinStatus = Izin['status'];
export type PersonelIslemType = PersonelIslem['type'];

// Tekrarlayan Ödemeler
export interface TekrarlayanOdeme {
  id: string;
  restaurant_id: string;
  name: string;
  amount: number;
  frequency: 'gunluk' | 'haftalik' | 'aylik' | 'yillik';
  next_date: string;
  kasa_id?: string;
  cari_id?: string;
  kategori_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  kasa?: Kasa;
  cari?: Cari;
  kategori?: Kategori;
}

export type OdemeFrequency = TekrarlayanOdeme['frequency'];

// Çek/Senet
export interface CekSenet {
  id: string;
  restaurant_id: string;
  type: 'cek' | 'senet';
  direction: 'alacak' | 'borc';
  amount: number;
  due_date: string;
  cari_id?: string;
  bank_name?: string;
  serial_number?: string;
  status: 'beklemede' | 'tahsil_edildi' | 'odendi' | 'karsilıksiz' | 'iptal';
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined
  cari?: Cari;
}

export type CekSenetType = CekSenet['type'];
export type CekSenetDirection = CekSenet['direction'];
export type CekSenetStatus = CekSenet['status'];

// Günlük Satış
export interface GunlukSatis {
  id: string;
  restaurant_id: string;
  date: string;
  nakit_satis: number;
  kredi_karti_satis: number;
  yemeksepeti: number;
  getir: number;
  trendyol: number;
  diger_online: number;
  toplam: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
