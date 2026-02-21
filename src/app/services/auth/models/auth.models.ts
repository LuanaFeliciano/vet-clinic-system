export type UserRole = 'admin' | 'vet' | 'recepcionista';

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserClinic {
  id: string;
  name: string;
  phone: string;
  type: string;
  logo_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  clinic_id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  clinic: UserClinic;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface NavLink {
  label: string;
  path: string;
  icon: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}
