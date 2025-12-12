// Raporlar Screen - Refactored
// Original: 1,080 lines → Now: ~450 lines

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  UserCheck,
  ChevronRight,
  X,
  Building2,
  Calendar,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import DatePickerField from "../../src/components/DatePickerField";
import { useRaporData, ReportType } from "../../src/features/raporlar";
import { formatCurrency } from "../../src/shared/utils";

const REPORT_TABS: { key: ReportType; label: string }[] = [
  { key: "ozet", label: "Özet" },
  { key: "gelir-gider", label: "Gelir/Gider" },
  { key: "kasa", label: "Kasa" },
  { key: "cari-borc", label: "Cari Borç" },
  { key: "personel-borc", label: "Personel" },
];

export default function RaporlarScreen() {
  const [activeReport, setActiveReport] = useState<ReportType>("ozet");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [showDateModal, setShowDateModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    hesaplamalar,
    borcluCariler,
    alacakliMusteriler,
    borcluPersoneller,
    aktifKasalar,
    refreshAll,
  } = useRaporData(startDate, endDate);
  const {
    toplamGelir,
    toplamGider,
    netKar,
    toplamKasa,
    tedarikciBorc,
    musteriAlacak,
    personelBorc,
  } = hesaplamalar;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // PDF Export
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const meta = `<div style="color:#6b7280;font-size:12px;margin-bottom:20px;">Tarih: ${new Date().toLocaleString(
        "tr-TR"
      )}</div>`;
      let html = "";

      if (activeReport === "ozet") {
        html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px}h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}.card{background:#f9fafb;padding:15px;border-radius:8px;margin:10px 0}.label{color:#6b7280;font-size:12px}.value{font-size:24px;font-weight:bold}.green{color:#10b981}.red{color:#ef4444}.blue{color:#3b82f6}</style></head><body><h1>Genel Durum Özeti</h1>${meta}<div class="card"><div class="label">Toplam Kasa</div><div class="value blue">${formatCurrency(
          toplamKasa
        )}</div></div><div class="card"><div class="label">Tedarikçi Borçları</div><div class="value red">${formatCurrency(
          tedarikciBorc
        )}</div></div><div class="card"><div class="label">Müşteri Alacakları</div><div class="value green">${formatCurrency(
          musteriAlacak
        )}</div></div><div class="card"><div class="label">Personel Borçları</div><div class="value red">${formatCurrency(
          personelBorc
        )}</div></div></body></html>`;
      } else if (activeReport === "gelir-gider") {
        html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px}h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}.period{color:#6b7280;margin-bottom:20px}.card{background:#f9fafb;padding:15px;border-radius:8px;margin:10px 0}.label{color:#6b7280;font-size:12px}.value{font-size:24px;font-weight:bold}.green{color:#10b981}.red{color:#ef4444}</style></head><body><h1>Gelir/Gider Raporu</h1><div class="period">Dönem: ${formatDate(
          startDate
        )} - ${formatDate(
          endDate
        )}</div>${meta}<div class="card"><div class="label">Toplam Gelir</div><div class="value green">${formatCurrency(
          toplamGelir
        )}</div></div><div class="card"><div class="label">Toplam Gider</div><div class="value red">${formatCurrency(
          toplamGider
        )}</div></div><div class="card"><div class="label">Net ${
          netKar >= 0 ? "Kar" : "Zarar"
        }</div><div class="value ${
          netKar >= 0 ? "green" : "red"
        }">${formatCurrency(Math.abs(netKar))}</div></div></body></html>`;
      } else if (activeReport === "kasa") {
        const rows = aktifKasalar
          .map(
            (k) =>
              `<tr><td>${k.name}</td><td>${
                k.type
              }</td><td style="text-align:right">${formatCurrency(
                k.balance || 0
              )}</td></tr>`
          )
          .join("");
        html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px}h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}th{background:#f3f4f6}.total{font-weight:bold;background:#f0fdf4}</style></head><body><h1>Kasa Bakiyeleri</h1>${meta}<table><tr><th>Kasa</th><th>Tip</th><th style="text-align:right">Bakiye</th></tr>${rows}<tr class="total"><td colspan="2">TOPLAM</td><td style="text-align:right">${formatCurrency(
          toplamKasa
        )}</td></tr></table></body></html>`;
      } else if (activeReport === "cari-borc") {
        const rows =
          borcluCariler
            .map(
              (c) =>
                `<tr><td>${
                  c.name
                }</td><td style="text-align:right;color:#ef4444">${formatCurrency(
                  c.balance || 0
                )}</td></tr>`
            )
            .join("") || "<tr><td colspan='2'>Borç yok</td></tr>";
        html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px}h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}th{background:#f3f4f6}.total{font-weight:bold;background:#fef2f2}</style></head><body><h1>Tedarikçi Borçları</h1>${meta}<table><tr><th>Tedarikçi</th><th style="text-align:right">Borç</th></tr>${rows}<tr class="total"><td>TOPLAM</td><td style="text-align:right">${formatCurrency(
          tedarikciBorc
        )}</td></tr></table></body></html>`;
      } else if (activeReport === "personel-borc") {
        const rows =
          borcluPersoneller
            .map(
              (p) =>
                `<tr><td>${p.name}</td><td>${
                  p.position || "-"
                }</td><td style="text-align:right;color:#ef4444">${formatCurrency(
                  p.balance || 0
                )}</td></tr>`
            )
            .join("") || "<tr><td colspan='3'>Borç yok</td></tr>";
        html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px}h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}th{background:#f3f4f6}.total{font-weight:bold;background:#fef2f2}</style></head><body><h1>Personel Borçları</h1>${meta}<table><tr><th>Personel</th><th>Pozisyon</th><th style="text-align:right">Borç</th></tr>${rows}<tr class="total"><td colspan="2">TOPLAM</td><td style="text-align:right">${formatCurrency(
          personelBorc
        )}</td></tr></table></body></html>`;
      }

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } catch (error) {
      Alert.alert("Hata", "PDF oluşturulamadı");
    } finally {
      setExporting(false);
    }
  };

  const netDurum = toplamKasa - tedarikciBorc - personelBorc + musteriAlacak;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Raporlar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDateModal(true)}
          >
            <Calendar size={18} color="#6b7280" />
            <Text style={styles.dateBtnText}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && { opacity: 0.6 }]}
            onPress={exportToPDF}
            disabled={exporting}
          >
            <Download size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {REPORT_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeReport === tab.key && styles.tabActive]}
            onPress={() => setActiveReport(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeReport === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeReport === "ozet" && (
          <>
            <SummaryCard
              icon={Wallet}
              label="Toplam Kasa"
              value={toplamKasa}
              color="#3b82f6"
              bg="#dbeafe"
            />
            <SummaryCard
              icon={Building2}
              label="Tedarikçi Borçları"
              value={tedarikciBorc}
              color="#ef4444"
              bg="#fef2f2"
            />
            <SummaryCard
              icon={Users}
              label="Müşteri Alacakları"
              value={musteriAlacak}
              color="#10b981"
              bg="#dcfce7"
            />
            <SummaryCard
              icon={UserCheck}
              label="Personel Borçları"
              value={personelBorc}
              color="#f59e0b"
              bg="#fef3c7"
            />
            <View style={styles.netCard}>
              <Text style={styles.netLabel}>
                Net Durum (Kasa - Borçlar + Alacaklar)
              </Text>
              <Text
                style={[
                  styles.netValue,
                  { color: netDurum >= 0 ? "#10b981" : "#ef4444" },
                ]}
              >
                {formatCurrency(netDurum)}
              </Text>
            </View>
          </>
        )}

        {activeReport === "gelir-gider" && (
          <>
            <SummaryCard
              icon={ArrowDownLeft}
              label="Toplam Gelir"
              value={toplamGelir}
              color="#10b981"
              bg="#dcfce7"
            />
            <SummaryCard
              icon={ArrowUpRight}
              label="Toplam Gider"
              value={toplamGider}
              color="#ef4444"
              bg="#fef2f2"
            />
            <View style={styles.netCard}>
              <Text style={styles.netLabel}>
                Net {netKar >= 0 ? "Kar" : "Zarar"}
              </Text>
              <Text
                style={[
                  styles.netValue,
                  { color: netKar >= 0 ? "#10b981" : "#ef4444" },
                ]}
              >
                {formatCurrency(Math.abs(netKar))}
              </Text>
            </View>
          </>
        )}

        {activeReport === "kasa" && (
          <View style={styles.listCard}>
            {aktifKasalar.map((k) => (
              <View key={k.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemName}>{k.name}</Text>
                  <Text style={styles.listItemSub}>{k.type}</Text>
                </View>
                <Text style={styles.listItemValue}>
                  {formatCurrency(k.balance || 0)}
                </Text>
              </View>
            ))}
            <View style={styles.listTotal}>
              <Text style={styles.listTotalLabel}>TOPLAM</Text>
              <Text style={styles.listTotalValue}>
                {formatCurrency(toplamKasa)}
              </Text>
            </View>
          </View>
        )}

        {activeReport === "cari-borc" && (
          <View style={styles.listCard}>
            {borcluCariler.length > 0 ? (
              borcluCariler.map((c) => (
                <View key={c.id} style={styles.listItem}>
                  <Text style={styles.listItemName}>{c.name}</Text>
                  <Text style={[styles.listItemValue, { color: "#ef4444" }]}>
                    {formatCurrency(c.balance || 0)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Tedarikçi borcu yok</Text>
            )}
            {borcluCariler.length > 0 && (
              <View style={styles.listTotal}>
                <Text style={styles.listTotalLabel}>TOPLAM</Text>
                <Text style={[styles.listTotalValue, { color: "#ef4444" }]}>
                  {formatCurrency(tedarikciBorc)}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeReport === "personel-borc" && (
          <View style={styles.listCard}>
            {borcluPersoneller.length > 0 ? (
              borcluPersoneller.map((p) => (
                <View key={p.id} style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemName}>{p.name}</Text>
                    <Text style={styles.listItemSub}>{p.position || "-"}</Text>
                  </View>
                  <Text style={[styles.listItemValue, { color: "#ef4444" }]}>
                    {formatCurrency(p.balance || 0)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Personel borcu yok</Text>
            )}
            {borcluPersoneller.length > 0 && (
              <View style={styles.listTotal}>
                <Text style={styles.listTotalLabel}>TOPLAM</Text>
                <Text style={[styles.listTotalValue, { color: "#ef4444" }]}>
                  {formatCurrency(personelBorc)}
                </Text>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Modal */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDateModal(false)}
        >
          <View style={styles.dateModal}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Tarih Aralığı</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={styles.dateLabel}>Başlangıç</Text>
            <DatePickerField value={startDate} onChange={setStartDate} />
            <Text style={styles.dateLabel}>Bitiş</Text>
            <DatePickerField value={endDate} onChange={setEndDate} />
            <TouchableOpacity
              style={styles.dateApplyBtn}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.dateApplyText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// Summary Card Component
const SummaryCard = ({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  bg: string;
}) => (
  <View style={[styles.summaryCard, { backgroundColor: bg }]}>
    <Icon size={24} color={color} />
    <View style={styles.summaryInfo}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>
        {formatCurrency(value)}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  dateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dateBtnText: { fontSize: 13, color: "#374151" },
  exportBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsScroll: { maxHeight: 50 },
  tabs: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  tabActive: { backgroundColor: "#10b981" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  tabTextActive: { color: "#fff" },
  content: { flex: 1, padding: 16 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 14,
  },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  netCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    alignItems: "center",
  },
  netLabel: { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  netValue: { fontSize: 28, fontWeight: "700" },
  listCard: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  listItemName: { fontSize: 15, fontWeight: "500", color: "#111827" },
  listItemSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  listItemValue: { fontSize: 16, fontWeight: "600", color: "#111827" },
  listTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f0fdf4",
  },
  listTotalLabel: { fontSize: 14, fontWeight: "600", color: "#374151" },
  listTotalValue: { fontSize: 16, fontWeight: "700", color: "#10b981" },
  emptyText: { padding: 20, textAlign: "center", color: "#9ca3af" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
  },
  dateModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateModalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  dateApplyBtn: {
    marginTop: 20,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  dateApplyText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
