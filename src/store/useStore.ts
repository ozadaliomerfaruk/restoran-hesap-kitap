import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Kasa, Cari, Kategori, Islem, Profile, Personel, PersonelIslem, Izin, TekrarlayanOdeme, CekSenet, GunlukSatis } from '../types';

interface AppState {
  // Profile
  profile: Profile | null;
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;

  // Kasalar
  kasalar: Kasa[];
  loadingKasalar: boolean;
  fetchKasalar: () => Promise<void>;
  addKasa: (kasa: Omit<Kasa, 'id' | 'created_at' | 'updated_at' | 'balance'>) => Promise<{ error: any }>;
  updateKasa: (id: string, updates: Partial<Kasa>) => Promise<{ error: any }>;

  // Cariler
  cariler: Cari[];
  loadingCariler: boolean;
  fetchCariler: () => Promise<void>;
  addCari: (cari: Omit<Cari, 'id' | 'created_at' | 'updated_at' | 'balance'>) => Promise<{ error: any }>;
  updateCari: (id: string, updates: Partial<Cari>) => Promise<{ error: any }>;

  // Kategoriler
  kategoriler: Kategori[];
  loadingKategoriler: boolean;
  fetchKategoriler: () => Promise<void>;

  // İşlemler
  islemler: Islem[];
  loadingIslemler: boolean;
  fetchIslemler: () => Promise<void>;
  addIslem: (islem: Omit<Islem, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<{ error: any }>;

  // Personel
  personeller: Personel[];
  loadingPersoneller: boolean;
  fetchPersoneller: () => Promise<void>;
  addPersonel: (personel: Omit<Personel, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updatePersonel: (id: string, updates: Partial<Personel>) => Promise<{ error: any }>;

  // Personel İşlemleri
  personelIslemler: PersonelIslem[];
  loadingPersonelIslemler: boolean;
  fetchPersonelIslemler: () => Promise<void>;
  addPersonelIslem: (islem: Omit<PersonelIslem, 'id' | 'created_at' | 'created_by'>) => Promise<{ error: any }>;

  // İzinler
  izinler: Izin[];
  loadingIzinler: boolean;
  fetchIzinler: () => Promise<void>;
  addIzin: (izin: Omit<Izin, 'id' | 'created_at'>) => Promise<{ error: any }>;
  updateIzin: (id: string, updates: Partial<Izin>) => Promise<{ error: any }>;

  // Tekrarlayan Ödemeler
  tekrarlayanOdemeler: TekrarlayanOdeme[];
  loadingTekrarlayanOdemeler: boolean;
  fetchTekrarlayanOdemeler: () => Promise<void>;
  addTekrarlayanOdeme: (odeme: Omit<TekrarlayanOdeme, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateTekrarlayanOdeme: (id: string, updates: Partial<TekrarlayanOdeme>) => Promise<{ error: any }>;

  // Çek/Senet
  cekSenetler: CekSenet[];
  loadingCekSenetler: boolean;
  fetchCekSenetler: () => Promise<void>;
  addCekSenet: (cekSenet: Omit<CekSenet, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateCekSenet: (id: string, updates: Partial<CekSenet>) => Promise<{ error: any }>;

  // Günlük Satış
  gunlukSatislar: GunlukSatis[];
  loadingGunlukSatislar: boolean;
  fetchGunlukSatislar: () => Promise<void>;
  addGunlukSatis: (satis: Omit<GunlukSatis, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'toplam'>) => Promise<{ error: any }>;
  updateGunlukSatis: (id: string, updates: Partial<GunlukSatis>) => Promise<{ error: any }>;
}

export const useStore = create<AppState>((set, get) => ({
  // Profile
  profile: null,
  loadingProfile: false,
  fetchProfile: async () => {
    set({ loadingProfile: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      set({ profile: data });
    }
    set({ loadingProfile: false });
  },

  // Kasalar
  kasalar: [],
  loadingKasalar: false,
  fetchKasalar: async () => {
    set({ loadingKasalar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('kasalar')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('is_archived', false)
        .order('created_at', { ascending: true });
      set({ kasalar: data || [] });
    }
    set({ loadingKasalar: false });
  },
  addKasa: async (kasa) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { error } = await supabase
      .from('kasalar')
      .insert({ ...kasa, restaurant_id: profile.restaurant_id });

    if (!error) {
      get().fetchKasalar();
    }
    return { error };
  },
  updateKasa: async (id, updates) => {
    const { error } = await supabase
      .from('kasalar')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      get().fetchKasalar();
    }
    return { error };
  },

  // Cariler
  cariler: [],
  loadingCariler: false,
  fetchCariler: async () => {
    set({ loadingCariler: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('cariler')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('is_archived', false)
        .order('name', { ascending: true });
      set({ cariler: data || [] });
    }
    set({ loadingCariler: false });
  },
  addCari: async (cari) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { error } = await supabase
      .from('cariler')
      .insert({
        ...cari,
        restaurant_id: profile.restaurant_id,
        balance: cari.initial_balance || 0
      });

    if (!error) {
      get().fetchCariler();
    }
    return { error };
  },
  updateCari: async (id, updates) => {
    const { error } = await supabase
      .from('cariler')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      get().fetchCariler();
    }
    return { error };
  },

  // Kategoriler
  kategoriler: [],
  loadingKategoriler: false,
  fetchKategoriler: async () => {
    set({ loadingKategoriler: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('kategoriler')
        .select('*')
        .or(`restaurant_id.eq.${profile.restaurant_id},is_default.eq.true`)
        .order('name', { ascending: true });
      set({ kategoriler: data || [] });
    }
    set({ loadingKategoriler: false });
  },

  // İşlemler
  islemler: [],
  loadingIslemler: false,
  fetchIslemler: async () => {
    set({ loadingIslemler: true });
    const { profile, kasalar } = get();
    if (profile?.restaurant_id) {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.log('fetchIslemler error:', error);
      }

      // Manually join kasa data
      const islemlerWithKasa = (data || []).map(islem => ({
        ...islem,
        kasa: kasalar.find(k => k.id === islem.kasa_id)
      }));

      set({ islemler: islemlerWithKasa });
    }
    set({ loadingIslemler: false });
  },
  addIslem: async (islem) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No user' };

    const { error } = await supabase
      .from('islemler')
      .insert({
        ...islem,
        restaurant_id: profile.restaurant_id,
        created_by: user.id
      });

    if (!error) {
      // Update kasa balance
      if (islem.kasa_id) {
        const multiplier = islem.type === 'gelir' || islem.type === 'tahsilat' ? 1 : -1;
        await supabase.rpc('update_kasa_balance', {
          kasa_id: islem.kasa_id,
          amount: islem.amount * multiplier
        });
      }

      // Update cari balance if applicable
      if (islem.cari_id && (islem.type === 'odeme' || islem.type === 'tahsilat')) {
        const multiplier = islem.type === 'tahsilat' ? -1 : 1;
        await supabase.rpc('update_cari_balance', {
          cari_id: islem.cari_id,
          amount: islem.amount * multiplier
        });
      }

      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  // Personel
  personeller: [],
  loadingPersoneller: false,
  fetchPersoneller: async () => {
    set({ loadingPersoneller: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('personel')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('is_archived', false)
        .order('name', { ascending: true });
      set({ personeller: data || [] });
    }
    set({ loadingPersoneller: false });
  },
  addPersonel: async (personel) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { error } = await supabase
      .from('personel')
      .insert({
        name: personel.name,
        phone: personel.phone,
        position: personel.position,
        salary: personel.salary,
        start_date: personel.start_date,
        restaurant_id: profile.restaurant_id,
        is_archived: false,
      });

    if (!error) {
      get().fetchPersoneller();
    }
    return { error };
  },
  updatePersonel: async (id, updates) => {
    const { error } = await supabase
      .from('personel')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      get().fetchPersoneller();
    }
    return { error };
  },

  // Personel İşlemleri
  personelIslemler: [],
  loadingPersonelIslemler: false,
  fetchPersonelIslemler: async () => {
    set({ loadingPersonelIslemler: true });
    const { profile, personeller, kasalar } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('personel_islemler')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('date', { ascending: false })
        .limit(100);

      const islemlerWithJoins = (data || []).map(islem => ({
        ...islem,
        personel: personeller.find(p => p.id === islem.personel_id),
        kasa: kasalar.find(k => k.id === islem.kasa_id)
      }));

      set({ personelIslemler: islemlerWithJoins });
    }
    set({ loadingPersonelIslemler: false });
  },
  addPersonelIslem: async (islem) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No user' };

    const { error } = await supabase
      .from('personel_islemler')
      .insert({
        ...islem,
        restaurant_id: profile.restaurant_id,
        created_by: user.id
      });

    if (!error && islem.kasa_id) {
      // Maaş ve avans kasadan çıkış
      const multiplier = islem.type === 'prim' ? 1 : -1;
      await supabase.rpc('update_kasa_balance', {
        kasa_id: islem.kasa_id,
        amount: islem.amount * multiplier
      });
      get().fetchKasalar();
    }

    if (!error) {
      get().fetchPersonelIslemler();
    }
    return { error };
  },

  // İzinler
  izinler: [],
  loadingIzinler: false,
  fetchIzinler: async () => {
    set({ loadingIzinler: true });
    const { profile, personeller } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('izinler')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('start_date', { ascending: false })
        .limit(100);

      const izinlerWithJoins = (data || []).map(izin => ({
        ...izin,
        personel: personeller.find(p => p.id === izin.personel_id)
      }));

      set({ izinler: izinlerWithJoins });
    }
    set({ loadingIzinler: false });
  },
  addIzin: async (izin) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { error } = await supabase
      .from('izinler')
      .insert({ ...izin, restaurant_id: profile.restaurant_id });

    if (!error) {
      get().fetchIzinler();
    }
    return { error };
  },
  updateIzin: async (id, updates) => {
    const { error } = await supabase
      .from('izinler')
      .update(updates)
      .eq('id', id);

    if (!error) {
      get().fetchIzinler();
    }
    return { error };
  },

  // Tekrarlayan Ödemeler
  tekrarlayanOdemeler: [],
  loadingTekrarlayanOdemeler: false,
  fetchTekrarlayanOdemeler: async () => {
    set({ loadingTekrarlayanOdemeler: true });
    const { profile, kasalar, cariler, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('tekrarlayan_odemeler')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('is_active', true)
        .order('next_date', { ascending: true });

      const odemelerWithJoins = (data || []).map(odeme => ({
        ...odeme,
        kasa: kasalar.find(k => k.id === odeme.kasa_id),
        cari: cariler.find(c => c.id === odeme.cari_id),
        kategori: kategoriler.find(k => k.id === odeme.kategori_id)
      }));

      set({ tekrarlayanOdemeler: odemelerWithJoins });
    }
    set({ loadingTekrarlayanOdemeler: false });
  },
  addTekrarlayanOdeme: async (odeme) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { error } = await supabase
      .from('tekrarlayan_odemeler')
      .insert({ ...odeme, restaurant_id: profile.restaurant_id });

    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },
  updateTekrarlayanOdeme: async (id, updates) => {
    const { error } = await supabase
      .from('tekrarlayan_odemeler')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },

  // Çek/Senet
  cekSenetler: [],
  loadingCekSenetler: false,
  fetchCekSenetler: async () => {
    set({ loadingCekSenetler: true });
    const { profile, cariler } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('cek_senet')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('due_date', { ascending: true });

      const cekSenetlerWithJoins = (data || []).map(cs => ({
        ...cs,
        cari: cariler.find(c => c.id === cs.cari_id)
      }));

      set({ cekSenetler: cekSenetlerWithJoins });
    }
    set({ loadingCekSenetler: false });
  },
  addCekSenet: async (cekSenet) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { error } = await supabase
      .from('cek_senet')
      .insert({ ...cekSenet, restaurant_id: profile.restaurant_id });

    if (!error) {
      get().fetchCekSenetler();
    }
    return { error };
  },
  updateCekSenet: async (id, updates) => {
    const { error } = await supabase
      .from('cek_senet')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      get().fetchCekSenetler();
    }
    return { error };
  },

  // Günlük Satış
  gunlukSatislar: [],
  loadingGunlukSatislar: false,
  fetchGunlukSatislar: async () => {
    set({ loadingGunlukSatislar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await supabase
        .from('gunluk_satis')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('date', { ascending: false })
        .limit(30);

      set({ gunlukSatislar: data || [] });
    }
    set({ loadingGunlukSatislar: false });
  },
  addGunlukSatis: async (satis) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: 'No restaurant' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No user' };

    const toplam =
      (satis.nakit_satis || 0) +
      (satis.kredi_karti_satis || 0) +
      (satis.yemeksepeti || 0) +
      (satis.getir || 0) +
      (satis.trendyol || 0) +
      (satis.diger_online || 0);

    const { error } = await supabase
      .from('gunluk_satis')
      .insert({
        ...satis,
        toplam,
        restaurant_id: profile.restaurant_id,
        created_by: user.id
      });

    if (!error) {
      get().fetchGunlukSatislar();
    }
    return { error };
  },
  updateGunlukSatis: async (id, updates) => {
    let toplam;
    if (updates.nakit_satis !== undefined || updates.kredi_karti_satis !== undefined) {
      const { gunlukSatislar } = get();
      const current = gunlukSatislar.find(s => s.id === id);
      if (current) {
        toplam =
          (updates.nakit_satis ?? current.nakit_satis) +
          (updates.kredi_karti_satis ?? current.kredi_karti_satis) +
          (updates.yemeksepeti ?? current.yemeksepeti) +
          (updates.getir ?? current.getir) +
          (updates.trendyol ?? current.trendyol) +
          (updates.diger_online ?? current.diger_online);
      }
    }

    const { error } = await supabase
      .from('gunluk_satis')
      .update({ ...updates, ...(toplam !== undefined && { toplam }), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      get().fetchGunlukSatislar();
    }
    return { error };
  },
}));
