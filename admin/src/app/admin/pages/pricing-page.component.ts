import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminDataService } from '../admin-data.service';

@Component({
  selector: 'app-pricing-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing-page.component.html',
  styleUrl: './pricing-page.component.scss'
})
export class PricingPageComponent {
  selectedAdjustmentType: 'percentage' | 'fixed' = 'percentage';
  adjustmentValue = 0;
  applyToSegment: 'B2B' | 'B2C' | 'both' = 'both';
  applied = false;

  constructor(public data: AdminDataService) {}

  get averageMargin(): number {
    const margins = this.data.products.map((product) => ((product.b2cPrice - product.costPrice) / product.costPrice) * 100);
    return margins.reduce((sum, value) => sum + value, 0) / margins.length;
  }

  applyAdjustment(): void {
    this.applied = true;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
