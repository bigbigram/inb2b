// Base types
export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

// Register types
export interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: 'customer' | 'admin' | 'vendor';
}

// Removed RegisterFormData with password_confirmation

// Additional types can be added as needed
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  email: string;
  password: string;

}
