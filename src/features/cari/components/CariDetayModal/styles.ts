/**
 * CariDetayModal Styles
 * Tüm stiller merkezi olarak burada
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Ana Container
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
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },

  // Info Card
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  infoMain: {
    marginLeft: 14,
    flex: 1,
  },
  cariName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cariType: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  excludedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  excludedBadgeText: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "500",
  },

  // Contact Section
  contactSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },

  // Balance Section
  balanceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "700",
  },

  // İşlemler Section
  islemlerSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  islemCount: {
    fontSize: 13,
    color: "#6b7280",
  },

  // Date Separator
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dateSeparatorText: {
    fontSize: 12,
    color: "#6b7280",
    marginHorizontal: 12,
    fontWeight: "500",
  },

  // İşlem Item
  islemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  islemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  islemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  islemType: {
    fontSize: 12,
    fontWeight: "700",
  },
  islemDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  islemKategori: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  islemKategoriText: {
    fontSize: 11,
    color: "#8b5cf6",
  },
  islemKasa: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  islemRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  islemAmount: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },

  // İşlem Detay Modal
  detayContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  detayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
  },
  detayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  detayContent: {
    flex: 1,
    padding: 16,
  },
  detayCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  detayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detayIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  detayCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detayType: {
    fontSize: 14,
    fontWeight: "700",
  },
  detayDate: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  detayAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  detayRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    marginTop: 12,
  },
  detayLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  detayValue: {
    fontSize: 14,
    color: "#374151",
  },
  kategoriTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  kategoriTagText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontWeight: "500",
  },

  // Loading
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Kalemler
  kalemlerSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  kalemlerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  kalemlerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  kalemItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  kalemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  kalemNo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 6,
  },
  kalemAdi: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  kalemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  kalemDetail: {
    fontSize: 13,
    color: "#6b7280",
  },
  kalemKdv: {
    fontSize: 12,
    color: "#9ca3af",
  },
  kalemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    textAlign: "right",
  },
  kalemlerTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 8,
  },
  kalemlerTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  kalemlerTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // Delete Button
  deleteIslemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  deleteIslemBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },

  // Hamburger Menü
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#374151",
  },
  menuItemDanger: {
    color: "#ef4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
  },

  // Edit Modal
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  editModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  editInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  editModalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editModalCancelBtn: {
    backgroundColor: "#f3f4f6",
  },
  editModalSaveBtn: {
    backgroundColor: "#3b82f6",
  },
  editModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  editModalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // İşlem Edit Modal
  editContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  saveBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#93c5fd",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  editContent: {
    flex: 1,
    padding: 16,
  },
  editSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  editAmountInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editDescInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Kalem Edit
  kalemEditItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  kalemEditHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  kalemEditInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  kalemEditInputGroup: {
    flex: 1,
  },
  kalemEditInputLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  kalemEditInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kalemEditTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    textAlign: "right",
    marginTop: 8,
  },
});
