import { API_BASE_URL } from '../auth/authApi';
import { authenticatedRequest } from '../api/http';
import { Cart, CartItem, CheckoutPayload, CheckoutResult } from './types';

type CartItemResponse = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type CartResponse = {
  id: string;
  status: string;
  items: CartItemResponse[];
  couponCode: string | null;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  updatedAt: string;
};

type CheckoutResponse = {
  orderId: string;
  orderNumber: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  canCreateAccount: boolean;
  registrationEmail: string | null;
  registrationFullName: string | null;
  registrationPhone: string | null;
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

function mapItem(item: CartItemResponse): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productSlug: item.productSlug,
    image: normalizeImageUrl(item.imageUrl),
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice ?? 0),
    lineTotal: Number(item.lineTotal ?? 0),
  };
}

function mapCart(cart: CartResponse): Cart {
  return {
    id: cart.id,
    status: cart.status,
    items: cart.items.map(mapItem),
    couponCode: cart.couponCode,
    subtotal: Number(cart.subtotal ?? 0),
    discountAmount: Number(cart.discountAmount ?? 0),
    shippingAmount: Number(cart.shippingAmount ?? 0),
    taxAmount: Number(cart.taxAmount ?? 0),
    totalAmount: Number(cart.totalAmount ?? 0),
    updatedAt: cart.updatedAt,
  };
}

function mapCheckoutResult(result: CheckoutResponse): CheckoutResult {
  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    invoiceId: result.invoiceId,
    invoiceNumber: result.invoiceNumber,
    canCreateAccount: result.canCreateAccount,
    registrationEmail: result.registrationEmail,
    registrationFullName: result.registrationFullName,
    registrationPhone: result.registrationPhone,
  };
}

export async function fetchMyCart(accessToken: string) {
  const payload = await authenticatedRequest<CartResponse>(accessToken, '/api/v1/cart', {
    method: 'GET',
  });
  return mapCart(payload);
}

export async function addCartItem(accessToken: string, productId: string, quantity: number) {
  const payload = await authenticatedRequest<CartResponse>(accessToken, '/api/v1/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
  return mapCart(payload);
}

export async function updateCartItem(accessToken: string, itemId: string, quantity: number) {
  const payload = await authenticatedRequest<CartResponse>(accessToken, `/api/v1/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return mapCart(payload);
}

export async function removeCartItem(accessToken: string, itemId: string) {
  const payload = await authenticatedRequest<CartResponse>(accessToken, `/api/v1/cart/items/${itemId}`, {
    method: 'DELETE',
  });
  return mapCart(payload);
}

export async function checkoutCart(accessToken: string, payload: CheckoutPayload) {
  const response = await authenticatedRequest<CheckoutResponse>(accessToken, '/api/v1/cart/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapCheckoutResult(response);
}
