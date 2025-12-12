/**
 * AddUrunForm Component
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { Kategori } from "../../../../types";
import { styles } from "./styles";
import { birimler, kdvOranlari } from "./constants";

interface Props {
  kategoriler: Kategori[];
  onAdd: (data: any) => Promise<{ error: any }>;
}

export const AddUrunForm: React.FC<Props> = ({ kategoriler, onAdd }) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("adet");
  const [price, setPrice] = useState("");
  const [kdvRate, setKdvRate] = useState("10");
  const [kategoriId, setKategoriId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showBirimDropdown, setShowBirimDropdown] = useState(false);
  const [showKdvDropdown, setShowKdvDropdown] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Ürün adı girin");
      return;
    }

    setLoading(true);
    const result = await onAdd({
      name: name.trim(),
      unit: unit || "adet",
      default_price: price ? parseFloat(price.replace(",", ".")) : undefined,
      kdv_rate: kdvRate ? parseInt(kdvRate) : 10,
      kategori_id: kategoriId || undefined,
      is_active: true,
    });
    setLoading(false);

    if (!result.error) {
      setName("");
      setUnit("adet");
      setPrice("");
      setKdvRate("10");
      setKategoriId(null);
    }
  };

  return (
    <ScrollView style={styles.addUrunFormScroll} nestedScrollEnabled>
      <View style={styles.addUrunForm}>
        <Text style={styles.addUrunTitle}>Yeni Ürün Ekle</Text>

        <Text style={styles.addUrunLabel}>Ürün Adı *</Text>
        <TextInput
          style={styles.addUrunInput}
          value={name}
          onChangeText={setName}
          placeholder="Örn: Domates, Tavuk Göğsü"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.addUrunLabel}>Birim *</Text>
        <TouchableOpacity
          style={styles.addUrunDropdownBtn}
          onPress={() => setShowBirimDropdown(!showBirimDropdown)}
        >
          <Text style={styles.addUrunDropdownText}>
            {birimler.find((b) => b.value === unit)?.label || "Adet"}
          </Text>
          <ChevronDown size={18} color="#6b7280" />
        </TouchableOpacity>
        {showBirimDropdown && (
          <View style={styles.addUrunDropdownList}>
            {birimler.map((b) => (
              <TouchableOpacity
                key={b.value}
                style={styles.addUrunDropdownItem}
                onPress={() => {
                  setUnit(b.value);
                  setShowBirimDropdown(false);
                }}
              >
                <Text style={styles.addUrunDropdownItemText}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.addUrunRowTwo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.addUrunLabel}>Varsayılan Fiyat</Text>
            <View style={styles.addUrunPriceInput}>
              <Text style={styles.addUrunCurrency}>₺</Text>
              <TextInput
                style={styles.addUrunPriceTextInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.addUrunLabel}>KDV Oranı</Text>
            <TouchableOpacity
              style={styles.addUrunDropdownBtn}
              onPress={() => setShowKdvDropdown(!showKdvDropdown)}
            >
              <Text style={styles.addUrunDropdownText}>%{kdvRate} KDV</Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>
            {showKdvDropdown && (
              <View style={styles.addUrunDropdownList}>
                {kdvOranlari.map((k) => (
                  <TouchableOpacity
                    key={k.value}
                    style={styles.addUrunDropdownItem}
                    onPress={() => {
                      setKdvRate(k.value);
                      setShowKdvDropdown(false);
                    }}
                  >
                    <Text style={styles.addUrunDropdownItemText}>
                      {k.label} KDV
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addUrunSaveBtn, loading && { opacity: 0.6 }]}
          onPress={handleAdd}
          disabled={loading}
        >
          <Check size={18} color="#fff" />
          <Text style={styles.addUrunSaveBtnText}>
            {loading ? "Ekleniyor..." : "Ürün Ekle"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
