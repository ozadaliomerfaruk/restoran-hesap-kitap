import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Users,
  Tags,
  FileText,
  LucideIcon,
} from "lucide-react-native";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  color: string;
  badge?: string;
  highlight?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Ayarlar() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: "Hesap",
      items: [
        { icon: User, label: "Profil Bilgileri", color: "#3b82f6" },
        { icon: Building2, label: "Restoran Ayarları", color: "#10b981" },
        {
          icon: Users,
          label: "Kullanıcı Yönetimi",
          color: "#8b5cf6",
          badge: "PRO",
        },
      ],
    },
    {
      title: "Uygulama",
      items: [
        { icon: Tags, label: "Kategoriler", color: "#f59e0b" },
        { icon: Bell, label: "Bildirimler", color: "#ef4444" },
        { icon: FileText, label: "Raporlar", color: "#06b6d4" },
      ],
    },
    {
      title: "Abonelik",
      items: [
        {
          icon: Crown,
          label: "Pro'ya Yükselt",
          color: "#f59e0b",
          highlight: true,
        },
        { icon: CreditCard, label: "Ödeme Yönetimi", color: "#6b7280" },
      ],
    },
    {
      title: "Destek",
      items: [
        { icon: HelpCircle, label: "Yardım & SSS", color: "#6b7280" },
        { icon: Shield, label: "Gizlilik Politikası", color: "#6b7280" },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        {/* Profil Kartı */}
        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || "K"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.user_metadata?.name || "Kullanıcı"}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Ücretsiz Plan</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* Menü Bölümleri */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 &&
                        styles.menuItemBorder,
                      item.highlight && styles.menuItemHighlight,
                    ]}
                  >
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: `${item.color}15` },
                      ]}
                    >
                      <IconComponent size={20} color={item.color} />
                    </View>
                    <Text
                      style={[
                        styles.menuLabel,
                        item.highlight && styles.menuLabelHighlight,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={20} color="#9ca3af" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Çıkış Yap */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* Versiyon */}
        <Text style={styles.version}>Versiyon 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  planBadgeText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemHighlight: {
    backgroundColor: "#fffbeb",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 19,
    color: "#111827",
    marginLeft: 12,
  },
  menuLabelHighlight: {
    fontWeight: "600",
    color: "#f59e0b",
  },
  badge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f59e0b",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#ef4444",
  },
  version: {
    textAlign: "center",
    fontSize: 19,
    color: "#9ca3af",
    marginBottom: 32,
  },
});
