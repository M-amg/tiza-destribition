export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  status: string;
  items: CartItem[];
  couponCode: string | null;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  updatedAt: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  canCreateAccount: boolean;
  registrationEmail: string | null;
  registrationFullName: string | null;
  registrationPhone: string | null;
}
