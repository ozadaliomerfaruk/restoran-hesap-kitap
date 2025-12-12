/**
 * CariInfoCard Component
 * Cari bilgi kartı
 */

import React from "react";
import { View, Text } from "react-native";
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  Users,
  EyeOff,
} from "lucide-react-native";
import { formatCurrency } from "../../../../shared/utils";
import { styles } from "./styles";
import { CariInfoCardProps } from "./types";

export const CariInfoCard: React.FC<CariInfoCardProps> = ({
  cari,
  balanceInfo,
}) => {
  return (
    <View style={styles.infoCard}>
      {/* Header */}
      <View style={styles.infoHeader}>
        <View
          style={[
            styles.typeIcon,
            {
              backgroundColor:
                cari.type === "tedarikci" ? "#fef3c7" : "#dbeafe",
            },
          ]}
        >
          {cari.type === "tedarikci" ? (
            <Building2 size={28} color="#f59e0b" />
          ) : (
            <Users size={28} color="#3b82f6" />
          )}
        </View>
        <View style={styles.infoMain}>
          <Text style={styles.cariName}>{cari.name}</Text>
          <Text style={styles.cariType}>
            {cari.type === "tedarikci" ? "Tedarikçi" : "Müşteri"}
          </Text>
          {!cari.include_in_reports && (
            <View style={styles.excludedBadge}>
              <EyeOff size={10} color="#f59e0b" />
              <Text style={styles.excludedBadgeText}>
                Raporlara dahil değil
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Contact Info */}
      {(cari.phone || cari.email || cari.address) && (
        <View style={styles.contactSection}>
          {cari.phone && (
            <View style={styles.contactRow}>
              <Phone size={16} color="#6b7280" />
              <Text style={styles.contactText}>{cari.phone}</Text>
            </View>
          )}
          {cari.email && (
            <View style={styles.contactRow}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.contactText}>{cari.email}</Text>
            </View>
          )}
          {cari.address && (
            <View style={styles.contactRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.contactText}>{cari.address}</Text>
            </View>
          )}
        </View>
      )}

      {/* Balance */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>{balanceInfo.text}</Text>
          <Text style={[styles.balanceValue, { color: balanceInfo.color }]}>
            {formatCurrency(Math.abs(cari.balance || 0))}
          </Text>
        </View>
      </View>
    </View>
  );
};
