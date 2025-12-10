import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  Kasa,
  Cari,
  Kategori,
  Islem,
  Profile,
  Personel,
  PersonelIslem,
  Izin,
  TekrarlayanOdeme,
  CekSenet,
  GunlukSatis,
  Taksit,
  TaksitOdemesi,
  Animsatici,
  MenuItem,
  Urun,
  Subscription,
  SatisKaydi,
} from "../types";

interface AppState {
  // Profile
  profile: Profile | null;
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;

  // Subscription (Plan Limitleri)
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
    item: Omit<MenuItem, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateMenuItem: (
    id: string,
    updates: Partial<MenuItem>
  ) => Promise<{ error: any }>;
  deleteMenuItem: (id: string) => Promise<{ error: any }>;

  // Satış Kayıtları (Ürün Bazlı Takip - Gelir/Gideri Etkilemez)
  satisKayitlari: SatisKaydi[];
  loadingSatisKayitlari: boolean;
  fetchSatisKayitlari: (limit?: number) => Promise<void>;
  addSatisKaydi: (
    kayit: Omit<
      SatisKaydi,
      | "id"
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
    urun: Omit<Urun, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateUrun: (id: string, updates: Partial<Urun>) => Promise<{ error: any }>;

  // Kasalar Arası Transfer
  transferBetweenKasalar: (
    fromKasaId: string,
    toKasaId: string,
    amount: number,
    description?: string
  ) => Promise<{ error: any }>;
}

export const useStore = create<AppState>((set, get) => ({
  // ==========================================
  // PROFILE
  // ==========================================
  profile: null,
  loadingProfile: false,
  fetchProfile: async () => {
    set({ loadingProfile: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      set({ profile: data });
    }
    set({ loadingProfile: false });
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
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .single();
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
      const { data } = await supabase
        .from("kasalar")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("is_archived", false)
        .order("created_at", { ascending: true });
      set({ kasalar: data || [] });
    }
    set({ loadingKasalar: false });
  },
  addKasa: async (kasa) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await supabase
      .from("kasalar")
      .insert({ ...kasa, restaurant_id: profile.restaurant_id, balance: 0 });

    if (!error) {
      get().fetchKasalar();
    }
    return { error };
  },
  updateKasa: async (id, updates) => {
    const { error } = await supabase
      .from("kasalar")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchKasalar();
    }
    return { error };
  },
  deleteKasa: async (id) => {
    // Soft delete - arşive al
    const { error } = await supabase
      .from("kasalar")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchKasalar();
    }
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
      const { data } = await supabase
        .from("cariler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("is_archived", false)
        .order("name", { ascending: true });
      set({ cariler: data || [] });
    }
    set({ loadingCariler: false });
  },
  addCari: async (cari) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await supabase.from("cariler").insert({
      ...cari,
      restaurant_id: profile.restaurant_id,
      balance: cari.initial_balance || 0,
    });

    if (!error) {
      get().fetchCariler();
    }
    return { error };
  },
  updateCari: async (id, updates) => {
    const { error } = await supabase
      .from("cariler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchCariler();
    }
    return { error };
  },
  deleteCari: async (id) => {
    const { error } = await supabase
      .from("cariler")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchCariler();
    }
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
      const { data } = await supabase
        .from("kategoriler")
        .select("*")
        .or(`restaurant_id.eq.${profile.restaurant_id},is_default.eq.true`)
        .order("name", { ascending: true });
      set({ kategoriler: data || [] });
    }
    set({ loadingKategoriler: false });
  },
  addKategori: async (kategori) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await supabase.from("kategoriler").insert({
      ...kategori,
      restaurant_id: profile.restaurant_id,
      is_default: false,
    });

    if (!error) {
      get().fetchKategoriler();
    }
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
      const { data, error } = await supabase
        .from("islemler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.log("fetchIslemler error:", error);
      }

      // Manually join data
      const islemlerWithJoins = (data || []).map((islem) => ({
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No user" };

    const { error } = await supabase.from("islemler").insert({
      ...islem,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      // Update kasa balance - SADECE kasa_id varsa
      // gelir, tahsilat: kasaya para girer (+)
      // gider, odeme: kasadan para çıkar (-)
      // iade, satis, musteri_iade: kasa değişmez
      if (islem.kasa_id && islem.type !== "transfer") {
        let kasaMultiplier = 0;
        if (islem.type === "gelir" || islem.type === "tahsilat") {
          kasaMultiplier = 1; // Kasaya para girer
        } else if (islem.type === "gider" || islem.type === "odeme") {
          kasaMultiplier = -1; // Kasadan para çıkar
        }
        // iade, satis, musteri_iade için kasa değişmez (multiplier = 0)

        if (kasaMultiplier !== 0) {
          await supabase.rpc("update_kasa_balance", {
            kasa_id: islem.kasa_id,
            amount: islem.amount * kasaMultiplier,
          });
        }
      }

      // Update cari balance if applicable
      // TEDARİKÇİ İŞLEMLERİ:
      // - gider (alış): tedarikçiye borcumuz artar (+)
      // - iade (tedarikçi iadesi): tedarikçiye borcumuz azalır (-)
      // - odeme: tedarikçiye ödeme yaptık, borcumuz azalır (-)
      // - tahsilat: tedarikçiden para aldık (borç verdik), borcumuz artar (+)
      //
      // MÜŞTERİ İŞLEMLERİ:
      // - satis: müşteriye sattık, müşteri borcu artar (+)
      // - musteri_iade: müşteri iade etti, müşteri borcu azalır (-)
      // - odeme: müşteriye para verdik (avans vb), müşteri borcu artar (+)
      // - tahsilat: müşteriden tahsilat aldık, müşteri borcu azalır (-)
      if (islem.cari_id) {
        // Cari tipini al
        const { data: cariData } = await supabase
          .from("cariler")
          .select("type")
          .eq("id", islem.cari_id)
          .single();

        const cariType = cariData?.type;
        let cariMultiplier = 0;

        // Borcu artıran işlemler
        if (islem.type === "gider") {
          cariMultiplier = 1; // Alış yaptık, tedarikçiye borcumuz arttı
        } else if (islem.type === "satis") {
          cariMultiplier = 1; // Satış yaptık, müşteri borcu arttı
        }
        // Borcu azaltan işlemler
        else if (islem.type === "iade") {
          cariMultiplier = -1; // Tedarikçi iadesi, borcumuz azaldı
        } else if (islem.type === "musteri_iade") {
          cariMultiplier = -1; // Müşteri iadesi, müşteri borcu azaldı
        } else if (islem.type === "gelir") {
          cariMultiplier = -1; // Gelir aldık, borç azaldı
        }
        // Ödeme ve tahsilat - cari tipine göre farklı davranır
        else if (islem.type === "odeme") {
          // Tedarikçiye ödeme: borcumuz azalır
          // Müşteriye ödeme: müşteri borcu artar (avans verdik)
          cariMultiplier = cariType === "tedarikci" ? -1 : 1;
        } else if (islem.type === "tahsilat") {
          // Tedarikçiden tahsilat: borcumuz artar (ona borç verdik)
          // Müşteriden tahsilat: müşteri borcu azalır
          cariMultiplier = cariType === "tedarikci" ? 1 : -1;
        }

        if (cariMultiplier !== 0) {
          await supabase.rpc("update_cari_balance", {
            cari_id: islem.cari_id,
            amount: islem.amount * cariMultiplier,
          });
        }
      }

      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },
  updateIslem: async (id, updates) => {
    const { error } = await supabase
      .from("islemler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },
  deleteIslem: async (id) => {
    // Önce işlemi al, kasa/cari bakiyelerini geri almak için
    const { islemler } = get();
    const islem = islemler.find((i) => i.id === id);

    const { error } = await supabase.from("islemler").delete().eq("id", id);

    if (!error && islem) {
      // Kasa bakiyesini geri al - SADECE kasa_id varsa
      // Silme işleminde tam tersi yapılır
      if (islem.kasa_id && islem.type !== "transfer") {
        let kasaMultiplier = 0;
        if (islem.type === "gelir" || islem.type === "tahsilat") {
          kasaMultiplier = -1; // Kasaya giren para geri alınır
        } else if (islem.type === "gider" || islem.type === "odeme") {
          kasaMultiplier = 1; // Kasadan çıkan para geri alınır
        }

        if (kasaMultiplier !== 0) {
          await supabase.rpc("update_kasa_balance", {
            kasa_id: islem.kasa_id,
            amount: islem.amount * kasaMultiplier,
          });
        }
      }

      // Cari bakiyesini geri al
      // Silme işleminde tam tersi yapılır
      if (islem.cari_id) {
        // Cari tipini al
        const { data: cariData } = await supabase
          .from("cariler")
          .select("type")
          .eq("id", islem.cari_id)
          .single();

        const cariType = cariData?.type;
        let cariMultiplier = 0;

        // Borcu artırmış olan işlemler silindi → borç azalır
        if (islem.type === "gider") {
          cariMultiplier = -1; // Alış silindi, borcumuz azaldı
        } else if (islem.type === "satis") {
          cariMultiplier = -1; // Satış silindi, müşteri borcu azaldı
        }
        // Borcu azaltmış olan işlemler silindi → borç artar
        else if (islem.type === "iade") {
          cariMultiplier = 1; // Tedarikçi iadesi silindi, borcumuz tekrar arttı
        } else if (islem.type === "musteri_iade") {
          cariMultiplier = 1; // Müşteri iadesi silindi, müşteri borcu tekrar arttı
        } else if (islem.type === "gelir") {
          cariMultiplier = 1; // Gelir silindi, borç tekrar arttı
        }
        // Ödeme ve tahsilat - cari tipine göre farklı davranır (silmede tersi)
        else if (islem.type === "odeme") {
          // Tedarikçiye ödeme silindi: borcumuz tekrar arttı
          // Müşteriye ödeme silindi: müşteri borcu azaldı
          cariMultiplier = cariType === "tedarikci" ? 1 : -1;
        } else if (islem.type === "tahsilat") {
          // Tedarikçiden tahsilat silindi: borcumuz azaldı
          // Müşteriden tahsilat silindi: müşteri borcu tekrar arttı
          cariMultiplier = cariType === "tedarikci" ? -1 : 1;
        }

        if (cariMultiplier !== 0) {
          await supabase.rpc("update_cari_balance", {
            cari_id: islem.cari_id,
            amount: islem.amount * cariMultiplier,
          });
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
      const { data } = await supabase
        .from("personel")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("is_archived", false)
        .order("name", { ascending: true });
      set({ personeller: data || [] });
    }
    set({ loadingPersoneller: false });
  },
  addPersonel: async (personel) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant", data: null };

    const { data, error } = await supabase
      .from("personel")
      .insert({
        ...personel,
        restaurant_id: profile.restaurant_id,
        balance: 0,
        annual_leave_days: personel.annual_leave_days || 0,
        used_leave_days: 0,
      })
      .select()
      .single();

    if (!error) {
      get().fetchPersoneller();
    }
    return { error, data };
  },
  updatePersonel: async (id, updates) => {
    const { error } = await supabase
      .from("personel")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchPersoneller();
    }
    return { error };
  },
  deletePersonel: async (id) => {
    const { error } = await supabase
      .from("personel")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchPersoneller();
    }
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
      const { data } = await supabase
        .from("personel_islemler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("date", { ascending: false })
        .limit(100);

      const islemlerWithJoins = (data || []).map((islem) => ({
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No user" };

    const { error } = await supabase.from("personel_islemler").insert({
      ...islem,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      // Personel Gideri (maas, mesai, prim, tazminat, komisyon, diger):
      // - Kasadan para ÇIKMIYOR (sadece borç kaydı)
      // - Personel bakiyesi ARTIYOR (biz personele borçlanıyoruz)

      // Ödeme:
      // - Kasadan para ÇIKIYOR
      // - Personel bakiyesi AZALIYOR (borcumuzu ödüyoruz)

      // Tahsilat (kesinti):
      // - Kasaya para GİRİYOR
      // - Personel bakiyesi AZALIYOR (personelden tahsilat yapıyoruz)

      // Kasadan çıkış SADECE ödeme için
      if (islem.kasa_id && islem.type === "odeme") {
        await supabase.rpc("update_kasa_balance", {
          kasa_id: islem.kasa_id,
          amount: -islem.amount,
        });
      }

      // Kasaya giriş SADECE tahsilat/kesinti için
      if (islem.kasa_id && islem.type === "kesinti") {
        await supabase.rpc("update_kasa_balance", {
          kasa_id: islem.kasa_id,
          amount: islem.amount,
        });
      }

      // Personel bakiyesini güncelle
      let balanceChange = 0;
      if (
        ["maas", "prim", "mesai", "tazminat", "komisyon", "diger"].includes(
          islem.type
        )
      ) {
        balanceChange = islem.amount; // Biz borçlandık (pozitif = biz borçluyuz)
      } else if (islem.type === "avans") {
        balanceChange = -islem.amount; // Personel bize borçlandı (negatif = personel borçlu)
      } else if (islem.type === "odeme") {
        balanceChange = -islem.amount; // Borcumuzu ödedik
      } else if (islem.type === "kesinti") {
        balanceChange = -islem.amount; // Personelden tahsilat
      }

      if (balanceChange !== 0) {
        await supabase.rpc("update_personel_balance", {
          personel_id: islem.personel_id,
          amount: balanceChange,
        });
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
      const { data } = await supabase
        .from("izinler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("start_date", { ascending: false })
        .limit(100);

      const izinlerWithJoins = (data || []).map((izin) => ({
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

    const { error } = await supabase
      .from("izinler")
      .insert({ ...izin, restaurant_id: profile.restaurant_id });

    if (!error) {
      // Yıllık izin ise kullanılan günleri güncelle
      if (izin.type === "yillik") {
        await supabase.rpc("update_personel_used_leave", {
          personel_id: izin.personel_id,
          days: izin.days,
        });
      }
      get().fetchIzinler();
      get().fetchPersoneller();
    }
    return { error };
  },
  updateIzin: async (id, updates) => {
    const { error } = await supabase
      .from("izinler")
      .update(updates)
      .eq("id", id);

    if (!error) {
      get().fetchIzinler();
    }
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
      const { data } = await supabase
        .from("tekrarlayan_odemeler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("is_active", true)
        .order("next_date", { ascending: true });

      const odemelerWithJoins = (data || []).map((odeme) => ({
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("tekrarlayan_odemeler").insert({
      ...odeme,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },
  updateTekrarlayanOdeme: async (id, updates) => {
    const { error } = await supabase
      .from("tekrarlayan_odemeler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },
  deleteTekrarlayanOdeme: async (id) => {
    const { error } = await supabase
      .from("tekrarlayan_odemeler")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
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
      const { data } = await supabase
        .from("cek_senet")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("due_date", { ascending: true });

      const cekSenetlerWithJoins = (data || []).map((cs) => ({
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

    const { error } = await supabase
      .from("cek_senet")
      .insert({ ...cekSenet, restaurant_id: profile.restaurant_id });

    if (!error) {
      get().fetchCekSenetler();
    }
    return { error };
  },
  updateCekSenet: async (id, updates) => {
    const { cekSenetler } = get();
    const cekSenet = cekSenetler.find((cs) => cs.id === id);

    const { error } = await supabase
      .from("cek_senet")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error && cekSenet) {
      // Durum değişikliğinde kasa etkisi
      if (updates.status && updates.status !== cekSenet.status) {
        const kasaId = updates.kasa_id || cekSenet.kasa_id;

        if (kasaId) {
          // Tahsil edildi (alınan çek/senet) -> Kasaya giriş
          if (
            updates.status === "tahsil_edildi" &&
            cekSenet.direction === "alacak"
          ) {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: kasaId,
              amount: cekSenet.amount,
            });
          }
          // Ödendi (verilen çek/senet) -> Kasadan çıkış
          else if (
            updates.status === "odendi" &&
            cekSenet.direction === "borc"
          ) {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: kasaId,
              amount: -cekSenet.amount,
            });
          }
        }

        // Cari bakiyesini güncelle
        if (cekSenet.cari_id) {
          if (
            updates.status === "tahsil_edildi" &&
            cekSenet.direction === "alacak"
          ) {
            await supabase.rpc("update_cari_balance", {
              cari_id: cekSenet.cari_id,
              amount: -cekSenet.amount,
            });
          } else if (
            updates.status === "odendi" &&
            cekSenet.direction === "borc"
          ) {
            await supabase.rpc("update_cari_balance", {
              cari_id: cekSenet.cari_id,
              amount: cekSenet.amount,
            });
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
    const { error } = await supabase.from("cek_senet").delete().eq("id", id);

    if (!error) {
      get().fetchCekSenetler();
    }
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
      const { data: taksitData } = await supabase
        .from("taksitler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("next_payment_date", { ascending: true });

      // Her taksit için ödemeleri çek
      const taksitlerWithJoins = await Promise.all(
        (taksitData || []).map(async (taksit) => {
          const { data: odemeler } = await supabase
            .from("taksit_odemeleri")
            .select("*")
            .eq("taksit_id", taksit.id)
            .order("installment_no", { ascending: true });

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Taksiti ekle
    const { data, error } = await supabase
      .from("taksitler")
      .insert({
        ...taksit,
        restaurant_id: profile.restaurant_id,
        paid_count: 0,
        remaining_amount: taksit.total_amount,
        is_completed: false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (!error && data) {
      // Taksit ödemelerini oluştur
      const odemeler = [];
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

      await supabase.from("taksit_odemeleri").insert(odemeler);

      // İlk gider kaydını oluştur (toplam tutar)
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
    const { error } = await supabase
      .from("taksitler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchTaksitler();
    }
    return { error };
  },
  payTaksitOdemesi: async (odemesiId, kasaId) => {
    const { profile, taksitler } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    // Ödeme bilgisini bul
    let odeme: TaksitOdemesi | undefined;
    let taksit: Taksit | undefined;

    for (const t of taksitler) {
      const found = t.odemeler?.find((o) => o.id === odemesiId);
      if (found) {
        odeme = found;
        taksit = t;
        break;
      }
    }

    if (!odeme || !taksit) return { error: "Ödeme bulunamadı" };

    // Ödemeyi işaretle
    const { error } = await supabase
      .from("taksit_odemeleri")
      .update({
        is_paid: true,
        paid_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", odemesiId);

    if (!error) {
      // Kasadan çıkış yap
      await supabase.rpc("update_kasa_balance", {
        kasa_id: kasaId,
        amount: -odeme.amount,
      });

      // Taksiti güncelle
      const newPaidCount = taksit.paid_count + 1;
      const newRemainingAmount = taksit.remaining_amount - odeme.amount;
      const isCompleted = newPaidCount >= taksit.installment_count;

      // Bir sonraki ödeme tarihini bul
      const nextOdeme = taksit.odemeler?.find(
        (o) => !o.is_paid && o.id !== odemesiId
      );

      await supabase
        .from("taksitler")
        .update({
          paid_count: newPaidCount,
          remaining_amount: newRemainingAmount,
          is_completed: isCompleted,
          next_payment_date: nextOdeme?.due_date || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taksit.id);

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
      const { data } = await supabase
        .from("gunluk_satis")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("date", { ascending: false })
        .limit(30);

      set({ gunlukSatislar: data || [] });
    }
    set({ loadingGunlukSatislar: false });
  },
  addGunlukSatis: async (satis) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No user" };

    const total_amount =
      (satis.cash_amount || 0) +
      (satis.card_amount || 0) +
      (satis.online_amount || 0);

    const { error } = await supabase.from("gunluk_satis").insert({
      ...satis,
      total_amount,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      get().fetchGunlukSatislar();
    }
    return { error };
  },
  updateGunlukSatis: async (id, updates) => {
    let total_amount;
    if (
      updates.cash_amount !== undefined ||
      updates.card_amount !== undefined ||
      updates.online_amount !== undefined
    ) {
      const { gunlukSatislar } = get();
      const current = gunlukSatislar.find((s) => s.id === id);
      if (current) {
        total_amount =
          (updates.cash_amount ?? current.cash_amount) +
          (updates.card_amount ?? current.card_amount) +
          (updates.online_amount ?? current.online_amount);
      }
    }

    const { error } = await supabase
      .from("gunluk_satis")
      .update({
        ...updates,
        ...(total_amount !== undefined && { total_amount }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      get().fetchGunlukSatislar();
    }
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
      const { data } = await supabase
        .from("animsaticilar")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("is_completed", false)
        .order("due_date", { ascending: true });

      set({ animsaticilar: data || [] });
    }
    set({ loadingAnimsaticilar: false });
  },
  addAnimsatici: async (animsatici) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("animsaticilar").insert({
      ...animsatici,
      restaurant_id: profile.restaurant_id,
      is_completed: false,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchAnimsaticilar();
    }
    return { error };
  },
  updateAnimsatici: async (id, updates) => {
    const { error } = await supabase
      .from("animsaticilar")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchAnimsaticilar();
    }
    return { error };
  },
  completeAnimsatici: async (id) => {
    const { error } = await supabase
      .from("animsaticilar")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      get().fetchAnimsaticilar();
    }
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
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      set({ menuItems: data || [] });
    }
    set({ loadingMenuItems: false });
  },
  addMenuItem: async (item) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await supabase.from("menu_items").insert({
      ...item,
      restaurant_id: profile.restaurant_id,
      is_active: true,
    });

    if (!error) {
      get().fetchMenuItems();
    }
    return { error };
  },
  updateMenuItem: async (id, updates) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchMenuItems();
    }
    return { error };
  },
  deleteMenuItem: async (id) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (!error) {
      get().fetchMenuItems();
    }
    return { error };
  },

  // ==========================================
  // SATIŞ KAYITLARI (Ürün Bazlı Takip)
  // Bu modül gelir/gideri ETKİLEMEZ!
  // ==========================================
  satisKayitlari: [],
  loadingSatisKayitlari: false,
  fetchSatisKayitlari: async (limit = 500) => {
    set({ loadingSatisKayitlari: true });
    const { profile, menuItems } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from("satis_kayitlari")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      // Join menu_item
      const kayitlarWithJoins = (data || []).map((kayit) => ({
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("satis_kayitlari").insert({
      ...kayit,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchSatisKayitlari();
    }
    return { error };
  },
  updateSatisKaydi: async (id, updates) => {
    const { error } = await supabase
      .from("satis_kayitlari")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchSatisKayitlari();
    }
    return { error };
  },
  deleteSatisKaydi: async (id) => {
    const { error } = await supabase
      .from("satis_kayitlari")
      .delete()
      .eq("id", id);

    if (!error) {
      get().fetchSatisKayitlari();
    }
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
      const { data } = await supabase
        .from("urunler")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .order("name", { ascending: true });

      const urunlerWithJoins = (data || []).map((urun) => ({
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

    const { error } = await supabase.from("urunler").insert({
      ...urun,
      restaurant_id: profile.restaurant_id,
      is_active: true,
    });

    if (!error) {
      get().fetchUrunler();
    }
    return { error };
  },
  updateUrun: async (id, updates) => {
    const { error } = await supabase
      .from("urunler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      get().fetchUrunler();
    }
    return { error };
  },

  // ==========================================
  // KASALAR ARASI TRANSFER
  // ==========================================
  transferBetweenKasalar: async (fromKasaId, toKasaId, amount, description) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No user" };

    // Transfer işlemi ekle
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
      // Kaynak kasadan çıkış
      await supabase.rpc("update_kasa_balance", {
        kasa_id: fromKasaId,
        amount: -amount,
      });

      // Hedef kasaya giriş
      await supabase.rpc("update_kasa_balance", {
        kasa_id: toKasaId,
        amount: amount,
      });

      get().fetchKasalar();
      get().fetchIslemler();
    }
    return { error };
  },
}));
