/**
 * Ana Store - Tüm Slice'ları Birleştirir
 *
 * Bu dosya artık sadece slice'ları birleştiriyor.
 * Her modülün mantığı kendi slice dosyasında.
 */

import { create } from "zustand";
import {
  Profile,
  Subscription,
  Kasa,
  Cari,
  Kategori,
  Islem,
  Personel,
  PersonelIslem,
  Izin,
  TekrarlayanOdeme,
  CekSenet,
  Taksit,
  GunlukSatis,
  Animsatici,
  MenuItem,
  UrunKategorisi,
  Urun,
  SatisKaydi,
} from "../types";

// Services
import {
  profileService,
  kasaService,
  cariService,
  kategoriService,
  islemService,
  personelService,
  tekrarlayanOdemeService,
  cekSenetService,
  taksitService,
  gunlukSatisService,
  animsaticiService,
  menuItemService,
  urunService,
  satisKaydiService,
} from "../services/supabase";

import { supabase } from "../lib/supabase";

// ==========================================
// STATE INTERFACE
// ==========================================
interface AppState {
  // Profile
  profile: Profile | null;
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;

  // Subscription
  subscription: Subscription | null;
  loadingSubscription: boolean;
  fetchSubscription: () => Promise<void>;

  // Kasalar
  kasalar: Kasa[];
  loadingKasalar: boolean;
  fetchKasalar: () => Promise<void>;
  addKasa: (
    kasa: Omit<Kasa, "id" | "created_at" | "updated_at" | "balance">
  ) => Promise<{ error: any }>;
  updateKasa: (id: string, updates: Partial<Kasa>) => Promise<{ error: any }>;
  deleteKasa: (id: string) => Promise<{ error: any }>;

  // Cariler
  cariler: Cari[];
  loadingCariler: boolean;
  fetchCariler: () => Promise<void>;
  addCari: (
    cari: Omit<Cari, "id" | "created_at" | "updated_at" | "balance">
  ) => Promise<{ error: any }>;
  updateCari: (id: string, updates: Partial<Cari>) => Promise<{ error: any }>;
  deleteCari: (id: string) => Promise<{ error: any }>;

  // Kategoriler
  kategoriler: Kategori[];
  loadingKategoriler: boolean;
  fetchKategoriler: () => Promise<void>;
  addKategori: (
    kategori: Omit<Kategori, "id" | "created_at">
  ) => Promise<{ error: any }>;

  // İşlemler
  islemler: Islem[];
  loadingIslemler: boolean;
  fetchIslemler: (limit?: number) => Promise<void>;
  addIslem: (
    islem: Omit<
      Islem,
      "id" | "created_at" | "updated_at" | "created_by" | "restaurant_id"
    >
  ) => Promise<{ error: any }>;
  updateIslem: (id: string, updates: Partial<Islem>) => Promise<{ error: any }>;
  deleteIslem: (id: string) => Promise<{ error: any }>;

  // Personel
  personeller: Personel[];
  loadingPersoneller: boolean;
  fetchPersoneller: () => Promise<void>;
  addPersonel: (
    personel: Omit<Personel, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any; data: Personel | null }>;
  updatePersonel: (
    id: string,
    updates: Partial<Personel>
  ) => Promise<{ error: any }>;
  deletePersonel: (id: string) => Promise<{ error: any }>;

  // Personel İşlemleri
  personelIslemler: PersonelIslem[];
  loadingPersonelIslemler: boolean;
  fetchPersonelIslemler: () => Promise<void>;
  addPersonelIslem: (
    islem: Omit<PersonelIslem, "id" | "created_at" | "created_by">
  ) => Promise<{ error: any }>;

  // İzinler
  izinler: Izin[];
  loadingIzinler: boolean;
  fetchIzinler: () => Promise<void>;
  addIzin: (izin: Omit<Izin, "id" | "created_at">) => Promise<{ error: any }>;
  updateIzin: (id: string, updates: Partial<Izin>) => Promise<{ error: any }>;

  // Tekrarlayan Ödemeler
  tekrarlayanOdemeler: TekrarlayanOdeme[];
  loadingTekrarlayanOdemeler: boolean;
  fetchTekrarlayanOdemeler: () => Promise<void>;
  addTekrarlayanOdeme: (
    odeme: Omit<TekrarlayanOdeme, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateTekrarlayanOdeme: (
    id: string,
    updates: Partial<TekrarlayanOdeme>
  ) => Promise<{ error: any }>;
  deleteTekrarlayanOdeme: (id: string) => Promise<{ error: any }>;

  // Çek/Senet
  cekSenetler: CekSenet[];
  loadingCekSenetler: boolean;
  fetchCekSenetler: () => Promise<void>;
  addCekSenet: (
    cekSenet: Omit<CekSenet, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateCekSenet: (
    id: string,
    updates: Partial<CekSenet>
  ) => Promise<{ error: any }>;
  deleteCekSenet: (id: string) => Promise<{ error: any }>;

  // Taksitler
  taksitler: Taksit[];
  loadingTaksitler: boolean;
  fetchTaksitler: () => Promise<void>;
  addTaksit: (
    taksit: Omit<
      Taksit,
      | "id"
      | "created_at"
      | "updated_at"
      | "paid_count"
      | "remaining_amount"
      | "is_completed"
    >
  ) => Promise<{ error: any }>;
  updateTaksit: (
    id: string,
    updates: Partial<Taksit>
  ) => Promise<{ error: any }>;
  payTaksitOdemesi: (
    odemesiId: string,
    kasaId: string
  ) => Promise<{ error: any }>;

  // Günlük Satış
  gunlukSatislar: GunlukSatis[];
  loadingGunlukSatislar: boolean;
  fetchGunlukSatislar: () => Promise<void>;
  addGunlukSatis: (
    satis: Omit<GunlukSatis, "id" | "created_at" | "updated_at" | "created_by">
  ) => Promise<{ error: any }>;
  updateGunlukSatis: (
    id: string,
    updates: Partial<GunlukSatis>
  ) => Promise<{ error: any }>;

  // Anımsatıcılar
  animsaticilar: Animsatici[];
  loadingAnimsaticilar: boolean;
  fetchAnimsaticilar: () => Promise<void>;
  addAnimsatici: (
    animsatici: Omit<
      Animsatici,
      "id" | "created_at" | "updated_at" | "is_completed" | "completed_at"
    >
  ) => Promise<{ error: any }>;
  updateAnimsatici: (
    id: string,
    updates: Partial<Animsatici>
  ) => Promise<{ error: any }>;
  completeAnimsatici: (id: string) => Promise<{ error: any }>;

  // Menü Öğeleri
  menuItems: MenuItem[];
  loadingMenuItems: boolean;
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (
    item: Omit<
      MenuItem,
      "id" | "restaurant_id" | "created_at" | "updated_at"
    > & { category?: string }
  ) => Promise<{ error: any }>;
  updateMenuItem: (
    id: string,
    updates: Partial<MenuItem>
  ) => Promise<{ error: any }>;
  deleteMenuItem: (id: string) => Promise<{ error: any }>;

  // Ürün Kategorileri
  urunKategorileri: UrunKategorisi[];
  loadingUrunKategorileri: boolean;
  fetchUrunKategorileri: () => Promise<void>;
  addUrunKategorisi: (name: string) => Promise<{ error: any }>;
  deleteUrunKategorisi: (id: string) => Promise<{ error: any }>;

  // Satış Kayıtları
  satisKayitlari: SatisKaydi[];
  loadingSatisKayitlari: boolean;
  fetchSatisKayitlari: (limit?: number) => Promise<void>;
  addSatisKaydi: (
    kayit: Omit<
      SatisKaydi,
      | "id"
      | "restaurant_id"
      | "created_at"
      | "updated_at"
      | "created_by"
      | "total_price"
      | "menu_item"
    >
  ) => Promise<{ error: any }>;
  updateSatisKaydi: (
    id: string,
    updates: Partial<SatisKaydi>
  ) => Promise<{ error: any }>;
  deleteSatisKaydi: (id: string) => Promise<{ error: any }>;

  // Ürünler
  urunler: Urun[];
  loadingUrunler: boolean;
  fetchUrunler: () => Promise<void>;
  addUrun: (
    urun: Omit<Urun, "id" | "restaurant_id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateUrun: (id: string, updates: Partial<Urun>) => Promise<{ error: any }>;

  // Transfer
  transferBetweenKasalar: (
    fromKasaId: string,
    toKasaId: string,
    amount: number,
    description?: string
  ) => Promise<{ error: any }>;
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================
export const useStore = create<AppState>((set, get) => ({
  // ==========================================
  // PROFILE
  // ==========================================
  profile: null,
  loadingProfile: false,
  fetchProfile: async () => {
    set({ loadingProfile: true });
    const { data } = await profileService.fetchProfile();
    set({ profile: data, loadingProfile: false });
  },

  // ==========================================
  // SUBSCRIPTION
  // ==========================================
  subscription: null,
  loadingSubscription: false,
  fetchSubscription: async () => {
    set({ loadingSubscription: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await profileService.fetchSubscription(
        profile.restaurant_id
      );
      set({ subscription: data });
    }
    set({ loadingSubscription: false });
  },

  // ==========================================
  // KASALAR
  // ==========================================
  kasalar: [],
  loadingKasalar: false,
  fetchKasalar: async () => {
    set({ loadingKasalar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await kasaService.fetchAll(profile.restaurant_id);
      set({ kasalar: data });
    }
    set({ loadingKasalar: false });
  },

  addKasa: async (kasa) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await kasaService.create({
      ...kasa,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchKasalar();
    return { error };
  },

  updateKasa: async (id, updates) => {
    const { error } = await kasaService.update(id, updates);
    if (!error) get().fetchKasalar();
    return { error };
  },

  deleteKasa: async (id) => {
    const { error } = await kasaService.archive(id);
    if (!error) get().fetchKasalar();
    return { error };
  },

  // ==========================================
  // CARİLER
  // ==========================================
  cariler: [],
  loadingCariler: false,
  fetchCariler: async () => {
    set({ loadingCariler: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await cariService.fetchAll(profile.restaurant_id);
      set({ cariler: data });
    }
    set({ loadingCariler: false });
  },

  addCari: async (cari) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await cariService.create({
      ...cari,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchCariler();
    return { error };
  },

  updateCari: async (id, updates) => {
    const { error } = await cariService.update(id, updates);
    if (!error) get().fetchCariler();
    return { error };
  },

  deleteCari: async (id) => {
    const { error } = await cariService.archive(id);
    if (!error) get().fetchCariler();
    return { error };
  },

  // ==========================================
  // KATEGORİLER
  // ==========================================
  kategoriler: [],
  loadingKategoriler: false,
  fetchKategoriler: async () => {
    set({ loadingKategoriler: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await kategoriService.fetchAll(profile.restaurant_id);
      set({ kategoriler: data });
    }
    set({ loadingKategoriler: false });
  },

  addKategori: async (kategori) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await kategoriService.create({
      ...kategori,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchKategoriler();
    return { error };
  },

  // ==========================================
  // İŞLEMLER
  // ==========================================
  islemler: [],
  loadingIslemler: false,
  fetchIslemler: async (limit = 100) => {
    set({ loadingIslemler: true });
    const { profile, kasalar, cariler, kategoriler } = get();

    if (profile?.restaurant_id) {
      const { data } = await islemService.fetchAll(
        profile.restaurant_id,
        limit
      );

      const islemlerWithJoins = (data || []).map((islem: Islem) => ({
        ...islem,
        kasa: kasalar.find((k) => k.id === islem.kasa_id),
        kasa_hedef: kasalar.find((k) => k.id === islem.kasa_hedef_id),
        cari: cariler.find((c) => c.id === islem.cari_id),
        kategori: kategoriler.find((k) => k.id === islem.kategori_id),
      }));

      set({ islemler: islemlerWithJoins });
    }
    set({ loadingIslemler: false });
  },

  addIslem: async (islem) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await islemService.create({
      ...islem,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      // Kasa bakiyesi güncelle
      if (islem.kasa_id && islem.type !== "transfer") {
        let kasaMultiplier = 0;
        if (islem.type === "gelir" || islem.type === "tahsilat") {
          kasaMultiplier = 1;
        } else if (islem.type === "gider" || islem.type === "odeme") {
          kasaMultiplier = -1;
        }

        if (kasaMultiplier !== 0) {
          await kasaService.updateBalance(
            islem.kasa_id,
            islem.amount * kasaMultiplier
          );
        }
      }

      // Cari bakiyesi güncelle
      if (islem.cari_id) {
        const { type: cariType } = await cariService.getType(islem.cari_id);
        let cariMultiplier = 0;

        if (islem.type === "gider") cariMultiplier = 1;
        else if (islem.type === "satis") cariMultiplier = 1;
        else if (islem.type === "iade") cariMultiplier = -1;
        else if (islem.type === "musteri_iade") cariMultiplier = -1;
        else if (islem.type === "gelir") cariMultiplier = -1;
        else if (islem.type === "odeme")
          cariMultiplier = cariType === "tedarikci" ? -1 : 1;
        else if (islem.type === "tahsilat")
          cariMultiplier = cariType === "tedarikci" ? 1 : -1;

        if (cariMultiplier !== 0) {
          await cariService.updateBalance(
            islem.cari_id,
            islem.amount * cariMultiplier
          );
        }
      }

      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  updateIslem: async (id, updates) => {
    const { error } = await islemService.update(id, updates);
    if (!error) {
      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  deleteIslem: async (id) => {
    const { islemler } = get();
    const islem = islemler.find((i) => i.id === id);

    const { error } = await islemService.delete(id);

    if (!error && islem) {
      // Kasa bakiyesini geri al
      if (islem.kasa_id && islem.type !== "transfer") {
        let kasaMultiplier = 0;
        if (islem.type === "gelir" || islem.type === "tahsilat")
          kasaMultiplier = -1;
        else if (islem.type === "gider" || islem.type === "odeme")
          kasaMultiplier = 1;

        if (kasaMultiplier !== 0) {
          await kasaService.updateBalance(
            islem.kasa_id,
            islem.amount * kasaMultiplier
          );
        }
      }

      // Cari bakiyesini geri al
      if (islem.cari_id) {
        const { type: cariType } = await cariService.getType(islem.cari_id);
        let cariMultiplier = 0;

        if (islem.type === "gider") cariMultiplier = -1;
        else if (islem.type === "satis") cariMultiplier = -1;
        else if (islem.type === "iade") cariMultiplier = 1;
        else if (islem.type === "musteri_iade") cariMultiplier = 1;
        else if (islem.type === "gelir") cariMultiplier = 1;
        else if (islem.type === "odeme")
          cariMultiplier = cariType === "tedarikci" ? 1 : -1;
        else if (islem.type === "tahsilat")
          cariMultiplier = cariType === "tedarikci" ? -1 : 1;

        if (cariMultiplier !== 0) {
          await cariService.updateBalance(
            islem.cari_id,
            islem.amount * cariMultiplier
          );
        }
      }

      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  // ==========================================
  // PERSONEL
  // ==========================================
  personeller: [],
  loadingPersoneller: false,
  fetchPersoneller: async () => {
    set({ loadingPersoneller: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await personelService.fetchAll(profile.restaurant_id);
      set({ personeller: data });
    }
    set({ loadingPersoneller: false });
  },

  addPersonel: async (personel) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant", data: null };

    const { data, error } = await personelService.create({
      ...personel,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchPersoneller();
    return { error, data };
  },

  updatePersonel: async (id, updates) => {
    const { error } = await personelService.update(id, updates);
    if (!error) get().fetchPersoneller();
    return { error };
  },

  deletePersonel: async (id) => {
    const { error } = await personelService.archive(id);
    if (!error) get().fetchPersoneller();
    return { error };
  },

  // ==========================================
  // PERSONEL İŞLEMLERİ
  // ==========================================
  personelIslemler: [],
  loadingPersonelIslemler: false,
  fetchPersonelIslemler: async () => {
    set({ loadingPersonelIslemler: true });
    const { profile, personeller, kasalar } = get();
    if (profile?.restaurant_id) {
      const { data } = await personelService.fetchIslemler(
        profile.restaurant_id
      );

      const islemlerWithJoins = (data || []).map((islem: PersonelIslem) => ({
        ...islem,
        personel: personeller.find((p) => p.id === islem.personel_id),
        kasa: kasalar.find((k) => k.id === islem.kasa_id),
      }));

      set({ personelIslemler: islemlerWithJoins });
    }
    set({ loadingPersonelIslemler: false });
  },

  addPersonelIslem: async (islem) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await personelService.createIslem({
      ...islem,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      // Kasa - ödeme için çıkış
      if (islem.kasa_id && islem.type === "odeme") {
        await kasaService.updateBalance(islem.kasa_id, -islem.amount);
      }
      // Kasa - kesinti için giriş
      if (islem.kasa_id && islem.type === "kesinti") {
        await kasaService.updateBalance(islem.kasa_id, islem.amount);
      }

      // Personel bakiyesi
      let balanceChange = 0;
      if (
        ["maas", "prim", "mesai", "tazminat", "komisyon", "diger"].includes(
          islem.type
        )
      ) {
        balanceChange = islem.amount;
      } else if (islem.type === "avans") {
        balanceChange = -islem.amount;
      } else if (islem.type === "odeme" || islem.type === "kesinti") {
        balanceChange = -islem.amount;
      }

      if (balanceChange !== 0) {
        await personelService.updateBalance(islem.personel_id, balanceChange);
      }

      get().fetchPersonelIslemler();
      get().fetchKasalar();
      get().fetchPersoneller();
    }
    return { error };
  },

  // ==========================================
  // İZİNLER
  // ==========================================
  izinler: [],
  loadingIzinler: false,
  fetchIzinler: async () => {
    set({ loadingIzinler: true });
    const { profile, personeller } = get();
    if (profile?.restaurant_id) {
      const { data } = await personelService.fetchIzinler(
        profile.restaurant_id
      );

      const izinlerWithJoins = (data || []).map((izin: Izin) => ({
        ...izin,
        personel: personeller.find((p) => p.id === izin.personel_id),
      }));

      set({ izinler: izinlerWithJoins });
    }
    set({ loadingIzinler: false });
  },

  addIzin: async (izin) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await personelService.createIzin({
      ...izin,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) {
      if (izin.type === "yillik") {
        await personelService.updateUsedLeave(izin.personel_id, izin.days);
      }
      get().fetchIzinler();
      get().fetchPersoneller();
    }
    return { error };
  },

  updateIzin: async (id, updates) => {
    const { error } = await personelService.updateIzin(id, updates);
    if (!error) get().fetchIzinler();
    return { error };
  },

  // ==========================================
  // TEKRARLAYAN ÖDEMELER
  // ==========================================
  tekrarlayanOdemeler: [],
  loadingTekrarlayanOdemeler: false,
  fetchTekrarlayanOdemeler: async () => {
    set({ loadingTekrarlayanOdemeler: true });
    const { profile, kasalar, cariler, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data } = await tekrarlayanOdemeService.fetchAll(
        profile.restaurant_id
      );

      const odemelerWithJoins = (data || []).map((odeme: TekrarlayanOdeme) => ({
        ...odeme,
        kasa: kasalar.find((k) => k.id === odeme.kasa_id),
        cari: cariler.find((c) => c.id === odeme.cari_id),
        kategori: kategoriler.find((k) => k.id === odeme.kategori_id),
      }));

      set({ tekrarlayanOdemeler: odemelerWithJoins });
    }
    set({ loadingTekrarlayanOdemeler: false });
  },

  addTekrarlayanOdeme: async (odeme) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { error } = await tekrarlayanOdemeService.create({
      ...odeme,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) get().fetchTekrarlayanOdemeler();
    return { error };
  },

  updateTekrarlayanOdeme: async (id, updates) => {
    const { error } = await tekrarlayanOdemeService.update(id, updates);
    if (!error) get().fetchTekrarlayanOdemeler();
    return { error };
  },

  deleteTekrarlayanOdeme: async (id) => {
    const { error } = await tekrarlayanOdemeService.deactivate(id);
    if (!error) get().fetchTekrarlayanOdemeler();
    return { error };
  },

  // ==========================================
  // ÇEK / SENET
  // ==========================================
  cekSenetler: [],
  loadingCekSenetler: false,
  fetchCekSenetler: async () => {
    set({ loadingCekSenetler: true });
    const { profile, cariler, kasalar } = get();
    if (profile?.restaurant_id) {
      const { data } = await cekSenetService.fetchAll(profile.restaurant_id);

      const cekSenetlerWithJoins = (data || []).map((cs: CekSenet) => ({
        ...cs,
        cari: cariler.find((c) => c.id === cs.cari_id),
        kasa: kasalar.find((k) => k.id === cs.kasa_id),
      }));

      set({ cekSenetler: cekSenetlerWithJoins });
    }
    set({ loadingCekSenetler: false });
  },

  addCekSenet: async (cekSenet) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await cekSenetService.create({
      ...cekSenet,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchCekSenetler();
    return { error };
  },

  updateCekSenet: async (id, updates) => {
    const { cekSenetler } = get();
    const cekSenet = cekSenetler.find((cs) => cs.id === id);

    const { error } = await cekSenetService.update(id, updates);

    if (!error && cekSenet) {
      if (updates.status && updates.status !== cekSenet.status) {
        const kasaId = updates.kasa_id || cekSenet.kasa_id;

        if (kasaId) {
          if (
            updates.status === "tahsil_edildi" &&
            cekSenet.direction === "alacak"
          ) {
            await kasaService.updateBalance(kasaId, cekSenet.amount);
          } else if (
            updates.status === "odendi" &&
            cekSenet.direction === "borc"
          ) {
            await kasaService.updateBalance(kasaId, -cekSenet.amount);
          }
        }

        if (cekSenet.cari_id) {
          if (
            updates.status === "tahsil_edildi" &&
            cekSenet.direction === "alacak"
          ) {
            await cariService.updateBalance(cekSenet.cari_id, -cekSenet.amount);
          } else if (
            updates.status === "odendi" &&
            cekSenet.direction === "borc"
          ) {
            await cariService.updateBalance(cekSenet.cari_id, cekSenet.amount);
          }
        }
      }

      get().fetchCekSenetler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  deleteCekSenet: async (id) => {
    const { error } = await cekSenetService.delete(id);
    if (!error) get().fetchCekSenetler();
    return { error };
  },

  // ==========================================
  // TAKSİTLER
  // ==========================================
  taksitler: [],
  loadingTaksitler: false,
  fetchTaksitler: async () => {
    set({ loadingTaksitler: true });
    const { profile, kasalar, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data: taksitData } = await taksitService.fetchAll(
        profile.restaurant_id
      );

      const taksitlerWithJoins = await Promise.all(
        (taksitData || []).map(async (taksit: Taksit) => {
          const { data: odemeler } = await taksitService.fetchOdemeler(
            taksit.id
          );

          return {
            ...taksit,
            kasa: kasalar.find((k) => k.id === taksit.kasa_id),
            kategori: kategoriler.find((k) => k.id === taksit.kategori_id),
            odemeler: odemeler || [],
          };
        })
      );

      set({ taksitler: taksitlerWithJoins });
    }
    set({ loadingTaksitler: false });
  },

  addTaksit: async (taksit) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { data, error } = await taksitService.create({
      ...taksit,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error && data) {
      const odemeler: any[] = [];
      const startDate = new Date(taksit.start_date);

      for (let i = 0; i < taksit.installment_count; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        odemeler.push({
          taksit_id: data.id,
          restaurant_id: profile.restaurant_id,
          installment_no: i + 1,
          amount: taksit.installment_amount,
          due_date: dueDate.toISOString().split("T")[0],
          is_paid: false,
        });
      }

      await taksitService.createOdemeler(odemeler);

      await get().addIslem({
        type: "gider",
        amount: taksit.total_amount,
        description: `Taksitli alım: ${taksit.title}`,
        date: taksit.start_date,
        kategori_id: taksit.kategori_id,
      });

      get().fetchTaksitler();
    }
    return { error };
  },

  updateTaksit: async (id, updates) => {
    const { error } = await taksitService.update(id, updates);
    if (!error) get().fetchTaksitler();
    return { error };
  },

  payTaksitOdemesi: async (odemesiId, kasaId) => {
    const { taksitler } = get();

    let odeme: any;
    let taksit: Taksit | undefined;

    for (const t of taksitler) {
      const found = t.odemeler?.find((o: any) => o.id === odemesiId);
      if (found) {
        odeme = found;
        taksit = t;
        break;
      }
    }

    if (!odeme || !taksit) return { error: "Ödeme bulunamadı" };

    const { error } = await taksitService.payOdeme(odemesiId);

    if (!error) {
      await kasaService.updateBalance(kasaId, -odeme.amount);

      const newPaidCount = taksit.paid_count + 1;
      const newRemainingAmount = taksit.remaining_amount - odeme.amount;
      const isCompleted = newPaidCount >= taksit.installment_count;

      const nextOdeme = taksit.odemeler?.find(
        (o: any) => !o.is_paid && o.id !== odemesiId
      );

      await taksitService.update(taksit.id, {
        paid_count: newPaidCount,
        remaining_amount: newRemainingAmount,
        is_completed: isCompleted,
        next_payment_date: nextOdeme?.due_date,
      });

      get().fetchTaksitler();
      get().fetchKasalar();
    }
    return { error };
  },

  // ==========================================
  // GÜNLÜK SATIŞ
  // ==========================================
  gunlukSatislar: [],
  loadingGunlukSatislar: false,
  fetchGunlukSatislar: async () => {
    set({ loadingGunlukSatislar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await gunlukSatisService.fetchAll(profile.restaurant_id);
      set({ gunlukSatislar: data });
    }
    set({ loadingGunlukSatislar: false });
  },

  addGunlukSatis: async (satis) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await gunlukSatisService.create({
      ...satis,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) get().fetchGunlukSatislar();
    return { error };
  },

  updateGunlukSatis: async (id, updates) => {
    const { gunlukSatislar } = get();
    const current = gunlukSatislar.find((s) => s.id === id);

    const { error } = await gunlukSatisService.update(id, updates, current);
    if (!error) get().fetchGunlukSatislar();
    return { error };
  },

  // ==========================================
  // ANIMSATICILAR
  // ==========================================
  animsaticilar: [],
  loadingAnimsaticilar: false,
  fetchAnimsaticilar: async () => {
    set({ loadingAnimsaticilar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await animsaticiService.fetchAll(profile.restaurant_id);
      set({ animsaticilar: data });
    }
    set({ loadingAnimsaticilar: false });
  },

  addAnimsatici: async (animsatici) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { error } = await animsaticiService.create({
      ...animsatici,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) get().fetchAnimsaticilar();
    return { error };
  },

  updateAnimsatici: async (id, updates) => {
    const { error } = await animsaticiService.update(id, updates);
    if (!error) get().fetchAnimsaticilar();
    return { error };
  },

  completeAnimsatici: async (id) => {
    const { error } = await animsaticiService.complete(id);
    if (!error) get().fetchAnimsaticilar();
    return { error };
  },

  // ==========================================
  // MENÜ ÖĞELERİ
  // ==========================================
  menuItems: [],
  loadingMenuItems: false,
  fetchMenuItems: async () => {
    set({ loadingMenuItems: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await menuItemService.fetchAll(profile.restaurant_id);
      set({ menuItems: data });
    }
    set({ loadingMenuItems: false });
  },

  addMenuItem: async (item) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await menuItemService.create({
      ...item,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchMenuItems();
    return { error };
  },

  updateMenuItem: async (id, updates) => {
    const { error } = await menuItemService.update(id, updates);
    if (!error) get().fetchMenuItems();
    return { error };
  },

  deleteMenuItem: async (id) => {
    const { error } = await menuItemService.delete(id);
    if (!error) get().fetchMenuItems();
    return { error };
  },

  // ==========================================
  // ÜRÜN KATEGORİLERİ
  // ==========================================
  urunKategorileri: [],
  loadingUrunKategorileri: false,
  fetchUrunKategorileri: async () => {
    set({ loadingUrunKategorileri: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await menuItemService.fetchKategoriler(
        profile.restaurant_id
      );
      set({ urunKategorileri: data });
    }
    set({ loadingUrunKategorileri: false });
  },

  addUrunKategorisi: async (name) => {
    const { profile, urunKategorileri } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const maxOrder = urunKategorileri.reduce(
      (max, k) => Math.max(max, k.sort_order || 0),
      0
    );

    const { error } = await menuItemService.createKategori(
      profile.restaurant_id,
      name,
      maxOrder + 1
    );

    if (!error) get().fetchUrunKategorileri();
    return { error };
  },

  deleteUrunKategorisi: async (id) => {
    const { error } = await menuItemService.deleteKategori(id);
    if (!error) get().fetchUrunKategorileri();
    return { error };
  },

  // ==========================================
  // SATIŞ KAYITLARI
  // ==========================================
  satisKayitlari: [],
  loadingSatisKayitlari: false,
  fetchSatisKayitlari: async (limit = 500) => {
    set({ loadingSatisKayitlari: true });
    const { profile, menuItems } = get();
    if (profile?.restaurant_id) {
      const { data } = await satisKaydiService.fetchAll(
        profile.restaurant_id,
        limit
      );

      const kayitlarWithJoins = (data || []).map((kayit: SatisKaydi) => ({
        ...kayit,
        menu_item: menuItems.find((m) => m.id === kayit.menu_item_id),
      }));

      set({ satisKayitlari: kayitlarWithJoins });
    }
    set({ loadingSatisKayitlari: false });
  },

  addSatisKaydi: async (kayit) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { error } = await satisKaydiService.create({
      ...kayit,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) get().fetchSatisKayitlari();
    return { error };
  },

  updateSatisKaydi: async (id, updates) => {
    const { error } = await satisKaydiService.update(id, updates);
    if (!error) get().fetchSatisKayitlari();
    return { error };
  },

  deleteSatisKaydi: async (id) => {
    const { error } = await satisKaydiService.delete(id);
    if (!error) get().fetchSatisKayitlari();
    return { error };
  },

  // ==========================================
  // ÜRÜNLER
  // ==========================================
  urunler: [],
  loadingUrunler: false,
  fetchUrunler: async () => {
    set({ loadingUrunler: true });
    const { profile, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data } = await urunService.fetchAll(profile.restaurant_id);

      const urunlerWithJoins = (data || []).map((urun: Urun) => ({
        ...urun,
        kategori: kategoriler.find((k) => k.id === urun.kategori_id),
      }));

      set({ urunler: urunlerWithJoins });
    }
    set({ loadingUrunler: false });
  },

  addUrun: async (urun) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await urunService.create({
      ...urun,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) get().fetchUrunler();
    return { error };
  },

  updateUrun: async (id, updates) => {
    const { error } = await urunService.update(id, updates);
    if (!error) get().fetchUrunler();
    return { error };
  },

  // ==========================================
  // KASALAR ARASI TRANSFER
  // ==========================================
  transferBetweenKasalar: async (fromKasaId, toKasaId, amount, description) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await supabase.from("islemler").insert({
      type: "transfer",
      amount,
      description: description || "Kasalar arası transfer",
      date: new Date().toISOString().split("T")[0],
      kasa_id: fromKasaId,
      kasa_hedef_id: toKasaId,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      await kasaService.updateBalance(fromKasaId, -amount);
      await kasaService.updateBalance(toKasaId, amount);
      get().fetchKasalar();
      get().fetchIslemler();
    }
    return { error };
  },
}));
