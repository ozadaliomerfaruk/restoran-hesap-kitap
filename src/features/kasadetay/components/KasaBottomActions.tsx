/**
 * Kasa Bottom Actions
 */

import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ShoppingCart,
  Banknote,
} from "lucide-react-native";
import { Kasa } from "@/types";
import { IslemTipi } from "../types";

interface KasaBottomActionsProps {
  kasa: Kasa;
  onSelectIslemTipi: (tipi: IslemTipi) => void;
  onKrediKartiHarcama: () => void;
  onKrediKartiBorcOde: () => void;
}

export function KasaBottomActions({
  kasa,
  onSelectIslemTipi,
  onKrediKartiHarcama,
  onKrediKartiBorcOde,
}: KasaBottomActionsProps) {
  const isKrediKarti = kasa.type === "kredi_karti";

  if (isKrediKarti) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#fef3c7", flex: 1 }]}
          onPress={onKrediKartiHarcama}
        >
          <ShoppingCart size={20} color="#f59e0b" />
          <Text style={[styles.btnText, { color: "#f59e0b" }]}>
            Harcama Yap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#dcfce7", flex: 1 }]}
          onPress={onKrediKartiBorcOde}
        >
          <Banknote size={20} color="#10b981" />
          <Text style={[styles.btnText, { color: "#10b981" }]}>Borç Öde</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#dbeafe", flex: 1 }]}
          onPress={() => onSelectIslemTipi("transfer")}
        >
          <ArrowRightLeft size={20} color="#3b82f6" />
          <Text style={[styles.btnText, { color: "#3b82f6" }]}>Transfer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#dcfce7" }]}
        onPress={() => onSelectIslemTipi("gelir")}
      >
        <ArrowDownLeft size={20} color="#10b981" />
        <Text style={[styles.btnText, { color: "#10b981" }]}>Gelir</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#fee2e2" }]}
        onPress={() => onSelectIslemTipi("gider")}
      >
        <ArrowUpRight size={20} color="#ef4444" />
        <Text style={[styles.btnText, { color: "#ef4444" }]}>Gider</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#dbeafe" }]}
        onPress={() => onSelectIslemTipi("odeme")}
      >
        <ArrowUpRight size={20} color="#3b82f6" />
        <Text style={[styles.btnText, { color: "#3b82f6" }]}>Ödeme</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#ede9fe" }]}
        onPress={() => onSelectIslemTipi("tahsilat")}
      >
        <ArrowDownLeft size={20} color="#8b5cf6" />
        <Text style={[styles.btnText, { color: "#8b5cf6" }]}>Tahsilat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#fef3c7" }]}
        onPress={() => onSelectIslemTipi("transfer")}
      >
        <ArrowRightLeft size={20} color="#f59e0b" />
        <Text style={[styles.btnText, { color: "#f59e0b" }]}>Transfer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  btn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 3,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default KasaBottomActions;
