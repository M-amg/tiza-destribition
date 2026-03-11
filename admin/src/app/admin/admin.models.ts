export type CustomerType = 'B2B' | 'B2C';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export type ProductStatus = 'active' | 'disabled';

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type CouponStatus = 'active' | 'inactive' | 'expired';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  featured?: boolean;
  isNew?: boolean;
  stockQuantity: number;
  minimumStockLevel: number;
  costPrice: number;
  b2cPrice: number;
  b2bPrice: number;
  status: ProductStatus;
  updatedDate: string;
  image: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerType: CustomerType;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  paymentMethod: 'card' | 'cash' | 'bank_transfer';
  paymentStatus: PaymentStatus;
  couponCode?: string;
  couponDiscount?: number;
  shippingAddress: Address;
  items: OrderItem[];
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  company?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdDate: string;
  address: Address;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  status?: 'active' | 'inactive';
  parentCategoryId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscountCap?: number;
  segment: 'all' | 'B2B' | 'B2C';
  applicability?: 'entire' | 'categories' | 'products';
  selectedCategories?: string[];
  selectedProducts?: string[];
  minOrderAmount: number;
  usageLimitTotal?: number;
  usageLimitPerCustomer?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: CouponStatus;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  stockQuantity: number;
  minimumLevel: number;
  status: InventoryStatus;
  lastRestocked: string;
}

export interface StockHistory {
  id: string;
  productName: string;
  changeType: 'restock' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  adminUser: string;
  notes?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: string[];
  createdDate: string;
  lastLogin: string;
}

export interface RolePermission {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

export interface MonthlyMetric {
  month: string;
  revenue: number;
  orders: number;
}
