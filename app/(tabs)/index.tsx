/**
 * Dashboard - Ana Sayfa (Refactored)
 * Önceki: 2,331 satır → Şimdi: ~300 satır
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";
import { Kasa } from "../../src/types";

// Feature imports
import {
  FinansalOzetPanel,
  HizliIslemler,
  HedefSecModal,
  HesapEkleModal,
  KasaCard,
  KasaIslemForm,
  KasaList,
} from "../../src/features/dashboard";
import {
  useDashboardData,
  useFinansalOzet,
} from "../../src/features/dashboard/hooks";
import { IslemTipi } from "../../src/features/dashboard/constants";

// Existing modals
import GunlukCiroModal from "../../src/components/GunlukCiroModal";
import HakedisModal from "../../src/components/HakedisModal";
import KrediKartiHarcamaModal from "../../src/components/KrediKartiHarcamaModal";
import KrediKartiOdemeModal from "../../src/components/KrediKartiOdemeModal";

// Kategori seçme modal (henüz refactor edilmedi, mevcut kodu kullanıyoruz)
import { ListSelectModal } from "../../src/shared/components/modals";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Dashboard() {
  // Data
  const {
    profile,
    kasalar,
    cariler,
    personeller,
    kategoriler,
    refreshAll,
    fetchKasalar,
    fetchIslemler,
    fetchCariler,
    fetchPersoneller,
    fetchPersonelIslemler,
  } = useDashboardData();

  const finansalOzet = useFinansalOzet({ kasalar, cariler, personeller });

  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [expandedKasaId, setExpandedKasaId] = useState<string | null>(null);
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );

  // Modal State
  const [showCiroModal, setShowCiroModal] = useState(false);
  const [showHakedisModal, setShowHakedisModal] = useState(false);
  const [showAddKasaModal, setShowAddKasaModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);

  // Kredi Kartı Modals
  const [showKrediKartiHarcama, setShowKrediKartiHarcama] = useState(false);
  const [showKrediKartiOdeme, setShowKrediKartiOdeme] = useState(false);
  const [selectedKrediKarti, setSelectedKrediKarti] = useState<Kasa | null>(
    null
  );

  // Form State
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetKasaId, setFormTargetKasaId] = useState<string | null>(null);
  const [formTargetType, setFormTargetType] = useState<
    "personel" | "cari" | null
  >(null);
  const [formTargetId, setFormTargetId] = useState<string | null>(null);
  const [formKategoriId, setFormKategoriId] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormAmount("");
    setFormDescription("");
    setFormTargetKasaId(null);
    setFormTargetType(null);
    setFormTargetId(null);
    setFormKategoriId("");
  };

  const toggleExpand = (kasaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedKasaId === kasaId) {
      setExpandedKasaId(null);
      setActiveIslemTipi(null);
    } else {
      setExpandedKasaId(kasaId);
      setActiveIslemTipi(null);
    }
    resetForm();
  };

  const selectIslemTipi = (tipi: IslemTipi) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeIslemTipi === tipi) {
      setActiveIslemTipi(null);
    } else {
      setActiveIslemTipi(tipi);
      if (tipi === "transfer") {
        const otherKasalar = kasalar.filter((k) => k.id !== expandedKasaId);
        if (otherKasalar.length > 0) setFormTargetKasaId(otherKasalar[0].id);
      }
    }
    resetForm();
  };

  const selectTarget = (type: "personel" | "cari", id: string) => {
    setFormTargetType(type);
    setFormTargetId(id);
    setShowTargetModal(false);
  };

  const getTargetName = () => {
    if (!formTargetId) return "Seçiniz";
    if (formTargetType === "personel") {
      return personeller.find((p) => p.id === formTargetId)?.name || "Seçiniz";
    }
    return cariler.find((c) => c.id === formTargetId)?.name || "Seçiniz";
  };

  const handleSubmit = async (kasa: Kasa) => {
    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }
    if (
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat") &&
      !formTargetId
    ) {
      Alert.alert("Hata", "Lütfen bir personel veya cari seçin");
      return;
    }
    if (activeIslemTipi === "transfer" && !formTargetKasaId) {
      Alert.alert("Hata", "Lütfen hedef kasa seçin");
      return;
    }

    setFormLoading(true);
    const amount = parseFloat(formAmount);
    let description = formDescription.trim();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Kullanıcı bulunamadı");

      // İşlem tipine göre kayıt
      if (activeIslemTipi === "gelir") {
        if (!description) description = `${kasa.name} - Gelir`;
        await supabase.from("islemler").insert({
          type: "gelir",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kategori_id: formKategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });
        await supabase.rpc("update_kasa_balance", { kasa_id: kasa.id, amount });
      } else if (activeIslemTipi === "gider") {
        if (!description) description = `${kasa.name} - Gider`;
        await supabase.from("islemler").insert({
          type: "gider",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kategori_id: formKategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: -amount,
        });
      } else if (activeIslemTipi === "odeme") {
        await handleOdeme(kasa, amount, description, currentUser.id);
      } else if (activeIslemTipi === "tahsilat") {
        await handleTahsilat(kasa, amount, description, currentUser.id);
      } else if (activeIslemTipi === "transfer") {
        await handleTransfer(kasa, amount, description, currentUser.id);
      }

      Alert.alert("Başarılı", "İşlem kaydedildi");
      resetForm();
      setActiveIslemTipi(null);
      fetchKasalar();
      fetchIslemler();
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchCariler();
    } catch (error) {
      console.error("İşlem hatası:", error);
      Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOdeme = async (
    kasa: Kasa,
    amount: number,
    description: string,
    userId: string
  ) => {
    const isKrediKarti = kasa.type === "kredi_karti";

    if (formTargetType === "personel") {
      const personel = personeller.find((p) => p.id === formTargetId);
      const desc = description || `${personel?.name || "Personel"} - Ödeme`;
      await supabase.from("personel_islemler").insert({
        type: "odeme",
        amount,
        description: desc,
        date: formDate,
        kasa_id: kasa.id,
        personel_id: formTargetId,
        restaurant_id: profile?.restaurant_id,
        created_by: userId,
      });
      await supabase.rpc("update_kasa_balance", {
        kasa_id: kasa.id,
        amount: isKrediKarti ? amount : -amount,
      });
      await supabase.rpc("update_personel_balance", {
        personel_id: formTargetId,
        amount: -amount,
      });
    } else if (formTargetType === "cari") {
      const cari = cariler.find((c) => c.id === formTargetId);
      const desc = description || `${cari?.name || "Cari"} - Ödeme`;
      await supabase.from("islemler").insert({
        type: "odeme",
        amount,
        description: desc,
        date: formDate,
        kasa_id: kasa.id,
        cari_id: formTargetId,
        restaurant_id: profile?.restaurant_id,
        created_by: userId,
      });
      await supabase.rpc("update_kasa_balance", {
        kasa_id: kasa.id,
        amount: isKrediKarti ? amount : -amount,
      });
      await supabase.rpc("update_cari_balance", {
        cari_id: formTargetId,
        amount: -amount,
      });
    }
  };

  const handleTahsilat = async (
    kasa: Kasa,
    amount: number,
    description: string,
    userId: string
  ) => {
    if (formTargetType === "personel") {
      const personel = personeller.find((p) => p.id === formTargetId);
      const desc = description || `${personel?.name || "Personel"} - Tahsilat`;
      await supabase.from("personel_islemler").insert({
        type: "tahsilat",
        amount,
        description: desc,
        date: formDate,
        kasa_id: kasa.id,
        personel_id: formTargetId,
        restaurant_id: profile?.restaurant_id,
        created_by: userId,
      });
      await supabase.rpc("update_kasa_balance", { kasa_id: kasa.id, amount });
      await supabase.rpc("update_personel_balance", {
        personel_id: formTargetId,
        amount,
      });
    } else if (formTargetType === "cari") {
      const cari = cariler.find((c) => c.id === formTargetId);
      const desc = description || `${cari?.name || "Cari"} - Tahsilat`;
      await supabase.from("islemler").insert({
        type: "tahsilat",
        amount,
        description: desc,
        date: formDate,
        kasa_id: kasa.id,
        cari_id: formTargetId,
        restaurant_id: profile?.restaurant_id,
        created_by: userId,
      });
      await supabase.rpc("update_kasa_balance", { kasa_id: kasa.id, amount });
      await supabase.rpc("update_cari_balance", {
        cari_id: formTargetId,
        amount,
      });
    }
  };

  const handleTransfer = async (
    kasa: Kasa,
    amount: number,
    description: string,
    userId: string
  ) => {
    const targetKasa = kasalar.find((k) => k.id === formTargetKasaId);
    const desc =
      description || `${kasa.name} → ${targetKasa?.name || "Hedef Kasa"}`;
    await supabase.from("islemler").insert({
      type: "transfer",
      amount,
      description: desc,
      date: formDate,
      kasa_id: kasa.id,
      kasa_hedef_id: formTargetKasaId,
      restaurant_id: profile?.restaurant_id,
      created_by: userId,
    });
    await supabase.rpc("update_kasa_balance", {
      kasa_id: kasa.id,
      amount: -amount,
    });
    await supabase.rpc("update_kasa_balance", {
      kasa_id: formTargetKasaId,
      amount,
    });
  };

  // Kategori items for ListSelectModal
  const kategoriItems = [
    { id: "", title: "Kategorisiz" },
    ...kategoriler
      .filter((k) => k.type === activeIslemTipi && !k.parent_id)
      .map((k) => ({ id: k.id, title: k.name })),
  ];

  // Render
  const renderKasaCard = (kasa: Kasa) => {
    const isExpanded = expandedKasaId === kasa.id;
    const otherKasalar = kasalar.filter((k) => k.id !== kasa.id);
    const isKrediKarti = kasa.type === "kredi_karti";
    const showForm =
      activeIslemTipi &&
      (!isKrediKarti ||
        activeIslemTipi === "odeme" ||
        activeIslemTipi === "transfer");

    return (
      <KasaCard
        key={kasa.id}
        kasa={kasa}
        isExpanded={isExpanded}
        activeIslemTipi={activeIslemTipi}
        onToggleExpand={() => toggleExpand(kasa.id)}
        onSelectIslemTipi={selectIslemTipi}
        onKrediKartiHarcama={() => {
          setSelectedKrediKarti(kasa);
          setShowKrediKartiHarcama(true);
        }}
        onKrediKartiBorcOde={() => {
          setSelectedKrediKarti(kasa);
          setShowKrediKartiOdeme(true);
        }}
        hasOtherKasalar={otherKasalar.length > 0}
      >
        {showForm && (
          <KasaIslemForm
            islemTipi={activeIslemTipi!}
            kasa={kasa}
            otherKasalar={otherKasalar}
            kategoriler={kategoriler}
            date={formDate}
            onDateChange={setFormDate}
            amount={formAmount}
            onAmountChange={setFormAmount}
            description={formDescription}
            onDescriptionChange={setFormDescription}
            targetKasaId={formTargetKasaId}
            onTargetKasaChange={setFormTargetKasaId}
            kategoriId={formKategoriId}
            onKategoriPress={() => setShowKategoriModal(true)}
            targetName={getTargetName()}
            onTargetPress={() => setShowTargetModal(true)}
            onSubmit={() => handleSubmit(kasa)}
            loading={formLoading}
          />
        )}
      </KasaCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Merhaba, {profile?.name?.split(" ")[0] || "Kullanıcı"}
          </Text>
        </View>

        {/* Finansal Özet */}
        <FinansalOzetPanel {...finansalOzet} />

        {/* Hesaplarım */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hesaplarım</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddKasaModal(true)}
            >
              <Plus size={16} color="#3b82f6" />
              <Text style={styles.addBtnText}>Hesap Ekle</Text>
            </TouchableOpacity>
          </View>
          <KasaList
            kasalar={kasalar}
            onAddPress={() => setShowAddKasaModal(true)}
            renderKasaCard={renderKasaCard}
          />
        </View>

        {/* Hızlı İşlemler */}
        <HizliIslemler
          onCiroPress={() => setShowCiroModal(true)}
          onHakedisPress={() => setShowHakedisModal(true)}
        />

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modals */}
      <HedefSecModal
        visible={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        onSelect={selectTarget}
        title={activeIslemTipi === "odeme" ? "Kime Ödeme?" : "Kimden Tahsilat?"}
        personeller={finansalOzet.aktifPersoneller}
        tedarikciler={finansalOzet.tedarikciler}
        musteriler={finansalOzet.musteriler}
      />

      <ListSelectModal
        visible={showKategoriModal}
        onClose={() => setShowKategoriModal(false)}
        onSelect={(item) => setFormKategoriId(item.id)}
        title="Kategori Seç"
        items={kategoriItems}
        selectedId={formKategoriId}
        emptyTitle="Kategori bulunamadı"
      />

      <HesapEkleModal
        visible={showAddKasaModal}
        onClose={() => setShowAddKasaModal(false)}
        onSuccess={fetchKasalar}
      />

      <GunlukCiroModal
        visible={showCiroModal}
        onClose={() => setShowCiroModal(false)}
      />
      <HakedisModal
        visible={showHakedisModal}
        onClose={() => setShowHakedisModal(false)}
      />

      {selectedKrediKarti && (
        <>
          <KrediKartiHarcamaModal
            visible={showKrediKartiHarcama}
            onClose={() => {
              setShowKrediKartiHarcama(false);
              setSelectedKrediKarti(null);
            }}
            kasa={selectedKrediKarti}
            onSuccess={() => {
              fetchKasalar();
              fetchIslemler();
            }}
          />
          <KrediKartiOdemeModal
            visible={showKrediKartiOdeme}
            onClose={() => {
              setShowKrediKartiOdeme(false);
              setSelectedKrediKarti(null);
            }}
            kasa={selectedKrediKarti}
            onSuccess={() => {
              fetchKasalar();
              fetchIslemler();
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { paddingVertical: 16 },
  greeting: { fontSize: 20, fontWeight: "600", color: "#111827" },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: "#111827" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { fontSize: 14, color: "#3b82f6", fontWeight: "500" },
});
