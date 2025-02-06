export interface UserSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserSettingsFormData = {
  email: string;
  currentPassword?: string;
  newPassword?: string;
  darkMode: boolean;
};