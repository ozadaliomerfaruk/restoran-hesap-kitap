/**
 * KalemliFaturaModal Styles
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  // Header
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
  headerBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },

  // Fatura Tipi Seçici
  faturaTipiContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  faturaTipiBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  faturaTipiBtnActiveAlis: {
    backgroundColor: "#3b82f6",
  },
  faturaTipiBtnActiveIade: {
    backgroundColor: "#f59e0b",
  },
  faturaTipiBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  faturaTipiBtnTextActive: {
    color: "#fff",
  },

  // Top Fields
  topFields: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  descField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Kalemler Section
  kalemlerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  // Kalem Ekle Butonu
  addKalemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
  },
  addKalemBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3b82f6",
  },

  // Kalem Card
  kalemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kalemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kalemNo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  removeKalemBtn: {
    padding: 4,
  },
  urunSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  urunSelectText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  placeholder: {
    color: "#9ca3af",
    fontWeight: "400",
  },
  kalemRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  qtyBox: {
    flex: 1,
  },
  unitBox: {
    flex: 1,
    position: "relative",
    zIndex: 20,
  },
  priceBox: {
    flex: 1.2,
  },
  kdvBox: {
    flex: 0.8,
    position: "relative",
    zIndex: 10,
  },
  kalemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  qtyInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Birim Select
  unitSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  unitSelectText: {
    fontSize: 14,
    color: "#111827",
  },
  birimDropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  birimDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  birimDropdownText: {
    fontSize: 14,
    color: "#374151",
  },

  // Price Input
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 8,
  },
  currencySmall: {
    fontSize: 13,
    color: "#6b7280",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },

  // KDV Select
  kdvSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kdvSelectText: {
    fontSize: 13,
    color: "#111827",
  },
  kdvDropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  kdvDropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kdvDropdownText: {
    fontSize: 13,
    color: "#374151",
  },

  // Kalem Total
  kalemTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
  },
  kalemTotalLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginRight: 8,
  },
  kalemTotalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10b981",
  },

  // Summary Section
  summarySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },

  // Save Button
  saveBtn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Ürün Modal
  urunModalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  urunModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  urunModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  // Ürün Search
  urunSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  urunSearchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#111827",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  sectionHeaderCount: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Ürün Item
  urunItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  urunItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  urunItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  urunItemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  urunItemMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  // Empty
  emptyUrun: {
    padding: 40,
    alignItems: "center",
  },
  emptyUrunText: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 12,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },

  // Add Urun Form
  addUrunFormScroll: {
    maxHeight: 320,
  },
  addUrunForm: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  addUrunTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  addUrunLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  addUrunInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addUrunDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addUrunDropdownText: {
    fontSize: 15,
    color: "#111827",
  },
  addUrunRowTwo: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  addUrunPriceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addUrunCurrency: {
    fontSize: 15,
    color: "#6b7280",
    marginRight: 6,
  },
  addUrunPriceTextInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  addUrunDropdownList: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addUrunDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  addUrunDropdownItemText: {
    fontSize: 14,
    color: "#374151",
  },
  addUrunSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  addUrunSaveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  // Birim Modal
  birimModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  birimModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  birimModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  birimModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  birimModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  birimModalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  birimModalItemActive: {
    backgroundColor: "#f0fdf4",
  },
  birimModalItemTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },

  // Kategori Modal (Aynı yapı)
  kategoriModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  kategoriModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  kategoriModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  kategoriModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  kategoriModalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriModalItemText: {
    fontSize: 16,
    color: "#374151",
  },
});
