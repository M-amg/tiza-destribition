export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Cart = {
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
};

export type CheckoutPayload = {
  recipientName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  paymentMethod: 'CASH';
  notes?: string;
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  canCreateAccount: boolean;
  registrationEmail: string | null;
  registrationFullName: string | null;
  registrationPhone: string | null;
};
