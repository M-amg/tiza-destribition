import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Eye, LucideAngularModule, Search } from 'lucide-angular/src/icons';

import { AdminOrdersApiService } from '../admin-orders-api.service';
import { AdminOrderView, mapApiOrderToView, UiOrderStatus, UiPaymentStatus } from '../admin-orders-api.models';

@Component({
  selector: 'app-orders-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent implements OnInit {
  readonly iconSearch = Search;
  readonly iconEye = Eye;

  private readonly ordersApi = inject(AdminOrdersApiService);

  loading = true;
  errorMessage = '';
  orders: AdminOrderView[] = [];

  searchTerm = '';
  statusFilter: 'all' | UiOrderStatus = 'all';
  paymentFilter: 'all' | UiPaymentStatus = 'all';
  customerTypeFilter: 'all' | 'B2B' | 'B2C' = 'all';

  ngOnInit(): void {
    this.loadOrders();
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

  get filteredOrders() {
    return this.orders.filter((order) => {
      const query = this.searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query);

      const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
      const matchesPayment = this.paymentFilter === 'all' || order.paymentStatus === this.paymentFilter;
      const matchesCustomerType = this.customerTypeFilter === 'all' || order.customerType === this.customerTypeFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesCustomerType;
    });
  }

  get allOrdersCount(): number {
    return this.orders.length;
  }

  get pendingCount(): number {
    return this.orders.filter((item) => item.status === 'pending').length;
  }

  get processingCount(): number {
    return this.orders.filter((item) => item.status === 'processing').length;
  }

  get shippedCount(): number {
    return this.orders.filter((item) => item.status === 'shipped').length;
  }

  get deliveredCount(): number {
    return this.orders.filter((item) => item.status === 'delivered').length;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ordersApi.allOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map(mapApiOrderToView);
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load orders.';
        this.loading = false;
      }
    });
  }
}
