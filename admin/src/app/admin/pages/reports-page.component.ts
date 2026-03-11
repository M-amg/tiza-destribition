import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AdminDataService } from '../admin-data.service';

@Component({
  selector: 'app-reports-page',
  imports: [CommonModule],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  constructor(public data: AdminDataService) {}

  get totalRevenue(): number {
    return this.data.orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
  }

  get averageOrder(): number {
    return this.totalRevenue / this.data.orders.length;
  }

  get maxRevenue(): number {
    return Math.max(...this.data.monthlyMetrics.map((item) => item.revenue));
  }
}
