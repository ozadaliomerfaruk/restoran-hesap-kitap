/**
 * Profil Feature - Tipler
 */

export interface ProfileFormData {
  name: string;
  phone: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormErrors {
  name?: string;
  phone?: string;
}

export interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
