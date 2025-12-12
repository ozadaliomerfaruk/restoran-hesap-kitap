/**
 * Helpers - Genel yardımcı fonksiyonlar
 */

import { Alert, Platform } from "react-native";

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number,
  order: "asc" | "desc" = "asc"
): T[] {
  const sorted = [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
  return order === "desc" ? sorted.reverse() : sorted;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: { confirmText?: string; cancelText?: string; destructive?: boolean }
): void {
  const {
    confirmText = "Evet",
    cancelText = "İptal",
    destructive = false,
  } = options || {};

  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: "cancel", onPress: onCancel },
      {
        text: confirmText,
        style: destructive ? "destructive" : "default",
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}

export function showErrorAlert(message: string, title: string = "Hata"): void {
  Alert.alert(title, message, [{ text: "Tamam" }]);
}

export function showSuccessAlert(
  message: string,
  title: string = "Başarılı"
): void {
  Alert.alert(title, message, [{ text: "Tamam" }]);
}

export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function isEmpty(arr: any[] | null | undefined): boolean {
  return !arr || arr.length === 0;
}
