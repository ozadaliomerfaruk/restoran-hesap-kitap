import { Tabs } from "expo-router";
import {
  Home,
  Users,
  Wallet,
  ClipboardList,
  Settings,
  MoreHorizontal,
  UserCheck,
  RefreshCw,
  FileText,
  TrendingUp,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          paddingBottom: 28,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cari"
        options={{
          title: "Cariler",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="personel"
        options={{
          title: "Personel",
          tabBarIcon: ({ color, size }) => (
            <UserCheck size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="daha"
        options={{
          title: "Daha Fazla",
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - accessible from other screens */}
      <Tabs.Screen
        name="gunluksatis"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="kasa"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tekrarlayan"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ceksenet"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="islemler"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="kategoriler"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="urunler"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="raporlar"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
