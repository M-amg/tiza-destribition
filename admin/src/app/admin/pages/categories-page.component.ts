import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ArrowDown, ArrowUp, Edit, LucideAngularModule, Plus, Trash2 } from 'lucide-angular/src/icons';

import { AdminCatalogApiService } from '../admin-catalog-api.service';
import { ApiCategory, ApiCategoryUpsertRequest } from '../admin-catalog-api.models';

@Component({
  selector: 'app-categories-page',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss'
})
export class CategoriesPageComponent implements OnInit {
  readonly iconPlus = Plus;
  readonly iconEdit = Edit;
  readonly iconTrash = Trash2;
  readonly iconArrowUp = ArrowUp;
  readonly iconArrowDown = ArrowDown;
  readonly fallbackImage = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop';

  private readonly catalogApi = inject(AdminCatalogApiService);

  categories: ApiCategory[] = [];
  loading = true;
  deletingId: string | null = null;
  reorderingId: string | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  get totalProducts(): number {
    return this.categories.reduce((sum, category) => sum + Number(category.productCount ?? 0), 0);
  }

  get averageProductsPerCategory(): number {
    if (!this.categories.length) {
      return 0;
    }

    return Math.round(this.totalProducts / this.categories.length);
  }

  deleteCategory(category: ApiCategory): void {
    if (this.deletingId || this.reorderingId || !window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    this.deletingId = category.id;
    this.errorMessage = '';

    this.catalogApi.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((item) => item.id !== category.id);
        this.deletingId = null;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to delete category.';
        this.deletingId = null;
      }
    });
  }

  imageFor(category: ApiCategory): string {
    return category.imageUrl || this.fallbackImage;
  }

  statusLabel(category: ApiCategory): string {
    return (category.status || 'ACTIVE').toLowerCase();
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  canMoveUp(index: number): boolean {
    return index > 0 && !this.reorderingId;
  }

  canMoveDown(index: number): boolean {
    return index < this.categories.length - 1 && !this.reorderingId;
  }

  moveCategory(index: number, direction: 'up' | 'down'): void {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.categories.length || this.reorderingId || this.deletingId) {
      return;
    }

    const reorderedCategories = [...this.categories];
    const [current] = reorderedCategories.splice(index, 1);
    reorderedCategories.splice(targetIndex, 0, current);

    this.reorderingId = current.id;
    this.errorMessage = '';

    forkJoin(
      reorderedCategories.map((category, orderIndex) =>
        this.catalogApi.updateCategory(category.id, this.toReorderPayload(category, orderIndex))
      )
    ).subscribe({
      next: () => {
        this.reorderingId = null;
        this.loadCategories();
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to reorder categories.';
        this.reorderingId = null;
      }
    });
  }

  private loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.catalogApi.allCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load categories.';
        this.loading = false;
      }
    });
  }

  private toReorderPayload(category: ApiCategory, sortOrder: number): ApiCategoryUpsertRequest {
    return {
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      sortOrder: Math.max(0, sortOrder),
      status: category.status ?? 'ACTIVE',
      parentId: category.parentId ?? null
    };
  }
}
