import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Order } from '../../../core/models/order.model';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-dashboard-orders-page',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './dashboard-orders-page.component.html',
  styleUrl: './dashboard-orders-page.component.css'
})
export class DashboardOrdersPageComponent {
  private readonly orderService = inject(OrderService);
  private readonly authState = inject(AuthStateService);

  readonly isB2B = this.authState.isB2B;

  loading = true;
  orders: Order[] = [];

  searchTerm = '';
  statusFilter = 'all';

  constructor() {
    this.orderService.listMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get availableStatuses(): string[] {
    return ['all', ...new Set(this.orders.map((order) => order.status.toLowerCase()))];
  }

  get filteredOrders(): Order[] {
    return this.orders
      .filter((order) => {
        const search = this.searchTerm.toLowerCase();
        const matchesSearch = order.orderNumber.toLowerCase().includes(search);
        const matchesStatus =
          this.statusFilter === 'all' || order.status.toLowerCase() === this.statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }

  get totalSpent(): number {
    return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  get totalSavings(): number {
    return this.orders.reduce((sum, order) => sum + (order.couponDiscount ?? 0), 0);
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
}
