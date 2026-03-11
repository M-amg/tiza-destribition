export type ApiOrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type ApiPaymentStatus = 'PAID' | 'PENDING' | 'FAILED';
export type ApiPaymentMethod = 'CARD' | 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
export type ApiCustomerType = 'B2B' | 'B2C';

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: ApiOrderStatus;
  customerType: ApiCustomerType;
  paymentMethod: ApiPaymentMethod;
  paymentStatus: ApiPaymentStatus;
  couponCode: string | null;
  couponDiscount: number | null;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  placedAt: string;
  shippingRecipientName: string;
  shippingPhone: string | null;
  shippingEmail: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  items: ApiOrderItem[];
}

export interface ApiUpdateOrderStatusRequest {
  status: ApiOrderStatus;
  paymentStatus?: ApiPaymentStatus | null;
  note?: string | null;
}

export type UiOrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type UiPaymentStatus = 'paid' | 'pending' | 'failed';
export type UiPaymentMethod = 'card' | 'cash' | 'bank_transfer' | 'digital_wallet';

export interface OrderViewItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface OrderViewAddress {
  street: string;
  line2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AdminOrderView {
  id: string;
  orderNumber: string;
  placedAt: string;
  date: string;
  status: UiOrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerType: ApiCustomerType;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  paymentMethod: UiPaymentMethod;
  paymentStatus: UiPaymentStatus;
  couponCode?: string;
  couponDiscount?: number;
  shippingAddress: OrderViewAddress;
  items: OrderViewItem[];
}

export function mapApiOrderToView(order: ApiOrder): AdminOrderView {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    date: formatDateShort(order.placedAt),
    status: toUiOrderStatus(order.status),
    customerName: order.shippingRecipientName,
    customerEmail: order.shippingEmail,
    customerPhone: order.shippingPhone,
    customerType: order.customerType,
    total: Number(order.totalAmount ?? 0),
    subtotal: Number(order.subtotal ?? 0),
    shipping: Number(order.shippingAmount ?? 0),
    tax: Number(order.taxAmount ?? 0),
    paymentMethod: toUiPaymentMethod(order.paymentMethod),
    paymentStatus: toUiPaymentStatus(order.paymentStatus),
    couponCode: order.couponCode ?? undefined,
    couponDiscount: order.couponDiscount == null ? undefined : Number(order.couponDiscount),
    shippingAddress: {
      street: order.shippingAddressLine1,
      line2: order.shippingAddressLine2,
      city: order.shippingCity,
      state: order.shippingState,
      zipCode: order.shippingZipCode,
      country: order.shippingCountry
    },
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      quantity: Number(item.quantity ?? 0),
      price: Number(item.unitPrice ?? 0),
      lineTotal: Number(item.lineTotal ?? 0)
    }))
  };
}

export function toApiOrderStatus(status: UiOrderStatus): ApiOrderStatus {
  switch (status) {
    case 'pending':
      return 'PENDING';
    case 'processing':
      return 'PROCESSING';
    case 'shipped':
      return 'SHIPPED';
    case 'delivered':
      return 'DELIVERED';
    case 'cancelled':
      return 'CANCELLED';
  }
}

function toUiOrderStatus(status: ApiOrderStatus): UiOrderStatus {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'PROCESSING':
      return 'processing';
    case 'SHIPPED':
      return 'shipped';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
  }
}

function toUiPaymentStatus(status: ApiPaymentStatus): UiPaymentStatus {
  switch (status) {
    case 'PAID':
      return 'paid';
    case 'FAILED':
      return 'failed';
    case 'PENDING':
      return 'pending';
  }
}

function toUiPaymentMethod(method: ApiPaymentMethod): UiPaymentMethod {
  switch (method) {
    case 'CARD':
      return 'card';
    case 'BANK_TRANSFER':
      return 'bank_transfer';
    case 'DIGITAL_WALLET':
      return 'digital_wallet';
    case 'CASH':
      return 'cash';
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
