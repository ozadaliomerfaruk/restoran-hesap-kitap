/**
 * FaturaForm Component
 */

import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import DatePickerField from "../../../../components/DatePickerField";
import { styles } from "./styles";
import { FaturaFormProps } from "./types";

export const FaturaForm: React.FC<FaturaFormProps> = ({
  faturaTipi,
  setFaturaTipi,
  formDate,
  setFormDate,
  formDescription,
  setFormDescription,
}) => {
  return (
    <>
      {/* Fatura Tipi Seçici */}
      <View style={styles.faturaTipiContainer}>
        <TouchableOpacity
          style={[
            styles.faturaTipiBtn,
            faturaTipi === "alis" && styles.faturaTipiBtnActiveAlis,
          ]}
          onPress={() => setFaturaTipi("alis")}
        >
          <Text
            style={[
              styles.faturaTipiBtnText,
              faturaTipi === "alis" && styles.faturaTipiBtnTextActive,
            ]}
          >
            Alış Faturası
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.faturaTipiBtn,
            faturaTipi === "iade" && styles.faturaTipiBtnActiveIade,
          ]}
          onPress={() => setFaturaTipi("iade")}
        >
          <Text
            style={[
              styles.faturaTipiBtnText,
              faturaTipi === "iade" && styles.faturaTipiBtnTextActive,
            ]}
          >
            İade Faturası
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tarih ve Açıklama */}
      <View style={styles.topFields}>
        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>Tarih</Text>
          <DatePickerField value={formDate} onChange={setFormDate} />
        </View>
        <View style={styles.descField}>
          <Text style={styles.fieldLabel}>Açıklama</Text>
          <TextInput
            style={styles.input}
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Opsiyonel"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </>
  );
};
