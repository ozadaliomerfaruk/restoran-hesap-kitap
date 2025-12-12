/**
 * IslemDetayModal Component
 * İşlem detay görüntüleme modalı
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Edit3,
  Trash2,
  Tag,
  Package,
  ShoppingCart,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { formatCurrency, formatDate } from "../../../../shared/utils";
import { styles } from "./styles";
import { IslemDetayModalProps } from "./types";
import { getIslemColor, getIslemLabel } from "./constants";

export const IslemDetayModal: React.FC<IslemDetayModalProps> = ({
  visible,
  islem,
  kalemler,
  loadingKalemler,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!islem) return null;

  const getIslemIcon = (type: string) => {
    switch (type) {
      case "gider":
        return <ShoppingCart size={20} color="#ef4444" />;
      case "gelir":
        return <RotateCcw size={20} color="#f59e0b" />;
      case "odeme":
        return <ArrowUpRight size={20} color="#3b82f6" />;
      case "tahsilat":
        return <ArrowDownLeft size={20} color="#10b981" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.detayContainer} edges={["top"]}>
        {/* Header */}
        <View style={styles.detayHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.detayTitle}>İşlem Detayı</Text>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit3 size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detayContent}>
          {/* İşlem Özet Kartı */}
          <View
            style={[
              styles.detayCard,
              { borderLeftColor: getIslemColor(islem.type) },
            ]}
          >
            <View style={styles.detayCardHeader}>
              <View
                style={[
                  styles.detayIconBox,
                  { backgroundColor: `${getIslemColor(islem.type)}15` },
                ]}
              >
                {getIslemIcon(islem.type)}
              </View>
              <View style={styles.detayCardInfo}>
                <Text
                  style={[
                    styles.detayType,
                    { color: getIslemColor(islem.type) },
                  ]}
                >
                  {getIslemLabel(islem.type)}
                </Text>
                <Text style={styles.detayDate}>
                  {formatDate(islem.date, "full")}
                </Text>
              </View>
              <Text
                style={[
                  styles.detayAmount,
                  { color: getIslemColor(islem.type) },
                ]}
              >
                {formatCurrency(islem.amount)}
              </Text>
            </View>

            {islem.description && (
              <View style={styles.detayRow}>
                <Text style={styles.detayLabel}>Açıklama</Text>
                <Text style={styles.detayValue}>{islem.description}</Text>
              </View>
            )}

            {islem.kategori && (
              <View style={styles.detayRow}>
                <Text style={styles.detayLabel}>Kategori</Text>
                <View style={styles.kategoriTag}>
                  <Tag size={12} color="#8b5cf6" />
                  <Text style={styles.kategoriTagText}>
                    {islem.kategori.name}
                  </Text>
                </View>
              </View>
            )}

            {islem.kasa && (
              <View style={styles.detayRow}>
                <Text style={styles.detayLabel}>Kasa</Text>
                <Text style={styles.detayValue}>{islem.kasa.name}</Text>
              </View>
            )}
          </View>

          {/* Kalemler */}
          {loadingKalemler ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Kalemler yükleniyor...</Text>
            </View>
          ) : kalemler.length > 0 ? (
            <View style={styles.kalemlerSection}>
              <View style={styles.kalemlerHeader}>
                <Package size={18} color="#374151" />
                <Text style={styles.kalemlerTitle}>
                  Fatura Kalemleri ({kalemler.length})
                </Text>
              </View>
              {kalemler.map((kalem, index) => (
                <View key={kalem.id} style={styles.kalemItem}>
                  <View style={styles.kalemHeader}>
                    <Text style={styles.kalemNo}>{index + 1}.</Text>
                    <Text style={styles.kalemAdi}>{kalem.urun_adi}</Text>
                  </View>
                  <View style={styles.kalemDetails}>
                    <Text style={styles.kalemDetail}>
                      {kalem.quantity} {kalem.unit} ×{" "}
                      {formatCurrency(kalem.unit_price)}
                    </Text>
                    <Text style={styles.kalemKdv}>KDV %{kalem.kdv_rate}</Text>
                  </View>
                  <Text style={styles.kalemTotal}>
                    {formatCurrency(kalem.total_price)}
                  </Text>
                </View>
              ))}
              <View style={styles.kalemlerTotal}>
                <Text style={styles.kalemlerTotalLabel}>Toplam</Text>
                <Text style={styles.kalemlerTotalValue}>
                  {formatCurrency(
                    kalemler.reduce((sum, k) => sum + k.total_price, 0)
                  )}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Sil Butonu */}
          <TouchableOpacity style={styles.deleteIslemBtn} onPress={onDelete}>
            <Trash2 size={18} color="#ef4444" />
            <Text style={styles.deleteIslemBtnText}>İşlemi Sil</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
