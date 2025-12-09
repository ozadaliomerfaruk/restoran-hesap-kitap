import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FileText,
  TrendingUp,
  Wallet,
  Users,
  UserCheck,
  Download,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  X,
  Building2,
  Banknote,
  ArrowRightLeft,
  BarChart3,
  UserMinus,
  Receipt,
  PiggyBank,
  Package,
  CalendarRange,
  ShoppingCart,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { supabase } from "../../src/lib/supabase";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { writeFile } from "../../src/utils/fileUtils";

const screenWidth = Dimensions.get("window").width;

interface ReportItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  needsDateRange: boolean;
  needsCariSelect?: boolean;
}

interface ReportCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  reports: ReportItem[];
}

const reportCategories: ReportCategory[] = [
  {
    id: "genel",
    title: "Genel Raporlar",
    icon: BarChart3,
    color: "#10b981",
    reports: [
      {
        id: "genel-ozet",
        title: "Genel Durum Özeti",
        icon: PiggyBank,
        color: "#10b981",
        needsDateRange: false,
      },
      {
        id: "gelir-gider",
        title: "Gelir/Gider Raporu",
        icon: TrendingUp,
        color: "#3b82f6",
        needsDateRange: true,
      },
      {
        id: "kasa-bakiyeleri",
        title: "Kasa Bakiyeleri",
        icon: Wallet,
        color: "#8b5cf6",
        needsDateRange: false,
      },
      {
        id: "aylik-karsilastirma",
        title: "Aylık Karşılaştırma",
        icon: CalendarRange,
        color: "#f59e0b",
        needsDateRange: false,
      },
    ],
  },
  {
    id: "satis",
    title: "Satış & Trend",
    icon: TrendingUp,
    color: "#06b6d4",
    reports: [
      {
        id: "gunluk-satis-trendi",
        title: "Günlük Satış Trendi",
        icon: TrendingUp,
        color: "#10b981",
        needsDateRange: true,
      },
      {
        id: "haftalik-satis",
        title: "Haftalık Satış Özeti",
        icon: BarChart3,
        color: "#3b82f6",
        needsDateRange: false,
      },
    ],
  },
  {
    id: "cariler",
    title: "Cari Hesaplar",
    icon: Users,
    color: "#3b82f6",
    reports: [
      {
        id: "tedarikci-borclar",
        title: "Tedarikçi Borçlarım",
        icon: Building2,
        color: "#ef4444",
        needsDateRange: false,
      },
      {
        id: "musteri-alacaklar",
        title: "Müşteri Alacaklarım",
        icon: Users,
        color: "#10b981",
        needsDateRange: false,
      },
      {
        id: "cari-ekstre",
        title: "Cari Hesap Ekstresi",
        icon: ArrowRightLeft,
        color: "#8b5cf6",
        needsDateRange: true,
        needsCariSelect: true,
      },
      {
        id: "top10-tedarikci",
        title: "En Çok Alış Yapılan Top 10",
        icon: ShoppingCart,
        color: "#f59e0b",
        needsDateRange: true,
      },
    ],
  },
  {
    id: "urunler",
    title: "Ürün Raporları",
    icon: Package,
    color: "#8b5cf6",
    reports: [
      {
        id: "urun-bazli-alis",
        title: "Ürün Bazlı Alışlar",
        icon: Package,
        color: "#8b5cf6",
        needsDateRange: true,
      },
      {
        id: "kategori-bazli-alis",
        title: "Kategori Bazlı Giderler",
        icon: BarChart3,
        color: "#ec4899",
        needsDateRange: true,
      },
    ],
  },
  {
    id: "personel",
    title: "Personel Raporları",
    icon: UserCheck,
    color: "#f59e0b",
    reports: [
      {
        id: "maas-raporu",
        title: "Maaş Ödemeleri",
        icon: Banknote,
        color: "#10b981",
        needsDateRange: true,
      },
      {
        id: "izin-raporu",
        title: "İzin Kullanımları",
        icon: UserMinus,
        color: "#3b82f6",
        needsDateRange: true,
      },
      {
        id: "personel-ozet",
        title: "Personel Genel Özet",
        icon: Receipt,
        color: "#f59e0b",
        needsDateRange: false,
      },
    ],
  },
];

export default function RaporlarScreen() {
  const {
    profile,
    fetchProfile,
    kasalar,
    fetchKasalar,
    cariler,
    fetchCariler,
    personeller,
    fetchPersoneller,
    kategoriler,
    fetchKategoriler,
    islemler,
    fetchIslemler,
    urunler,
    fetchUrunler,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "genel"
  );

  const [dashboardData, setDashboardData] = useState<{
    buAyGelir: number;
    buAyGider: number;
    gecenAyGelir: number;
    gecenAyGider: number;
    son7GunSatislar: { gun: string; tutar: number }[];
    toplamKasa: number;
    toplamBorc: number;
    toplamAlacak: number;
  } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCariId, setSelectedCariId] = useState<string | null>(null);
  const [showCariList, setShowCariList] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("pdf");

  useEffect(() => {
    fetchProfile();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      loadAllData();
    }
  }, [profile?.restaurant_id]);

  useEffect(() => {
    if (islemler.length > 0 || kasalar.length > 0 || cariler.length > 0) {
      calculateDashboard();
    }
  }, [islemler, kasalar, cariler]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchKasalar(),
      fetchCariler(),
      fetchPersoneller(),
      fetchKategoriler(),
      fetchIslemler(),
      fetchUrunler(),
    ]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const calculateDashboard = () => {
    const now = new Date();
    const buAyBaslangic = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const gecenAyBaslangic = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
    const gecenAyBitis = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    const buAyIslemler = islemler.filter(
      (i) => i.date.split("T")[0] >= buAyBaslangic
    );
    const buAyGelir = buAyIslemler
      .filter((i) => i.type === "gelir" || i.type === "tahsilat")
      .reduce((s, i) => s + i.amount, 0);
    const buAyGider = buAyIslemler
      .filter((i) => i.type === "gider" || i.type === "odeme")
      .reduce((s, i) => s + i.amount, 0);

    const gecenAyIslemler = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return d >= gecenAyBaslangic && d <= gecenAyBitis;
    });
    const gecenAyGelir = gecenAyIslemler
      .filter((i) => i.type === "gelir" || i.type === "tahsilat")
      .reduce((s, i) => s + i.amount, 0);
    const gecenAyGider = gecenAyIslemler
      .filter((i) => i.type === "gider" || i.type === "odeme")
      .reduce((s, i) => s + i.amount, 0);

    const son7Gun: { gun: string; tutar: number }[] = [];
    const gunIsimleri = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    for (let i = 6; i >= 0; i--) {
      const tarih = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const tarihStr = tarih.toISOString().split("T")[0];
      const gunIsmi = gunIsimleri[tarih.getDay()];
      const gunSatis = islemler
        .filter(
          (isl) =>
            isl.date.split("T")[0] === tarihStr &&
            (isl.type === "gelir" || isl.type === "tahsilat")
        )
        .reduce((s, isl) => s + isl.amount, 0);
      son7Gun.push({ gun: gunIsmi, tutar: gunSatis });
    }

    const toplamKasa = kasalar
      .filter((k) => !k.is_archived)
      .reduce((s, k) => s + (k.balance || 0), 0);
    const toplamBorc = cariler
      .filter((c) => c.type === "tedarikci" && (c.balance || 0) > 0)
      .reduce((s, c) => s + (c.balance || 0), 0);
    const toplamAlacak = cariler
      .filter((c) => c.type === "musteri" && (c.balance || 0) > 0)
      .reduce((s, c) => s + (c.balance || 0), 0);

    setDashboardData({
      buAyGelir,
      buAyGider,
      gecenAyGelir,
      gecenAyGider,
      son7GunSatislar: son7Gun,
      toplamKasa,
      toplamBorc,
      toplamAlacak,
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(amount);
  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M";
    if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
    return amount.toFixed(0);
  };
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("tr-TR");

  const openReportModal = (report: ReportItem) => {
    setSelectedReport(report);
    setSelectedCariId(null);
    if (!report.needsDateRange && !report.needsCariSelect) {
      generateReportDirect(report);
    } else {
      setShowModal(true);
    }
  };

  const getSelectedCari = () => cariler.find((c) => c.id === selectedCariId);

  const wrapHtml = (title: string, content: string, dateRange?: string) =>
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:20px;color:#333;font-size:12px}h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:10px;font-size:20px;margin-bottom:5px}.meta{color:#6b7280;margin-bottom:20px;font-size:11px}h2{color:#374151;margin-top:25px;font-size:14px}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left;font-size:11px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}.text-right{text-align:right}.text-center{text-align:center}.text-green{color:#10b981}.text-red{color:#ef4444}.total-row{background:#f0fdf4!important;font-weight:bold}.total-row.negative{background:#fef2f2!important}.summary{display:flex;gap:15px;margin:15px 0;flex-wrap:wrap}.summary-item{padding:12px 16px;border-radius:8px;min-width:120px}.summary-green{background:#dcfce7}.summary-red{background:#fef2f2}.summary-blue{background:#dbeafe}.summary-yellow{background:#fef3c7}.summary-value{font-size:18px;font-weight:bold}.summary-label{font-size:10px;color:#6b7280;margin-top:2px}.change-positive{color:#10b981;font-size:11px}.change-negative{color:#ef4444;font-size:11px}.footer{margin-top:30px;text-align:center;color:#9ca3af;font-size:10px;border-top:1px solid #e5e7eb;padding-top:15px}.bar-container{margin:10px 0}.bar-row{display:flex;align-items:center;margin:8px 0}.bar-label{width:120px;font-size:11px}.bar-track{flex:1;height:20px;background:#f3f4f6;border-radius:4px;overflow:hidden}.bar-fill{height:100%;border-radius:4px}.bar-value{width:80px;text-align:right;font-size:11px;font-weight:600}</style></head><body><h1>${title}</h1><div class="meta">${
      dateRange ? "<strong>Dönem:</strong> " + dateRange + " | " : ""
    }<strong>Tarih:</strong> ${new Date().toLocaleString(
      "tr-TR"
    )}</div>${content}<div class="footer">Bu rapor Restoran Hesap Kitap uygulaması tarafından oluşturulmuştur.</div></body></html>`;

  const generateReportDirect = async (report: ReportItem) => {
    setExporting(true);
    try {
      let result = await generateReportContent(report.id);
      if (exportFormat === "pdf") {
        const { uri } = await Print.printToFileAsync({ html: result.html });
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      } else {
        const fileName =
          report.id + "_" + new Date().toISOString().split("T")[0] + ".csv";
        const filePath = await writeFile(fileName, result.csv);
        await Sharing.shareAsync(filePath, { mimeType: "text/csv" });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Rapor oluşturulamadı");
    } finally {
      setExporting(false);
    }
  };

  const generateReport = async () => {
    if (!selectedReport) return;
    if (selectedReport.needsDateRange && (!startDate || !endDate)) {
      Alert.alert("Hata", "Tarih aralığı seçin");
      return;
    }
    if (selectedReport.needsCariSelect && !selectedCariId) {
      Alert.alert("Hata", "Cari seçin");
      return;
    }

    setExporting(true);
    setShowModal(false);

    try {
      let result = await generateReportContent(selectedReport.id);
      if (exportFormat === "pdf") {
        const { uri } = await Print.printToFileAsync({ html: result.html });
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      } else {
        const fileName =
          selectedReport.id +
          "_" +
          new Date().toISOString().split("T")[0] +
          ".csv";
        const filePath = await writeFile(fileName, result.csv);
        await Sharing.shareAsync(filePath, { mimeType: "text/csv" });
      }
      Alert.alert("Başarılı", "Rapor oluşturuldu");
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Rapor oluşturulamadı");
    } finally {
      setExporting(false);
    }
  };

  const generateReportContent = async (
    reportId: string
  ): Promise<{ html: string; csv: string }> => {
    switch (reportId) {
      case "genel-ozet":
        return generateGenelOzet();
      case "gelir-gider":
        return generateGelirGider();
      case "kasa-bakiyeleri":
        return generateKasaBakiyeleri();
      case "aylik-karsilastirma":
        return generateAylikKarsilastirma();
      case "gunluk-satis-trendi":
        return generateGunlukSatisTrendi();
      case "haftalik-satis":
        return generateHaftalikSatis();
      case "tedarikci-borclar":
        return generateTedarikciBorclar();
      case "musteri-alacaklar":
        return generateMusteriAlacaklar();
      case "cari-ekstre":
        return generateCariEkstre();
      case "top10-tedarikci":
        return generateTop10Tedarikci();
      case "urun-bazli-alis":
        return generateUrunBazliAlis();
      case "kategori-bazli-alis":
        return generateKategoriBazliAlis();
      case "maas-raporu":
        return generateMaasRaporu();
      case "izin-raporu":
        return await generateIzinRaporu();
      case "personel-ozet":
        return generatePersonelOzet();
      default:
        return { html: "", csv: "" };
    }
  };

  const generateGenelOzet = () => {
    const toplamKasa = kasalar
      .filter((k) => !k.is_archived)
      .reduce((s, k) => s + (k.balance || 0), 0);
    const tedarikciBorclari = cariler
      .filter((c) => c.type === "tedarikci" && (c.balance || 0) > 0)
      .reduce((s, c) => s + (c.balance || 0), 0);
    const musteriAlacaklari = cariler
      .filter((c) => c.type === "musteri" && (c.balance || 0) > 0)
      .reduce((s, c) => s + (c.balance || 0), 0);
    const aktifPersonel = personeller.filter((p) => !p.is_archived).length;
    const toplamMaas = personeller
      .filter((p) => !p.is_archived)
      .reduce((s, p) => s + (p.salary || 0), 0);

    const html = wrapHtml(
      "Genel Durum Özeti",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value text-green">' +
        formatCurrency(toplamKasa) +
        '</div><div class="summary-label">Toplam Kasa</div></div><div class="summary-item summary-red"><div class="summary-value text-red">' +
        formatCurrency(tedarikciBorclari) +
        '</div><div class="summary-label">Tedarikçi Borçları</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        formatCurrency(musteriAlacaklari) +
        '</div><div class="summary-label">Müşteri Alacakları</div></div><div class="summary-item summary-yellow"><div class="summary-value">' +
        aktifPersonel +
        '</div><div class="summary-label">Aktif Personel</div></div></div><h2>Kasa Detayı</h2><table><tr><th>Kasa</th><th>Tür</th><th class="text-right">Bakiye</th></tr>' +
        kasalar
          .filter((k) => !k.is_archived)
          .map(
            (k) =>
              "<tr><td>" +
              k.name +
              "</td><td>" +
              k.type +
              '</td><td class="text-right ' +
              ((k.balance || 0) >= 0 ? "text-green" : "text-red") +
              '">' +
              formatCurrency(k.balance || 0) +
              "</td></tr>"
          )
          .join("") +
        '</table><h2>Borç/Alacak Durumu</h2><table><tr><th>Açıklama</th><th class="text-right">Tutar</th></tr><tr><td>Tedarikçilere Borcumuz</td><td class="text-right text-red">' +
        formatCurrency(tedarikciBorclari) +
        '</td></tr><tr><td>Müşterilerden Alacağımız</td><td class="text-right text-green">' +
        formatCurrency(musteriAlacaklari) +
        '</td></tr><tr class="total-row"><td><strong>Net Durum</strong></td><td class="text-right">' +
        formatCurrency(musteriAlacaklari - tedarikciBorclari) +
        "</td></tr></table>"
    );
    let csv =
      "\uFEFFGENEL DURUM ÖZETİ\n\nToplam Kasa;" +
      toplamKasa +
      "\nTedarikçi Borçları;" +
      tedarikciBorclari +
      "\nMüşteri Alacakları;" +
      musteriAlacaklari +
      "\nAktif Personel;" +
      aktifPersonel +
      "\nAylık Maaş Yükü;" +
      toplamMaas +
      "\n";
    return { html, csv };
  };

  const generateGelirGider = () => {
    const filtered = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return d >= startDate && d <= endDate;
    });
    const gelirler = filtered.filter(
      (i) => i.type === "gelir" || i.type === "tahsilat"
    );
    const giderler = filtered.filter(
      (i) => i.type === "gider" || i.type === "odeme"
    );
    const toplamGelir = gelirler.reduce((s, i) => s + i.amount, 0);
    const toplamGider = giderler.reduce((s, i) => s + i.amount, 0);
    const net = toplamGelir - toplamGider;

    const html = wrapHtml(
      "Gelir/Gider Raporu",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value text-green">' +
        formatCurrency(toplamGelir) +
        '</div><div class="summary-label">Toplam Gelir</div></div><div class="summary-item summary-red"><div class="summary-value text-red">' +
        formatCurrency(toplamGider) +
        '</div><div class="summary-label">Toplam Gider</div></div><div class="summary-item ' +
        (net >= 0 ? "summary-green" : "summary-red") +
        '"><div class="summary-value">' +
        formatCurrency(net) +
        '</div><div class="summary-label">Net ' +
        (net >= 0 ? "Kar" : "Zarar") +
        "</div></div></div><h2>Gelirler (" +
        gelirler.length +
        ' işlem)</h2><table><tr><th>Tarih</th><th>Açıklama</th><th class="text-right">Tutar</th></tr>' +
        gelirler
          .slice(0, 50)
          .map(
            (i) =>
              "<tr><td>" +
              formatDate(i.date) +
              "</td><td>" +
              (i.description || "-") +
              '</td><td class="text-right text-green">' +
              formatCurrency(i.amount) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="2"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(toplamGelir) +
        "</td></tr></table><h2>Giderler (" +
        giderler.length +
        ' işlem)</h2><table><tr><th>Tarih</th><th>Açıklama</th><th class="text-right">Tutar</th></tr>' +
        giderler
          .slice(0, 50)
          .map(
            (i) =>
              "<tr><td>" +
              formatDate(i.date) +
              "</td><td>" +
              (i.description || "-") +
              '</td><td class="text-right text-red">' +
              formatCurrency(i.amount) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row negative"><td colspan="2"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(toplamGider) +
        "</td></tr></table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFGELİR/GİDER RAPORU\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nToplam Gelir;" +
      toplamGelir +
      "\nToplam Gider;" +
      toplamGider +
      "\nNet;" +
      net +
      "\n\nGELİRLER\nTarih;Açıklama;Tutar\n";
    gelirler.forEach(
      (i) =>
        (csv += i.date + ";" + (i.description || "") + ";" + i.amount + "\n")
    );
    csv += "\nGİDERLER\nTarih;Açıklama;Tutar\n";
    giderler.forEach(
      (i) =>
        (csv += i.date + ";" + (i.description || "") + ";" + i.amount + "\n")
    );
    return { html, csv };
  };

  const generateKasaBakiyeleri = () => {
    const aktif = kasalar.filter((k) => !k.is_archived);
    const toplam = aktif.reduce((s, k) => s + (k.balance || 0), 0);
    const turler: { [k: string]: string } = {
      nakit: "Nakit",
      banka: "Banka",
      kredi_karti: "Kredi Kartı",
      birikim: "Birikim",
    };
    const html = wrapHtml(
      "Kasa Bakiyeleri",
      '<div class="summary"><div class="summary-item ' +
        (toplam >= 0 ? "summary-green" : "summary-red") +
        '"><div class="summary-value">' +
        formatCurrency(toplam) +
        '</div><div class="summary-label">Toplam Bakiye</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        aktif.length +
        '</div><div class="summary-label">Aktif Kasa</div></div></div><table><tr><th>Kasa Adı</th><th>Tür</th><th class="text-right">Bakiye</th></tr>' +
        aktif
          .map(
            (k) =>
              "<tr><td>" +
              k.name +
              "</td><td>" +
              (turler[k.type] || k.type) +
              '</td><td class="text-right ' +
              ((k.balance || 0) >= 0 ? "text-green" : "text-red") +
              '">' +
              formatCurrency(k.balance || 0) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="2"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(toplam) +
        "</td></tr></table>"
    );
    let csv = "\uFEFFKASA BAKİYELERİ\n\nKasa;Tür;Bakiye\n";
    aktif.forEach(
      (k) => (csv += k.name + ";" + k.type + ";" + (k.balance || 0) + "\n")
    );
    csv += "\nToplam;;" + toplam + "\n";
    return { html, csv };
  };

  const generateAylikKarsilastirma = () => {
    const now = new Date();
    const buAyBaslangic = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const gecenAyBaslangic = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
    const gecenAyBitis = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    const buAy = islemler.filter((i) => i.date.split("T")[0] >= buAyBaslangic);
    const gecenAy = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return d >= gecenAyBaslangic && d <= gecenAyBitis;
    });

    const buAyGelir = buAy
      .filter((i) => i.type === "gelir" || i.type === "tahsilat")
      .reduce((s, i) => s + i.amount, 0);
    const buAyGider = buAy
      .filter((i) => i.type === "gider" || i.type === "odeme")
      .reduce((s, i) => s + i.amount, 0);
    const gecenAyGelir = gecenAy
      .filter((i) => i.type === "gelir" || i.type === "tahsilat")
      .reduce((s, i) => s + i.amount, 0);
    const gecenAyGider = gecenAy
      .filter((i) => i.type === "gider" || i.type === "odeme")
      .reduce((s, i) => s + i.amount, 0);

    const gelirDegisim =
      gecenAyGelir > 0
        ? (((buAyGelir - gecenAyGelir) / gecenAyGelir) * 100).toFixed(1)
        : "0";
    const giderDegisim =
      gecenAyGider > 0
        ? (((buAyGider - gecenAyGider) / gecenAyGider) * 100).toFixed(1)
        : "0";
    const buAyNet = buAyGelir - buAyGider;
    const gecenAyNet = gecenAyGelir - gecenAyGider;
    const maxValue = Math.max(
      buAyGelir,
      buAyGider,
      gecenAyGelir,
      gecenAyGider,
      1
    );

    const html = wrapHtml(
      "Aylık Karşılaştırma Raporu",
      '<h2>Özet Karşılaştırma</h2><table><tr><th></th><th class="text-center">Geçen Ay</th><th class="text-center">Bu Ay</th><th class="text-center">Değişim</th></tr><tr><td><strong>Gelir</strong></td><td class="text-center">' +
        formatCurrency(gecenAyGelir) +
        '</td><td class="text-center text-green">' +
        formatCurrency(buAyGelir) +
        '</td><td class="text-center ' +
        (parseFloat(gelirDegisim) >= 0
          ? "change-positive"
          : "change-negative") +
        '">' +
        (parseFloat(gelirDegisim) >= 0 ? "↑" : "↓") +
        " " +
        Math.abs(parseFloat(gelirDegisim)) +
        '%</td></tr><tr><td><strong>Gider</strong></td><td class="text-center">' +
        formatCurrency(gecenAyGider) +
        '</td><td class="text-center text-red">' +
        formatCurrency(buAyGider) +
        '</td><td class="text-center ' +
        (parseFloat(giderDegisim) <= 0
          ? "change-positive"
          : "change-negative") +
        '">' +
        (parseFloat(giderDegisim) >= 0 ? "↑" : "↓") +
        " " +
        Math.abs(parseFloat(giderDegisim)) +
        '%</td></tr><tr class="total-row"><td><strong>Net Kar/Zarar</strong></td><td class="text-center">' +
        formatCurrency(gecenAyNet) +
        '</td><td class="text-center">' +
        formatCurrency(buAyNet) +
        '</td><td></td></tr></table><h2>Görsel Karşılaştırma</h2><div class="bar-container"><div class="bar-row"><div class="bar-label">Geçen Ay Gelir</div><div class="bar-track"><div class="bar-fill" style="width:' +
        (gecenAyGelir / maxValue) * 100 +
        '%;background:#86efac;"></div></div><div class="bar-value">' +
        formatCurrency(gecenAyGelir) +
        '</div></div><div class="bar-row"><div class="bar-label">Bu Ay Gelir</div><div class="bar-track"><div class="bar-fill" style="width:' +
        (buAyGelir / maxValue) * 100 +
        '%;background:#10b981;"></div></div><div class="bar-value">' +
        formatCurrency(buAyGelir) +
        '</div></div><div class="bar-row"><div class="bar-label">Geçen Ay Gider</div><div class="bar-track"><div class="bar-fill" style="width:' +
        (gecenAyGider / maxValue) * 100 +
        '%;background:#fca5a5;"></div></div><div class="bar-value">' +
        formatCurrency(gecenAyGider) +
        '</div></div><div class="bar-row"><div class="bar-label">Bu Ay Gider</div><div class="bar-track"><div class="bar-fill" style="width:' +
        (buAyGider / maxValue) * 100 +
        '%;background:#ef4444;"></div></div><div class="bar-value">' +
        formatCurrency(buAyGider) +
        "</div></div></div>"
    );
    let csv =
      "\uFEFFAYLIK KARŞILAŞTIRMA\n\n;Geçen Ay;Bu Ay;Değişim\nGelir;" +
      gecenAyGelir +
      ";" +
      buAyGelir +
      ";" +
      gelirDegisim +
      "%\nGider;" +
      gecenAyGider +
      ";" +
      buAyGider +
      ";" +
      giderDegisim +
      "%\nNet;" +
      gecenAyNet +
      ";" +
      buAyNet +
      ";\n";
    return { html, csv };
  };

  const generateGunlukSatisTrendi = () => {
    const filtered = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return (
        d >= startDate &&
        d <= endDate &&
        (i.type === "gelir" || i.type === "tahsilat")
      );
    });
    const gunlukMap = new Map<string, number>();
    filtered.forEach((i) => {
      const d = i.date.split("T")[0];
      gunlukMap.set(d, (gunlukMap.get(d) || 0) + i.amount);
    });
    const data = Array.from(gunlukMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    const maxValue = Math.max(...data.map((d) => d[1]), 1);
    const toplam = data.reduce((s, d) => s + d[1], 0);
    const ortalama = data.length > 0 ? toplam / data.length : 0;

    const html = wrapHtml(
      "Günlük Satış Trendi",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value">' +
        formatCurrency(toplam) +
        '</div><div class="summary-label">Toplam Satış</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        formatCurrency(ortalama) +
        '</div><div class="summary-label">Günlük Ortalama</div></div><div class="summary-item summary-yellow"><div class="summary-value">' +
        data.length +
        '</div><div class="summary-label">Gün Sayısı</div></div></div><h2>Günlük Satış Grafiği</h2><div class="bar-container">' +
        data
          .map(
            ([tarih, tutar]) =>
              '<div class="bar-row"><div class="bar-label">' +
              formatDate(tarih) +
              '</div><div class="bar-track"><div class="bar-fill" style="width:' +
              (tutar / maxValue) * 100 +
              '%;background:#10b981;"></div></div><div class="bar-value">' +
              formatCurrency(tutar) +
              "</div></div>"
          )
          .join("") +
        '</div><h2>Detay Tablo</h2><table><tr><th>Tarih</th><th class="text-right">Satış</th><th class="text-right">Ortalamadan Fark</th></tr>' +
        data
          .map(
            ([tarih, tutar]) =>
              "<tr><td>" +
              formatDate(tarih) +
              '</td><td class="text-right">' +
              formatCurrency(tutar) +
              '</td><td class="text-right ' +
              (tutar >= ortalama ? "text-green" : "text-red") +
              '">' +
              (tutar >= ortalama ? "+" : "") +
              formatCurrency(tutar - ortalama) +
              "</td></tr>"
          )
          .join("") +
        "</table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFGÜNLÜK SATIŞ TRENDİ\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\nToplam;" +
      toplam +
      "\nOrtalama;" +
      ortalama +
      "\n\nTarih;Satış\n";
    data.forEach(([tarih, tutar]) => (csv += tarih + ";" + tutar + "\n"));
    return { html, csv };
  };

  const generateHaftalikSatis = () => {
    const now = new Date();
    const haftalar: {
      hafta: string;
      baslangic: string;
      bitis: string;
      toplam: number;
    }[] = [];
    for (let i = 3; i >= 0; i--) {
      const haftaSonu = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const haftaBasi = new Date(haftaSonu.getTime() - 6 * 24 * 60 * 60 * 1000);
      const basStr = haftaBasi.toISOString().split("T")[0];
      const bitStr = haftaSonu.toISOString().split("T")[0];
      const toplam = islemler
        .filter((isl) => {
          const d = isl.date.split("T")[0];
          return (
            d >= basStr &&
            d <= bitStr &&
            (isl.type === "gelir" || isl.type === "tahsilat")
          );
        })
        .reduce((s, isl) => s + isl.amount, 0);
      haftalar.push({
        hafta:
          i === 0 ? "Bu Hafta" : i === 1 ? "Geçen Hafta" : i + " Hafta Önce",
        baslangic: basStr,
        bitis: bitStr,
        toplam,
      });
    }
    const maxValue = Math.max(...haftalar.map((h) => h.toplam), 1);
    const genelToplam = haftalar.reduce((s, h) => s + h.toplam, 0);

    const html = wrapHtml(
      "Haftalık Satış Özeti",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value">' +
        formatCurrency(genelToplam) +
        '</div><div class="summary-label">4 Hafta Toplam</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        formatCurrency(genelToplam / 4) +
        '</div><div class="summary-label">Haftalık Ortalama</div></div></div><h2>Haftalık Karşılaştırma</h2><div class="bar-container">' +
        haftalar
          .map(
            (h) =>
              '<div class="bar-row"><div class="bar-label">' +
              h.hafta +
              '</div><div class="bar-track"><div class="bar-fill" style="width:' +
              (h.toplam / maxValue) * 100 +
              '%;background:#3b82f6;"></div></div><div class="bar-value">' +
              formatCurrency(h.toplam) +
              "</div></div>"
          )
          .join("") +
        '</div><table><tr><th>Hafta</th><th>Tarih Aralığı</th><th class="text-right">Satış</th></tr>' +
        haftalar
          .map(
            (h) =>
              "<tr><td>" +
              h.hafta +
              "</td><td>" +
              formatDate(h.baslangic) +
              " - " +
              formatDate(h.bitis) +
              '</td><td class="text-right">' +
              formatCurrency(h.toplam) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="2"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(genelToplam) +
        "</td></tr></table>"
    );
    let csv = "\uFEFFHAFTALIK SATIŞ ÖZETİ\n\nHafta;Başlangıç;Bitiş;Satış\n";
    haftalar.forEach(
      (h) =>
        (csv +=
          h.hafta + ";" + h.baslangic + ";" + h.bitis + ";" + h.toplam + "\n")
    );
    return { html, csv };
  };

  const generateTop10Tedarikci = () => {
    const filtered = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return d >= startDate && d <= endDate && i.cari_id && i.type === "gider";
    });
    const cariMap = new Map<
      string,
      { name: string; toplam: number; islemSayisi: number }
    >();
    filtered.forEach((i) => {
      const cari = cariler.find((c) => c.id === i.cari_id);
      if (cari && cari.type === "tedarikci") {
        const mevcut = cariMap.get(i.cari_id!) || {
          name: cari.name,
          toplam: 0,
          islemSayisi: 0,
        };
        mevcut.toplam += i.amount;
        mevcut.islemSayisi++;
        cariMap.set(i.cari_id!, mevcut);
      }
    });
    const sorted = Array.from(cariMap.values())
      .sort((a, b) => b.toplam - a.toplam)
      .slice(0, 10);
    const genelToplam = sorted.reduce((s, c) => s + c.toplam, 0);
    const maxValue = sorted.length > 0 ? sorted[0].toplam : 1;

    const html = wrapHtml(
      "En Çok Alış Yapılan Tedarikçiler - Top 10",
      '<div class="summary"><div class="summary-item summary-red"><div class="summary-value">' +
        formatCurrency(genelToplam) +
        '</div><div class="summary-label">Top 10 Toplam</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        sorted.reduce((s, c) => s + c.islemSayisi, 0) +
        '</div><div class="summary-label">İşlem Sayısı</div></div></div><h2>Alış Sıralaması</h2><div class="bar-container">' +
        sorted
          .map(
            (c, i) =>
              '<div class="bar-row"><div class="bar-label">' +
              (i + 1) +
              ". " +
              c.name.substring(0, 15) +
              '</div><div class="bar-track"><div class="bar-fill" style="width:' +
              (c.toplam / maxValue) * 100 +
              '%;background:#f59e0b;"></div></div><div class="bar-value">' +
              formatCurrency(c.toplam) +
              "</div></div>"
          )
          .join("") +
        '</div><table><tr><th>#</th><th>Tedarikçi</th><th class="text-center">İşlem</th><th class="text-right">Toplam Alış</th><th class="text-right">Oran</th></tr>' +
        sorted
          .map(
            (c, i) =>
              "<tr><td>" +
              (i + 1) +
              "</td><td>" +
              c.name +
              '</td><td class="text-center">' +
              c.islemSayisi +
              '</td><td class="text-right">' +
              formatCurrency(c.toplam) +
              '</td><td class="text-right">' +
              ((c.toplam / genelToplam) * 100).toFixed(1) +
              "%</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="3"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(genelToplam) +
        "</td><td></td></tr></table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFEN ÇOK ALIŞ YAPILAN TEDARİKÇİLER - TOP 10\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nSıra;Tedarikçi;İşlem Sayısı;Toplam\n";
    sorted.forEach(
      (c, i) =>
        (csv +=
          i + 1 + ";" + c.name + ";" + c.islemSayisi + ";" + c.toplam + "\n")
    );
    return { html, csv };
  };

  const generateUrunBazliAlis = () => {
    const html = wrapHtml(
      "Ürün Bazlı Alışlar",
      "<p><em>Not: Bu rapor için kalemli fatura girişi yapılmış olmalıdır.</em></p><h2>Tanımlı Ürünler</h2><table><tr><th>Ürün</th><th>Birim</th><th>Varsayılan Fiyat</th></tr>" +
        urunler
          .filter((u) => u.is_active)
          .slice(0, 20)
          .map(
            (u) =>
              "<tr><td>" +
              u.name +
              "</td><td>" +
              u.unit +
              '</td><td class="text-right">' +
              (u.default_price ? formatCurrency(u.default_price) : "-") +
              "</td></tr>"
          )
          .join("") +
        "</table><p>Toplam " +
        urunler.filter((u) => u.is_active).length +
        " aktif ürün tanımlı.</p>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFÜRÜN BAZLI ALIŞLAR\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nÜrün;Birim;Varsayılan Fiyat\n";
    urunler
      .filter((u) => u.is_active)
      .forEach(
        (u) =>
          (csv += u.name + ";" + u.unit + ";" + (u.default_price || "") + "\n")
      );
    return { html, csv };
  };

  const generateKategoriBazliAlis = () => {
    const filtered = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return (
        d >= startDate && d <= endDate && i.kategori_id && i.type === "gider"
      );
    });
    const kategoriMap = new Map<
      string,
      { name: string; toplam: number; islemSayisi: number }
    >();
    filtered.forEach((i) => {
      if (i.kategori) {
        const mevcut = kategoriMap.get(i.kategori_id!) || {
          name: i.kategori.name,
          toplam: 0,
          islemSayisi: 0,
        };
        mevcut.toplam += i.amount;
        mevcut.islemSayisi++;
        kategoriMap.set(i.kategori_id!, mevcut);
      }
    });
    const sorted = Array.from(kategoriMap.values()).sort(
      (a, b) => b.toplam - a.toplam
    );
    const genelToplam = sorted.reduce((s, k) => s + k.toplam, 0);
    const maxValue = sorted.length > 0 ? sorted[0].toplam : 1;

    const html = wrapHtml(
      "Kategori Bazlı Giderler",
      '<div class="summary"><div class="summary-item summary-red"><div class="summary-value">' +
        formatCurrency(genelToplam) +
        '</div><div class="summary-label">Toplam Gider</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        sorted.length +
        '</div><div class="summary-label">Kategori Sayısı</div></div></div><h2>Kategori Dağılımı</h2><div class="bar-container">' +
        sorted
          .slice(0, 10)
          .map(
            (k) =>
              '<div class="bar-row"><div class="bar-label">' +
              k.name.substring(0, 15) +
              '</div><div class="bar-track"><div class="bar-fill" style="width:' +
              (k.toplam / maxValue) * 100 +
              '%;background:#ec4899;"></div></div><div class="bar-value">' +
              formatCurrency(k.toplam) +
              "</div></div>"
          )
          .join("") +
        '</div><table><tr><th>Kategori</th><th class="text-center">İşlem</th><th class="text-right">Toplam</th><th class="text-right">Oran</th></tr>' +
        sorted
          .map(
            (k) =>
              "<tr><td>" +
              k.name +
              '</td><td class="text-center">' +
              k.islemSayisi +
              '</td><td class="text-right">' +
              formatCurrency(k.toplam) +
              '</td><td class="text-right">' +
              (genelToplam > 0
                ? ((k.toplam / genelToplam) * 100).toFixed(1)
                : 0) +
              "%</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="2"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(genelToplam) +
        "</td><td></td></tr></table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFKATEGORİ BAZLI GİDERLER\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nKategori;İşlem Sayısı;Toplam\n";
    sorted.forEach(
      (k) => (csv += k.name + ";" + k.islemSayisi + ";" + k.toplam + "\n")
    );
    return { html, csv };
  };

  const generateTedarikciBorclar = () => {
    const borcluTedarikciler = cariler
      .filter((c) => c.type === "tedarikci" && (c.balance || 0) > 0)
      .sort((a, b) => (b.balance || 0) - (a.balance || 0));
    const toplam = borcluTedarikciler.reduce((s, c) => s + (c.balance || 0), 0);
    const maxValue =
      borcluTedarikciler.length > 0 ? borcluTedarikciler[0].balance || 1 : 1;

    const html = wrapHtml(
      "Tedarikçi Borçlarım",
      '<div class="summary"><div class="summary-item summary-red"><div class="summary-value text-red">' +
        formatCurrency(toplam) +
        '</div><div class="summary-label">Toplam Borç</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        borcluTedarikciler.length +
        '</div><div class="summary-label">Tedarikçi Sayısı</div></div></div>' +
        (borcluTedarikciler.length > 0
          ? '<h2>Borç Dağılımı</h2><div class="bar-container">' +
            borcluTedarikciler
              .slice(0, 8)
              .map(
                (c) =>
                  '<div class="bar-row"><div class="bar-label">' +
                  c.name.substring(0, 15) +
                  '</div><div class="bar-track"><div class="bar-fill" style="width:' +
                  ((c.balance || 0) / maxValue) * 100 +
                  '%;background:#ef4444;"></div></div><div class="bar-value">' +
                  formatCurrency(c.balance || 0) +
                  "</div></div>"
              )
              .join("") +
            "</div>"
          : "") +
        '<table><tr><th>#</th><th>Tedarikçi</th><th>Telefon</th><th class="text-right">Borç</th></tr>' +
        borcluTedarikciler
          .map(
            (c, i) =>
              "<tr><td>" +
              (i + 1) +
              "</td><td>" +
              c.name +
              "</td><td>" +
              (c.phone || "-") +
              '</td><td class="text-right text-red">' +
              formatCurrency(c.balance || 0) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row negative"><td colspan="3"><strong>Toplam Borç</strong></td><td class="text-right">' +
        formatCurrency(toplam) +
        "</td></tr></table>"
    );
    let csv =
      "\uFEFFTEDARİKÇİ BORÇLARIM\n\nToplam Borç;" +
      toplam +
      "\n\nSıra;Tedarikçi;Telefon;Borç\n";
    borcluTedarikciler.forEach(
      (c, i) =>
        (csv +=
          i +
          1 +
          ";" +
          c.name +
          ";" +
          (c.phone || "") +
          ";" +
          (c.balance || 0) +
          "\n")
    );
    return { html, csv };
  };

  const generateMusteriAlacaklar = () => {
    const alacakliMusteriler = cariler
      .filter((c) => c.type === "musteri" && (c.balance || 0) > 0)
      .sort((a, b) => (b.balance || 0) - (a.balance || 0));
    const toplam = alacakliMusteriler.reduce((s, c) => s + (c.balance || 0), 0);

    const html = wrapHtml(
      "Müşteri Alacaklarım",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value text-green">' +
        formatCurrency(toplam) +
        '</div><div class="summary-label">Toplam Alacak</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        alacakliMusteriler.length +
        '</div><div class="summary-label">Müşteri Sayısı</div></div></div><table><tr><th>#</th><th>Müşteri</th><th>Telefon</th><th class="text-right">Alacak</th></tr>' +
        alacakliMusteriler
          .map(
            (c, i) =>
              "<tr><td>" +
              (i + 1) +
              "</td><td>" +
              c.name +
              "</td><td>" +
              (c.phone || "-") +
              '</td><td class="text-right text-green">' +
              formatCurrency(c.balance || 0) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="3"><strong>Toplam Alacak</strong></td><td class="text-right">' +
        formatCurrency(toplam) +
        "</td></tr></table>"
    );
    let csv =
      "\uFEFFMÜŞTERİ ALACAKLARIM\n\nToplam Alacak;" +
      toplam +
      "\n\nSıra;Müşteri;Telefon;Alacak\n";
    alacakliMusteriler.forEach(
      (c, i) =>
        (csv +=
          i +
          1 +
          ";" +
          c.name +
          ";" +
          (c.phone || "") +
          ";" +
          (c.balance || 0) +
          "\n")
    );
    return { html, csv };
  };

  const generateCariEkstre = () => {
    const cari = getSelectedCari();
    if (!cari) return { html: "", csv: "" };
    const cariIslemler = islemler
      .filter(
        (i) =>
          i.cari_id === cari.id &&
          i.date.split("T")[0] >= startDate &&
          i.date.split("T")[0] <= endDate
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let bakiye = cari.initial_balance || 0;
    const hareketler = cariIslemler.map((i) => {
      const isBorc = i.type === "gider";
      const isAlacak = i.type === "odeme";
      if (isBorc) bakiye += i.amount;
      if (isAlacak) bakiye -= i.amount;
      return {
        ...i,
        borc: isBorc ? i.amount : 0,
        alacak: isAlacak ? i.amount : 0,
        bakiye,
      };
    });
    const toplamBorc = hareketler.reduce((s, h) => s + h.borc, 0);
    const toplamAlacak = hareketler.reduce((s, h) => s + h.alacak, 0);

    const html = wrapHtml(
      "Cari Hesap Ekstresi - " + cari.name,
      '<div class="summary"><div class="summary-item summary-red"><div class="summary-value">' +
        formatCurrency(toplamBorc) +
        '</div><div class="summary-label">Toplam Alış</div></div><div class="summary-item summary-green"><div class="summary-value">' +
        formatCurrency(toplamAlacak) +
        '</div><div class="summary-label">Toplam Ödeme</div></div><div class="summary-item ' +
        (bakiye > 0 ? "summary-red" : "summary-green") +
        '"><div class="summary-value">' +
        formatCurrency(Math.abs(bakiye)) +
        '</div><div class="summary-label">' +
        (bakiye > 0 ? "Borcumuz" : "Alacağımız") +
        '</div></div></div><table><tr><th>Tarih</th><th>Açıklama</th><th class="text-right">Borç</th><th class="text-right">Alacak</th><th class="text-right">Bakiye</th></tr><tr><td colspan="4"><em>Açılış Bakiyesi</em></td><td class="text-right">' +
        formatCurrency(cari.initial_balance || 0) +
        "</td></tr>" +
        hareketler
          .map(
            (h) =>
              "<tr><td>" +
              formatDate(h.date) +
              "</td><td>" +
              (h.description || "-") +
              '</td><td class="text-right ' +
              (h.borc > 0 ? "text-red" : "") +
              '">' +
              (h.borc > 0 ? formatCurrency(h.borc) : "-") +
              '</td><td class="text-right ' +
              (h.alacak > 0 ? "text-green" : "") +
              '">' +
              (h.alacak > 0 ? formatCurrency(h.alacak) : "-") +
              '</td><td class="text-right">' +
              formatCurrency(h.bakiye) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="2"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(toplamBorc) +
        '</td><td class="text-right">' +
        formatCurrency(toplamAlacak) +
        '</td><td class="text-right"><strong>' +
        formatCurrency(bakiye) +
        "</strong></td></tr></table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFCARİ HESAP EKSTRESİ - " +
      cari.name +
      "\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nTarih;Açıklama;Borç;Alacak;Bakiye\nAçılış;;;;" +
      (cari.initial_balance || 0) +
      "\n";
    hareketler.forEach(
      (h) =>
        (csv +=
          h.date +
          ";" +
          (h.description || "") +
          ";" +
          (h.borc || "") +
          ";" +
          (h.alacak || "") +
          ";" +
          h.bakiye +
          "\n")
    );
    return { html, csv };
  };

  const generateMaasRaporu = () => {
    const filtered = islemler.filter((i) => {
      const d = i.date.split("T")[0];
      return d >= startDate && d <= endDate && i.personel_id;
    });
    const personelMap = new Map<
      string,
      { name: string; maas: number; avans: number; prim: number }
    >();
    personeller.forEach((p) =>
      personelMap.set(p.id, { name: p.name, maas: 0, avans: 0, prim: 0 })
    );
    filtered.forEach((i) => {
      const p = personelMap.get(i.personel_id!);
      if (p) {
        const desc = (i.description || "").toLowerCase();
        if (desc.includes("maaş")) p.maas += i.amount;
        else if (desc.includes("avans")) p.avans += i.amount;
        else if (desc.includes("prim")) p.prim += i.amount;
        else p.maas += i.amount;
      }
    });
    const data = Array.from(personelMap.values()).filter(
      (p) => p.maas + p.avans + p.prim > 0
    );
    const toplam = data.reduce(
      (s, p) => ({
        maas: s.maas + p.maas,
        avans: s.avans + p.avans,
        prim: s.prim + p.prim,
      }),
      { maas: 0, avans: 0, prim: 0 }
    );

    const html = wrapHtml(
      "Maaş Ödemeleri Raporu",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value">' +
        formatCurrency(toplam.maas) +
        '</div><div class="summary-label">Toplam Maaş</div></div><div class="summary-item summary-yellow"><div class="summary-value">' +
        formatCurrency(toplam.avans) +
        '</div><div class="summary-label">Toplam Avans</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        formatCurrency(toplam.prim) +
        '</div><div class="summary-label">Toplam Prim</div></div></div><table><tr><th>Personel</th><th class="text-right">Maaş</th><th class="text-right">Avans</th><th class="text-right">Prim</th><th class="text-right">Toplam</th></tr>' +
        data
          .map(
            (p) =>
              "<tr><td>" +
              p.name +
              '</td><td class="text-right">' +
              formatCurrency(p.maas) +
              '</td><td class="text-right">' +
              formatCurrency(p.avans) +
              '</td><td class="text-right">' +
              formatCurrency(p.prim) +
              '</td><td class="text-right"><strong>' +
              formatCurrency(p.maas + p.avans + p.prim) +
              "</strong></td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(toplam.maas) +
        '</td><td class="text-right">' +
        formatCurrency(toplam.avans) +
        '</td><td class="text-right">' +
        formatCurrency(toplam.prim) +
        '</td><td class="text-right"><strong>' +
        formatCurrency(toplam.maas + toplam.avans + toplam.prim) +
        "</strong></td></tr></table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFMAAŞ ÖDEMELERİ RAPORU\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nPersonel;Maaş;Avans;Prim;Toplam\n";
    data.forEach(
      (p) =>
        (csv +=
          p.name +
          ";" +
          p.maas +
          ";" +
          p.avans +
          ";" +
          p.prim +
          ";" +
          (p.maas + p.avans + p.prim) +
          "\n")
    );
    return { html, csv };
  };

  const generateIzinRaporu = async () => {
    const { data: izinler } = await supabase
      .from("personel_izinler")
      .select("*, personel:personeller(name)")
      .gte("start_date", startDate)
      .lte("start_date", endDate);
    const izinData = izinler || [];
    const personelMap = new Map<
      string,
      {
        name: string;
        yillik: number;
        hastalik: number;
        mazeret: number;
        ucretsiz: number;
      }
    >();
    izinData.forEach((izin: any) => {
      const pid = izin.personel_id;
      const name = izin.personel?.name || "Bilinmeyen";
      if (!personelMap.has(pid))
        personelMap.set(pid, {
          name,
          yillik: 0,
          hastalik: 0,
          mazeret: 0,
          ucretsiz: 0,
        });
      const p = personelMap.get(pid)!;
      const days = Math.abs(izin.days || 0);
      if (izin.type === "yillik") p.yillik += days;
      else if (izin.type === "hastalik") p.hastalik += days;
      else if (izin.type === "mazeret") p.mazeret += days;
      else if (izin.type === "ucretsiz") p.ucretsiz += days;
    });
    const data = Array.from(personelMap.values());
    const toplam = data.reduce(
      (s, p) => ({
        yillik: s.yillik + p.yillik,
        hastalik: s.hastalik + p.hastalik,
        mazeret: s.mazeret + p.mazeret,
        ucretsiz: s.ucretsiz + p.ucretsiz,
      }),
      { yillik: 0, hastalik: 0, mazeret: 0, ucretsiz: 0 }
    );

    const html = wrapHtml(
      "İzin Kullanımları Raporu",
      '<div class="summary"><div class="summary-item summary-green"><div class="summary-value">' +
        toplam.yillik +
        '</div><div class="summary-label">Yıllık (gün)</div></div><div class="summary-item summary-red"><div class="summary-value">' +
        toplam.hastalik +
        '</div><div class="summary-label">Hastalık (gün)</div></div><div class="summary-item summary-yellow"><div class="summary-value">' +
        toplam.mazeret +
        '</div><div class="summary-label">Mazeret (gün)</div></div><div class="summary-item summary-blue"><div class="summary-value">' +
        toplam.ucretsiz +
        '</div><div class="summary-label">Ücretsiz (gün)</div></div></div><table><tr><th>Personel</th><th class="text-center">Yıllık</th><th class="text-center">Hastalık</th><th class="text-center">Mazeret</th><th class="text-center">Ücretsiz</th><th class="text-center">Toplam</th></tr>' +
        data
          .map(
            (p) =>
              "<tr><td>" +
              p.name +
              '</td><td class="text-center">' +
              p.yillik +
              '</td><td class="text-center">' +
              p.hastalik +
              '</td><td class="text-center">' +
              p.mazeret +
              '</td><td class="text-center">' +
              p.ucretsiz +
              '</td><td class="text-center"><strong>' +
              (p.yillik + p.hastalik + p.mazeret + p.ucretsiz) +
              "</strong></td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td><strong>Toplam</strong></td><td class="text-center">' +
        toplam.yillik +
        '</td><td class="text-center">' +
        toplam.hastalik +
        '</td><td class="text-center">' +
        toplam.mazeret +
        '</td><td class="text-center">' +
        toplam.ucretsiz +
        '</td><td class="text-center"><strong>' +
        (toplam.yillik + toplam.hastalik + toplam.mazeret + toplam.ucretsiz) +
        "</strong></td></tr></table>",
      formatDate(startDate) + " - " + formatDate(endDate)
    );
    let csv =
      "\uFEFFİZİN KULLANIMLARI RAPORU\nDönem;" +
      startDate +
      " - " +
      endDate +
      "\n\nPersonel;Yıllık;Hastalık;Mazeret;Ücretsiz;Toplam\n";
    data.forEach(
      (p) =>
        (csv +=
          p.name +
          ";" +
          p.yillik +
          ";" +
          p.hastalik +
          ";" +
          p.mazeret +
          ";" +
          p.ucretsiz +
          ";" +
          (p.yillik + p.hastalik + p.mazeret + p.ucretsiz) +
          "\n")
    );
    return { html, csv };
  };

  const generatePersonelOzet = () => {
    const aktifPersonel = personeller.filter((p) => !p.is_archived);
    const toplamMaas = aktifPersonel.reduce((s, p) => s + (p.salary || 0), 0);
    const html = wrapHtml(
      "Personel Genel Özeti",
      '<div class="summary"><div class="summary-item summary-blue"><div class="summary-value">' +
        aktifPersonel.length +
        '</div><div class="summary-label">Aktif Personel</div></div><div class="summary-item summary-green"><div class="summary-value">' +
        formatCurrency(toplamMaas) +
        '</div><div class="summary-label">Aylık Maaş Yükü</div></div></div><table><tr><th>#</th><th>Ad Soyad</th><th>Pozisyon</th><th>İşe Başlama</th><th class="text-right">Maaş</th></tr>' +
        aktifPersonel
          .map(
            (p, i) =>
              "<tr><td>" +
              (i + 1) +
              "</td><td>" +
              p.name +
              "</td><td>" +
              (p.position || "-") +
              "</td><td>" +
              (p.start_date ? formatDate(p.start_date) : "-") +
              '</td><td class="text-right">' +
              formatCurrency(p.salary || 0) +
              "</td></tr>"
          )
          .join("") +
        '<tr class="total-row"><td colspan="4"><strong>Toplam</strong></td><td class="text-right">' +
        formatCurrency(toplamMaas) +
        "</td></tr></table>"
    );
    let csv =
      "\uFEFFPERSONEL GENEL ÖZETİ\n\nAktif Personel;" +
      aktifPersonel.length +
      "\nAylık Maaş Yükü;" +
      toplamMaas +
      "\n\nAd Soyad;Pozisyon;İşe Başlama;Maaş\n";
    aktifPersonel.forEach(
      (p) =>
        (csv +=
          p.name +
          ";" +
          (p.position || "") +
          ";" +
          (p.start_date || "") +
          ";" +
          (p.salary || 0) +
          "\n")
    );
    return { html, csv };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  const maxSatis = dashboardData
    ? Math.max(...dashboardData.son7GunSatislar.map((s) => s.tutar), 1)
    : 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Raporlar</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {dashboardData && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dashboardScroll}
            >
              <View style={[styles.dashCard, styles.dashCardGreen]}>
                <Text style={styles.dashLabel}>Bu Ay Gelir</Text>
                <Text style={styles.dashValue}>
                  {formatCurrencyShort(dashboardData.buAyGelir)}
                </Text>
                {dashboardData.gecenAyGelir > 0 && (
                  <Text
                    style={[
                      styles.dashChange,
                      dashboardData.buAyGelir >= dashboardData.gecenAyGelir
                        ? styles.changeUp
                        : styles.changeDown,
                    ]}
                  >
                    {dashboardData.buAyGelir >= dashboardData.gecenAyGelir
                      ? "↑"
                      : "↓"}{" "}
                    {Math.abs(
                      ((dashboardData.buAyGelir - dashboardData.gecenAyGelir) /
                        dashboardData.gecenAyGelir) *
                        100
                    ).toFixed(0)}
                    %
                  </Text>
                )}
              </View>
              <View style={[styles.dashCard, styles.dashCardRed]}>
                <Text style={styles.dashLabel}>Bu Ay Gider</Text>
                <Text style={styles.dashValue}>
                  {formatCurrencyShort(dashboardData.buAyGider)}
                </Text>
                {dashboardData.gecenAyGider > 0 && (
                  <Text
                    style={[
                      styles.dashChange,
                      dashboardData.buAyGider <= dashboardData.gecenAyGider
                        ? styles.changeUp
                        : styles.changeDown,
                    ]}
                  >
                    {dashboardData.buAyGider >= dashboardData.gecenAyGider
                      ? "↑"
                      : "↓"}{" "}
                    {Math.abs(
                      ((dashboardData.buAyGider - dashboardData.gecenAyGider) /
                        dashboardData.gecenAyGider) *
                        100
                    ).toFixed(0)}
                    %
                  </Text>
                )}
              </View>
              <View style={[styles.dashCard, styles.dashCardBlue]}>
                <Text style={styles.dashLabel}>Kasada</Text>
                <Text style={styles.dashValue}>
                  {formatCurrencyShort(dashboardData.toplamKasa)}
                </Text>
              </View>
              <View style={[styles.dashCard, styles.dashCardOrange]}>
                <Text style={styles.dashLabel}>Borçlar</Text>
                <Text style={styles.dashValue}>
                  {formatCurrencyShort(dashboardData.toplamBorc)}
                </Text>
              </View>
            </ScrollView>
            <View style={styles.miniChart}>
              <Text style={styles.miniChartTitle}>Son 7 Gün Satış</Text>
              <View style={styles.miniChartBars}>
                {dashboardData.son7GunSatislar.map((s, i) => (
                  <View key={i} style={styles.miniChartBar}>
                    <View style={styles.miniChartBarTrack}>
                      <View
                        style={[
                          styles.miniChartBarFill,
                          { height: `${(s.tutar / maxSatis) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.miniChartBarLabel}>{s.gun}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {reportCategories.map((cat) => {
          const CatIcon = cat.icon;
          const isExpanded = expandedCategory === cat.id;
          return (
            <View key={cat.id} style={styles.category}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(isExpanded ? null : cat.id)}
              >
                <View
                  style={[
                    styles.categoryIconBox,
                    { backgroundColor: `${cat.color}20` },
                  ]}
                >
                  <CatIcon size={20} color={cat.color} />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.reports.length}</Text>
                {isExpanded ? (
                  <ChevronDown size={20} color="#6b7280" />
                ) : (
                  <ChevronRight size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.reportList}>
                  {cat.reports.map((report) => {
                    const RepIcon = report.icon;
                    return (
                      <TouchableOpacity
                        key={report.id}
                        style={styles.reportItem}
                        onPress={() => openReportModal(report)}
                      >
                        <RepIcon size={18} color={report.color} />
                        <Text style={styles.reportTitle}>{report.title}</Text>
                        <Download size={16} color="#9ca3af" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedReport?.title}</Text>
            <View style={{ width: 48 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedReport?.needsDateRange && (
              <View style={styles.section}>
                <Text style={styles.label}>Tarih Aralığı</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Başlangıç</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Bitiş</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
                <View style={styles.quickDates}>
                  {[
                    {
                      label: "Bugün",
                      fn: () => {
                        const n = new Date().toISOString().split("T")[0];
                        setStartDate(n);
                        setEndDate(n);
                      },
                    },
                    {
                      label: "Bu Hafta",
                      fn: () => {
                        const n = new Date();
                        setStartDate(
                          new Date(n.getTime() - 7 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0]
                        );
                        setEndDate(n.toISOString().split("T")[0]);
                      },
                    },
                    {
                      label: "Bu Ay",
                      fn: () => {
                        const n = new Date();
                        setStartDate(
                          new Date(n.getFullYear(), n.getMonth(), 1)
                            .toISOString()
                            .split("T")[0]
                        );
                        setEndDate(n.toISOString().split("T")[0]);
                      },
                    },
                    {
                      label: "Bu Yıl",
                      fn: () => {
                        const n = new Date();
                        setStartDate(
                          new Date(n.getFullYear(), 0, 1)
                            .toISOString()
                            .split("T")[0]
                        );
                        setEndDate(n.toISOString().split("T")[0]);
                      },
                    },
                  ].map((q) => (
                    <TouchableOpacity
                      key={q.label}
                      style={styles.quickBtn}
                      onPress={q.fn}
                    >
                      <Text style={styles.quickBtnText}>{q.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {selectedReport?.needsCariSelect && (
              <View style={styles.section}>
                <Text style={styles.label}>Cari Seç</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => setShowCariList(!showCariList)}
                >
                  <Text
                    style={
                      selectedCariId
                        ? styles.selectText
                        : styles.selectPlaceholder
                    }
                  >
                    {selectedCariId
                      ? getSelectedCari()?.name
                      : "Tedarikçi seçin..."}
                  </Text>
                  <ChevronDown size={18} color="#6b7280" />
                </TouchableOpacity>
                {showCariList && (
                  <ScrollView style={styles.cariList} nestedScrollEnabled>
                    {cariler
                      .filter((c) => c.type === "tedarikci")
                      .map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.cariItem,
                            selectedCariId === c.id && styles.cariItemActive,
                          ]}
                          onPress={() => {
                            setSelectedCariId(c.id);
                            setShowCariList(false);
                          }}
                        >
                          <Text style={styles.cariText}>{c.name}</Text>
                          {(c.balance || 0) > 0 && (
                            <Text style={styles.cariBakiye}>
                              {formatCurrency(c.balance || 0)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.label}>Format</Text>
              <View style={styles.formatRow}>
                <TouchableOpacity
                  style={[
                    styles.formatBtn,
                    exportFormat === "pdf" && styles.formatBtnActive,
                  ]}
                  onPress={() => setExportFormat("pdf")}
                >
                  <FileText
                    size={20}
                    color={exportFormat === "pdf" ? "#fff" : "#ef4444"}
                  />
                  <Text
                    style={[
                      styles.formatText,
                      exportFormat === "pdf" && styles.formatTextActive,
                    ]}
                  >
                    PDF
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.formatBtn,
                    exportFormat === "excel" && styles.formatBtnActiveGreen,
                  ]}
                  onPress={() => setExportFormat("excel")}
                >
                  <FileSpreadsheet
                    size={20}
                    color={exportFormat === "excel" ? "#fff" : "#10b981"}
                  />
                  <Text
                    style={[
                      styles.formatText,
                      exportFormat === "excel" && styles.formatTextActive,
                    ]}
                  >
                    Excel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={generateReport}
            >
              <Download size={20} color="#fff" />
              <Text style={styles.generateText}>Rapor Oluştur</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {exporting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Rapor oluşturuluyor...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  content: { flex: 1 },
  dashboardScroll: { paddingLeft: 16, marginBottom: 16 },
  dashCard: { width: 120, padding: 14, borderRadius: 14, marginRight: 10 },
  dashCardGreen: { backgroundColor: "#dcfce7" },
  dashCardRed: { backgroundColor: "#fef2f2" },
  dashCardBlue: { backgroundColor: "#dbeafe" },
  dashCardOrange: { backgroundColor: "#fef3c7" },
  dashLabel: { fontSize: 19, color: "#6b7280", marginBottom: 4 },
  dashValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  dashChange: { fontSize: 19, marginTop: 4 },
  changeUp: { color: "#10b981" },
  changeDown: { color: "#ef4444" },
  miniChart: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  miniChartTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  miniChartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 80,
  },
  miniChartBar: { flex: 1, alignItems: "center" },
  miniChartBarTrack: {
    flex: 1,
    width: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  miniChartBarFill: {
    width: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  miniChartBarLabel: { fontSize: 20, color: "#6b7280", marginTop: 4 },
  category: { marginBottom: 8, paddingHorizontal: 16 },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  categoryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryTitle: { flex: 1, fontSize: 19, fontWeight: "600", color: "#111827" },
  categoryCount: {
    fontSize: 19,
    color: "#9ca3af",
    marginRight: 8,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reportList: {
    backgroundColor: "#fff",
    marginTop: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  reportTitle: { flex: 1, fontSize: 19, color: "#374151" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: { fontSize: 19, fontWeight: "600", color: "#111827" },
  modalContent: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  label: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  dateRow: { flexDirection: "row", gap: 12 },
  dateCol: { flex: 1 },
  dateLabel: { fontSize: 19, color: "#6b7280", marginBottom: 6 },
  dateInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 19,
  },
  quickDates: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  quickBtnText: { fontSize: 19, color: "#374151", fontWeight: "500" },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectText: { fontSize: 19, color: "#111827" },
  selectPlaceholder: { fontSize: 19, color: "#9ca3af" },
  cariList: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cariItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cariItemActive: { backgroundColor: "#dcfce7" },
  cariText: { fontSize: 19, color: "#111827" },
  cariBakiye: { fontSize: 19, color: "#ef4444" },
  formatRow: { flexDirection: "row", gap: 12 },
  formatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  formatBtnActive: { backgroundColor: "#ef4444" },
  formatBtnActiveGreen: { backgroundColor: "#10b981" },
  formatText: { fontSize: 19, fontWeight: "600", color: "#374151" },
  formatTextActive: { color: "#fff" },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateText: { fontSize: 19, fontWeight: "700", color: "#fff" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#fff", fontSize: 19, marginTop: 12 },
});
