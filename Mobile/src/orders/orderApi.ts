import { API_BASE_URL } from '../auth/authApi';
import { authenticatedRequest } from '../api/http';
import { Order, OrderItem, OrderStatus } from './types';

type OrderItemResponse = {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderResponse = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  couponCode: string | null;
  couponDiscount: number | null;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  placedAt: string;
  shippingRecipientName: string | null;
  shippingPhone: string | null;
  shippingEmail: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  items: OrderItemResponse[];
};

function normalizeImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/${imageUrl}`;
}

function mapStatus(status: string): OrderStatus {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
    case 'PENDING':
      return 'pending';
    default:
      return 'processing';
  }
}

function mapItem(item: OrderItemResponse): OrderItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    image: normalizeImageUrl(item.imageUrl),
    sku: item.sku ?? '',
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice ?? 0),
    lineTotal: Number(item.lineTotal ?? 0),
  };
}

function mapOrder(order: OrderResponse): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: mapStatus(order.status),
    paymentMethod: order.paymentMethod ?? '',
    paymentStatus: order.paymentStatus ?? '',
    couponCode: order.couponCode,
    discountAmount: Number(order.couponDiscount ?? 0),
    subtotal: Number(order.subtotal ?? 0),
    shippingAmount: Number(order.shippingAmount ?? 0),
    taxAmount: Number(order.taxAmount ?? 0),
    totalAmount: Number(order.totalAmount ?? 0),
    placedAt: order.placedAt,
    shippingRecipientName: order.shippingRecipientName ?? '',
    shippingPhone: order.shippingPhone ?? '',
    shippingEmail: order.shippingEmail ?? '',
    shippingAddressLine1: order.shippingAddressLine1 ?? '',
    shippingAddressLine2: order.shippingAddressLine2 ?? '',
    shippingCity: order.shippingCity ?? '',
    shippingState: order.shippingState ?? '',
    shippingZipCode: order.shippingZipCode ?? '',
    shippingCountry: order.shippingCountry ?? '',
    items: (order.items ?? []).map(mapItem),
  };
}

export async function fetchOrders(accessToken: string) {
  const payload = await authenticatedRequest<OrderResponse[]>(accessToken, '/api/v1/orders', {
    method: 'GET',
  });

  return payload.map(mapOrder);
}

export async function fetchOrderById(accessToken: string, orderId: string) {
  const payload = await authenticatedRequest<OrderResponse>(accessToken, `/api/v1/orders/${orderId}`, {
    method: 'GET',
  });

  return mapOrder(payload);
}
