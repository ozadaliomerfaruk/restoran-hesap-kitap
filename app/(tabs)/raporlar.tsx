import { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  Banknote,
  PiggyBank,
  Calendar,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import DatePickerField from "../../src/components/DatePickerField";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

type ReportType =
  | "ozet"
  | "gelir-gider"
  | "kasa"
  | "cari-borc"
  | "personel-borc";

export default function RaporlarScreen() {
  const {
    kasalar,
    cariler,
    personeller,
    islemler,
    fetchKasalar,
    fetchCariler,
    fetchPersoneller,
    fetchIslemler,
    profile,
    fetchProfile,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>("ozet");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Ayın ilk günü
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showDateModal, setShowDateModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      loadData();
    }
  }, [profile?.restaurant_id]);

  const loadData = async () => {
    await Promise.all([
      fetchKasalar(),
      fetchCariler(),
      fetchPersoneller(),
      fetchIslemler(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ========== HESAPLAMALAR ==========

  // Filtrelenmiş işlemler (tarih aralığına göre)
  const filteredIslemler = islemler.filter((i) => {
    const d = i.date.split("T")[0];
    return d >= startDate && d <= endDate;
  });

  // Toplam gelir
  const toplamGelir = filteredIslemler
    .filter((i) => i.type === "gelir" || i.type === "tahsilat")
    .reduce((s, i) => s + i.amount, 0);

  // Toplam gider
  const toplamGider = filteredIslemler
    .filter((i) => i.type === "gider" || i.type === "odeme")
    .reduce((s, i) => s + i.amount, 0);

  // Net kar/zarar
  const netKar = toplamGelir - toplamGider;

  // Toplam kasa bakiyesi
  const toplamKasa = kasalar
    .filter((k) => !k.is_archived)
    .reduce((s, k) => s + (k.balance || 0), 0);

  // Tedarikçi borçları
  const tedarikciBorc = cariler
    .filter(
      (c) => !c.is_archived && c.type === "tedarikci" && (c.balance || 0) > 0
    )
    .reduce((s, c) => s + (c.balance || 0), 0);

  // Müşteri alacakları
  const musteriAlacak = cariler
    .filter(
      (c) => !c.is_archived && c.type === "musteri" && (c.balance || 0) > 0
    )
    .reduce((s, c) => s + (c.balance || 0), 0);

  // Personel borçları
  const personelBorc = personeller
    .filter((p) => !p.is_archived && (p.balance || 0) > 0)
    .reduce((s, p) => s + (p.balance || 0), 0);

  // Borçlu cariler listesi
  const borcluCariler = cariler
    .filter(
      (c) => !c.is_archived && c.type === "tedarikci" && (c.balance || 0) > 0
    )
    .sort((a, b) => (b.balance || 0) - (a.balance || 0));

  // Alacaklı müşteriler listesi
  const alacakliMusteriler = cariler
    .filter(
      (c) => !c.is_archived && c.type === "musteri" && (c.balance || 0) > 0
    )
    .sort((a, b) => (b.balance || 0) - (a.balance || 0));

  // Borçlu personeller listesi
  const borcluPersoneller = personeller
    .filter((p) => !p.is_archived && (p.balance || 0) > 0)
    .sort((a, b) => (b.balance || 0) - (a.balance || 0));

  // ========== PDF EXPORT ==========

  const exportToPDF = async () => {
    setExporting(true);
    try {
      let html = "";
      const meta = `<div style="color:#6b7280;font-size:12px;margin-bottom:20px;">Tarih: ${new Date().toLocaleString(
        "tr-TR"
      )}</div>`;

      if (activeReport === "ozet") {
        html = `
          <html><head><meta charset="utf-8"><style>
            body{font-family:Arial;padding:20px}
            h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}
            .card{background:#f9fafb;padding:15px;border-radius:8px;margin:10px 0}
            .label{color:#6b7280;font-size:12px}
            .value{font-size:24px;font-weight:bold}
            .green{color:#10b981}.red{color:#ef4444}.blue{color:#3b82f6}
          </style></head><body>
          <h1>Genel Durum Özeti</h1>${meta}
          <div class="card"><div class="label">Toplam Kasa</div><div class="value blue">${formatCurrency(
            toplamKasa
          )}</div></div>
          <div class="card"><div class="label">Tedarikçi Borçları</div><div class="value red">${formatCurrency(
            tedarikciBorc
          )}</div></div>
          <div class="card"><div class="label">Müşteri Alacakları</div><div class="value green">${formatCurrency(
            musteriAlacak
          )}</div></div>
          <div class="card"><div class="label">Personel Borçları</div><div class="value red">${formatCurrency(
            personelBorc
          )}</div></div>
          </body></html>
        `;
      } else if (activeReport === "gelir-gider") {
        html = `
          <html><head><meta charset="utf-8"><style>
            body{font-family:Arial;padding:20px}
            h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}
            .period{color:#6b7280;margin-bottom:20px}
            .card{background:#f9fafb;padding:15px;border-radius:8px;margin:10px 0}
            .label{color:#6b7280;font-size:12px}
            .value{font-size:24px;font-weight:bold}
            .green{color:#10b981}.red{color:#ef4444}
          </style></head><body>
          <h1>Gelir/Gider Raporu</h1>
          <div class="period">Dönem: ${formatDate(startDate)} - ${formatDate(
          endDate
        )}</div>${meta}
          <div class="card"><div class="label">Toplam Gelir</div><div class="value green">${formatCurrency(
            toplamGelir
          )}</div></div>
          <div class="card"><div class="label">Toplam Gider</div><div class="value red">${formatCurrency(
            toplamGider
          )}</div></div>
          <div class="card"><div class="label">Net ${
            netKar >= 0 ? "Kar" : "Zarar"
          }</div><div class="value ${
          netKar >= 0 ? "green" : "red"
        }">${formatCurrency(Math.abs(netKar))}</div></div>
          </body></html>
        `;
      } else if (activeReport === "kasa") {
        const kasaRows = kasalar
          .filter((k) => !k.is_archived)
          .map(
            (k) =>
              `<tr><td>${k.name}</td><td>${
                k.type
              }</td><td style="text-align:right">${formatCurrency(
                k.balance || 0
              )}</td></tr>`
          )
          .join("");
        html = `
          <html><head><meta charset="utf-8"><style>
            body{font-family:Arial;padding:20px}
            h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}
            table{width:100%;border-collapse:collapse;margin-top:20px}
            th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}
            th{background:#f3f4f6}
            .total{font-weight:bold;background:#f0fdf4}
          </style></head><body>
          <h1>Kasa Bakiyeleri</h1>${meta}
          <table>
            <tr><th>Kasa Adı</th><th>Tip</th><th style="text-align:right">Bakiye</th></tr>
            ${kasaRows}
            <tr class="total"><td colspan="2">TOPLAM</td><td style="text-align:right">${formatCurrency(
              toplamKasa
            )}</td></tr>
          </table>
          </body></html>
        `;
      } else if (activeReport === "cari-borc") {
        const cariRows = borcluCariler
          .map(
            (c) =>
              `<tr><td>${
                c.name
              }</td><td style="text-align:right;color:#ef4444">${formatCurrency(
                c.balance || 0
              )}</td></tr>`
          )
          .join("");
        html = `
          <html><head><meta charset="utf-8"><style>
            body{font-family:Arial;padding:20px}
            h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}
            table{width:100%;border-collapse:collapse;margin-top:20px}
            th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}
            th{background:#f3f4f6}
            .total{font-weight:bold;background:#fef2f2}
          </style></head><body>
          <h1>Tedarikçi Borçları</h1>${meta}
          <table>
            <tr><th>Tedarikçi</th><th style="text-align:right">Borç</th></tr>
            ${cariRows || "<tr><td colspan='2'>Borç yok</td></tr>"}
            <tr class="total"><td>TOPLAM</td><td style="text-align:right">${formatCurrency(
              tedarikciBorc
            )}</td></tr>
          </table>
          </body></html>
        `;
      } else if (activeReport === "personel-borc") {
        const personelRows = borcluPersoneller
          .map(
            (p) =>
              `<tr><td>${p.name}</td><td>${
                p.position || "-"
              }</td><td style="text-align:right;color:#ef4444">${formatCurrency(
                p.balance || 0
              )}</td></tr>`
          )
          .join("");
        html = `
          <html><head><meta charset="utf-8"><style>
            body{font-family:Arial;padding:20px}
            h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px}
            table{width:100%;border-collapse:collapse;margin-top:20px}
            th,td{border:1px solid #e5e7eb;padding:10px;text-align:left}
            th{background:#f3f4f6}
            .total{font-weight:bold;background:#fef2f2}
          </style></head><body>
          <h1>Personel Borçları</h1>${meta}
          <table>
            <tr><th>Personel</th><th>Pozisyon</th><th style="text-align:right">Borç</th></tr>
            ${personelRows || "<tr><td colspan='3'>Borç yok</td></tr>"}
            <tr class="total"><td colspan="2">TOPLAM</td><td style="text-align:right">${formatCurrency(
              personelBorc
            )}</td></tr>
          </table>
          </body></html>
        `;
      }

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "PDF oluşturulamadı");
    } finally {
      setExporting(false);
    }
  };

  // ========== RENDER FONKSİYONLARI ==========

  const renderOzetRaporu = () => (
    <View style={styles.reportContent}>
      <View style={[styles.summaryCard, styles.summaryBlue]}>
        <Wallet size={24} color="#3b82f6" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Toplam Kasa</Text>
          <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
            {formatCurrency(toplamKasa)}
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, styles.summaryRed]}>
        <Building2 size={24} color="#ef4444" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Tedarikçi Borçları</Text>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            {formatCurrency(tedarikciBorc)}
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, styles.summaryGreen]}>
        <Users size={24} color="#10b981" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Müşteri Alacakları</Text>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {formatCurrency(musteriAlacak)}
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, styles.summaryYellow]}>
        <UserCheck size={24} color="#f59e0b" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Personel Borçları</Text>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {formatCurrency(personelBorc)}
          </Text>
        </View>
      </View>

      <View style={styles.netCard}>
        <Text style={styles.netLabel}>
          Net Durum (Kasa - Borçlar + Alacaklar)
        </Text>
        <Text
          style={[
            styles.netValue,
            {
              color:
                toplamKasa - tedarikciBorc - personelBorc + musteriAlacak >= 0
                  ? "#10b981"
                  : "#ef4444",
            },
          ]}
        >
          {formatCurrency(
            toplamKasa - tedarikciBorc - personelBorc + musteriAlacak
          )}
        </Text>
      </View>
    </View>
  );

  const renderGelirGiderRaporu = () => (
    <View style={styles.reportContent}>
      <TouchableOpacity
        style={styles.dateRangeBtn}
        onPress={() => setShowDateModal(true)}
      >
        <Calendar size={18} color="#6b7280" />
        <Text style={styles.dateRangeText}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>
        <ChevronRight size={18} color="#6b7280" />
      </TouchableOpacity>

      <View style={[styles.summaryCard, styles.summaryGreen]}>
        <ArrowDownLeft size={24} color="#10b981" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Toplam Gelir</Text>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {formatCurrency(toplamGelir)}
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, styles.summaryRed]}>
        <ArrowUpRight size={24} color="#ef4444" />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Toplam Gider</Text>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            {formatCurrency(toplamGider)}
          </Text>
        </View>
      </View>

      <View style={styles.netCard}>
        <Text style={styles.netLabel}>Net {netKar >= 0 ? "Kar" : "Zarar"}</Text>
        <Text
          style={[
            styles.netValue,
            { color: netKar >= 0 ? "#10b981" : "#ef4444" },
          ]}
        >
          {formatCurrency(Math.abs(netKar))}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>İşlem Sayıları</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredIslemler.filter((i) => i.type === "gelir").length}
          </Text>
          <Text style={styles.statLabel}>Gelir</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredIslemler.filter((i) => i.type === "gider").length}
          </Text>
          <Text style={styles.statLabel}>Gider</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredIslemler.filter((i) => i.type === "odeme").length}
          </Text>
          <Text style={styles.statLabel}>Ödeme</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredIslemler.filter((i) => i.type === "tahsilat").length}
          </Text>
          <Text style={styles.statLabel}>Tahsilat</Text>
        </View>
      </View>
    </View>
  );

  const renderKasaRaporu = () => (
    <View style={styles.reportContent}>
      {kasalar
        .filter((k) => !k.is_archived)
        .map((kasa) => (
          <View key={kasa.id} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View
                style={[styles.listItemIcon, { backgroundColor: "#dbeafe" }]}
              >
                <Wallet size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.listItemName}>{kasa.name}</Text>
                <Text style={styles.listItemSub}>
                  {kasa.type === "nakit"
                    ? "Nakit"
                    : kasa.type === "banka"
                    ? "Banka"
                    : kasa.type === "kredi_karti"
                    ? "Kredi Kartı"
                    : "Diğer"}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.listItemValue,
                { color: (kasa.balance || 0) >= 0 ? "#10b981" : "#ef4444" },
              ]}
            >
              {formatCurrency(kasa.balance || 0)}
            </Text>
          </View>
        ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOPLAM</Text>
        <Text
          style={[
            styles.totalValue,
            { color: toplamKasa >= 0 ? "#10b981" : "#ef4444" },
          ]}
        >
          {formatCurrency(toplamKasa)}
        </Text>
      </View>
    </View>
  );

  const renderCariBorcRaporu = () => (
    <View style={styles.reportContent}>
      {borcluCariler.length === 0 ? (
        <View style={styles.emptyState}>
          <Building2 size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Tedarikçi borcunuz yok</Text>
        </View>
      ) : (
        <>
          {borcluCariler.map((cari) => (
            <View key={cari.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View
                  style={[styles.listItemIcon, { backgroundColor: "#fee2e2" }]}
                >
                  <Building2 size={18} color="#ef4444" />
                </View>
                <Text style={styles.listItemName}>{cari.name}</Text>
              </View>
              <Text style={[styles.listItemValue, { color: "#ef4444" }]}>
                {formatCurrency(cari.balance || 0)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOPLAM BORÇ</Text>
            <Text style={[styles.totalValue, { color: "#ef4444" }]}>
              {formatCurrency(tedarikciBorc)}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  const renderPersonelBorcRaporu = () => (
    <View style={styles.reportContent}>
      {borcluPersoneller.length === 0 ? (
        <View style={styles.emptyState}>
          <UserCheck size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Personel borcunuz yok</Text>
        </View>
      ) : (
        <>
          {borcluPersoneller.map((personel) => (
            <View key={personel.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View
                  style={[styles.listItemIcon, { backgroundColor: "#fef3c7" }]}
                >
                  <UserCheck size={18} color="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.listItemName}>{personel.name}</Text>
                  <Text style={styles.listItemSub}>
                    {personel.position || "Pozisyon belirtilmemiş"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.listItemValue, { color: "#ef4444" }]}>
                {formatCurrency(personel.balance || 0)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOPLAM BORÇ</Text>
            <Text style={[styles.totalValue, { color: "#ef4444" }]}>
              {formatCurrency(personelBorc)}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  const renderActiveReport = () => {
    switch (activeReport) {
      case "ozet":
        return renderOzetRaporu();
      case "gelir-gider":
        return renderGelirGiderRaporu();
      case "kasa":
        return renderKasaRaporu();
      case "cari-borc":
        return renderCariBorcRaporu();
      case "personel-borc":
        return renderPersonelBorcRaporu();
      default:
        return null;
    }
  };

  const getReportTitle = () => {
    switch (activeReport) {
      case "ozet":
        return "Genel Özet";
      case "gelir-gider":
        return "Gelir/Gider";
      case "kasa":
        return "Kasa Bakiyeleri";
      case "cari-borc":
        return "Tedarikçi Borçları";
      case "personel-borc":
        return "Personel Borçları";
      default:
        return "Rapor";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Raporlar</Text>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={exportToPDF}
          disabled={exporting}
        >
          <Download size={20} color="#fff" />
          <Text style={styles.exportBtnText}>{exporting ? "..." : "PDF"}</Text>
        </TouchableOpacity>
      </View>

      {/* Rapor Sekmeleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, activeReport === "ozet" && styles.tabActive]}
          onPress={() => setActiveReport("ozet")}
        >
          <PiggyBank
            size={16}
            color={activeReport === "ozet" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeReport === "ozet" && styles.tabTextActive,
            ]}
          >
            Özet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeReport === "gelir-gider" && styles.tabActive,
          ]}
          onPress={() => setActiveReport("gelir-gider")}
        >
          <TrendingUp
            size={16}
            color={activeReport === "gelir-gider" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeReport === "gelir-gider" && styles.tabTextActive,
            ]}
          >
            Gelir/Gider
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeReport === "kasa" && styles.tabActive]}
          onPress={() => setActiveReport("kasa")}
        >
          <Wallet
            size={16}
            color={activeReport === "kasa" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeReport === "kasa" && styles.tabTextActive,
            ]}
          >
            Kasalar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeReport === "cari-borc" && styles.tabActive]}
          onPress={() => setActiveReport("cari-borc")}
        >
          <Building2
            size={16}
            color={activeReport === "cari-borc" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeReport === "cari-borc" && styles.tabTextActive,
            ]}
          >
            Tedarikçi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeReport === "personel-borc" && styles.tabActive,
          ]}
          onPress={() => setActiveReport("personel-borc")}
        >
          <UserCheck
            size={16}
            color={activeReport === "personel-borc" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeReport === "personel-borc" && styles.tabTextActive,
            ]}
          >
            Personel
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rapor İçeriği */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.reportTitle}>{getReportTitle()}</Text>
        {renderActiveReport()}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Tarih Seçim Modal */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Aralığı</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <DatePickerField
                value={startDate}
                onChange={setStartDate}
                label="Başlangıç Tarihi"
              />
              <View style={{ height: 16 }} />
              <DatePickerField
                value={endDate}
                onChange={setEndDate}
                label="Bitiş Tarihi"
              />

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.applyBtnText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  tabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    gap: 6,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#10b981",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  reportContent: {},
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 14,
  },
  summaryGreen: {
    backgroundColor: "#dcfce7",
  },
  summaryRed: {
    backgroundColor: "#fee2e2",
  },
  summaryBlue: {
    backgroundColor: "#dbeafe",
  },
  summaryYellow: {
    backgroundColor: "#fef3c7",
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  netCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  netLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  netValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  dateRangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateRangeText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  listItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  listItemSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#9ca3af",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalBody: {
    padding: 16,
    paddingBottom: 30,
  },
  applyBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
