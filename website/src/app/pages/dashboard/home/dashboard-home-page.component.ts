import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, forkJoin, of } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Address } from '../../../core/models/address.model';
import { Invoice } from '../../../core/models/invoice.model';
import { Order } from '../../../core/models/order.model';
import { AddressService } from '../../../core/services/address.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-dashboard-home-page',
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './dashboard-home-page.component.html',
  styleUrl: './dashboard-home-page.component.css'
})
export class DashboardHomePageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly orderService = inject(OrderService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly addressService = inject(AddressService);

  readonly user = this.authState.user;
  readonly isB2B = this.authState.isB2B;
  readonly wishlistCount = 0;
  readonly profileTabs = [
    { key: 'orders', label: 'Orders', icon: 'package' },
    { key: 'addresses', label: 'Addresses', icon: 'map-pin' },
    { key: 'wishlist', label: 'Wishlist', icon: 'heart' },
    { key: 'payment', label: 'Payment', icon: 'credit-card' },
    { key: 'settings', label: 'Settings', icon: 'settings' }
  ] as const;

  loading = true;
  orders: Order[] = [];
  invoices: Invoice[] = [];
  addresses: Address[] = [];
  activeTab: (typeof this.profileTabs)[number]['key'] = 'orders';

  constructor() {
    forkJoin({
      orders: this.orderService.listMyOrders().pipe(catchError(() => of([]))),
      invoices: this.invoiceService.listMyInvoices().pipe(catchError(() => of([]))),
      addresses: this.addressService.listMyAddresses().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ orders, invoices, addresses }) => {
        this.orders = orders;
        this.invoices = invoices;
        this.addresses = addresses;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get profileOrders(): Order[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
    );
  }

  get totalSpent(): number {
    return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  get totalSavings(): number {
    return this.orders.reduce((sum, order) => sum + (order.couponDiscount ?? 0), 0);
  }

  get lastOrderDate(): string | null {
    if (this.orders.length === 0) {
      return null;
    }

    return [...this.orders].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
    )[0].placedAt;
  }

  get recentOrders(): Order[] {
    return this.profileOrders.slice(0, 5);
  }

  get latestInvoice(): Invoice | null {
    if (this.invoices.length === 0) {
      return null;
    }

    return [...this.invoices].sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    )[0];
  }

  get totalItemsPurchased(): number {
    return this.orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
  }

  get deliveredOrders(): number {
    return this.orders.filter((order) =>
      ['DELIVERED', 'COMPLETED'].includes(order.status.toUpperCase())
    ).length;
  }

  get primaryAddress(): Address | null {
    return (
      this.addresses.find((address) => address.defaultShipping || address.defaultBilling) ??
      this.addresses[0] ??
      null
    );
  }

  customerDisplayName(): string {
    return this.user()?.fullName || 'Customer';
  }

  avatarUrl(): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.customerDisplayName())}`;
  }

  userInitials(): string {
    const name = this.customerDisplayName().trim();
    if (!name) {
      return 'CU';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  contactPhone(): string {
    return this.primaryAddress?.phone || this.profileOrders[0]?.shippingPhone || 'Add your phone during checkout';
  }

  accountRoute(section?: 'orders' | 'company' | 'invoices'): string {
    return this.authState.accountRoute(section);
  }

  orderStatusLabel(status: string): string {
    switch (status.toUpperCase()) {
      case 'PROCESSING':
        return 'In Transit';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  fullAddress(address: Address): string {
    return [address.addressLine1, address.addressLine2, address.city, address.state, address.country]
      .filter(Boolean)
      .join(', ');
  }

  statusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'PROCESSING':
        return 'bg-blue-500';
      case 'SHIPPED':
        return 'bg-purple-500';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  }

  statusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700';
      case 'SHIPPED':
        return 'bg-violet-50 text-violet-700';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }
}
