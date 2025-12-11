import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
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
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Trash2,
  MoreVertical,
  Archive,
  X,
  Edit3,
  ChevronDown,
  ChevronUp,
  Check,
  Calculator,
  Calendar,
  Plus,
  Users,
  UserCheck,
  Search,
  PlusCircle,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { supabase } from "../../src/lib/supabase";

interface BirlesikIslem {
  id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  kasa_hedef_id?: string;
  source: "islem" | "personel";
  cari?: { id: string; name: string; type: string };
  personel?: { id: string; name: string };
  kategori?: { id: string; name: string };
  kategori_id?: string;
  target_kasa?: { id: string; name: string };
  isTransferIn?: boolean;
}

type IslemTipi = "gelir" | "gider" | "odeme" | "tahsilat" | "transfer";

const kasaIcons: Record<string, any> = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
  kredi_karti: { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" },
  birikim: { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" },
};

export default function KasaDetayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    kasalar,
    fetchKasalar,
    fetchProfile,
    profile,
    kategoriler,
    fetchKategoriler,
    cariler,
    fetchCariler,
    personeller,
    fetchPersoneller,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [kasaIslemleri, setKasaIslemleri] = useState<BirlesikIslem[]>([]);

  // Düzenleme state'leri
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState("");

  // İşlem düzenleme - Akordeon
  const [expandedIslemId, setExpandedIslemId] = useState<string | null>(null);
  const [editIslemDate, setEditIslemDate] = useState<Date>(new Date());
  const [editIslemAmount, setEditIslemAmount] = useState("");
  const [editIslemDesc, setEditIslemDesc] = useState("");
  const [editIslemKategori, setEditIslemKategori] = useState("");
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Yeni işlem ekleme state'leri
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
  const [kategoriSearch, setKategoriSearch] = useState("");

  const kasa = kasalar.find((k) => k.id === id);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id && id) {
      fetchKasaIslemleri();
      fetchKategoriler();
      fetchCariler();
      fetchPersoneller();
    }
  }, [profile?.restaurant_id, id]);

  const loadData = async () => {
    await fetchProfile();
    await fetchKasalar();
    await fetchCariler();
    await fetchPersoneller();
  };

  const fetchKasaIslemleri = async () => {
    if (!id || !profile?.restaurant_id) return;

    // Ana işlemler - hem kasa_id hem kasa_hedef_id ile (transfer giriş/çıkış)
    const { data: islemlerData, error: islemlerError } = await supabase
      .from("islemler")
      .select(`*, cari:cariler(id, name, type), kategori:kategoriler(id, name)`)
      .eq("restaurant_id", profile.restaurant_id)
      .or(`kasa_id.eq.${id},kasa_hedef_id.eq.${id}`)
      .order("date", { ascending: false });

    if (islemlerError) {
      console.log("İşlemler çekme hatası:", islemlerError);
    }

    // Personel işlemleri
    const { data: personelData, error: personelError } = await supabase
      .from("personel_islemler")
      .select(`*, personel:personel(id, name)`)
      .eq("restaurant_id", profile.restaurant_id)
      .eq("kasa_id", id)
      .order("date", { ascending: false });

    if (personelError) {
      console.log("Personel işlemleri çekme hatası:", personelError);
    }

    const birlesikListe: BirlesikIslem[] = [];

    (islemlerData || []).forEach((islem) => {
      // Transfer işleminde bu kasa hedef mi (giriş) yoksa kaynak mı (çıkış)?
      const isTransferIn =
        islem.type === "transfer" && islem.kasa_hedef_id === id;

      // Transfer için ilgili kasayı bul
      let relatedKasa: { id: string; name: string } | undefined = undefined;
      if (islem.type === "transfer") {
        const relatedKasaId = isTransferIn
          ? islem.kasa_id
          : islem.kasa_hedef_id;
        const foundKasa = kasalar.find((k) => k.id === relatedKasaId);
        if (foundKasa) relatedKasa = { id: foundKasa.id, name: foundKasa.name };
      }

      birlesikListe.push({
        id: islem.id,
        type: islem.type,
        amount: islem.amount,
        description: islem.description,
        date: islem.date,
        kasa_id: islem.kasa_id,
        kasa_hedef_id: islem.kasa_hedef_id,
        kategori_id: islem.kategori_id,
        source: "islem",
        cari: islem.cari,
        kategori: islem.kategori,
        target_kasa: relatedKasa,
        isTransferIn,
      });
    });

    (personelData || []).forEach((islem) => {
      birlesikListe.push({
        id: islem.id,
        type:
          islem.type === "odeme"
            ? "personel_odeme"
            : islem.type === "tahsilat"
            ? "personel_tahsilat"
            : islem.type,
        amount: islem.amount,
        description: islem.description,
        date: islem.date,
        kasa_id: islem.kasa_id,
        source: "personel",
        personel: islem.personel,
      });
    });

    birlesikListe.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setKasaIslemleri(birlesikListe);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchKasaIslemleri();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Tarih ayracı için uzun format (10 Aralık 2025)
  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Tarih karşılaştırması için sadece tarih kısmı (2025-12-10)
  const getDateKey = (dateStr: string) => {
    return dateStr.split("T")[0];
  };

  const getIslemIcon = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") {
      return islem.isTransferIn ? (
        <ArrowDownLeft size={22} color="#f59e0b" />
      ) : (
        <ArrowUpRight size={22} color="#f59e0b" />
      );
    }
    const icons: Record<string, React.ReactNode> = {
      gelir: <ArrowDownLeft size={22} color="#10b981" />,
      gider: <ArrowUpRight size={22} color="#ef4444" />,
      odeme: <ArrowUpRight size={22} color="#3b82f6" />,
      tahsilat: <ArrowDownLeft size={22} color="#8b5cf6" />,
      personel_odeme: <ArrowUpRight size={22} color="#ec4899" />,
      personel_tahsilat: <ArrowDownLeft size={22} color="#14b8a6" />,
    };
    return icons[islem.type] || <ArrowRightLeft size={22} color="#6b7280" />;
  };

  const getIslemColor = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") return "#f59e0b";
    const colors: Record<string, string> = {
      gelir: "#10b981",
      gider: "#ef4444",
      odeme: "#3b82f6",
      tahsilat: "#8b5cf6",
      personel_odeme: "#ec4899",
      personel_tahsilat: "#14b8a6",
    };
    return colors[islem.type] || "#6b7280";
  };

  const getIslemLabel = (islem: BirlesikIslem) => {
    if (islem.type === "transfer")
      return islem.isTransferIn ? "TRANSFER (Giriş)" : "TRANSFER (Çıkış)";
    const labels: Record<string, string> = {
      gelir: "GELİR",
      gider: "GİDER",
      odeme: "CARİ ÖDEME",
      tahsilat: "CARİ TAHSİLAT",
      personel_odeme: "PERSONEL ÖDEME",
      personel_tahsilat: "PERSONEL TAHSİLAT",
    };
    return labels[islem.type] || islem.type.toUpperCase();
  };

  const getIslemSign = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") return islem.isTransferIn ? "+" : "-";
    if (["gelir", "tahsilat", "personel_tahsilat"].includes(islem.type))
      return "+";
    return "-";
  };

  // ===== HESAP İŞLEMLERİ =====

  const handleEditName = async () => {
    if (!editName.trim()) {
      Alert.alert("Hata", "Hesap adı boş olamaz");
      return;
    }
    setLoading(true);
    try {
      await supabase
        .from("kasalar")
        .update({ name: editName.trim() })
        .eq("id", id);
      await fetchKasalar();
      setShowEditName(false);
      Alert.alert("Başarılı", "Hesap adı güncellendi");
    } catch (error) {
      Alert.alert("Hata", "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    setShowMenu(false);
    Alert.alert(
      "Arşive Al",
      `"${kasa?.name}" hesabını arşive almak istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşive Al",
          onPress: async () => {
            setLoading(true);
            try {
              await supabase
                .from("kasalar")
                .update({ is_archived: true })
                .eq("id", id);
              await fetchKasalar();
              router.back();
            } catch (error) {
              Alert.alert("Hata", "İşlem başarısız");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      "Hesabı Sil",
      `"${kasa?.name}" hesabını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve hesaba ait tüm işlemler silinecektir.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Önce bu kasaya ait işlemleri sil
              await supabase.from("islemler").delete().eq("kasa_id", id);
              await supabase
                .from("personel_islemler")
                .delete()
                .eq("kasa_id", id);
              // Sonra kasayı sil
              await supabase.from("kasalar").delete().eq("id", id);
              await fetchKasalar();
              router.back();
            } catch (error) {
              Alert.alert("Hata", "Silme işlemi başarısız");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleExcludeFromProfit = async () => {
    if (!kasa) return;
    setLoading(true);
    try {
      await supabase
        .from("kasalar")
        .update({ exclude_from_profit: !kasa.exclude_from_profit })
        .eq("id", id);
      await fetchKasalar();
    } catch (error) {
      Alert.alert("Hata", "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  // ===== İŞLEM DÜZENLEME =====

  // Akordeon aç/kapa
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
    if (!editIslemAmount || isNaN(parseFloat(editIslemAmount))) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    setLoading(true);
    try {
      const dateString = editIslemDate.toISOString().split("T")[0];
      const newAmount = parseFloat(editIslemAmount);
      const amountDiff = newAmount - islem.amount;

      if (islem.source === "personel") {
        // Personel işlemi güncelleme
        await supabase
          .from("personel_islemler")
          .update({
            date: dateString,
            amount: newAmount,
            description: editIslemDesc || null,
          })
          .eq("id", islem.id);

        // Kasa bakiyesini güncelle
        if (islem.kasa_id && amountDiff !== 0) {
          const balanceChange =
            islem.type === "personel_odeme" ? -amountDiff : amountDiff;
          await supabase.rpc("update_kasa_balance", {
            kasa_id: islem.kasa_id,
            amount: balanceChange,
          });
        }
      } else {
        // Normal işlem güncelleme
        await supabase
          .from("islemler")
          .update({
            date: dateString,
            amount: newAmount,
            description: editIslemDesc || null,
            kategori_id: editIslemKategori || null,
          })
          .eq("id", islem.id);

        // Kasa bakiyesini güncelle
        if (islem.kasa_id && amountDiff !== 0) {
          let balanceChange = 0;
          if (islem.type === "gelir" || islem.type === "tahsilat") {
            balanceChange = amountDiff;
          } else if (islem.type === "gider" || islem.type === "odeme") {
            balanceChange = -amountDiff;
          }
          if (balanceChange !== 0) {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: islem.kasa_id,
              amount: balanceChange,
            });
          }
        }

        // Cari bakiyesini güncelle
        if (islem.cari?.id && amountDiff !== 0) {
          let cariChange = 0;
          if (islem.type === "gider") cariChange = amountDiff;
          else if (islem.type === "gelir") cariChange = -amountDiff;
          else if (islem.type === "odeme") cariChange = -amountDiff;
          else if (islem.type === "tahsilat") cariChange = amountDiff;
          if (cariChange !== 0) {
            await supabase.rpc("update_cari_balance", {
              cari_id: islem.cari.id,
              amount: cariChange,
            });
          }
        }
      }

      await fetchKasalar();
      await fetchKasaIslemleri();
      setExpandedIslemId(null);
      Alert.alert("Başarılı", "İşlem güncellendi");
    } catch (error) {
      Alert.alert("Hata", "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIslem = (islem: BirlesikIslem) => {
    Alert.alert(
      "İşlemi Sil",
      `${formatCurrency(
        islem.amount
      )} tutarındaki işlemi silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              if (islem.source === "personel") {
                // Personel işlemi silme
                let balanceChange =
                  islem.type === "personel_odeme"
                    ? islem.amount
                    : -islem.amount;
                if (islem.kasa_id) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount:
                      islem.type === "personel_odeme"
                        ? islem.amount
                        : -islem.amount,
                  });
                }
                await supabase
                  .from("personel_islemler")
                  .delete()
                  .eq("id", islem.id);
              } else {
                // Normal işlem silme
                if (islem.type === "transfer") {
                  // Transfer silindiğinde: kaynak kasaya para geri ekle, hedef kasadan para çıkar
                  if (islem.kasa_id)
                    await supabase.rpc("update_kasa_balance", {
                      kasa_id: islem.kasa_id,
                      amount: islem.amount,
                    });
                  if (islem.kasa_hedef_id)
                    await supabase.rpc("update_kasa_balance", {
                      kasa_id: islem.kasa_hedef_id,
                      amount: -islem.amount,
                    });
                } else {
                  let kasaChange = 0;
                  if (islem.type === "gelir" || islem.type === "tahsilat")
                    kasaChange = -islem.amount;
                  else if (islem.type === "gider" || islem.type === "odeme")
                    kasaChange = islem.amount;
                  if (kasaChange !== 0 && islem.kasa_id) {
                    await supabase.rpc("update_kasa_balance", {
                      kasa_id: islem.kasa_id,
                      amount: kasaChange,
                    });
                  }
                  if (islem.cari?.id) {
                    let cariChange = 0;
                    if (islem.type === "gider") cariChange = -islem.amount;
                    else if (islem.type === "gelir") cariChange = islem.amount;
                    else if (islem.type === "odeme") cariChange = islem.amount;
                    else if (islem.type === "tahsilat")
                      cariChange = -islem.amount;
                    if (cariChange !== 0)
                      await supabase.rpc("update_cari_balance", {
                        cari_id: islem.cari.id,
                        amount: cariChange,
                      });
                  }
                }
                await supabase.from("islemler").delete().eq("id", islem.id);
              }
              await fetchKasalar();
              await fetchKasaIslemleri();
              setExpandedIslemId(null);
              Alert.alert("Başarılı", "İşlem silindi");
            } catch (error) {
              Alert.alert("Hata", "Silme başarısız");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Yeni işlem ekleme fonksiyonları
  const resetForm = () => {
    setFormAmount("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormKategoriId("");
    setFormTargetType("cari");
    setFormTargetId("");
    setFormTargetKasaId("");
    setShowFormDatePicker(false);
  };

  const handleSubmitIslem = async () => {
    if (
      !formAmount ||
      isNaN(parseFloat(formAmount)) ||
      parseFloat(formAmount) <= 0
    ) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }
    if (!activeIslemTipi || !kasa) return;

    // Ödeme/tahsilat için hedef seçimi kontrolü
    if (
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat") &&
      !formTargetId
    ) {
      Alert.alert("Hata", "Lütfen bir cari veya personel seçin");
      return;
    }

    // Transfer için hedef kasa kontrolü
    if (activeIslemTipi === "transfer" && !formTargetKasaId) {
      Alert.alert("Hata", "Lütfen hedef kasa seçin");
      return;
    }

    setLoading(true);
    const amount = parseFloat(formAmount);
    let description = formDescription.trim();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Kullanıcı bulunamadı");

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
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: amount,
        });
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
        if (formTargetType === "personel") {
          const personel = personeller.find((p) => p.id === formTargetId);
          if (!description)
            description = `${personel?.name || "Personel"} - Ödeme`;
          await supabase.from("personel_islemler").insert({
            type: "odeme",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            personel_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: -amount,
          });
          await supabase.rpc("update_personel_balance", {
            personel_id: formTargetId,
            amount: -amount,
          });
        } else if (formTargetType === "cari") {
          const cari = cariler.find((c) => c.id === formTargetId);
          if (!description) description = `${cari?.name || "Cari"} - Ödeme`;
          await supabase.from("islemler").insert({
            type: "odeme",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            cari_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: -amount,
          });
          await supabase.rpc("update_cari_balance", {
            cari_id: formTargetId,
            amount: -amount,
          });
        }
      } else if (activeIslemTipi === "tahsilat") {
        if (formTargetType === "personel") {
          const personel = personeller.find((p) => p.id === formTargetId);
          if (!description)
            description = `${personel?.name || "Personel"} - Tahsilat`;
          await supabase.from("personel_islemler").insert({
            type: "tahsilat",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            personel_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: amount,
          });
          await supabase.rpc("update_personel_balance", {
            personel_id: formTargetId,
            amount: amount,
          });
        } else if (formTargetType === "cari") {
          const cari = cariler.find((c) => c.id === formTargetId);
          if (!description) description = `${cari?.name || "Cari"} - Tahsilat`;
          await supabase.from("islemler").insert({
            type: "tahsilat",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            cari_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: amount,
          });
          await supabase.rpc("update_cari_balance", {
            cari_id: formTargetId,
            amount: amount,
          });
        }
      } else if (activeIslemTipi === "transfer") {
        const targetKasa = kasalar.find((k) => k.id === formTargetKasaId);
        if (!description)
          description = `${kasa.name} → ${targetKasa?.name || "Hedef Kasa"}`;
        await supabase.from("islemler").insert({
          type: "transfer",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kasa_hedef_id: formTargetKasaId,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: -amount,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: formTargetKasaId,
          amount: amount,
        });
      }

      Alert.alert("Başarılı", "İşlem kaydedildi");
      resetForm();
      setActiveIslemTipi(null);
      fetchKasalar();
      fetchKasaIslemleri();
    } catch (error) {
      console.log("İşlem hatası:", error);
      Alert.alert("Hata", "İşlem kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  const getIslemTipiColor = (tip: IslemTipi) => {
    const colors: Record<IslemTipi, string> = {
      gelir: "#10b981",
      gider: "#ef4444",
      odeme: "#3b82f6",
      tahsilat: "#8b5cf6",
      transfer: "#f59e0b",
    };
    return colors[tip];
  };

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

  const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
  const IconComponent = iconConfig.icon;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
        {/* Header */}
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
        {/* Hesap Bilgisi */}
        <View style={styles.accountCard}>
          <View
            style={[
              styles.accountIcon,
              { backgroundColor: iconConfig.bgColor },
            ]}
          >
            <IconComponent size={32} color={iconConfig.color} />
          </View>
          <View style={styles.accountInfo}>
            <TouchableOpacity
              onPress={() => {
                setEditName(kasa.name);
                setShowEditName(true);
              }}
            >
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>{kasa.name}</Text>
                <Edit3 size={16} color="#9ca3af" />
              </View>
            </TouchableOpacity>
            <Text style={styles.accountType}>
              {kasa.type === "nakit"
                ? "Nakit"
                : kasa.type === "banka"
                ? "Banka"
                : kasa.type === "kredi_karti"
                ? "Kredi Kartı"
                : "Birikim"}
            </Text>
          </View>
          <Text
            style={[
              styles.accountBalance,
              kasa.balance < 0 && { color: "#ef4444" },
            ]}
          >
            {formatCurrency(kasa.balance)}
          </Text>
        </View>

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
              onValueChange={handleToggleExcludeFromProfit}
              trackColor={{ false: "#e5e7eb", true: "#86efac" }}
              thumbColor={!kasa.exclude_from_profit ? "#10b981" : "#9ca3af"}
            />
          </View>
        </View>

        {/* İşlem Geçmişi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            İşlem Geçmişi ({kasaIslemleri.length})
          </Text>

          {kasaIslemleri.length > 0 ? (
            kasaIslemleri.map((islem, index) => {
              const isExpanded = expandedIslemId === islem.id;
              // Önceki işlemin tarihiyle karşılaştır
              const prevIslem = index > 0 ? kasaIslemleri[index - 1] : null;
              const showDateHeader =
                !prevIslem ||
                getDateKey(prevIslem.date) !== getDateKey(islem.date);

              return (
                <View key={`${islem.source}-${islem.id}`}>
                  {/* Tarih Ayracı */}
                  {showDateHeader && (
                    <View style={styles.dateSeparator}>
                      <View style={styles.dateSeparatorLine} />
                      <Text style={styles.dateSeparatorText}>
                        {formatDateHeader(islem.date)}
                      </Text>
                      <View style={styles.dateSeparatorLine} />
                    </View>
                  )}

                  <View style={styles.islemCard}>
                    {/* Üst Kısım - Tıklanabilir */}
                    <TouchableOpacity
                      style={styles.islemHeader}
                      onPress={() => toggleIslemExpand(islem)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.islemLeft}>
                        <View
                          style={[
                            styles.islemIconBox,
                            { backgroundColor: `${getIslemColor(islem)}15` },
                          ]}
                        >
                          {getIslemIcon(islem)}
                        </View>
                        <View style={styles.islemInfo}>
                          <Text
                            style={[
                              styles.islemType,
                              { color: getIslemColor(islem) },
                            ]}
                          >
                            {getIslemLabel(islem)}
                          </Text>
                          {islem.cari && (
                            <Text style={styles.islemCari}>
                              {islem.cari.name}
                            </Text>
                          )}
                          {islem.personel && (
                            <Text style={styles.islemPersonel}>
                              {islem.personel.name}
                            </Text>
                          )}
                          {islem.kategori && (
                            <Text style={styles.islemKategori}>
                              {islem.kategori.name}
                            </Text>
                          )}
                          {islem.type === "transfer" && islem.target_kasa && (
                            <Text style={styles.islemTransferKasa}>
                              {islem.isTransferIn ? "← " : "→ "}
                              {islem.target_kasa.name}
                            </Text>
                          )}
                          {islem.description && (
                            <Text
                              style={styles.islemDesc}
                              numberOfLines={isExpanded ? undefined : 1}
                            >
                              {islem.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.islemRight}>
                        <Text
                          style={[
                            styles.islemAmount,
                            { color: getIslemColor(islem) },
                          ]}
                        >
                          {getIslemSign(islem)}
                          {formatCurrency(islem.amount)}
                        </Text>
                        {isExpanded ? (
                          <ChevronUp size={20} color="#9ca3af" />
                        ) : (
                          <ChevronDown size={20} color="#9ca3af" />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Genişleyen Düzenleme Alanı */}
                    {isExpanded && (
                      <View style={styles.islemExpandedContent}>
                        {/* Tutar */}
                        <View style={styles.editRow}>
                          <Text style={styles.editRowLabel}>Tutar</Text>
                          <View style={styles.editAmountBox}>
                            <Text style={styles.editCurrency}>₺</Text>
                            <TextInput
                              style={styles.editAmountInput}
                              value={editIslemAmount}
                              onChangeText={setEditIslemAmount}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#9ca3af"
                            />
                          </View>
                        </View>

                        {/* Tarih */}
                        <View style={styles.editRow}>
                          <Text style={styles.editRowLabel}>Tarih</Text>
                          <TouchableOpacity
                            style={styles.editDateBtn}
                            onPress={() => setShowDatePicker(true)}
                          >
                            <Calendar size={18} color="#6b7280" />
                            <Text style={styles.editDateText}>
                              {editIslemDate.toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {showDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View style={styles.iosDatePicker}>
                              <DateTimePicker
                                value={editIslemDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, date) => {
                                  if (date) setEditIslemDate(date);
                                }}
                                locale="tr-TR"
                              />
                              <TouchableOpacity
                                style={styles.datePickerDoneBtn}
                                onPress={() => setShowDatePicker(false)}
                              >
                                <Text style={styles.datePickerDoneBtnText}>
                                  Tamam
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <DateTimePicker
                              value={editIslemDate}
                              mode="date"
                              display="default"
                              onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date) setEditIslemDate(date);
                              }}
                            />
                          ))}

                        {/* Kategori - sadece gelir/gider için */}
                        {islem.source === "islem" &&
                          ["gelir", "gider"].includes(islem.type) && (
                            <View style={styles.editRow}>
                              <Text style={styles.editRowLabel}>Kategori</Text>
                              <TouchableOpacity
                                style={styles.editSelectBtn}
                                onPress={() => setShowKategoriPicker(true)}
                              >
                                <Text
                                  style={[
                                    styles.editSelectText,
                                    !editIslemKategori && { color: "#9ca3af" },
                                  ]}
                                >
                                  {editIslemKategori
                                    ? kategoriler.find(
                                        (k) => k.id === editIslemKategori
                                      )?.name
                                    : "Seçilmedi"}
                                </Text>
                                <ChevronDown size={18} color="#6b7280" />
                              </TouchableOpacity>
                            </View>
                          )}

                        {/* Açıklama */}
                        <View style={styles.editRow}>
                          <Text style={styles.editRowLabel}>Açıklama</Text>
                          <TextInput
                            style={styles.editDescInput}
                            value={editIslemDesc}
                            onChangeText={setEditIslemDesc}
                            placeholder="Açıklama ekle..."
                            placeholderTextColor="#9ca3af"
                          />
                        </View>

                        {/* Butonlar */}
                        <View style={styles.editBtnRow}>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteIslem(islem)}
                          >
                            <Trash2 size={18} color="#ef4444" />
                            <Text style={styles.deleteBtnText}>Sil</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.saveBtn,
                              loading && { opacity: 0.6 },
                            ]}
                            onPress={() => handleSaveIslem(islem)}
                            disabled={loading}
                          >
                            <Check size={18} color="#fff" />
                            <Text style={styles.saveBtnText}>
                              {loading ? "..." : "Kaydet"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Alt İşlem Butonları */}
      {!activeIslemTipi && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#dcfce7" }]}
            onPress={() => setActiveIslemTipi("gelir")}
          >
            <ArrowDownLeft size={20} color="#10b981" />
            <Text style={[styles.actionBtnText, { color: "#10b981" }]}>
              Gelir
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
            onPress={() => setActiveIslemTipi("gider")}
          >
            <ArrowUpRight size={20} color="#ef4444" />
            <Text style={[styles.actionBtnText, { color: "#ef4444" }]}>
              Gider
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#dbeafe" }]}
            onPress={() => setActiveIslemTipi("odeme")}
          >
            <ArrowUpRight size={20} color="#3b82f6" />
            <Text style={[styles.actionBtnText, { color: "#3b82f6" }]}>
              Ödeme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#ede9fe" }]}
            onPress={() => setActiveIslemTipi("tahsilat")}
          >
            <ArrowDownLeft size={20} color="#8b5cf6" />
            <Text style={[styles.actionBtnText, { color: "#8b5cf6" }]}>
              Tahsilat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#fef3c7" }]}
            onPress={() => setActiveIslemTipi("transfer")}
          >
            <ArrowRightLeft size={20} color="#f59e0b" />
            <Text style={[styles.actionBtnText, { color: "#f59e0b" }]}>
              Transfer
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* İşlem Formu */}
      {activeIslemTipi && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          <View style={styles.formHeader}>
            <Text
              style={[
                styles.formTitle,
                { color: getIslemTipiColor(activeIslemTipi) },
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
          <View style={styles.formRow}>
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
          </View>

          {/* Tarih Seçici */}
          <TouchableOpacity
            style={styles.formDateBtn}
            onPress={() => setShowFormDatePicker(true)}
          >
            <Calendar size={18} color="#6b7280" />
            <Text style={styles.formDateText}>{formatDate(formDate)}</Text>
            <ChevronDown size={16} color="#6b7280" />
          </TouchableOpacity>

          {/* iOS Date Picker */}
          {showFormDatePicker && Platform.OS === "ios" && (
            <View style={styles.iosDatePickerForm}>
              <DateTimePicker
                value={new Date(formDate)}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setFormDate(date.toISOString().split("T")[0]);
                }}
                locale="tr-TR"
              />
              <TouchableOpacity
                style={styles.datePickerDoneBtn}
                onPress={() => setShowFormDatePicker(false)}
              >
                <Text style={styles.datePickerDoneBtnText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Android Date Picker */}
          {showFormDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={new Date(formDate)}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowFormDatePicker(false);
                if (date) setFormDate(date.toISOString().split("T")[0]);
              }}
            />
          )}

          {/* Ödeme/Tahsilat için Cari/Personel Seçimi */}
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
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>
            </>
          )}

          {/* Transfer için Hedef Kasa Seçimi */}
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
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>
          )}

          {/* Gelir/Gider için Kategori */}
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
                  : "Kategori Seç (opsiyonel)"}
              </Text>
              <ChevronDown size={18} color="#6b7280" />
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

          {/* Kaydet Butonu */}
          <TouchableOpacity
            style={[
              styles.formSubmitBtn,
              { backgroundColor: getIslemTipiColor(activeIslemTipi) },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleSubmitIslem}
            disabled={loading}
          >
            <Text style={styles.formSubmitBtnText}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {/* Menü Modal */}
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
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Archive size={20} color="#f59e0b" />
              <Text style={[styles.menuItemText, { color: "#f59e0b" }]}>
                Arşive Al
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                Hesabı Sil
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* İsim Düzenleme Modal */}
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
            <View style={styles.editNameBtnRow}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={() => setShowEditName(false)}
              >
                <Text style={styles.editCancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editSaveBtn, loading && { opacity: 0.6 }]}
                onPress={handleEditName}
                disabled={loading}
              >
                <Text style={styles.editSaveBtnText}>
                  {loading ? "..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Kategori Picker Modal */}
      {/* Kategori Picker Modal - Tam Ekran (İşlem Düzenleme) */}
      <Modal
        visible={showKategoriPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowKategoriPicker(false);
          setKategoriSearch("");
        }}
      >
        <SafeAreaView style={styles.kategoriModalContainer}>
          <View style={styles.kategoriModalHeader}>
            <Text style={styles.kategoriModalTitle}>Kategori Seç</Text>
            <TouchableOpacity
              style={styles.kategoriModalCloseBtn}
              onPress={() => {
                setShowKategoriPicker(false);
                setKategoriSearch("");
              }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.kategoriSearchContainer}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.kategoriSearchInput}
              placeholder="Kategori ara..."
              placeholderTextColor="#9ca3af"
              value={kategoriSearch}
              onChangeText={setKategoriSearch}
            />
          </View>

          <ScrollView
            style={styles.kategoriScrollView}
            contentContainerStyle={styles.kategoriListContent}
          >
            <TouchableOpacity
              style={[
                styles.kategoriModalItem,
                !editIslemKategori && styles.kategoriModalItemActive,
              ]}
              onPress={() => {
                setEditIslemKategori("");
                setShowKategoriPicker(false);
                setKategoriSearch("");
              }}
            >
              <Text
                style={[
                  styles.kategoriModalItemText,
                  !editIslemKategori && styles.kategoriModalItemTextActive,
                ]}
              >
                Kategorisiz
              </Text>
              {!editIslemKategori && <Check size={20} color="#10b981" />}
            </TouchableOpacity>

            <View style={styles.kategoriSeparator} />

            {(() => {
              const currentIslem = kasaIslemleri.find(
                (i) => i.id === expandedIslemId
              );
              const islemType = currentIslem?.type;
              return kategoriler
                .filter((k) => k.type === islemType && !k.parent_id)
                .filter(
                  (k) =>
                    kategoriSearch === "" ||
                    k.name
                      .toLowerCase()
                      .includes(kategoriSearch.toLowerCase()) ||
                    kategoriler.some(
                      (sub) =>
                        sub.parent_id === k.id &&
                        sub.name
                          .toLowerCase()
                          .includes(kategoriSearch.toLowerCase())
                    )
                )
                .map((anaKategori) => {
                  const altKategoriler = kategoriler
                    .filter((k) => k.parent_id === anaKategori.id)
                    .filter(
                      (k) =>
                        kategoriSearch === "" ||
                        k.name
                          .toLowerCase()
                          .includes(kategoriSearch.toLowerCase())
                    );

                  return (
                    <View key={anaKategori.id} style={styles.kategoriGroup}>
                      <TouchableOpacity
                        style={[
                          styles.kategoriAnaBaslik,
                          editIslemKategori === anaKategori.id &&
                            styles.kategoriModalItemActive,
                        ]}
                        onPress={() => {
                          setEditIslemKategori(anaKategori.id);
                          setShowKategoriPicker(false);
                          setKategoriSearch("");
                        }}
                      >
                        <Text style={styles.kategoriAnaBaslikText}>
                          {anaKategori.name}
                        </Text>
                        {editIslemKategori === anaKategori.id && (
                          <Check size={20} color="#10b981" />
                        )}
                      </TouchableOpacity>

                      {altKategoriler.map((altKategori) => (
                        <TouchableOpacity
                          key={altKategori.id}
                          style={[
                            styles.kategoriAltItem,
                            editIslemKategori === altKategori.id &&
                              styles.kategoriModalItemActive,
                          ]}
                          onPress={() => {
                            setEditIslemKategori(altKategori.id);
                            setShowKategoriPicker(false);
                            setKategoriSearch("");
                          }}
                        >
                          <Text
                            style={[
                              styles.kategoriAltItemText,
                              editIslemKategori === altKategori.id &&
                                styles.kategoriModalItemTextActive,
                            ]}
                          >
                            {altKategori.name}
                          </Text>
                          {editIslemKategori === altKategori.id && (
                            <Check size={20} color="#10b981" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                });
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Form Kategori Picker Modal - Tam Ekran (Yeni İşlem) */}
      <Modal
        visible={showFormKategoriPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowFormKategoriPicker(false);
          setKategoriSearch("");
        }}
      >
        <SafeAreaView style={styles.kategoriModalContainer}>
          <View style={styles.kategoriModalHeader}>
            <Text style={styles.kategoriModalTitle}>Kategori Seç</Text>
            <TouchableOpacity
              style={styles.kategoriModalCloseBtn}
              onPress={() => {
                setShowFormKategoriPicker(false);
                setKategoriSearch("");
              }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.kategoriSearchContainer}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.kategoriSearchInput}
              placeholder="Kategori ara..."
              placeholderTextColor="#9ca3af"
              value={kategoriSearch}
              onChangeText={setKategoriSearch}
            />
          </View>

          <ScrollView
            style={styles.kategoriScrollView}
            contentContainerStyle={styles.kategoriListContent}
          >
            <TouchableOpacity
              style={[
                styles.kategoriModalItem,
                !formKategoriId && styles.kategoriModalItemActive,
              ]}
              onPress={() => {
                setFormKategoriId("");
                setShowFormKategoriPicker(false);
                setKategoriSearch("");
              }}
            >
              <Text
                style={[
                  styles.kategoriModalItemText,
                  !formKategoriId && styles.kategoriModalItemTextActive,
                ]}
              >
                Kategorisiz
              </Text>
              {!formKategoriId && <Check size={20} color="#10b981" />}
            </TouchableOpacity>

            <View style={styles.kategoriSeparator} />

            {kategoriler
              .filter((k) => k.type === activeIslemTipi && !k.parent_id)
              .filter(
                (k) =>
                  kategoriSearch === "" ||
                  k.name.toLowerCase().includes(kategoriSearch.toLowerCase()) ||
                  kategoriler.some(
                    (sub) =>
                      sub.parent_id === k.id &&
                      sub.name
                        .toLowerCase()
                        .includes(kategoriSearch.toLowerCase())
                  )
              )
              .map((anaKategori) => {
                const altKategoriler = kategoriler
                  .filter((k) => k.parent_id === anaKategori.id)
                  .filter(
                    (k) =>
                      kategoriSearch === "" ||
                      k.name
                        .toLowerCase()
                        .includes(kategoriSearch.toLowerCase())
                  );

                return (
                  <View key={anaKategori.id} style={styles.kategoriGroup}>
                    <TouchableOpacity
                      style={[
                        styles.kategoriAnaBaslik,
                        formKategoriId === anaKategori.id &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setFormKategoriId(anaKategori.id);
                        setShowFormKategoriPicker(false);
                        setKategoriSearch("");
                      }}
                    >
                      <Text style={styles.kategoriAnaBaslikText}>
                        {anaKategori.name}
                      </Text>
                      {formKategoriId === anaKategori.id && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>

                    {altKategoriler.map((altKategori) => (
                      <TouchableOpacity
                        key={altKategori.id}
                        style={[
                          styles.kategoriAltItem,
                          formKategoriId === altKategori.id &&
                            styles.kategoriModalItemActive,
                        ]}
                        onPress={() => {
                          setFormKategoriId(altKategori.id);
                          setShowFormKategoriPicker(false);
                          setKategoriSearch("");
                        }}
                      >
                        <Text
                          style={[
                            styles.kategoriAltItemText,
                            formKategoriId === altKategori.id &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {altKategori.name}
                        </Text>
                        {formKategoriId === altKategori.id && (
                          <Check size={20} color="#10b981" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Target (Cari/Personel) Picker Modal - Tam Ekran */}
      <Modal
        visible={showTargetPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTargetPicker(false)}
      >
        <SafeAreaView style={styles.kategoriModalContainer}>
          <View style={styles.kategoriModalHeader}>
            <Text style={styles.kategoriModalTitle}>
              {formTargetType === "cari" ? "Cari Seç" : "Personel Seç"}
            </Text>
            <TouchableOpacity
              style={styles.kategoriModalCloseBtn}
              onPress={() => setShowTargetPicker(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.kategoriScrollView}
            contentContainerStyle={styles.kategoriListContent}
          >
            {formTargetType === "cari"
              ? cariler
                  .filter((c) => !c.is_archived)
                  .map((cari) => (
                    <TouchableOpacity
                      key={cari.id}
                      style={[
                        styles.targetPickerItem,
                        formTargetId === cari.id &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setFormTargetId(cari.id);
                        setShowTargetPicker(false);
                      }}
                    >
                      <View>
                        <Text
                          style={[
                            styles.targetPickerItemName,
                            formTargetId === cari.id &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {cari.name}
                        </Text>
                        <Text style={styles.targetPickerItemSubtext}>
                          {cari.type === "musteri" ? "Müşteri" : "Tedarikçi"}
                        </Text>
                      </View>
                      {formTargetId === cari.id && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))
              : personeller
                  .filter((p) => !p.is_archived)
                  .map((personel) => (
                    <TouchableOpacity
                      key={personel.id}
                      style={[
                        styles.targetPickerItem,
                        formTargetId === personel.id &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setFormTargetId(personel.id);
                        setShowTargetPicker(false);
                      }}
                    >
                      <View>
                        <Text
                          style={[
                            styles.targetPickerItemName,
                            formTargetId === personel.id &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {personel.name}
                        </Text>
                        {personel.position && (
                          <Text style={styles.targetPickerItemSubtext}>
                            {personel.position}
                          </Text>
                        )}
                      </View>
                      {formTargetId === personel.id && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Hedef Kasa Picker Modal - Tam Ekran */}
      <Modal
        visible={showKasaPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowKasaPicker(false)}
      >
        <SafeAreaView style={styles.kategoriModalContainer}>
          <View style={styles.kategoriModalHeader}>
            <Text style={styles.kategoriModalTitle}>Hedef Kasa Seç</Text>
            <TouchableOpacity
              style={styles.kategoriModalCloseBtn}
              onPress={() => setShowKasaPicker(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.kategoriScrollView}
            contentContainerStyle={styles.kategoriListContent}
          >
            {kasalar
              .filter((k) => k.id !== id && !k.is_archived)
              .map((k) => {
                const iconData = kasaIcons[k.type] || kasaIcons.nakit;
                const IconComp = iconData.icon;
                return (
                  <TouchableOpacity
                    key={k.id}
                    style={[
                      styles.kasaPickerItem,
                      formTargetKasaId === k.id &&
                        styles.kategoriModalItemActive,
                    ]}
                    onPress={() => {
                      setFormTargetKasaId(k.id);
                      setShowKasaPicker(false);
                    }}
                  >
                    <View style={styles.kasaPickerItemLeft}>
                      <View
                        style={[
                          styles.kasaPickerIcon,
                          { backgroundColor: iconData.bgColor },
                        ]}
                      >
                        <IconComp size={20} color={iconData.color} />
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.kasaPickerItemName,
                            formTargetKasaId === k.id &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {k.name}
                        </Text>
                        <Text style={styles.kasaPickerItemBalance}>
                          {formatCurrency(k.balance)}
                        </Text>
                      </View>
                    </View>
                    {formTargetKasaId === k.id && (
                      <Check size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

  // Account Card
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  accountInfo: { flex: 1, marginLeft: 14 },
  accountNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  accountName: { fontSize: 18, fontWeight: "600", color: "#111827" },
  accountType: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  accountBalance: { fontSize: 20, fontWeight: "700", color: "#111827" },

  // Settings
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  settingDesc: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  // Section
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  // Tarih Ayracı
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },

  // İşlem Card - Akordeon
  islemCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  islemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  islemLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  islemRight: { alignItems: "flex-end", gap: 6 },
  islemIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: { marginLeft: 14, flex: 1 },
  islemType: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  islemDate: { fontSize: 14, color: "#6b7280", marginTop: 3 },
  islemDesc: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
  islemCari: {
    fontSize: 14,
    color: "#3b82f6",
    marginTop: 3,
    fontWeight: "500",
  },
  islemPersonel: {
    fontSize: 14,
    color: "#ec4899",
    marginTop: 3,
    fontWeight: "500",
  },
  islemKategori: {
    fontSize: 13,
    color: "#8b5cf6",
    marginTop: 3,
    fontStyle: "italic",
  },
  islemTransferKasa: {
    fontSize: 14,
    color: "#f59e0b",
    marginTop: 3,
    fontWeight: "500",
  },
  islemAmount: { fontSize: 18, fontWeight: "700" },

  // Akordeon Genişlemiş Alan
  islemExpandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  editRow: { marginTop: 14 },
  editRowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  editAmountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 6,
  },
  editAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  editDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editDateText: { fontSize: 15, color: "#111827", flex: 1 },
  editSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editSelectText: { fontSize: 15, color: "#111827" },
  editDescInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editBtnRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
  },
  deleteBtnText: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#10b981",
  },
  saveBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  // Empty
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: { fontSize: 15, color: "#9ca3af" },

  // Menu Modal
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

  // Edit Name Modal
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
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
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
  editNameBtnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
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

  // Picker Modal
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "60%",
    overflow: "hidden",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerList: { maxHeight: 300 },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerItemSelected: { backgroundColor: "#dcfce7" },
  pickerItemText: { fontSize: 15, color: "#111827" },
  pickerItemSubtext: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  pickerItemWithIcon: { flexDirection: "row", alignItems: "center", gap: 12 },
  pickerKasaIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Date Picker (iOS)
  iosDatePicker: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  datePickerDoneBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    alignItems: "center",
  },
  datePickerDoneBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Bottom Actions
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 30,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 3,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 11, fontWeight: "600", marginTop: 4 },

  // Form Container
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
  formRow: { marginBottom: 12 },
  formAmountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  formSelectText: { fontSize: 15, color: "#111827" },
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

  // Kategori Modal Stilleri
  kategoriModalContainer: { flex: 1, backgroundColor: "#fff" },
  kategoriModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  kategoriModalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  kategoriModalCloseBtn: { padding: 4 },
  kategoriSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  kategoriSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  kategoriScrollView: { flex: 1 },
  kategoriListContent: { paddingHorizontal: 16, paddingBottom: 30 },
  kategoriModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  kategoriModalItemActive: {
    backgroundColor: "#f0fdf4",
    marginHorizontal: -4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  kategoriModalItemText: { fontSize: 16, color: "#374151" },
  kategoriModalItemTextActive: { color: "#10b981", fontWeight: "600" },
  kategoriSeparator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  kategoriGroup: { marginBottom: 16 },
  kategoriAnaBaslik: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 4,
  },
  kategoriAnaBaslikText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kategoriAltItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriAltItemText: { fontSize: 15, color: "#4b5563" },

  // Target Picker Stilleri
  targetPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  targetPickerItemName: { fontSize: 16, fontWeight: "500", color: "#111827" },
  targetPickerItemSubtext: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  // Kasa Picker Stilleri
  kasaPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kasaPickerItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  kasaPickerIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  kasaPickerItemName: { fontSize: 16, fontWeight: "500", color: "#111827" },
  kasaPickerItemBalance: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  // Form Tarih Seçici
  formDateBtn: {
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
  formDateText: { flex: 1, fontSize: 15, color: "#111827" },
  iosDatePickerForm: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
});
