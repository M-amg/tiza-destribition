import { authenticatedRequest } from '../api/http';

export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  customerType: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  companyName: string;
  taxId: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
};

export type UpdateCustomerProfilePayload = {
  fullName: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

type CustomerProfileResponse = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  customerType: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  companyName: string | null;
  taxId: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  totalOrders: number;
  totalSpent: number;
};

function mapProfile(profile: CustomerProfileResponse): CustomerProfile {
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone ?? '',
    customerType: profile.customerType,
    status: profile.status,
    createdAt: profile.createdAt,
    lastLoginAt: profile.lastLoginAt,
    companyName: profile.companyName ?? '',
    taxId: profile.taxId ?? '',
    addressLine1: profile.addressLine1 ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    zipCode: profile.zipCode ?? '',
    country: profile.country ?? '',
    totalOrders: profile.totalOrders,
    totalSpent: Number(profile.totalSpent ?? 0),
  };
}

export async function fetchMyCustomerProfile(accessToken: string) {
  const payload = await authenticatedRequest<CustomerProfileResponse>(
    accessToken,
    '/api/v1/customer/profile',
    { method: 'GET' },
  );

  return mapProfile(payload);
}

export async function updateMyCustomerProfile(
  accessToken: string,
  payload: UpdateCustomerProfilePayload,
) {
  const response = await authenticatedRequest<CustomerProfileResponse>(
    accessToken,
    '/api/v1/customer/profile',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  return mapProfile(response);
}
