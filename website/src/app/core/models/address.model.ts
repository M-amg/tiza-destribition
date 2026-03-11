export interface Address {
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
}
