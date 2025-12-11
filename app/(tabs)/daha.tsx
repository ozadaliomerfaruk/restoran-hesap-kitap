import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Users,
  RefreshCw,
  FileText,
  Settings,
  ChevronRight,
  HelpCircle,
  Star,
  Bell,
  Shield,
  ClipboardList,
  FolderTree,
  Package,
  BarChart3,
  ShoppingBag,
  Archive,
} from "lucide-react-native";

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: "satistakip",
    title: "Satış Takip",
    subtitle: "Ürün bazlı satış analizi",
    icon: ShoppingBag,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    route: "/gunluksatis",
  },
  {
    id: "raporlar",
    title: "Raporlar",
    subtitle: "Detaylı finansal raporlar",
    icon: BarChart3,
    color: "#06b6d4",
    bgColor: "#cffafe",
    route: "/raporlar",
  },
  {
    id: "islemler",
    title: "İşlemler",
    subtitle: "Gelir ve gider kayıtları",
    icon: ClipboardList,
    color: "#f59e0b",
    bgColor: "#fef3c7",
    route: "/islemler",
  },
  {
    id: "kategoriler",
    title: "Kategoriler",
    subtitle: "Gelir ve gider kategorileri",
    icon: FolderTree,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    route: "/kategoriler",
  },
  {
    id: "hammaddeler",
    title: "Hammaddeler",
    subtitle: "Ürün ve malzeme tanımları",
    icon: Package,
    color: "#3b82f6",
    bgColor: "#dbeafe",
    route: "/hammaddeler",
  },
  {
    id: "tekrarlayan",
    title: "Tekrarlayan Ödemeler",
    subtitle: "Kira, fatura, sigorta",
    icon: RefreshCw,
    color: "#ec4899",
    bgColor: "#fce7f3",
    route: "/tekrarlayan",
  },
  {
    id: "ceksenet",
    title: "Çek / Senet",
    subtitle: "Çek ve senet takibi",
    icon: FileText,
    color: "#6366f1",
    bgColor: "#e0e7ff",
    route: "/ceksenet",
  },
  {
    id: "arsiv",
    title: "Arşiv",
    subtitle: "Arşivlenen kayıtlar",
    icon: Archive,
    color: "#6b7280",
    bgColor: "#f3f4f6",
    route: "/arsiv",
  },
];

const settingsItems = [
  {
    id: "ayarlar",
    title: "Ayarlar",
    icon: Settings,
    route: "/ayarlar",
  },
  {
    id: "bildirimler",
    title: "Bildirimler",
    icon: Bell,
    route: "/ayarlar",
  },
  {
    id: "guvenlik",
    title: "Güvenlik",
    icon: Shield,
    route: "/ayarlar",
  },
];

export default function DahaFazla() {
  const router = useRouter();

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuCard}
        onPress={() => router.push(item.route as any)}
      >
        <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
          <IconComponent size={24} color={item.color} />
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daha Fazla</Text>
        </View>

        {/* Ana Modüller */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modüller</Text>
          <View style={styles.menuList}>{menuItems.map(renderMenuItem)}</View>
        </View>

        {/* Ayarlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <View style={styles.settingsList}>
            {settingsItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.settingsItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.settingsLeft}>
                    <IconComponent size={20} color="#6b7280" />
                    <Text style={styles.settingsTitle}>{item.title}</Text>
                  </View>
                  <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pro Banner */}
        <TouchableOpacity style={styles.proBanner}>
          <View style={styles.proContent}>
            <Star size={24} color="#f59e0b" />
            <View style={styles.proText}>
              <Text style={styles.proTitle}>Pro'ya Yükselt</Text>
              <Text style={styles.proSubtitle}>
                Tüm özelliklerin kilidini aç
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#f59e0b" />
        </TouchableOpacity>

        {/* Yardım */}
        <TouchableOpacity style={styles.helpButton}>
          <HelpCircle size={20} color="#6b7280" />
          <Text style={styles.helpText}>Yardım ve Destek</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuList: {
    gap: 12,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  menuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  menuSubtitle: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  settingsList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsTitle: {
    fontSize: 19,
    color: "#111827",
  },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef3c7",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  proContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  proText: {
    gap: 2,
  },
  proTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#92400e",
  },
  proSubtitle: {
    fontSize: 19,
    color: "#b45309",
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
  },
  helpText: {
    fontSize: 19,
    color: "#6b7280",
  },
  bottomPadding: {
    height: 20,
  },
});
