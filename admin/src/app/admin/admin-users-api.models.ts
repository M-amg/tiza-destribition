import { AdminUser, RolePermission, UserRole } from './admin.models';

export type ApiAdminUserRole = 'super_admin' | 'admin' | 'manager' | 'staff';
export type ApiAdminUserStatus = 'active' | 'inactive';
export type ApiUserStatusUpdate = 'ACTIVE' | 'INACTIVE';
export type ApiAdminUserRoleUpsert = 'admin' | 'manager' | 'staff';

export interface ApiAdminUser {
  id: string;
  name: string;
  email: string;
  role: ApiAdminUserRole;
  status: ApiAdminUserStatus;
  permissions: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ApiAdminRole {
  key: ApiAdminUserRole;
  name: string;
  description: string;
  permissions: string[];
}

export interface ApiUpdateAdminUserStatusRequest {
  status: ApiUserStatusUpdate;
}

export interface ApiAdminUserUpsertRequest {
  name: string;
  email: string;
  role: ApiAdminUserRole;
  status: ApiUserStatusUpdate;
  password: string | null;
}

export function mapApiAdminUserToView(user: ApiAdminUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toUserRole(user.role),
    status: user.status,
    permissions: user.permissions ?? [],
    createdDate: formatDateShort(user.createdAt),
    lastLogin: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'
  };
}

export function mapApiRoleToView(role: ApiAdminRole): RolePermission {
  return {
    role: toUserRole(role.key),
    name: role.name,
    description: role.description,
    permissions: role.permissions ?? []
  };
}

export function toApiUserStatus(status: 'active' | 'inactive'): ApiUserStatusUpdate {
  return status === 'active' ? 'ACTIVE' : 'INACTIVE';
}

export function toApiUserUpsertRequest(input: {
  name: string;
  email: string;
  role: ApiAdminUserRoleUpsert;
  statusActive: boolean;
  password: string;
}): ApiAdminUserUpsertRequest {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: input.statusActive ? 'ACTIVE' : 'INACTIVE',
    password: input.password.trim() || null
  };
}

function toUserRole(role: ApiAdminUserRole): UserRole {
  switch (role) {
    case 'super_admin':
      return 'super_admin';
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'staff':
      return 'staff';
  }
}

function formatDateShort(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
