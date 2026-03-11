import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HttpErrorResponse } from '@angular/common/http';
import { Order, OrderItem } from '../../core/models/order.model';
import { API_BASE_URL } from '../../core/services/api.config';
import { AuthStateService } from '../../core/services/auth-state.service';
import { OrderService } from '../../core/services/order.service';

interface TrackingStep {
  status: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-track-order-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './track-order-page.component.html',
  styleUrl: './track-order-page.component.css'
})
export class TrackOrderPageComponent {
  private readonly mediaBaseUrl = API_BASE_URL.replace(/\/api\/v1$/, '');
  private readonly authState = inject(AuthStateService);
  private readonly orderService = inject(OrderService);

  readonly isLoggedIn = this.authState.isAuthenticated;
  readonly trackedOrder = signal<Order | null>(null);
  readonly trackingSteps = computed(() => this.buildTrackingSteps(this.trackedOrder()));
  readonly privateDetailsVisible = computed(
    () => this.trackedOrder()?.privateDetailsVisible ?? false
  );
  readonly brokenImageIds = signal<Record<string, true>>({});
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly errorMessage = signal('');

  orderNumber = '';

  accountOrdersRoute(): string {
    return this.authState.accountRoute('orders');
  }

  contactRoute(): string {
    return '/contact';
  }

  trackOrder(): void {
    const normalized = this.normalizeOrderNumber(this.orderNumber);
    this.searched.set(true);
    this.errorMessage.set('');
    this.trackedOrder.set(null);
    this.brokenImageIds.set({});

    if (!normalized) {
      this.errorMessage.set('Enter your order number first.');
      return;
    }

    this.loading.set(true);
    this.orderService
      .trackOrder(normalized)
      .subscribe({
        next: (order) => {
          this.loading.set(false);
          this.trackedOrder.set(order);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.trackedOrder.set(null);

          if (error.status === 404) {
            this.errorMessage.set('No matching order was found.');
            return;
          }

          if (error.status === 400) {
            this.errorMessage.set('Enter a valid order number.');
            return;
          }

          this.errorMessage.set('Tracking is temporarily unavailable. Please try again.');
        }
      });
  }

  statusPillClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  deliveryLabel(order: Order): string {
    switch (order.status.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'Delivered';
      case 'SHIPPED':
        return 'On the way';
      case 'PROCESSING':
        return 'Preparing order';
      case 'CANCELLED':
        return 'Order cancelled';
      default:
        return 'Order received';
    }
  }

  publicDeliverySummary(order: Order): string {
    switch (order.status.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'Package delivered to the destination area.';
      case 'SHIPPED':
        return 'Package is currently moving through delivery.';
      case 'PROCESSING':
        return 'Shipment is being prepared for dispatch.';
      case 'CANCELLED':
        return 'Delivery updates stopped because the order was cancelled.';
      default:
        return 'Order has been registered and is waiting for the next update.';
    }
  }

  publicCustomerSummary(): string {
    return this.isLoggedIn()
      ? 'Full customer details are visible only for the account that placed this order.'
      : 'Customer details stay protected on public tracking pages.';
  }

  publicCustomerHint(): string {
    return this.isLoggedIn()
      ? 'Sign in with the purchasing account to unlock address, payment, and item details.'
      : 'Sign in with the purchasing account to view full order details.';
  }

  statusHeadline(order: Order): string {
    switch (order.status.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'Delivered successfully';
      case 'SHIPPED':
        return 'Out for delivery';
      case 'PROCESSING':
        return 'Processing your order';
      case 'CANCELLED':
        return 'This order was cancelled';
      default:
        return 'Order confirmed';
    }
  }

  statusIcon(order: Order): string {
    switch (order.status.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'house';
      case 'SHIPPED':
        return 'truck';
      case 'PROCESSING':
        return 'package';
      case 'CANCELLED':
        return 'circle-x';
      default:
        return 'circle-check';
    }
  }

  orderAddressLines(order: Order): string[] {
    return [
      order.shippingAddressLine1,
      order.shippingAddressLine2,
      `${order.shippingCity}${order.shippingState ? ', ' + order.shippingState : ''}`,
      order.shippingCountry
    ].filter(Boolean) as string[];
  }

  productTitle(item: OrderItem, index: number): string {
    return item.productName?.trim() || item.sku?.trim() || `Product ${index + 1}`;
  }

  productImageUrl(item: OrderItem): string | null {
    if (this.brokenImageIds()[item.id]) {
      return null;
    }

    const imageUrl = item.imageUrl?.trim();
    if (!imageUrl) {
      return null;
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    return `${this.mediaBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  markImageError(itemId: string): void {
    this.brokenImageIds.update((state) => ({ ...state, [itemId]: true }));
  }

  private normalizeOrderNumber(value: string): string {
    return value.trim().replace(/^#/, '').toUpperCase();
  }

  private buildTrackingSteps(order: Order | null): TrackingStep[] {
    if (!order) {
      return [];
    }

    const placedAt = new Date(order.placedAt);
    const stage = this.statusStage(order.status);

    return [
      {
        status: 'Order Placed',
        description: 'Your order was confirmed and saved to your account.',
        icon: 'circle-check',
        completed: true,
        current: stage === 0,
        timestamp: placedAt
      },
      {
        status: 'Processing',
        description: 'We are preparing your products for shipment.',
        icon: 'package',
        completed: stage >= 1,
        current: stage === 1,
        timestamp: this.addHours(placedAt, 6)
      },
      {
        status: 'Shipped',
        description: 'Your package has left the warehouse.',
        icon: 'truck',
        completed: stage >= 2,
        current: stage === 2,
        timestamp: this.addHours(placedAt, 24)
      },
      {
        status: 'Delivered',
        description:
          order.status.toUpperCase() === 'CANCELLED'
            ? 'Delivery stopped because the order was cancelled.'
            : 'Package delivered to the selected address.',
        icon: order.status.toUpperCase() === 'CANCELLED' ? 'circle-x' : 'house',
        completed: ['DELIVERED', 'COMPLETED'].includes(order.status.toUpperCase()),
        current: stage === 3,
        timestamp: this.addHours(placedAt, 48)
      }
    ];
  }

  private statusStage(status: string): number {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
      case 'COMPLETED':
      case 'CANCELLED':
        return 3;
      default:
        return 0;
    }
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }
}
