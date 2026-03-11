import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  LucideAngularModule,
  Mail,
  MapPin,
  Package,
  Phone,
  Tag,
  Truck,
  XCircle
} from 'lucide-angular/src/icons';

import { AdminCatalogApiService } from '../admin-catalog-api.service';
import { AdminOrdersApiService } from '../admin-orders-api.service';
import {
  AdminOrderView,
  OrderViewItem,
  UiOrderStatus,
  UiPaymentStatus,
  mapApiOrderToView,
  toApiOrderStatus
} from '../admin-orders-api.models';

@Component({
  selector: 'app-order-details-page',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './order-details-page.component.html',
  styleUrl: './order-details-page.component.scss'
})
export class OrderDetailsPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconCheck = CheckCircle;
  readonly iconClock = Clock;
  readonly iconTruck = Truck;
  readonly iconPackage = Package;
  readonly iconCancel = XCircle;
  readonly iconMail = Mail;
  readonly iconPhone = Phone;
  readonly iconMapPin = MapPin;
  readonly iconCard = CreditCard;
  readonly iconTag = Tag;

  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(AdminOrdersApiService);
  private readonly catalogApi = inject(AdminCatalogApiService);

  readonly orderId = this.route.snapshot.paramMap.get('id');
  order?: AdminOrderView;

  loading = true;
  savingStatus = false;
  errorMessage = '';

  currentStatus: UiOrderStatus = 'pending';
  private readonly productImageById: Record<string, string> = {};

  ngOnInit(): void {
    this.loadOrder();
    this.loadProductImages();
  }

  readonly statusChipClass: Record<UiOrderStatus, string> = {
    pending: 'chip chip-warning',
    processing: 'chip chip-brand',
    shipped: 'chip chip-brand',
    delivered: 'chip chip-success',
    cancelled: 'chip chip-danger'
  };

  readonly paymentChipClass: Record<UiPaymentStatus, string> = {
    paid: 'chip chip-success',
    pending: 'chip chip-warning',
    failed: 'chip chip-danger'
  };

  get formattedPlacedDate(): string {
    if (!this.order) {
      return '';
    }

    return new Date(this.order.placedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get customerPhone(): string {
    if (!this.order) {
      return '';
    }

    return this.order.customerPhone ?? '';
  }

  get paymentMethodLabel(): string {
    if (!this.order) {
      return '';
    }

    switch (this.order.paymentMethod) {
      case 'card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'digital_wallet':
        return 'Digital Wallet';
      default:
        return 'Cash';
    }
  }

  get canConfirm(): boolean {
    return this.currentStatus === 'pending';
  }

  get canMarkProcessing(): boolean {
    return this.currentStatus === 'processing';
  }

  get canMarkShipped(): boolean {
    return this.currentStatus === 'pending' || this.currentStatus === 'processing';
  }

  get canMarkDelivered(): boolean {
    return this.currentStatus === 'shipped';
  }

  get canCancel(): boolean {
    return this.currentStatus !== 'cancelled' && this.currentStatus !== 'delivered';
  }

  updateStatus(nextStatus: UiOrderStatus): void {
    if (!this.order || this.savingStatus) {
      return;
    }

    this.savingStatus = true;
    this.errorMessage = '';

    this.ordersApi
      .updateStatus(this.order.id, {
        status: toApiOrderStatus(nextStatus),
        note: null
      })
      .subscribe({
        next: (updatedOrder) => {
          this.order = mapApiOrderToView(updatedOrder);
          this.currentStatus = this.order.status;
          this.savingStatus = false;
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage = error.error?.message ?? 'Failed to update order status.';
          this.savingStatus = false;
        }
      });
  }

  cancelOrder(): void {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );

    if (confirmed) {
      this.updateStatus('cancelled');
    }
  }

  itemImage(item: OrderViewItem): string {
    return this.productImageById[item.productId] ?? 'https://via.placeholder.com/64x64?text=Item';
  }

  itemLineTotal(item: OrderViewItem): number {
    return item.lineTotal || item.price * item.quantity;
  }

  isProgressComplete(step: 'processing' | 'shipped' | 'delivered'): boolean {
    if (this.currentStatus === 'cancelled') {
      return false;
    }

    const level: Record<'pending' | 'processing' | 'shipped' | 'delivered', number> = {
      pending: 1,
      processing: 2,
      shipped: 3,
      delivered: 4
    };

    const stepLevel: Record<'processing' | 'shipped' | 'delivered', number> = {
      processing: 2,
      shipped: 3,
      delivered: 4
    };

    const statusLevel = level[this.currentStatus as 'pending' | 'processing' | 'shipped' | 'delivered'] ?? 0;
    return statusLevel >= stepLevel[step];
  }

  private loadOrder(): void {
    if (!this.orderId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.ordersApi.orderById(this.orderId).subscribe({
      next: (order) => {
        this.order = mapApiOrderToView(order);
        this.currentStatus = this.order.status;
        this.loading = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.errorMessage = error.status === 404 ? 'Order not found.' : error.error?.message ?? 'Failed to load order.';
        this.loading = false;
      }
    });
  }

  private loadProductImages(): void {
    this.catalogApi.allProducts().subscribe({
      next: (products) => {
        products.forEach((product) => {
          if (product.imageUrl) {
            this.productImageById[product.id] = product.imageUrl;
          }
        });
      }
    });
  }
}

