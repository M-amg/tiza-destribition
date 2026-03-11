export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  privateDetailsVisible: boolean;
  customerType: string | null;
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
  items: OrderItem[];
}
