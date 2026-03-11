import {
  AdminCustomer,
  AdminNavItem,
  AdminOrder,
  AdminProduct,
  AdminUser,
  Category,
  Coupon,
  InventoryItem,
  MonthlyMetric,
  RolePermission,
  StockHistory
} from './admin.models';

export const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', path: '', icon: 'DB' },
  { label: 'Products', path: 'products', icon: 'PR' },
  { label: 'Categories', path: 'categories', icon: 'CT' },
  { label: 'Orders', path: 'orders', icon: 'OR' },
  { label: 'Customers', path: 'customers', icon: 'CU' },
  { label: 'Inventory', path: 'inventory', icon: 'IN' },
  { label: 'Coupons', path: 'coupons', icon: 'CP' },
  { label: 'Pricing', path: 'pricing', icon: 'PC' },
  { label: 'Reports', path: 'reports', icon: 'RP' },
  { label: 'Users & Roles', path: 'users', icon: 'UR' },
  { label: 'Settings', path: 'settings', icon: 'ST' }
];

export const adminProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'Professional Wireless Mouse',
    slug: 'professional-wireless-mouse',
    description: 'Ergonomic wireless mouse with precision tracking and long battery life.',
    category: 'Electronics',
    brand: 'TechPro',
    sku: 'WM-001',
    stockQuantity: 150,
    minimumStockLevel: 50,
    costPrice: 15,
    b2cPrice: 29.99,
    b2bPrice: 24.99,
    status: 'active',
    updatedDate: '2024-02-20',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Mechanical Keyboard RGB',
    slug: 'mechanical-keyboard-rgb',
    description: 'Mechanical keyboard with RGB lighting and tactile switches.',
    category: 'Electronics',
    brand: 'KeyMaster',
    sku: 'KB-002',
    stockQuantity: 85,
    minimumStockLevel: 30,
    costPrice: 45,
    b2cPrice: 89.99,
    b2bPrice: 79.99,
    status: 'active',
    updatedDate: '2024-02-18',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Office Chair Executive',
    slug: 'office-chair-executive',
    description: 'Executive ergonomic office chair with lumbar support.',
    category: 'Office Supplies',
    brand: 'ComfortSeat',
    sku: 'OC-003',
    stockQuantity: 42,
    minimumStockLevel: 20,
    costPrice: 120,
    b2cPrice: 249.99,
    b2bPrice: 219.99,
    status: 'active',
    updatedDate: '2024-02-15',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Industrial Drill Kit',
    slug: 'industrial-drill-kit',
    description: 'Heavy-duty drill kit for professional contractors.',
    category: 'Industrial Equipment',
    brand: 'PowerTools',
    sku: 'ID-005',
    stockQuantity: 67,
    minimumStockLevel: 25,
    costPrice: 90,
    b2cPrice: 179.99,
    b2bPrice: 159.99,
    status: 'active',
    updatedDate: '2024-02-22',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop'
  },
  {
    id: '5',
    name: 'Cardboard Boxes 50-Pack',
    slug: 'cardboard-boxes-50-pack',
    description: 'Durable corrugated cardboard boxes in bulk.',
    category: 'Packaging Materials',
    brand: 'PackRight',
    sku: 'CB-006',
    stockQuantity: 324,
    minimumStockLevel: 150,
    costPrice: 20,
    b2cPrice: 45.99,
    b2bPrice: 38.99,
    status: 'active',
    updatedDate: '2024-02-25',
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=200&h=200&fit=crop'
  },
  {
    id: '6',
    name: 'Safety Helmet Hard Hat',
    slug: 'safety-helmet-hard-hat',
    description: 'OSHA approved safety helmet with adjustable fit.',
    category: 'Safety Equipment',
    brand: 'SafetyFirst',
    sku: 'SH-007',
    stockQuantity: 456,
    minimumStockLevel: 200,
    costPrice: 8,
    b2cPrice: 19.99,
    b2bPrice: 16.99,
    status: 'active',
    updatedDate: '2024-02-18',
    image: 'https://images.unsplash.com/photo-1565699894576-2f0b23bc0b7c?w=200&h=200&fit=crop'
  },
  {
    id: '7',
    name: 'Wireless Printer All-in-One',
    slug: 'wireless-printer-all-in-one',
    description: 'Printer with scan and copy features.',
    category: 'Electronics',
    brand: 'PrintMaster',
    sku: 'WP-010',
    stockQuantity: 18,
    minimumStockLevel: 25,
    costPrice: 80,
    b2cPrice: 159.99,
    b2bPrice: 139.99,
    status: 'active',
    updatedDate: '2024-01-30',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&h=200&fit=crop'
  },
  {
    id: '8',
    name: 'Standing Desk Converter',
    slug: 'standing-desk-converter',
    description: 'Adjustable standing desk converter with dual monitor support.',
    category: 'Office Supplies',
    brand: 'ErgoDesk',
    sku: 'SD-011',
    stockQuantity: 12,
    minimumStockLevel: 15,
    costPrice: 95,
    b2cPrice: 199.99,
    b2bPrice: 179.99,
    status: 'active',
    updatedDate: '2024-01-25',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=200&h=200&fit=crop'
  }
];

export const adminCustomers: AdminCustomer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    customerType: 'B2C',
    totalOrders: 12,
    totalSpent: 3245.5,
    status: 'active',
    createdDate: '2023-05-15',
    address: { street: '123 Main Street', city: 'New York', state: 'NY', zipCode: '10001' }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    customerType: 'B2C',
    totalOrders: 8,
    totalSpent: 1876.3,
    status: 'active',
    createdDate: '2023-07-22',
    address: { street: '456 Oak Avenue', city: 'Los Angeles', state: 'CA', zipCode: '90001' }
  },
  {
    id: '3',
    name: 'TechCorp Industries',
    email: 'purchasing@techcorp.com',
    phone: '+1 (555) 234-5678',
    customerType: 'B2B',
    company: 'TechCorp Industries',
    totalOrders: 45,
    totalSpent: 25678.9,
    status: 'active',
    createdDate: '2022-11-05',
    address: { street: '321 Elm Street', city: 'Houston', state: 'TX', zipCode: '77001' }
  },
  {
    id: '4',
    name: 'Global Solutions LLC',
    email: 'orders@globalsolutions.com',
    phone: '+1 (555) 876-5432',
    customerType: 'B2B',
    company: 'Global Solutions LLC',
    totalOrders: 67,
    totalSpent: 45890.25,
    status: 'active',
    createdDate: '2022-08-18',
    address: { street: '654 Maple Drive', city: 'Phoenix', state: 'AZ', zipCode: '85001' }
  },
  {
    id: '5',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 345-6789',
    customerType: 'B2C',
    totalOrders: 5,
    totalSpent: 892.4,
    status: 'active',
    createdDate: '2024-01-08',
    address: { street: '987 Birch Lane', city: 'Seattle', state: 'WA', zipCode: '98101' }
  },
  {
    id: '6',
    name: 'BuildRight Construction',
    email: 'procurement@buildright.com',
    phone: '+1 (555) 567-8901',
    customerType: 'B2B',
    company: 'BuildRight Construction',
    totalOrders: 89,
    totalSpent: 67234.15,
    status: 'active',
    createdDate: '2022-06-12',
    address: { street: '246 Cedar Court', city: 'Denver', state: 'CO', zipCode: '80201' }
  },
  {
    id: '7',
    name: 'Robert Wilson',
    email: 'r.wilson@example.com',
    phone: '+1 (555) 678-9012',
    customerType: 'B2C',
    totalOrders: 3,
    totalSpent: 456.75,
    status: 'active',
    createdDate: '2024-02-14',
    address: { street: '135 Willow Way', city: 'Boston', state: 'MA', zipCode: '02101' }
  },
  {
    id: '8',
    name: 'Office Supplies Plus',
    email: 'buyer@officesuppliesplus.com',
    phone: '+1 (555) 789-0123',
    customerType: 'B2B',
    company: 'Office Supplies Plus',
    totalOrders: 102,
    totalSpent: 78945.6,
    status: 'active',
    createdDate: '2021-12-03',
    address: { street: '789 Commerce Blvd', city: 'Miami', state: 'FL', zipCode: '33101' }
  }
];

export const adminOrders: AdminOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-02-28',
    status: 'delivered',
    customerId: '1',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerType: 'B2C',
    subtotal: 149.97,
    shipping: 10,
    tax: 12,
    total: 171.97,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    couponCode: 'WELCOME20',
    couponDiscount: 20,
    shippingAddress: { street: '123 Main Street', city: 'New York', state: 'NY', zipCode: '10001' },
    items: [
      { productId: '1', productName: 'Professional Wireless Mouse', quantity: 2, price: 29.99 },
      { productId: '2', productName: 'Mechanical Keyboard RGB', quantity: 1, price: 89.99 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-02-27',
    status: 'shipped',
    customerId: '2',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    customerType: 'B2C',
    subtotal: 249.99,
    shipping: 25,
    tax: 22,
    total: 296.99,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    shippingAddress: { street: '456 Oak Avenue', city: 'Los Angeles', state: 'CA', zipCode: '90001' },
    items: [{ productId: '3', productName: 'Office Chair Executive', quantity: 1, price: 249.99 }]
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-02-26',
    status: 'processing',
    customerId: '3',
    customerName: 'TechCorp Industries',
    customerEmail: 'purchasing@techcorp.com',
    customerType: 'B2B',
    subtotal: 1139.75,
    shipping: 50,
    tax: 95.38,
    total: 1285.13,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    couponCode: 'B2BBULK15',
    couponDiscount: 170.96,
    shippingAddress: { street: '321 Elm Street', city: 'Houston', state: 'TX', zipCode: '77001' },
    items: [
      { productId: '4', productName: 'Industrial Drill Kit', quantity: 5, price: 159.99 },
      { productId: '6', productName: 'Safety Helmet Hard Hat', quantity: 20, price: 16.99 }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: '2024-02-25',
    status: 'pending',
    customerId: '5',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@example.com',
    customerType: 'B2C',
    subtotal: 659.98,
    shipping: 20,
    tax: 54.4,
    total: 734.38,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    couponCode: 'ELECTRONICS50',
    couponDiscount: 50,
    shippingAddress: { street: '987 Birch Lane', city: 'Seattle', state: 'WA', zipCode: '98101' },
    items: [{ productId: '7', productName: 'Wireless Printer All-in-One', quantity: 2, price: 329.99 }]
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    date: '2024-02-24',
    status: 'delivered',
    customerId: '4',
    customerName: 'Global Solutions LLC',
    customerEmail: 'orders@globalsolutions.com',
    customerType: 'B2B',
    subtotal: 669.82,
    shipping: 40,
    tax: 56.83,
    total: 766.65,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    shippingAddress: { street: '654 Maple Drive', city: 'Phoenix', state: 'AZ', zipCode: '85001' },
    items: [
      { productId: '5', productName: 'Cardboard Boxes 50-Pack', quantity: 10, price: 38.99 },
      { productId: '3', productName: 'Office Chair Executive', quantity: 1, price: 219.99 }
    ]
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    date: '2024-02-23',
    status: 'shipped',
    customerId: '6',
    customerName: 'BuildRight Construction',
    customerEmail: 'procurement@buildright.com',
    customerType: 'B2B',
    subtotal: 479.97,
    shipping: 30,
    tax: 40.8,
    total: 550.77,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    couponCode: 'INDUSTRIAL100',
    couponDiscount: 100,
    shippingAddress: { street: '246 Cedar Court', city: 'Denver', state: 'CO', zipCode: '80201' },
    items: [{ productId: '4', productName: 'Industrial Drill Kit', quantity: 3, price: 159.99 }]
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    date: '2024-02-22',
    status: 'processing',
    customerId: '1',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerType: 'B2C',
    subtotal: 154.95,
    shipping: 10,
    tax: 13.2,
    total: 178.15,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    shippingAddress: { street: '123 Main Street', city: 'New York', state: 'NY', zipCode: '10001' },
    items: [
      { productId: '2', productName: 'Mechanical Keyboard RGB', quantity: 1, price: 89.99 },
      { productId: '1', productName: 'Professional Wireless Mouse', quantity: 2, price: 29.99 }
    ]
  },
  {
    id: '8',
    orderNumber: 'ORD-2024-008',
    date: '2024-02-21',
    status: 'cancelled',
    customerId: '7',
    customerName: 'Robert Wilson',
    customerEmail: 'r.wilson@example.com',
    customerType: 'B2C',
    subtotal: 159.99,
    shipping: 15,
    tax: 14,
    total: 188.99,
    paymentMethod: 'card',
    paymentStatus: 'failed',
    shippingAddress: { street: '135 Willow Way', city: 'Boston', state: 'MA', zipCode: '02101' },
    items: [{ productId: '7', productName: 'Wireless Printer All-in-One', quantity: 1, price: 159.99 }]
  },
  {
    id: '9',
    orderNumber: 'ORD-2024-009',
    date: '2024-02-20',
    status: 'delivered',
    customerId: '8',
    customerName: 'Office Supplies Plus',
    customerEmail: 'buyer@officesuppliesplus.com',
    customerType: 'B2B',
    subtotal: 4799.76,
    shipping: 120,
    tax: 393.58,
    total: 5313.34,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    couponCode: 'OFFICE30',
    couponDiscount: 659.97,
    shippingAddress: { street: '789 Commerce Blvd', city: 'Miami', state: 'FL', zipCode: '33101' },
    items: [
      { productId: '8', productName: 'Standing Desk Converter', quantity: 12, price: 179.99 },
      { productId: '3', productName: 'Office Chair Executive', quantity: 12, price: 219.99 }
    ]
  },
  {
    id: '10',
    orderNumber: 'ORD-2024-010',
    date: '2024-02-19',
    status: 'pending',
    customerId: '2',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    customerType: 'B2C',
    subtotal: 119.98,
    shipping: 10,
    tax: 10.4,
    total: 140.38,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    couponCode: 'FREESHIP',
    couponDiscount: 15,
    shippingAddress: { street: '456 Oak Avenue', city: 'Los Angeles', state: 'CA', zipCode: '90001' },
    items: [
      { productId: '1', productName: 'Professional Wireless Mouse', quantity: 1, price: 29.99 },
      { productId: '2', productName: 'Mechanical Keyboard RGB', quantity: 1, price: 89.99 }
    ]
  }
];

export const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronic devices and accessories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
    productCount: 156,
    status: 'active'
  },
  {
    id: '2',
    name: 'Office Supplies',
    slug: 'office-supplies',
    description: 'Everything for your office needs',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop',
    productCount: 243,
    status: 'active'
  },
  {
    id: '3',
    name: 'Industrial Equipment',
    slug: 'industrial-equipment',
    description: 'Professional industrial tools and equipment',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&h=400&fit=crop',
    productCount: 89,
    status: 'active'
  },
  {
    id: '4',
    name: 'Packaging Materials',
    slug: 'packaging-materials',
    description: 'Quality packaging and shipping supplies',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
    productCount: 127,
    status: 'active'
  },
  {
    id: '5',
    name: 'Safety Equipment',
    slug: 'safety-equipment',
    description: 'Workplace safety gear and equipment',
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&h=400&fit=crop',
    productCount: 98,
    status: 'active'
  },
  {
    id: '6',
    name: 'Cleaning Supplies',
    slug: 'cleaning-supplies',
    description: 'Professional cleaning products and tools',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop',
    productCount: 134,
    status: 'active'
  }
];

export const coupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME20',
    name: 'Welcome Discount',
    description: '20% off for new customers',
    type: 'percentage',
    value: 20,
    maxDiscountCap: 50,
    segment: 'B2C',
    applicability: 'entire',
    minOrderAmount: 50,
    usageLimitTotal: 1000,
    usageLimitPerCustomer: 1,
    usedCount: 234,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active'
  },
  {
    id: '2',
    code: 'B2BBULK15',
    name: 'B2B Bulk Discount',
    description: '15% off for business customers on bulk orders',
    type: 'percentage',
    value: 15,
    segment: 'B2B',
    applicability: 'entire',
    minOrderAmount: 500,
    usageLimitTotal: 500,
    usageLimitPerCustomer: 3,
    usedCount: 89,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active'
  },
  {
    id: '3',
    code: 'ELECTRONICS50',
    name: 'Electronics Sale',
    description: '50 DH off electronics orders',
    type: 'fixed',
    value: 50,
    segment: 'all',
    applicability: 'categories',
    selectedCategories: ['1'],
    minOrderAmount: 200,
    usageLimitTotal: 300,
    usageLimitPerCustomer: 2,
    usedCount: 156,
    startDate: '2024-02-01',
    endDate: '2024-03-31',
    status: 'active'
  },
  {
    id: '4',
    code: 'SPRING2024',
    name: 'Spring Sale',
    description: '25% spring promotion',
    type: 'percentage',
    value: 25,
    maxDiscountCap: 120,
    segment: 'all',
    applicability: 'entire',
    minOrderAmount: 100,
    usageLimitTotal: 1500,
    usageLimitPerCustomer: 2,
    usedCount: 567,
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    status: 'active'
  },
  {
    id: '5',
    code: 'SUMMER2023',
    name: 'Summer Sale 2023',
    description: 'Expired campaign sample',
    type: 'percentage',
    value: 20,
    segment: 'all',
    applicability: 'entire',
    minOrderAmount: 50,
    usageLimitTotal: 1000,
    usageLimitPerCustomer: 2,
    usedCount: 892,
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    status: 'expired'
  }
];

export const inventory: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Professional Wireless Mouse',
    sku: 'WM-001',
    category: 'Electronics',
    stockQuantity: 150,
    minimumLevel: 50,
    status: 'in_stock',
    lastRestocked: '2024-02-15'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Mechanical Keyboard RGB',
    sku: 'KB-002',
    category: 'Electronics',
    stockQuantity: 85,
    minimumLevel: 30,
    status: 'in_stock',
    lastRestocked: '2024-02-20'
  },
  {
    id: '3',
    productId: '3',
    productName: 'Office Chair Executive',
    sku: 'OC-003',
    category: 'Office Supplies',
    stockQuantity: 42,
    minimumLevel: 20,
    status: 'in_stock',
    lastRestocked: '2024-02-10'
  },
  {
    id: '4',
    productId: '5',
    productName: 'Cardboard Boxes 50-Pack',
    sku: 'CB-006',
    category: 'Packaging Materials',
    stockQuantity: 324,
    minimumLevel: 150,
    status: 'in_stock',
    lastRestocked: '2024-02-28'
  },
  {
    id: '5',
    productId: '7',
    productName: 'Wireless Printer All-in-One',
    sku: 'WP-010',
    category: 'Electronics',
    stockQuantity: 18,
    minimumLevel: 25,
    status: 'low_stock',
    lastRestocked: '2024-01-30'
  },
  {
    id: '6',
    productId: '8',
    productName: 'Standing Desk Converter',
    sku: 'SD-011',
    category: 'Office Supplies',
    stockQuantity: 12,
    minimumLevel: 15,
    status: 'low_stock',
    lastRestocked: '2024-01-25'
  }
];

export const stockHistory: StockHistory[] = [
  {
    id: '1',
    productName: 'Wireless Printer All-in-One',
    changeType: 'sale',
    quantity: -5,
    previousStock: 23,
    newStock: 18,
    date: '2024-02-28',
    adminUser: 'System',
    notes: 'Order #ORD-2024-089'
  },
  {
    id: '2',
    productName: 'Standing Desk Converter',
    changeType: 'sale',
    quantity: -3,
    previousStock: 15,
    newStock: 12,
    date: '2024-02-27',
    adminUser: 'System',
    notes: 'Order #ORD-2024-087'
  },
  {
    id: '3',
    productName: 'Cardboard Boxes 50-Pack',
    changeType: 'restock',
    quantity: 100,
    previousStock: 224,
    newStock: 324,
    date: '2024-02-28',
    adminUser: 'Admin User',
    notes: 'Restocked from supplier'
  },
  {
    id: '4',
    productName: 'Professional Wireless Mouse',
    changeType: 'adjustment',
    quantity: -10,
    previousStock: 160,
    newStock: 150,
    date: '2024-02-26',
    adminUser: 'Admin User',
    notes: 'Inventory audit adjustment'
  }
];

export const adminUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Admin Master',
    email: 'admin@tizadistribution.com',
    role: 'super_admin',
    status: 'active',
    permissions: ['all'],
    createdDate: '2022-01-01',
    lastLogin: '2024-03-01 09:30:00'
  },
  {
    id: '2',
    name: 'Jane Cooper',
    email: 'jane.cooper@tizadistribution.com',
    role: 'admin',
    status: 'active',
    permissions: ['manage_products', 'manage_orders', 'manage_customers', 'view_reports'],
    createdDate: '2022-06-15',
    lastLogin: '2024-03-01 08:15:00'
  },
  {
    id: '3',
    name: 'Mark Stevens',
    email: 'mark.stevens@tizadistribution.com',
    role: 'manager',
    status: 'active',
    permissions: ['manage_products', 'manage_inventory', 'view_reports'],
    createdDate: '2022-09-20',
    lastLogin: '2024-02-29 16:45:00'
  },
  {
    id: '4',
    name: 'Lisa Martinez',
    email: 'lisa.martinez@tizadistribution.com',
    role: 'staff',
    status: 'active',
    permissions: ['manage_orders', 'view_customers'],
    createdDate: '2023-03-10',
    lastLogin: '2024-03-01 07:20:00'
  },
  {
    id: '5',
    name: 'Tom Wilson',
    email: 'tom.wilson@tizadistribution.com',
    role: 'staff',
    status: 'active',
    permissions: ['manage_inventory'],
    createdDate: '2023-07-05',
    lastLogin: '2024-02-28 14:30:00'
  },
  {
    id: '6',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@tizadistribution.com',
    role: 'manager',
    status: 'inactive',
    permissions: ['manage_products', 'manage_coupons'],
    createdDate: '2022-11-12',
    lastLogin: '2023-12-15 10:00:00'
  }
];

export const rolePermissions: RolePermission[] = [
  {
    role: 'super_admin',
    name: 'Super Admin',
    description: 'Full access to all features',
    permissions: ['all']
  },
  {
    role: 'admin',
    name: 'Admin',
    description: 'Manage most features except settings',
    permissions: [
      'manage_products',
      'manage_categories',
      'manage_orders',
      'manage_customers',
      'manage_coupons',
      'manage_pricing',
      'view_reports'
    ]
  },
  {
    role: 'manager',
    name: 'Manager',
    description: 'Manage products and inventory',
    permissions: ['manage_products', 'manage_inventory', 'view_reports']
  },
  {
    role: 'staff',
    name: 'Staff',
    description: 'Limited access to specific features',
    permissions: ['view_orders', 'view_customers']
  }
];

export const monthlyMetrics: MonthlyMetric[] = [
  { month: 'Sep', revenue: 12500, orders: 45 },
  { month: 'Oct', revenue: 15200, orders: 52 },
  { month: 'Nov', revenue: 18900, orders: 68 },
  { month: 'Dec', revenue: 16400, orders: 58 },
  { month: 'Jan', revenue: 21000, orders: 75 },
  { month: 'Feb', revenue: 19800, orders: 70 }
];
