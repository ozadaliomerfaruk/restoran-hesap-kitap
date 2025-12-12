/**
 * Formatters - Para, Tarih, Sayı formatlama
 */

export function formatCurrency(
  amount: number | null | undefined,
  options: {
    currency?: string;
    showSign?: boolean;
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    currency = "₺",
    showSign = false,
    compact = false,
    decimals = 2,
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0,00`;
  }

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : showSign && amount > 0 ? "+" : "";

  if (compact && absAmount >= 1000000) {
    return `${sign}${currency}${(absAmount / 1000000)
      .toFixed(1)
      .replace(".", ",")}M`;
  }

  if (compact && absAmount >= 1000) {
    return `${sign}${currency}${(absAmount / 1000)
      .toFixed(1)
      .replace(".", ",")}K`;
  }

  const formatted = absAmount
    .toFixed(decimals)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${sign}${currency}${formatted}`;
}

export function formatDate(
  date: Date | string | null | undefined,
  format:
    | "default"
    | "full"
    | "short"
    | "time"
    | "datetime"
    | "iso"
    | "dayMonth" = "default"
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  const monthsShort = [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ];

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  switch (format) {
    case "full":
      return `${day} ${months[month]} ${year}`;
    case "short":
      return `${day.toString().padStart(2, "0")}/${(month + 1)
        .toString()
        .padStart(2, "0")}/${year}`;
    case "time":
      return `${hours}:${minutes}`;
    case "datetime":
      return `${day} ${monthsShort[month]} ${year} ${hours}:${minutes}`;
    case "iso":
      return d.toISOString().split("T")[0];
    case "dayMonth":
      return `${day} ${monthsShort[month]}`;
    default:
      return `${day} ${monthsShort[month]} ${year}`;
  }
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      8
    )} ${digits.slice(8)}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `0${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(
      7,
      9
    )} ${digits.slice(9)}`;
  }

  return phone;
}

export function formatNumber(
  num: number | null | undefined,
  decimals: number = 0
): string {
  if (num === null || num === undefined || isNaN(num)) return "0";

  return num
    .toFixed(decimals)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function truncate(
  str: string | null | undefined,
  maxLength: number
): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
