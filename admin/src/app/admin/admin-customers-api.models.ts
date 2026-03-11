export type ApiCustomerType = 'B2B' | 'B2C';
export type ApiCustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type UiCustomerStatus = 'active' | 'inactive' | 'blocked';

export interface ApiCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  customerType: ApiCustomerType;
  status: ApiCustomerStatus;
  createdAt: string;
  companyName: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  totalOrders: number;
  totalSpent: number;
}

export interface ApiCustomerDetail extends ApiCustomerSummary {
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export interface ApiUpdateCustomerTypeRequest {
  customerType: ApiCustomerType;
}

export interface CustomerViewAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AdminCustomerView {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerType: ApiCustomerType;
  company?: string;
  totalOrders: number;
  totalSpent: number;
  status: UiCustomerStatus;
  createdDate: string;
  createdAt: string;
  address: CustomerViewAddress;
}

export function mapApiCustomerToView(customer: ApiCustomerSummary | ApiCustomerDetail): AdminCustomerView {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? '',
    customerType: customer.customerType,
    company: customer.companyName ?? undefined,
    totalOrders: Number(customer.totalOrders ?? 0),
    totalSpent: Number(customer.totalSpent ?? 0),
    status: toUiCustomerStatus(customer.status),
    createdDate: formatDateShort(customer.createdAt),
    createdAt: customer.createdAt,
    address: {
      street: customer.addressLine1 ?? '',
      city: customer.city ?? '',
      state: customer.state ?? '',
      zipCode: customer.zipCode ?? '',
      country: customer.country ?? ''
    }
  };
}

function toUiCustomerStatus(status: ApiCustomerStatus): UiCustomerStatus {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'inactive';
    case 'BLOCKED':
      return 'blocked';
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
