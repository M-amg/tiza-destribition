import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Edit, LucideAngularModule, Plus, Search, Trash2 } from 'lucide-angular/src/icons';

import { AdminCatalogApiService } from '../admin-catalog-api.service';
import { ApiProductSummary } from '../admin-catalog-api.models';
import { AdminProduct } from '../admin.models';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent implements OnInit {
  readonly iconPlus = Plus;
  readonly iconSearch = Search;
  readonly iconEdit = Edit;
  readonly iconTrash = Trash2;

  searchTerm = '';
  categoryFilter = 'all';
  stockFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' = 'all';
  statusFilter: 'all' | 'active' | 'disabled' = 'all';
  priceView: 'B2C' | 'B2B' = 'B2C';

  loading = true;
  deletingId: string | null = null;
  errorMessage = '';

  products: AdminProduct[] = [];

  constructor(private readonly catalogApi: AdminCatalogApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get categories() {
    return [...new Set(this.products.map((product) => product.category))];
  }

  get filteredProducts() {
    return this.products.filter((product) => {
      const query = this.searchTerm.toLowerCase();
      const matchesSearch =
        !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);

      const matchesCategory = this.categoryFilter === 'all' || product.category === this.categoryFilter;

      const matchesStock =
        this.stockFilter === 'all' ||
        (this.stockFilter === 'in_stock' && product.stockQuantity > product.minimumStockLevel) ||
        (this.stockFilter === 'low_stock' &&
          product.stockQuantity > 0 &&
          product.stockQuantity <= product.minimumStockLevel) ||
        (this.stockFilter === 'out_of_stock' && product.stockQuantity <= 0);

      const matchesStatus = this.statusFilter === 'all' || product.status === this.statusFilter;

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });
  }

  setPriceView(value: 'B2C' | 'B2B'): void {
    this.priceView = value;
  }

  getStockStatus(product: AdminProduct) {
    if (product.stockQuantity <= 0) {
      return { label: 'Out of Stock', className: 'chip chip-danger' };
    }

    if (product.stockQuantity <= product.minimumStockLevel) {
      return { label: 'Low Stock', className: 'chip chip-warning' };
    }

    return { label: 'In Stock', className: 'chip chip-success' };
  }

  getPrice(product: AdminProduct): number {
    return this.priceView === 'B2C' ? product.b2cPrice : product.b2bPrice;
  }

  deleteProduct(product: AdminProduct): void {
    if (this.deletingId || !window.confirm(`Delete "${product.name}"?`)) {
      return;
    }

    this.deletingId = product.id;
    this.catalogApi.deleteProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter((item) => item.id !== product.id);
        this.deletingId = null;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to delete product.';
        this.deletingId = null;
      }
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.catalogApi.allProducts().subscribe({
      next: (response) => {
        this.products = response.map((item) => this.mapApiProduct(item));
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load products.';
        this.loading = false;
      }
    });
  }

  private mapApiProduct(item: ApiProductSummary): AdminProduct {
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.shortDescription ?? '',
      category: item.categoryName,
      brand: item.brand,
      sku: item.sku,
      featured: item.featured,
      isNew: item.isNew,
      stockQuantity: item.stockQuantity,
      minimumStockLevel: item.minimumStockLevel,
      costPrice: Number(item.costPrice ?? 0),
      b2cPrice: Number(item.b2cPrice ?? 0),
      b2bPrice: Number(item.b2bPrice ?? 0),
      status: item.status === 'ACTIVE' ? 'active' : 'disabled',
      updatedDate: item.updatedAt ? item.updatedAt.slice(0, 10) : '',
      image:
        item.imageUrl ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
    };
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
