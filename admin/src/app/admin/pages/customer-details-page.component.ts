import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Eye,
  LucideAngularModule,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  User
} from 'lucide-angular/src/icons';

import { AdminCustomersApiService } from '../admin-customers-api.service';
import { AdminCustomerView, mapApiCustomerToView } from '../admin-customers-api.models';
import { AdminOrderView, UiOrderStatus, mapApiOrderToView } from '../admin-orders-api.models';

@Component({
  selector: 'app-customer-details-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './customer-details-page.component.html',
  styleUrl: './customer-details-page.component.scss'
})
export class CustomerDetailsPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconMail = Mail;
  readonly iconPhone = Phone;
  readonly iconMapPin = MapPin;
  readonly iconCalendar = Calendar;
  readonly iconDollar = DollarSign;
  readonly iconOrders = ShoppingBag;
  readonly iconUser = User;
  readonly iconEye = Eye;

  private readonly route = inject(ActivatedRoute);
  private readonly customersApi = inject(AdminCustomersApiService);

  readonly customerId = this.route.snapshot.paramMap.get('id');
  customer?: AdminCustomerView;
  orders: AdminOrderView[] = [];

  loading = true;
  errorMessage = '';
  savingType = false;

  selectedType: 'B2B' | 'B2C' = 'B2C';
  savedType = false;

  ngOnInit(): void {
    this.loadCustomer();
    this.loadOrders();
  }

  readonly statusChipClass: Record<UiOrderStatus, string> = {
    pending: 'chip chip-warning',
    processing: 'chip chip-brand',
    shipped: 'chip chip-brand',
    delivered: 'chip chip-success',
    cancelled: 'chip chip-danger'
  };

  get averageOrderValue(): number {
    if (!this.customer || this.customer.totalOrders <= 0) {
      return 0;
    }

    return this.customer.totalSpent / this.customer.totalOrders;
  }

  get formattedJoinDate(): string {
    if (!this.customer) {
      return '';
    }

    return new Date(this.customer.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  saveCustomerType(): void {
    if (!this.customerId || this.savingType) {
      return;
    }

    this.savingType = true;
    this.errorMessage = '';

    this.customersApi.updateCustomerType(this.customerId, this.selectedType).subscribe({
      next: (customer) => {
        this.customer = mapApiCustomerToView(customer);
        this.selectedType = this.customer.customerType;
        this.savingType = false;
        this.savedType = true;
        setTimeout(() => {
          this.savedType = false;
        }, 1800);
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to update customer type.';
        this.savingType = false;
      }
    });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadCustomer(): void {
    if (!this.customerId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.customersApi.customerById(this.customerId).subscribe({
      next: (customer) => {
        this.customer = mapApiCustomerToView(customer);
        this.selectedType = this.customer.customerType;
        this.loading = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.errorMessage =
          error.status === 404 ? 'Customer not found.' : error.error?.message ?? 'Failed to load customer.';
        this.loading = false;
      }
    });
  }

  private loadOrders(): void {
    if (!this.customerId) {
      return;
    }

    this.customersApi.ordersByCustomer(this.customerId).subscribe({
      next: (orders) => {
        this.orders = orders.map(mapApiOrderToView);
      }
    });
  }
}
