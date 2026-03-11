export type Category = {
  id: string;
  name: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  moq: number;
  stock: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  specifications: Array<{ label: string; value: string }>;
};

export type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  phone: string;
  isDefault?: boolean;
};

export type PaymentMethod = {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault?: boolean;
};

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  estimatedDelivery: string;
  deliveryTime: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  deliveryAddressId: string;
  paymentMethodId: string;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

export const categories: Category[] = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    image:
      'https://images.unsplash.com/photo-1714224247661-ee250f55a842?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    image:
      'https://images.unsplash.com/photo-1758184468790-f2b89a28a21d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    image:
      'https://images.unsplash.com/photo-1771255217872-99fe6c876e45?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    image:
      'https://images.unsplash.com/photo-1555932450-31a8aec2adf1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'meat',
    name: 'Meat',
    image:
      'https://images.unsplash.com/photo-1763140446057-9becaa30b868?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    image:
      'https://images.unsplash.com/photo-1650201920760-e5b2abd5e156?auto=format&fit=crop&w=1200&q=80',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes (Roma)',
    image: categories[0].image,
    price: 45.99,
    unit: 'case',
    moq: 5,
    stock: 'In Stock',
    category: 'vegetables',
    rating: 4.8,
    reviews: 124,
    description:
      'Fresh organic Roma tomatoes, ideal for restaurants and food service teams ordering in volume.',
    specifications: [
      { label: 'Weight per case', value: '25 lbs' },
      { label: 'Origin', value: 'California, USA' },
      { label: 'Shelf life', value: '7 to 10 days' },
      { label: 'Storage', value: 'Cool, dry place' },
    ],
  },
  {
    id: '2',
    name: 'Fresh Lettuce (Romaine)',
    image: categories[0].image,
    price: 38.5,
    unit: 'case',
    moq: 4,
    stock: 'In Stock',
    category: 'vegetables',
    rating: 4.6,
    reviews: 81,
    description: 'Crisp romaine lettuce packed for daily prep and salad stations.',
    specifications: [
      { label: 'Weight per case', value: '18 lbs' },
      { label: 'Origin', value: 'Arizona, USA' },
      { label: 'Shelf life', value: '5 to 7 days' },
      { label: 'Storage', value: 'Refrigerated' },
    ],
  },
  {
    id: '3',
    name: 'Fresh Bananas (Cavendish)',
    image: categories[1].image,
    price: 32.5,
    unit: 'case',
    moq: 10,
    stock: 'In Stock',
    category: 'fruits',
    rating: 4.7,
    reviews: 94,
    description: 'Reliable bulk bananas for smoothies, desserts, and breakfast service.',
    specifications: [
      { label: 'Weight per case', value: '40 lbs' },
      { label: 'Origin', value: 'Ecuador' },
      { label: 'Shelf life', value: '4 to 6 days' },
      { label: 'Storage', value: 'Room temperature' },
    ],
  },
  {
    id: '4',
    name: 'Red Apples (Gala)',
    image: categories[1].image,
    price: 52,
    unit: 'case',
    moq: 8,
    stock: 'In Stock',
    category: 'fruits',
    rating: 4.5,
    reviews: 63,
    description: 'Sweet Gala apples for grab-and-go counters and dessert prep.',
    specifications: [
      { label: 'Weight per case', value: '35 lbs' },
      { label: 'Origin', value: 'Washington, USA' },
      { label: 'Shelf life', value: '10 to 14 days' },
      { label: 'Storage', value: 'Refrigerated' },
    ],
  },
  {
    id: '5',
    name: 'Whole Milk (Organic)',
    image: categories[2].image,
    price: 58,
    unit: 'case',
    moq: 6,
    stock: 'Low Stock',
    category: 'dairy',
    rating: 4.8,
    reviews: 117,
    description: 'Organic whole milk sold by the case for high-volume kitchens.',
    specifications: [
      { label: 'Pack size', value: '4 x 1 gallon' },
      { label: 'Origin', value: 'California, USA' },
      { label: 'Shelf life', value: '6 days' },
      { label: 'Storage', value: 'Keep chilled' },
    ],
  },
  {
    id: '6',
    name: 'Cheddar Cheese (Sharp)',
    image: categories[2].image,
    price: 75,
    unit: 'case',
    moq: 5,
    stock: 'In Stock',
    category: 'dairy',
    rating: 4.7,
    reviews: 76,
    description: 'Sharp cheddar for sandwich, burger, and breakfast menus.',
    specifications: [
      { label: 'Pack size', value: '8 x 2 lbs' },
      { label: 'Origin', value: 'Wisconsin, USA' },
      { label: 'Shelf life', value: '30 days' },
      { label: 'Storage', value: 'Keep chilled' },
    ],
  },
  {
    id: '7',
    name: 'Artisan Sourdough Bread',
    image: categories[3].image,
    price: 42,
    unit: 'dozen',
    moq: 3,
    stock: 'In Stock',
    category: 'bakery',
    rating: 4.9,
    reviews: 140,
    description: 'Fresh sourdough loaves for table service and sandwiches.',
    specifications: [
      { label: 'Pack size', value: '12 loaves' },
      { label: 'Origin', value: 'Local bakery partner' },
      { label: 'Shelf life', value: '2 days' },
      { label: 'Storage', value: 'Ambient' },
    ],
  },
  {
    id: '8',
    name: 'Croissants (Butter)',
    image: categories[3].image,
    price: 55,
    unit: 'dozen',
    moq: 5,
    stock: 'In Stock',
    category: 'bakery',
    rating: 4.6,
    reviews: 59,
    description: 'Butter croissants for breakfast trays and coffee service.',
    specifications: [
      { label: 'Pack size', value: '24 pieces' },
      { label: 'Origin', value: 'Local bakery partner' },
      { label: 'Shelf life', value: '1 day' },
      { label: 'Storage', value: 'Ambient' },
    ],
  },
  {
    id: '9',
    name: 'Premium Beef Steak',
    image: categories[4].image,
    price: 185,
    unit: 'case',
    moq: 2,
    stock: 'In Stock',
    category: 'meat',
    rating: 4.8,
    reviews: 48,
    description: 'Premium steak cuts for grills and upscale dining service.',
    specifications: [
      { label: 'Weight per case', value: '30 lbs' },
      { label: 'Origin', value: 'Texas, USA' },
      { label: 'Shelf life', value: '4 days' },
      { label: 'Storage', value: 'Refrigerated' },
    ],
  },
  {
    id: '10',
    name: 'Chicken Breast (Boneless)',
    image: categories[4].image,
    price: 98,
    unit: 'case',
    moq: 5,
    stock: 'In Stock',
    category: 'meat',
    rating: 4.5,
    reviews: 66,
    description: 'Boneless chicken breast for prep-heavy kitchens and catering.',
    specifications: [
      { label: 'Weight per case', value: '40 lbs' },
      { label: 'Origin', value: 'Arkansas, USA' },
      { label: 'Shelf life', value: '3 days' },
      { label: 'Storage', value: 'Refrigerated' },
    ],
  },
  {
    id: '11',
    name: 'Orange Juice (Fresh)',
    image: categories[5].image,
    price: 48,
    unit: 'case',
    moq: 6,
    stock: 'In Stock',
    category: 'beverages',
    rating: 4.6,
    reviews: 72,
    description: 'Fresh orange juice packed for breakfast and cafe service.',
    specifications: [
      { label: 'Pack size', value: '12 x 1L' },
      { label: 'Origin', value: 'Florida, USA' },
      { label: 'Shelf life', value: '5 days' },
      { label: 'Storage', value: 'Keep chilled' },
    ],
  },
  {
    id: '12',
    name: 'Bottled Water (24-pack)',
    image: categories[5].image,
    price: 25,
    unit: 'case',
    moq: 10,
    stock: 'In Stock',
    category: 'beverages',
    rating: 4.4,
    reviews: 55,
    description: '24-pack bottled water for front-of-house and event use.',
    specifications: [
      { label: 'Pack size', value: '24 bottles' },
      { label: 'Origin', value: 'USA' },
      { label: 'Shelf life', value: '12 months' },
      { label: 'Storage', value: 'Ambient' },
    ],
  },
];

export const featuredProducts = products.slice(0, 4);

export const cartSeed = [
  { productId: '1', quantity: 5 },
  { productId: '3', quantity: 10 },
  { productId: '5', quantity: 6 },
];

export const addresses: Address[] = [
  {
    id: '1',
    name: 'Main Location',
    street: '1234 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '+1 (555) 123-4567',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Secondary Kitchen',
    street: '5678 Oak Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    phone: '+1 (555) 987-6543',
  },
  {
    id: '3',
    name: 'Catering Hub',
    street: '9012 Pine Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
    phone: '+1 (555) 456-7890',
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'Business Credit Card',
    brand: 'Visa',
    last4: '4242',
    expiry: '12/25',
    holderName: 'Green Valley Restaurant',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Business Debit Card',
    brand: 'Mastercard',
    last4: '8888',
    expiry: '08/26',
    holderName: 'Green Valley Restaurant',
  },
  {
    id: '3',
    type: 'Corporate Card',
    brand: 'American Express',
    last4: '1234',
    expiry: '03/27',
    holderName: 'Green Valley Restaurant',
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-2026-001',
    date: 'March 8, 2026',
    status: 'processing',
    estimatedDelivery: 'March 10, 2026',
    deliveryTime: '10:00 AM - 2:00 PM',
    items: [
      { productId: '1', quantity: 5, price: 45.99 },
      { productId: '3', quantity: 10, price: 32.5 },
      { productId: '5', quantity: 6, price: 58 },
    ],
    deliveryAddressId: '1',
    paymentMethodId: '1',
    subtotal: 903.45,
    discount: 135.52,
    delivery: 25,
    total: 792.93,
  },
  {
    id: 'ORD-2026-002',
    date: 'March 5, 2026',
    status: 'delivered',
    estimatedDelivery: 'March 6, 2026',
    deliveryTime: '9:00 AM - 12:00 PM',
    items: [
      { productId: '7', quantity: 6, price: 42 },
      { productId: '11', quantity: 8, price: 48 },
    ],
    deliveryAddressId: '1',
    paymentMethodId: '1',
    subtotal: 636,
    discount: 95.4,
    delivery: 20,
    total: 560.6,
  },
  {
    id: 'ORD-2026-003',
    date: 'March 2, 2026',
    status: 'delivered',
    estimatedDelivery: 'March 3, 2026',
    deliveryTime: '1:00 PM - 4:00 PM',
    items: [
      { productId: '9', quantity: 2, price: 185 },
      { productId: '10', quantity: 5, price: 98 },
    ],
    deliveryAddressId: '2',
    paymentMethodId: '2',
    subtotal: 860,
    discount: 129,
    delivery: 25,
    total: 756,
  },
  {
    id: 'ORD-2026-004',
    date: 'February 28, 2026',
    status: 'delivered',
    estimatedDelivery: 'March 1, 2026',
    deliveryTime: '8:00 AM - 11:00 AM',
    items: [
      { productId: '2', quantity: 6, price: 38.5 },
      { productId: '4', quantity: 8, price: 52 },
      { productId: '12', quantity: 10, price: 25 },
    ],
    deliveryAddressId: '3',
    paymentMethodId: '3',
    subtotal: 897,
    discount: 134.55,
    delivery: 25,
    total: 787.45,
  },
  {
    id: 'ORD-2026-005',
    date: 'February 25, 2026',
    status: 'cancelled',
    estimatedDelivery: 'February 26, 2026',
    deliveryTime: '12:00 PM - 3:00 PM',
    items: [{ productId: '6', quantity: 5, price: 75 }],
    deliveryAddressId: '1',
    paymentMethodId: '1',
    subtotal: 375,
    discount: 0,
    delivery: 18,
    total: 393,
  },
];

export const invoices = [
  {
    id: 'INV-2026-001',
    orderId: 'ORD-2026-001',
    date: 'March 8, 2026',
    dueDate: 'March 22, 2026',
    amount: 792.93,
    status: 'paid',
  },
  {
    id: 'INV-2026-002',
    orderId: 'ORD-2026-002',
    date: 'March 5, 2026',
    dueDate: 'March 19, 2026',
    amount: 560.6,
    status: 'paid',
  },
  {
    id: 'INV-2026-003',
    orderId: 'ORD-2026-003',
    date: 'March 2, 2026',
    dueDate: 'March 16, 2026',
    amount: 756,
    status: 'paid',
  },
  {
    id: 'INV-2026-004',
    orderId: 'ORD-2026-004',
    date: 'February 28, 2026',
    dueDate: 'March 14, 2026',
    amount: 787.45,
    status: 'pending',
  },
];

export const faqCategories = [
  {
    title: 'Orders & Delivery',
    questions: [
      'How do I track my order?',
      'What are the delivery times?',
      'Can I change my delivery address?',
      'What is the minimum order quantity?',
    ],
  },
  {
    title: 'Payments & Billing',
    questions: [
      'What payment methods do you accept?',
      'How do I update my payment method?',
      'When will I be charged?',
      'Can I get an invoice?',
    ],
  },
  {
    title: 'Products & Pricing',
    questions: [
      'How does bulk pricing work?',
      'Are prices inclusive of tax?',
      'What is your return policy?',
      'How do I request a product?',
    ],
  },
  {
    title: 'Account & Security',
    questions: [
      'How do I reset my password?',
      'Can I have multiple users?',
      'How do I update business information?',
      'Is my data secure?',
    ],
  },
];

export const termSections = [
  {
    title: '1. Acceptance of Terms',
    body:
      'By using this platform, you accept these commercial terms for GroceryStore B2B ordering and fulfillment services.',
  },
  {
    title: '2. Business Accounts',
    body:
      'Business customers must provide accurate company details and protect account access for all users under the account.',
    bullets: [
      'Provide valid business and tax information',
      'Maintain secure credentials',
      'Report unauthorized access quickly',
    ],
  },
  {
    title: '3. Orders & Pricing',
    body:
      'Orders are subject to minimum quantities, availability, and the confirmed price at checkout.',
    bullets: [
      'MOQ rules apply per product',
      'Bulk discounts may change by volume',
      'Order acceptance depends on stock and fulfillment capacity',
    ],
  },
  {
    title: '4. Payments & Delivery',
    body:
      'Payment, delivery windows, and invoice handling follow the commercial terms assigned to your business account.',
    bullets: [
      'Cards, ACH, and approved net terms are supported',
      'Delivery windows are estimated',
      'Late payment may delay service',
    ],
  },
  {
    title: '5. Returns & Quality',
    body:
      'Damaged or incorrect goods should be reported promptly so support can issue replacement or refund handling.',
  },
];

export const companyProfile = {
  businessName: 'Green Valley Restaurant',
  businessType: 'Restaurant',
  taxId: '12-3456789',
  email: 'contact@greenvalley.com',
  phone: '+1 (555) 123-4567',
  website: 'www.greenvalley.com',
  address: '1234 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  established: '2020',
};

export const accountManager = {
  firstName: 'John',
  lastName: 'Doe',
  position: 'General Manager',
  email: 'john.doe@greenvalley.com',
  phone: '+1 (555) 123-4567',
  mobile: '+1 (555) 987-6543',
};

export const businessSnapshot = {
  businessName: 'Green Valley Restaurant',
  businessId: 'BUS-2026-0456',
  tier: 'Gold',
  orders: 24,
  spent: '$3.2K',
};

export function getProductById(id: string) {
  return products.find((product) => product.id === id) ?? products[0];
}

export function getOrderById(id: string) {
  return orders.find((order) => order.id === id) ?? orders[0];
}

export function getProductName(productId: string) {
  return getProductById(productId).name;
}

export function getProductImage(productId: string) {
  return getProductById(productId).image;
}

export function getAddressById(addressId: string) {
  return addresses.find((address) => address.id === addressId) ?? addresses[0];
}

export function getPaymentMethodById(paymentMethodId: string) {
  return paymentMethods.find((method) => method.id === paymentMethodId) ?? paymentMethods[0];
}
