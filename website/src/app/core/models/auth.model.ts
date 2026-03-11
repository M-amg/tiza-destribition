export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  customerType: 'B2C' | 'B2B';
  status: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface MeResponse {
  id: string;
  email: string;
  fullName: string;
  customerType: 'B2C' | 'B2B';
  status: string;
  roles: string[];
}
