import { UserRole } from '../../auth/models/auth.models';

export interface PanelUser {
  id: number;
  clinic_id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFormValue {
  id: number | null;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  password_confirmation: string;
}

export interface UserUpsertPayload {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  password_confirmation?: string;
}
