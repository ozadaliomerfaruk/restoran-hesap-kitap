import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit3,
  Trash2,
  ShoppingCart,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Users,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Cari, Islem } from "../types";
import { supabase } from "../lib/supabase";

interface CariDetayModalProps {
  visible: boolean;
  onClose: () => void;
  cari: Cari | null;
}

export default function CariDetayModal({
  visible,
  onClose,
  cari,
}: CariDetayModalProps) {
  const { islemler, fetchIslemler, fetchCariler, fetchKasalar, cariler } =
    useStore();

  const [loading, setLoading] = useState(false);

  // Güncel cari bilgisini store'dan al
  const currentCari = cariler.find((c) => c.id === cari?.id) || cari;

  // Bu cariye ait işlemler
  const cariIslemleri = islemler
    .filter((i) => i.cari_id === currentCari?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (visible && cari) {
      fetchIslemler();
      fetchCariler();
    }
  }, [visible, cari]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getBalanceInfo = () => {
    if (!currentCari) return { text: "Borç yok", color: "#6b7280" };
    const balance = currentCari.balance || 0;

    if (currentCari.type === "tedarikci") {
      // Tedarikçi: pozitif = biz borçluyuz, negatif = tedarikçi borçlu (avans verdik)
      if (balance > 0) {
        return {
          text: `Borcumuz: ${formatCurrency(balance)}`,
          color: "#ef4444",
        };
      } else if (balance < 0) {
        return {
          text: `Alacağımız: ${formatCurrency(Math.abs(balance))}`,
          color: "#10b981",
        };
      }
    } else {
      // Müşteri: pozitif = müşteri borçlu, negatif = biz borçluyuz
      if (balance > 0) {
        return {
          text: `Alacağımız: ${formatCurrency(balance)}`,
          color: "#10b981",
        };
      } else if (balance < 0) {
        return {
          text: `Borcumuz: ${formatCurrency(Math.abs(balance))}`,
          color: "#ef4444",
        };
      }
    }
    return { text: "Borç yok", color: "#6b7280" };
  };

  const getIslemIcon = (type: string) => {
    switch (type) {
      case "gider":
        return <ShoppingCart size={16} color="#ef4444" />;
      case "gelir":
        return <RotateCcw size={16} color="#f59e0b" />;
      case "odeme":
        return <ArrowUpRight size={16} color="#3b82f6" />;
      case "tahsilat":
        return <ArrowDownLeft size={16} color="#10b981" />;
      default:
        return null;
    }
  };

  const getIslemLabel = (type: string) => {
    const labels: Record<string, string> = {
      gider: "ALIŞ",
      gelir: "İADE",
      odeme: "ÖDEME",
      tahsilat: "TAHSİLAT",
    };
    return labels[type] || type.toUpperCase();
  };

  const getIslemColor = (type: string) => {
    const colors: Record<string, string> = {
      gider: "#ef4444",
      gelir: "#f59e0b",
      odeme: "#3b82f6",
      tahsilat: "#10b981",
    };
    return colors[type] || "#6b7280";
  };

  const handleDeleteIslem = async (islem: Islem) => {
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

            // Cari bakiyesini geri al (silme = ters işlem)
            if (currentCari) {
              let cariBalanceChange = 0;

              // Silme işleminde ters mantık:
              // gider silindi → borcumuz azaldı
              // gelir silindi → borcumuz arttı
              // odeme silindi → borcumuz arttı
              // tahsilat silindi → müşteri borcu arttı
              if (islem.type === "gider") {
                cariBalanceChange = -islem.amount;
              } else if (islem.type === "gelir") {
                cariBalanceChange = islem.amount;
              } else if (islem.type === "odeme") {
                cariBalanceChange = islem.amount;
              } else if (islem.type === "tahsilat") {
                cariBalanceChange = islem.amount;
              }

              if (cariBalanceChange !== 0) {
                await supabase.rpc("update_cari_balance", {
                  cari_id: currentCari.id,
                  amount: cariBalanceChange,
                });
              }

              // Kasa bakiyesini geri al - SADECE kasa_id varsa
              if (islem.kasa_id) {
                let kasaBalanceChange = 0;
                // Silme işleminde ters mantık:
                // odeme silindi → kasaya geri ekle
                // tahsilat silindi → kasadan geri çıkar
                if (islem.type === "odeme" || islem.type === "gider") {
                  kasaBalanceChange = islem.amount; // Kasaya geri ekle
                } else if (
                  islem.type === "tahsilat" ||
                  islem.type === "gelir"
                ) {
                  kasaBalanceChange = -islem.amount; // Kasadan geri çıkar
                }

                if (kasaBalanceChange !== 0) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount: kasaBalanceChange,
                  });
                }
              }
            }

            const { error } = await supabase
              .from("islemler")
              .delete()
              .eq("id", islem.id);

            setLoading(false);

            if (error) {
              Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
            } else {
              fetchIslemler();
              fetchCariler();
              fetchKasalar();
            }
          },
        },
      ]
    );
  };

  if (!currentCari) return null;

  const balanceInfo = getBalanceInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cari Detay</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cari Bilgi Kartı */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.typeIcon,
                  {
                    backgroundColor:
                      currentCari.type === "tedarikci" ? "#dbeafe" : "#dcfce7",
                  },
                ]}
              >
                {currentCari.type === "tedarikci" ? (
                  <Building2 size={28} color="#3b82f6" />
                ) : (
                  <Users size={28} color="#10b981" />
                )}
              </View>
              <View style={styles.infoMain}>
                <Text style={styles.cariName}>{currentCari.name}</Text>
                <Text style={styles.cariType}>
                  {currentCari.type === "tedarikci" ? "Tedarikçi" : "Müşteri"}
                </Text>
              </View>
            </View>

            {/* İletişim Bilgileri */}
            <View style={styles.contactSection}>
              {currentCari.phone && (
                <View style={styles.contactRow}>
                  <Phone size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{currentCari.phone}</Text>
                </View>
              )}
              {currentCari.email && (
                <View style={styles.contactRow}>
                  <Mail size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{currentCari.email}</Text>
                </View>
              )}
              {currentCari.address && (
                <View style={styles.contactRow}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{currentCari.address}</Text>
                </View>
              )}
              {currentCari.tax_number && (
                <View style={styles.contactRow}>
                  <FileText size={16} color="#6b7280" />
                  <Text style={styles.contactText}>
                    VKN: {currentCari.tax_number}
                  </Text>
                </View>
              )}
            </View>

            {/* Bakiye */}
            <View
              style={[
                styles.balanceBox,
                { borderLeftColor: balanceInfo.color },
              ]}
            >
              <Text style={styles.balanceLabel}>Bakiye Durumu</Text>
              <Text
                style={[styles.balanceAmount, { color: balanceInfo.color }]}
              >
                {formatCurrency(Math.abs(currentCari.balance || 0))}
              </Text>
              <Text
                style={[styles.balanceStatus, { color: balanceInfo.color }]}
              >
                {balanceInfo.text}
              </Text>
            </View>
          </View>

          {/* İşlem Geçmişi */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>
              İşlem Geçmişi ({cariIslemleri.length})
            </Text>

            {cariIslemleri.length > 0 ? (
              cariIslemleri.map((islem) => (
                <View key={islem.id} style={styles.islemItem}>
                  <View style={styles.islemLeft}>
                    <View
                      style={[
                        styles.islemIconBox,
                        { backgroundColor: `${getIslemColor(islem.type)}15` },
                      ]}
                    >
                      {getIslemIcon(islem.type)}
                    </View>
                    <View style={styles.islemInfo}>
                      <Text
                        style={[
                          styles.islemType,
                          { color: getIslemColor(islem.type) },
                        ]}
                      >
                        {getIslemLabel(islem.type)}
                      </Text>
                      <Text style={styles.islemDate}>
                        {formatDate(islem.date)}
                      </Text>
                      {islem.description && (
                        <Text style={styles.islemDesc} numberOfLines={1}>
                          {islem.description}
                        </Text>
                      )}
                      {islem.kasa && (
                        <Text style={styles.islemKasa}>
                          {islem.type === "odeme" || islem.type === "gider"
                            ? "← "
                            : "→ "}
                          {islem.kasa.name}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.islemRight}>
                    <Text
                      style={[
                        styles.islemAmount,
                        { color: getIslemColor(islem.type) },
                      ]}
                    >
                      {islem.type === "gider" || islem.type === "odeme"
                        ? "-"
                        : "+"}
                      {formatCurrency(islem.amount)}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteIslem(islem)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Henüz işlem yok</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  infoMain: {
    marginLeft: 14,
    flex: 1,
  },
  cariName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  cariType: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
    gap: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactText: {
    fontSize: 19,
    color: "#374151",
    flex: 1,
  },
  balanceBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 19,
    color: "#6b7280",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
  },
  balanceStatus: {
    fontSize: 19,
    fontWeight: "500",
    marginTop: 4,
  },
  historySection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  historyTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  islemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  islemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  islemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  islemType: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  islemDate: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  islemDesc: {
    fontSize: 19,
    color: "#374151",
    marginTop: 2,
  },
  islemKasa: {
    fontSize: 19,
    color: "#3b82f6",
    marginTop: 2,
  },
  islemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  islemAmount: {
    fontSize: 19,
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 19,
    color: "#9ca3af",
  },
});
