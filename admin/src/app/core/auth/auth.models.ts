export type CustomerType = 'B2B' | 'B2C';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  customerType: CustomerType;
  status: UserStatus;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthenticatedUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  user: AuthenticatedUser;
}
