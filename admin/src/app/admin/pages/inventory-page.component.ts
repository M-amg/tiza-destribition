import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertTriangle,
  LucideAngularModule,
  Package,
  Search,
  TrendingDown
} from 'lucide-angular/src/icons';
import { forkJoin } from 'rxjs';

import {
  InventoryStatusView,
  InventoryViewItem,
  StockHistoryChangeType,
  StockHistoryView,
  mapMovementToHistory,
  mapProductsToInventory
} from '../admin-inventory-api.models';
import { AdminInventoryApiService } from '../admin-inventory-api.service';
import { AdminCatalogApiService } from '../admin-catalog-api.service';

@Component({
  selector: 'app-inventory-page',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss'
})
export class InventoryPageComponent implements OnInit {
  readonly iconPackage = Package;
  readonly iconAlertTriangle = AlertTriangle;
  readonly iconTrendingDown = TrendingDown;
  readonly iconSearch = Search;

  activeTab: 'inventory' | 'history' = 'inventory';
  searchTerm = '';
  statusFilter: 'all' | InventoryStatusView = 'all';

  loading = true;
  errorMessage = '';
  successMessage = '';
  restockingProductId: string | null = null;

  inventoryItems: InventoryViewItem[] = [];
  stockHistory: StockHistoryView[] = [];

  constructor(
    private readonly catalogApi: AdminCatalogApiService,
    private readonly inventoryApi: AdminInventoryApiService
  ) {}

  ngOnInit(): void {
    this.loadInventoryData();
  }

  get filteredInventory(): InventoryViewItem[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.inventoryItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.productName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);

      const matchesStatus = this.statusFilter === 'all' || item.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get inStockCount(): number {
    return this.inventoryItems.filter((item) => item.status === 'in_stock').length;
  }

  get lowStockCount(): number {
    return this.inventoryItems.filter((item) => item.status === 'low_stock').length;
  }

  get outOfStockCount(): number {
    return this.inventoryItems.filter((item) => item.status === 'out_of_stock').length;
  }

  setActiveTab(tab: 'inventory' | 'history'): void {
    this.activeTab = tab;
  }

  restockProduct(item: InventoryViewItem): void {
    if (this.restockingProductId) {
      return;
    }

    const rawQuantity = window.prompt(`Restock quantity for "${item.productName}"`, '1');
    if (rawQuantity === null) {
      return;
    }

    const quantity = Number(rawQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      this.errorMessage = 'Restock quantity must be a positive integer.';
      this.successMessage = '';
      return;
    }

    const rawNote = window.prompt('Restock note (optional)', 'Restocked from admin panel');
    const note = rawNote?.trim() || null;

    this.restockingProductId = item.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.inventoryApi
      .adjustStock({
        productId: item.productId,
        quantityChange: quantity,
        note
      })
      .subscribe({
        next: () => {
          this.successMessage = `"${item.productName}" restocked by ${quantity}.`;
          this.loadInventoryData(true);
          this.restockingProductId = null;
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage = error.error?.message ?? 'Failed to update stock.';
          this.restockingProductId = null;
        }
      });
  }

  formatInventoryStatus(status: InventoryStatusView): string {
    return status.replace('_', ' ');
  }

  formatChangeType(changeType: StockHistoryChangeType): string {
    return changeType.replace('_', ' ');
  }

  inventoryStatusClass(status: InventoryStatusView): string {
    if (status === 'in_stock') {
      return 'chip chip-status chip-success';
    }

    if (status === 'low_stock') {
      return 'chip chip-status chip-warning';
    }

    return 'chip chip-status chip-danger';
  }

  historyTypeClass(changeType: StockHistoryChangeType): string {
    if (changeType === 'restock') {
      return 'chip chip-outline type-restock';
    }

    if (changeType === 'sale') {
      return 'chip chip-outline type-sale';
    }

    if (changeType === 'return') {
      return 'chip chip-outline type-return';
    }

    return 'chip chip-outline type-adjustment';
  }

  quantityLabel(value: number): string {
    return value > 0 ? `+${value}` : String(value);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadInventoryData(silent = false): void {
    if (!silent) {
      this.loading = true;
    }

    forkJoin({
      products: this.catalogApi.allProducts(),
      movements: this.inventoryApi.allMovements()
    }).subscribe({
      next: ({ products, movements }) => {
        this.inventoryItems = mapProductsToInventory(products, movements);
        this.stockHistory = movements
          .map((movement) => mapMovementToHistory(movement))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.errorMessage = '';
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }
}
