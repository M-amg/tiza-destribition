import { authenticatedRequest } from '../api/http';

export type CustomerAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressPayload = {
  label?: string;
  recipientName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
};

type AddressResponse = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  zipCode: string | null;
  country: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapAddress(address: AddressResponse): CustomerAddress {
  return {
    id: address.id,
    label: address.label ?? '',
    recipientName: address.recipientName,
    phone: address.phone ?? '',
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    state: address.state ?? '',
    zipCode: address.zipCode ?? '',
    country: address.country,
    defaultShipping: address.defaultShipping,
    defaultBilling: address.defaultBilling,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export async function fetchCustomerAddresses(accessToken: string) {
  const payload = await authenticatedRequest<AddressResponse[]>(
    accessToken,
    '/api/v1/customer/addresses',
    { method: 'GET' },
  );

  return payload.map(mapAddress);
}

export async function createCustomerAddress(accessToken: string, payload: AddressPayload) {
  const response = await authenticatedRequest<AddressResponse>(
    accessToken,
    '/api/v1/customer/addresses',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return mapAddress(response);
}

export async function updateCustomerAddress(accessToken: string, addressId: string, payload: AddressPayload) {
  const response = await authenticatedRequest<AddressResponse>(
    accessToken,
    `/api/v1/customer/addresses/${addressId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  return mapAddress(response);
}

export async function deleteCustomerAddress(accessToken: string, addressId: string) {
  await authenticatedRequest<void>(accessToken, `/api/v1/customer/addresses/${addressId}`, {
    method: 'DELETE',
  });
}
