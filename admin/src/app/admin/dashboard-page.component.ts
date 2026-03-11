import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import {
  AlertTriangle,
  DollarSign,
  Eye,
  LucideAngularModule,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users
} from 'lucide-angular/src/icons';
import { BaseChartDirective } from 'ng2-charts';

import {
  adminCustomers,
  adminOrders,
  adminProducts,
  inventory,
  monthlyMetrics
} from './admin.mock-data';
import { OrderStatus, PaymentStatus } from './admin.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  readonly iconPlus = Plus;
  readonly iconCart = ShoppingCart;
  readonly iconMoney = DollarSign;
  readonly iconOrders = ShoppingCart;
  readonly iconAlert = AlertTriangle;
  readonly iconUsers = Users;
  readonly iconPackage = Package;
  readonly iconEye = Eye;
  readonly iconTrend = TrendingUp;

  readonly products = adminProducts;
  readonly orders = adminOrders;
  readonly customers = adminCustomers;
  readonly inventoryItems = inventory;
  readonly metrics = monthlyMetrics;
  readonly months = this.metrics.map((metric) => metric.month);

  readonly orderStatusClasses: Record<OrderStatus, string> = {
    pending: 'chip chip-warning',
    processing: 'chip chip-warning',
    shipped: 'chip chip-brand',
    delivered: 'chip chip-success',
    cancelled: 'chip chip-danger'
  };

  readonly paymentStatusClasses: Record<PaymentStatus, string> = {
    paid: 'chip chip-success',
    pending: 'chip chip-warning',
    failed: 'chip chip-danger'
  };

  readonly categoryDistribution = [
    { name: 'Electronics', value: 45, color: '#1E3A8A' },
    { name: 'Office Supplies', value: 30, color: '#F97316' },
    { name: 'Industrial', value: 15, color: '#10B981' },
    { name: 'Others', value: 10, color: '#6B7280' }
  ];

  readonly revenueBarData: ChartData<'bar'> = {
    labels: this.months,
    datasets: [
      {
        data: this.metrics.map((metric) => metric.revenue),
        backgroundColor: '#1E3A8A',
        borderRadius: 8
      }
    ]
  };

  readonly revenueBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${Number(context.parsed.y).toLocaleString()} DH`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#717182' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.08)' },
        ticks: { color: '#717182' }
      }
    }
  };

  readonly ordersLineData: ChartData<'line'> = {
    labels: this.months,
    datasets: [
      {
        data: this.metrics.map((metric) => metric.orders),
        borderColor: '#F97316',
        backgroundColor: '#F97316',
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#F97316',
        pointRadius: 4,
        pointHoverRadius: 5,
        borderWidth: 3,
        tension: 0.35,
        fill: false
      }
    ]
  };

  readonly ordersLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#717182' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.08)' },
        ticks: { color: '#717182' }
      }
    }
  };

  readonly categoryPieData: ChartData<'pie', number[], string> = {
    labels: this.categoryDistribution.map((category) => category.name),
    datasets: [
      {
        data: this.categoryDistribution.map((category) => category.value),
        backgroundColor: this.categoryDistribution.map((category) => category.color),
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  readonly categoryPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#717182',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${Number(context.parsed).toFixed(0)}%`
        }
      }
    }
  };

  get totalRevenue(): number {
    return this.orders
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + item.total, 0);
  }

  get pendingOrders(): number {
    return this.orders.filter((item) => item.status === 'pending').length;
  }

  get lowStockItems() {
    return this.inventoryItems.filter((item) => item.status !== 'in_stock');
  }

  get latestOrders() {
    return this.orders.slice(0, 5);
  }

  get recentCustomers() {
    return this.customers.slice(0, 6);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}

