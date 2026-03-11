import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  adminCustomers,
  adminOrders,
  adminProducts,
  adminUsers,
  categories,
  coupons,
  inventory,
  monthlyMetrics
} from './admin.mock-data';

type AdminSection =
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'coupons'
  | 'pricing'
  | 'reports'
  | 'users'
  | 'settings';

@Component({
  selector: 'app-resource-page',
  imports: [CommonModule],
  templateUrl: './resource-page.component.html',
  styleUrl: './resource-page.component.scss'
})
export class ResourcePageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly section = this.route.snapshot.data['section'] as AdminSection;

  readonly products = adminProducts;
  readonly orders = adminOrders;
  readonly customers = adminCustomers;
  readonly categories = categories;
  readonly coupons = coupons;
  readonly inventory = inventory;
  readonly users = adminUsers;
  readonly metrics = monthlyMetrics;

  readonly sectionTitles: Record<AdminSection, string> = {
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    customers: 'Customers',
    inventory: 'Inventory',
    coupons: 'Coupons',
    pricing: 'Pricing',
    reports: 'Reports',
    users: 'Users & Roles',
    settings: 'Settings'
  };

  get pageTitle(): string {
    return this.sectionTitles[this.section];
  }

  get pageDescription(): string {
    const descriptions: Record<AdminSection, string> = {
      products: 'Manage SKUs, stock status and dual B2B/B2C pricing.',
      categories: 'Organize catalog categories and product grouping.',
      orders: 'Track order flow and payment status in real time.',
      customers: 'Monitor B2B and B2C customer activity and value.',
      inventory: 'Watch stock levels and restocking priorities.',
      coupons: 'Control promotional campaigns and coupon usage.',
      pricing: 'Review margins and apply bulk pricing strategies.',
      reports: 'Visualize business performance with quick analytics.',
      users: 'Handle admin access and role assignments.',
      settings: 'Configure operational defaults for the admin panel.'
    };

    return descriptions[this.section];
  }

  get averageMargin(): number {
    if (!this.products.length) {
      return 0;
    }

    const margins = this.products.map((product) => {
      const safeCost = product.costPrice || 1;
      return ((product.b2cPrice - safeCost) / safeCost) * 100;
    });

    return margins.reduce((sum, value) => sum + value, 0) / margins.length;
  }

  get highMarginSkuCount(): number {
    return this.products.filter((product) => {
      const safeCost = product.costPrice || 1;
      const margin = ((product.b2cPrice - safeCost) / safeCost) * 100;
      return margin > 70;
    }).length;
  }

  get revenueTotal(): number {
    return this.orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
