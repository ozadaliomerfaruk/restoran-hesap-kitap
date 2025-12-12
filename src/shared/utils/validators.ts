/**
 * Validators - Form doğrulama
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequired(
  value: string | number | null | undefined,
  fieldName: string = "Bu alan"
): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: `${fieldName} zorunludur` };
  }
  return { isValid: true };
}

export function validateEmail(
  email: string | null | undefined
): ValidationResult {
  if (!email) return { isValid: false, error: "E-posta adresi zorunludur" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return { isValid: false, error: "Geçerli bir e-posta adresi girin" };
  return { isValid: true };
}

export function validatePhone(
  phone: string | null | undefined
): ValidationResult {
  if (!phone) return { isValid: false, error: "Telefon numarası zorunludur" };
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) {
    return {
      isValid: false,
      error: "Telefon numarası 10 veya 11 haneli olmalıdır",
    };
  }
  return { isValid: true };
}

export function validateAmount(
  amount: string | number | null | undefined,
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    fieldName?: string;
  } = {}
): ValidationResult {
  const { min = 0, max, required = true, fieldName = "Tutar" } = options;

  if (!amount && amount !== 0) {
    if (required) return { isValid: false, error: `${fieldName} zorunludur` };
    return { isValid: true };
  }

  const numAmount =
    typeof amount === "string" ? parseFloat(amount.replace(",", ".")) : amount;
  if (isNaN(numAmount))
    return { isValid: false, error: "Geçerli bir sayı girin" };
  if (numAmount < min)
    return { isValid: false, error: `${fieldName} en az ${min} olmalıdır` };
  if (max !== undefined && numAmount > max)
    return { isValid: false, error: `${fieldName} en fazla ${max} olmalıdır` };

  return { isValid: true };
}

export function validateDay(day: number | null | undefined): ValidationResult {
  if (day === null || day === undefined)
    return { isValid: false, error: "Gün zorunludur" };
  if (day < 1 || day > 31)
    return { isValid: false, error: "Gün 1-31 arasında olmalıdır" };
  return { isValid: true };
}

export function validateForm(validations: ValidationResult[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors = validations
    .filter((v) => !v.isValid && v.error)
    .map((v) => v.error as string);
  return { isValid: errors.length === 0, errors };
}
