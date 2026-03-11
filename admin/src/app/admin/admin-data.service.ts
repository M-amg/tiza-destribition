import { Injectable } from '@angular/core';

import {
  adminCustomers,
  adminNavItems,
  adminOrders,
  adminProducts,
  adminUsers,
  categories,
  coupons,
  inventory,
  monthlyMetrics,
  rolePermissions,
  stockHistory
} from './admin.mock-data';

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  readonly navItems = adminNavItems;
  readonly products = adminProducts;
  readonly orders = adminOrders;
  readonly customers = adminCustomers;
  readonly categories = categories;
  readonly coupons = coupons;
  readonly inventory = inventory;
  readonly stockHistory = stockHistory;
  readonly users = adminUsers;
  readonly rolePermissions = rolePermissions;
  readonly monthlyMetrics = monthlyMetrics;

  findProduct(id: string) {
    return this.products.find((item) => item.id === id);
  }

  findOrder(id: string) {
    return this.orders.find((item) => item.id === id);
  }

  findCustomer(id: string) {
    return this.customers.find((item) => item.id === id);
  }

  findCategory(id: string) {
    return this.categories.find((item) => item.id === id);
  }

  findCoupon(id: string) {
    return this.coupons.find((item) => item.id === id);
  }

  ordersByCustomer(customerId: string) {
    return this.orders.filter((item) => item.customerId === customerId);
  }

  ordersByCoupon(couponCode: string) {
    return this.orders.filter((item) => item.couponCode === couponCode);
  }
}
