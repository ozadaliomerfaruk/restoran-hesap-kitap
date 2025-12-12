/**
 * KasaDetay Screen (Refactored)
 * Önceki: 2,902 satır → Şimdi: ~400 satır
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeft,
  MoreVertical,
  Edit3,
  Archive,
  Trash2,
  X,
  Calculator,
  ChevronDown,
  Calendar,
  Users,
  UserCheck,
} from "lucide-react-native";

// Feature imports
import {
  KasaAccountCard,
  KrediKartiOzet,
  KasaBottomActions,
  IslemCard,
} from "../src/features/kasadetay";
import {
  useKasaDetay,
  useKasaIslemleri,
} from "../src/features/kasadetay/hooks";
import {
  IslemTipi,
  BirlesikIslem,
  islemTipiColors,
} from "../src/features/kasadetay/types";

// Shared imports
import { ListSelectModal } from "../src/shared/components/modals";
import { formatCurrency, formatDate } from "../src/shared/utils";

// Existing modals
import KrediKartiHarcamaModal from "../src/components/KrediKartiHarcamaModal";
import KrediKartiOdemeModal from "../src/components/KrediKartiOdemeModal";
import KrediKartiDuzenleModal from "../src/components/KrediKartiDuzenleModal";
import { supabase } from "../src/lib/supabase";

export default function KasaDetayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Hooks
  const {
    kasa,
    kasalar,
    kategoriler,
    cariler,
    personeller,
    profile,
    loading: kasaLoading,
    refreshAll,
    updateKasaName,
    archiveKasa,
    deleteKasa,
    toggleExcludeFromProfit,
    fetchKasalar,
  } = useKasaDetay(id);

  const {
    islemler,
    loading: islemLoading,
    fetchIslemler,
    updateIslem,
    deleteIslem,
  } = useKasaIslemleri(id);

  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState("");

  // İşlem düzenleme state
  const [expandedIslemId, setExpandedIslemId] = useState<string | null>(null);
  const [editIslemDate, setEditIslemDate] = useState<Date>(new Date());
  const [editIslemAmount, setEditIslemAmount] = useState("");
  const [editIslemDesc, setEditIslemDesc] = useState("");
  const [editIslemKategori, setEditIslemKategori] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);

  // Yeni işlem state
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formKategoriId, setFormKategoriId] = useState("");
  const [formTargetType, setFormTargetType] = useState<"cari" | "personel">(
    "cari"
  );
  const [formTargetId, setFormTargetId] = useState("");
  const [formTargetKasaId, setFormTargetKasaId] = useState("");
  const [showFormDatePicker, setShowFormDatePicker] = useState(false);
  const [showFormKategoriPicker, setShowFormKategoriPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [showKasaPicker, setShowKasaPicker] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Kredi kartı modal state
  const [showKrediKartiHarcama, setShowKrediKartiHarcama] = useState(false);
  const [showKrediKartiOdeme, setShowKrediKartiOdeme] = useState(false);
  const [showKrediKartiDuzenle, setShowKrediKartiDuzenle] = useState(false);

  useEffect(() => {
    if (profile?.restaurant_id && id) {
      fetchIslemler();
    }
  }, [profile?.restaurant_id, id, fetchIslemler]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    await fetchIslemler();
    setRefreshing(false);
  };

  // İşlem düzenleme
  const toggleIslemExpand = (islem: BirlesikIslem) => {
    if (expandedIslemId === islem.id) {
      setExpandedIslemId(null);
      setShowDatePicker(false);
    } else {
      setExpandedIslemId(islem.id);
      setEditIslemDate(new Date(islem.date));
      setEditIslemAmount(islem.amount.toString());
      setEditIslemDesc(islem.description || "");
      setEditIslemKategori(islem.kategori_id || "");
      setShowDatePicker(false);
    }
  };

  const handleSaveIslem = async (islem: BirlesikIslem) => {
    const success = await updateIslem(
      islem,
      editIslemDate,
      editIslemAmount,
      editIslemDesc,
      editIslemKategori
    );
    if (success) setExpandedIslemId(null);
  };

  const handleDeleteIslem = async (islem: BirlesikIslem) => {
    const success = await deleteIslem(islem);
    if (success) setExpandedIslemId(null);
  };

  // Form reset
  const resetForm = () => {
    setFormAmount("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormKategoriId("");
    setFormTargetType("cari");
    setFormTargetId("");
    setFormTargetKasaId("");
  };

  // Yeni işlem kaydet
  const handleSubmitIslem = async () => {
    if (
      !formAmount ||
      isNaN(parseFloat(formAmount)) ||
      parseFloat(formAmount) <= 0
    ) {
      return;
    }
    if (!activeIslemTipi || !kasa) return;
    if (
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat") &&
      !formTargetId
    )
      return;
    if (activeIslemTipi === "transfer" && !formTargetKasaId) return;

    setFormLoading(true);
    const amount = parseFloat(formAmount);
    let description = formDescription.trim();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Kullanıcı bulunamadı");

      // İşlem tipine göre kayıt (Dashboard'dakiyle aynı mantık)
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
        await handleOdeme(amount, description, currentUser.id);
      } else if (activeIslemTipi === "tahsilat") {
        await handleTahsilat(amount, description, currentUser.id);
      } else if (activeIslemTipi === "transfer") {
        await handleTransfer(amount, description, currentUser.id);
      }

      resetForm();
      setActiveIslemTipi(null);
      fetchKasalar();
      fetchIslemler();
    } catch (error) {
      console.log("İşlem hatası:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOdeme = async (
    amount: number,
    description: string,
    userId: string
  ) => {
    if (!kasa) return;
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
    } else {
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
    amount: number,
    description: string,
    userId: string
  ) => {
    if (!kasa) return;

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
    } else {
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
    amount: number,
    description: string,
    userId: string
  ) => {
    if (!kasa) return;
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

  // Tarih ayracı için
  const getDateKey = (dateStr: string) => dateStr.split("T")[0];
  const formatDateHeader = (dateStr: string) => formatDate(dateStr, "full");

  // Loading state
  if (!kasa) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hesap Bulunamadı</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Kategori items
  const kategoriItems = [
    { id: "", title: "Kategorisiz" },
    ...kategoriler
      .filter((k) => {
        const currentIslem = islemler.find((i) => i.id === expandedIslemId);
        return k.type === currentIslem?.type && !k.parent_id;
      })
      .map((k) => ({ id: k.id, title: k.name })),
  ];

  const formKategoriItems = [
    { id: "", title: "Kategorisiz" },
    ...kategoriler
      .filter((k) => k.type === activeIslemTipi && !k.parent_id)
      .map((k) => ({ id: k.id, title: k.name })),
  ];

  const targetItems =
    formTargetType === "cari"
      ? cariler
          .filter((c) => !c.is_archived)
          .map((c) => ({
            id: c.id,
            title: c.name,
            subtitle: c.type === "musteri" ? "Müşteri" : "Tedarikçi",
          }))
      : personeller
          .filter((p) => !p.is_archived)
          .map((p) => ({ id: p.id, title: p.name, subtitle: p.position }));

  const kasaItems = kasalar
    .filter((k) => k.id !== id && !k.is_archived)
    .map((k) => ({
      id: k.id,
      title: k.name,
      subtitle: formatCurrency(k.balance),
    }));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hesap Detayı</Text>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.menuBtn}
          >
            <MoreVertical size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: activeIslemTipi ? 350 : 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hesap Kartı */}
        <KasaAccountCard
          kasa={kasa}
          onEditName={() => {
            setEditName(kasa.name);
            setShowEditName(true);
          }}
        />

        {/* Kredi Kartı Özet */}
        <KrediKartiOzet kasa={kasa} />

        {/* Kredi Kartı Düzenle */}
        {kasa.type === "kredi_karti" && (
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowKrediKartiDuzenle(true)}
            >
              <View style={styles.settingLeft}>
                <Edit3 size={20} color="#f59e0b" />
                <View>
                  <Text style={styles.settingTitle}>
                    Kart Bilgilerini Düzenle
                  </Text>
                  <Text style={styles.settingDesc}>
                    Limit, ekstre kesim ve son ödeme günü
                  </Text>
                </View>
              </View>
              <ChevronDown
                size={20}
                color="#9ca3af"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Ayarlar */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Calculator size={20} color="#6b7280" />
              <View>
                <Text style={styles.settingTitle}>
                  Kar/Zarar Hesabına Dahil Et
                </Text>
                <Text style={styles.settingDesc}>
                  Kapalıysa bu hesap genel duruma etki etmez
                </Text>
              </View>
            </View>
            <Switch
              value={!kasa.exclude_from_profit}
              onValueChange={toggleExcludeFromProfit}
              trackColor={{ false: "#e5e7eb", true: "#86efac" }}
              thumbColor={!kasa.exclude_from_profit ? "#10b981" : "#9ca3af"}
            />
          </View>
        </View>

        {/* İşlem Listesi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            İşlem Geçmişi ({islemler.length})
          </Text>

          {islemler.length > 0 ? (
            islemler.map((islem, index) => {
              const prevIslem = index > 0 ? islemler[index - 1] : null;
              const showDateHeader =
                !prevIslem ||
                getDateKey(prevIslem.date) !== getDateKey(islem.date);

              return (
                <View key={`${islem.source}-${islem.id}`}>
                  {showDateHeader && (
                    <View style={styles.dateSeparator}>
                      <View style={styles.dateLine} />
                      <Text style={styles.dateText}>
                        {formatDateHeader(islem.date)}
                      </Text>
                      <View style={styles.dateLine} />
                    </View>
                  )}
                  <IslemCard
                    islem={islem}
                    isExpanded={expandedIslemId === islem.id}
                    onToggle={() => toggleIslemExpand(islem)}
                    editDate={editIslemDate}
                    editAmount={editIslemAmount}
                    editDesc={editIslemDesc}
                    editKategoriId={editIslemKategori}
                    onEditDateChange={setEditIslemDate}
                    onEditAmountChange={setEditIslemAmount}
                    onEditDescChange={setEditIslemDesc}
                    onKategoriPress={() => setShowKategoriPicker(true)}
                    kategoriler={kategoriler}
                    onSave={() => handleSaveIslem(islem)}
                    onDelete={() => handleDeleteIslem(islem)}
                    loading={islemLoading}
                    showDatePicker={showDatePicker}
                    onShowDatePicker={setShowDatePicker}
                  />
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {!activeIslemTipi && (
        <KasaBottomActions
          kasa={kasa}
          onSelectIslemTipi={setActiveIslemTipi}
          onKrediKartiHarcama={() => setShowKrediKartiHarcama(true)}
          onKrediKartiBorcOde={() => setShowKrediKartiOdeme(true)}
        />
      )}

      {/* İşlem Formu - Basitleştirilmiş */}
      {activeIslemTipi && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          <View style={styles.formHeader}>
            <Text
              style={[
                styles.formTitle,
                { color: islemTipiColors[activeIslemTipi] },
              ]}
            >
              {activeIslemTipi === "gelir" && "Gelir Ekle"}
              {activeIslemTipi === "gider" && "Gider Ekle"}
              {activeIslemTipi === "odeme" && "Ödeme Yap"}
              {activeIslemTipi === "tahsilat" && "Tahsilat Al"}
              {activeIslemTipi === "transfer" && "Transfer Yap"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setActiveIslemTipi(null);
                resetForm();
              }}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Tutar */}
          <View style={styles.formAmountBox}>
            <Text style={styles.formCurrency}>₺</Text>
            <TextInput
              style={styles.formAmountInput}
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
          </View>

          {/* Tarih */}
          <TouchableOpacity
            style={styles.formSelectBtn}
            onPress={() => setShowFormDatePicker(true)}
          >
            <Calendar size={18} color="#6b7280" />
            <Text style={styles.formSelectText}>{formatDate(formDate)}</Text>
          </TouchableOpacity>

          {showFormDatePicker && Platform.OS === "ios" && (
            <View style={styles.iosDatePicker}>
              <DateTimePicker
                value={new Date(formDate)}
                mode="date"
                display="spinner"
                onChange={(_, date) =>
                  date && setFormDate(date.toISOString().split("T")[0])
                }
                locale="tr-TR"
              />
              <TouchableOpacity
                style={styles.datePickerDone}
                onPress={() => setShowFormDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          )}

          {showFormDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={new Date(formDate)}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowFormDatePicker(false);
                if (date) setFormDate(date.toISOString().split("T")[0]);
              }}
            />
          )}

          {/* Ödeme/Tahsilat - Cari/Personel Seçimi */}
          {(activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat") && (
            <>
              <View style={styles.formSegment}>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    formTargetType === "cari" && styles.segmentBtnActive,
                  ]}
                  onPress={() => {
                    setFormTargetType("cari");
                    setFormTargetId("");
                  }}
                >
                  <Users
                    size={16}
                    color={formTargetType === "cari" ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.segmentBtnText,
                      formTargetType === "cari" && styles.segmentBtnTextActive,
                    ]}
                  >
                    Cari
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    formTargetType === "personel" && styles.segmentBtnActive,
                  ]}
                  onPress={() => {
                    setFormTargetType("personel");
                    setFormTargetId("");
                  }}
                >
                  <UserCheck
                    size={16}
                    color={formTargetType === "personel" ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.segmentBtnText,
                      formTargetType === "personel" &&
                        styles.segmentBtnTextActive,
                    ]}
                  >
                    Personel
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.formSelectBtn}
                onPress={() => setShowTargetPicker(true)}
              >
                <Text
                  style={[
                    styles.formSelectText,
                    !formTargetId && { color: "#9ca3af" },
                  ]}
                >
                  {formTargetId
                    ? formTargetType === "cari"
                      ? cariler.find((c) => c.id === formTargetId)?.name
                      : personeller.find((p) => p.id === formTargetId)?.name
                    : formTargetType === "cari"
                    ? "Cari Seç"
                    : "Personel Seç"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Transfer - Hedef Kasa */}
          {activeIslemTipi === "transfer" && (
            <TouchableOpacity
              style={styles.formSelectBtn}
              onPress={() => setShowKasaPicker(true)}
            >
              <Text
                style={[
                  styles.formSelectText,
                  !formTargetKasaId && { color: "#9ca3af" },
                ]}
              >
                {formTargetKasaId
                  ? kasalar.find((k) => k.id === formTargetKasaId)?.name
                  : "Hedef Kasa Seç"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Gelir/Gider - Kategori */}
          {(activeIslemTipi === "gelir" || activeIslemTipi === "gider") && (
            <TouchableOpacity
              style={styles.formSelectBtn}
              onPress={() => setShowFormKategoriPicker(true)}
            >
              <Text
                style={[
                  styles.formSelectText,
                  !formKategoriId && { color: "#9ca3af" },
                ]}
              >
                {formKategoriId
                  ? kategoriler.find((k) => k.id === formKategoriId)?.name
                  : "Kategori (opsiyonel)"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Açıklama */}
          <TextInput
            style={styles.formDescInput}
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Açıklama (opsiyonel)"
            placeholderTextColor="#9ca3af"
          />

          {/* Kaydet */}
          <TouchableOpacity
            style={[
              styles.formSubmitBtn,
              { backgroundColor: islemTipiColors[activeIslemTipi] },
              formLoading && { opacity: 0.6 },
            ]}
            onPress={handleSubmitIslem}
            disabled={formLoading}
          >
            <Text style={styles.formSubmitBtnText}>
              {formLoading ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setEditName(kasa.name);
                setShowEditName(true);
              }}
            >
              <Edit3 size={20} color="#374151" />
              <Text style={styles.menuItemText}>İsmi Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                archiveKasa();
              }}
            >
              <Archive size={20} color="#f59e0b" />
              <Text style={[styles.menuItemText, { color: "#f59e0b" }]}>
                Arşive Al
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                deleteKasa();
              }}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                Hesabı Sil
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showEditName} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowEditName(false)}
        >
          <View style={styles.editModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.editModalTitle}>Hesap Adını Düzenle</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Hesap adı"
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.editBtnRow}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={() => setShowEditName(false)}
              >
                <Text style={styles.editCancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editSaveBtn, kasaLoading && { opacity: 0.6 }]}
                onPress={async () => {
                  const success = await updateKasaName(editName);
                  if (success) setShowEditName(false);
                }}
                disabled={kasaLoading}
              >
                <Text style={styles.editSaveBtnText}>
                  {kasaLoading ? "..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Picker Modals */}
      <ListSelectModal
        visible={showKategoriPicker}
        onClose={() => setShowKategoriPicker(false)}
        onSelect={(item) => setEditIslemKategori(item.id)}
        title="Kategori Seç"
        items={kategoriItems}
        selectedId={editIslemKategori}
      />

      <ListSelectModal
        visible={showFormKategoriPicker}
        onClose={() => setShowFormKategoriPicker(false)}
        onSelect={(item) => setFormKategoriId(item.id)}
        title="Kategori Seç"
        items={formKategoriItems}
        selectedId={formKategoriId}
      />

      <ListSelectModal
        visible={showTargetPicker}
        onClose={() => setShowTargetPicker(false)}
        onSelect={(item) => setFormTargetId(item.id)}
        title={formTargetType === "cari" ? "Cari Seç" : "Personel Seç"}
        items={targetItems}
        selectedId={formTargetId}
      />

      <ListSelectModal
        visible={showKasaPicker}
        onClose={() => setShowKasaPicker(false)}
        onSelect={(item) => setFormTargetKasaId(item.id)}
        title="Hedef Kasa Seç"
        items={kasaItems}
        selectedId={formTargetKasaId}
      />

      {/* Kredi Kartı Modals */}
      {kasa.type === "kredi_karti" && (
        <>
          <KrediKartiHarcamaModal
            visible={showKrediKartiHarcama}
            onClose={() => setShowKrediKartiHarcama(false)}
            kasa={kasa}
            onSuccess={fetchIslemler}
          />
          <KrediKartiOdemeModal
            visible={showKrediKartiOdeme}
            onClose={() => setShowKrediKartiOdeme(false)}
            kasa={kasa}
            onSuccess={fetchIslemler}
          />
          <KrediKartiDuzenleModal
            visible={showKrediKartiDuzenle}
            onClose={() => setShowKrediKartiDuzenle(false)}
            kasa={kasa}
            onSuccess={fetchKasalar}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  menuBtn: { padding: 8 },
  content: { flex: 1, padding: 16 },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  settingDesc: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dateText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: { fontSize: 15, color: "#9ca3af" },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  menuModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemText: { fontSize: 16, color: "#374151" },
  editModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  editInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editBtnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  editCancelBtnText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  editSaveBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formTitle: { fontSize: 18, fontWeight: "700" },
  formAmountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  formCurrency: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  formAmountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
  },
  formSegment: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnActive: { backgroundColor: "#3b82f6" },
  segmentBtnText: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  segmentBtnTextActive: { color: "#fff" },
  formSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  formSelectText: { flex: 1, fontSize: 15, color: "#111827" },
  formDescInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  formSubmitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  formSubmitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  iosDatePicker: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  datePickerDone: {
    backgroundColor: "#3b82f6",
    padding: 12,
    alignItems: "center",
  },
  datePickerDoneText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
