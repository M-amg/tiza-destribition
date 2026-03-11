import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Category, ProductSummary } from '../../core/models/catalog.model';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductTileComponent } from '../../shared/product-tile/product-tile.component';

@Component({
  selector: 'app-shop-page',
  imports: [CommonModule, FormsModule, ProductTileComponent, LucideAngularModule, TranslatePipe],
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.css'
})
export class ShopPageComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  categories: Category[] = [];
  products: ProductSummary[] = [];
  brands: string[] = [];
  loading = true;
  loadingMore = false;
  totalProducts = 0;
  hasMoreProducts = false;

  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  searchTerm = '';
  stockFilter: 'all' | 'inStock' | 'outOfStock' = 'all';
  sortBy: 'featured' | 'priceLow' | 'priceHigh' | 'newest' | 'rating' | 'stockHigh' | 'stockLow' = 'featured';
  priceRange: [number, number] = [0, 1000];
  readonly itemsPerBatch = 12;
  mobileFiltersOpen = false;
  private currentPage = 0;
  private loadMoreObserver: IntersectionObserver | null = null;

  @ViewChild('loadMoreSentinel')
  set loadMoreSentinel(element: ElementRef<HTMLDivElement> | undefined) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!element) {
      this.loadMoreObserver?.disconnect();
      return;
    }

    this.loadMoreObserver?.disconnect();
    this.loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.loadMoreProducts();
        }
      },
      { rootMargin: '400px 0px' }
    );
    this.loadMoreObserver.observe(element.nativeElement);
  }

  constructor() {
    this.loadCategories();

    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm = params.get('q') ?? '';
      const categoryParam = params.get('category');
      this.selectedCategories = categoryParam ? [categoryParam] : [];
      this.refreshCatalog();
    });
  }

  categoryLabelCount(categoryId: string): number {
    return this.categories.find((category) => category.id === categoryId)?.productCount ?? 0;
  }

  toggleCategory(categoryId: string): void {
    this.selectedCategories = this.selectedCategories.includes(categoryId)
      ? this.selectedCategories.filter((id) => id !== categoryId)
      : [...this.selectedCategories, categoryId];
    this.refreshCatalog();
  }

  toggleBrand(brand: string): void {
    this.selectedBrands = this.selectedBrands.includes(brand)
      ? this.selectedBrands.filter((value) => value !== brand)
      : [...this.selectedBrands, brand];
    this.fetchFirstPage();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.priceRange = [0, 1000];
    this.stockFilter = 'all';
    this.sortBy = 'featured';
    this.refreshCatalog();
  }

  loadMoreProducts(): void {
    if (this.loading || this.loadingMore || !this.hasMoreProducts) {
      return;
    }

    this.loadingMore = true;
    this.fetchPage(this.currentPage + 1);
  }

  private loadCategories(): void {
    this.catalogService.listCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  private refreshCatalog(): void {
    this.loadBrands(() => this.fetchFirstPage());
  }

  private loadBrands(onComplete?: () => void): void {
    this.catalogService.listBrands(this.selectedCategories).subscribe({
      next: (brands) => {
        this.brands = brands;
        this.selectedBrands = this.selectedBrands.filter((brand) => brands.includes(brand));
        onComplete?.();
      },
      error: () => {
        this.brands = [];
        this.selectedBrands = [];
        onComplete?.();
      }
    });
  }

  fetchFirstPage(): void {
    this.loading = true;
    this.loadingMore = false;
    this.currentPage = 0;
    this.products = [];
    this.totalProducts = 0;
    this.hasMoreProducts = false;
    this.fetchPage(0);
  }

  private fetchPage(page: number): void {
    this.catalogService.listProductsPage({
      categoryIds: this.selectedCategories,
      brands: this.selectedBrands,
      q: this.searchTerm,
      stock: this.stockFilter,
      minPrice: this.priceRange[0],
      maxPrice: this.priceRange[1],
      sortBy: this.sortBy,
      page,
      size: this.itemsPerBatch
    }).subscribe({
      next: (response) => {
        this.products = page === 0 ? response.items : [...this.products, ...response.items];
        this.currentPage = response.page;
        this.totalProducts = response.totalItems;
        this.hasMoreProducts = response.hasNext;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.products = [];
        this.totalProducts = 0;
        this.hasMoreProducts = false;
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }
}
