import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { switchMap } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ProductDetail, ProductSummary } from '../../core/models/catalog.model';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductTileComponent } from '../../shared/product-tile/product-tile.component';

@Component({
  selector: 'app-product-details-page',
  imports: [CommonModule, RouterLink, ProductTileComponent, LucideAngularModule, TranslatePipe],
  templateUrl: './product-details-page.component.html',
  styleUrl: './product-details-page.component.css'
})
export class ProductDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly authState = inject(AuthStateService);
  private readonly i18n = inject(I18nService);

  readonly isB2B = this.authState.isB2B;

  product: ProductDetail | null = null;
  relatedProducts: ProductSummary[] = [];
  loading = true;
  quantity = 1;
  selectedImageIndex = 0;
  selectedTab: 'description' | 'specifications' | 'reviews' = 'description';

  readonly reviewSamples = computed(() => [
    {
      initials: 'JS',
      name: 'John Smith',
      rating: 5,
      comment: this.i18n.t('product.review1')
    },
    {
      initials: 'SJ',
      name: 'Sarah Johnson',
      rating: 4,
      comment: this.i18n.t('product.review2')
    }
  ]);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          this.loading = true;
          return this.catalogService.getProductBySlug(slug);
        })
      )
      .subscribe({
        next: (product) => {
          this.product = product;
          this.selectedImageIndex = 0;
          this.quantity = 1;
          this.selectedTab = 'description';
          this.loading = false;
          this.loadRelatedProducts(product.category.id, product.id);
        },
        error: () => {
          this.product = null;
          this.relatedProducts = [];
          this.loading = false;
        }
      });
  }

  decrement(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  increment(): void {
    if (!this.product) {
      return;
    }
    this.quantity = Math.min(this.product.stockQuantity, this.quantity + 1);
  }

  displayPrice(product: ProductDetail): number {
    return this.isB2B() ? product.b2bPrice : product.b2cPrice;
  }

  savingsAmount(product: ProductDetail): number {
    if (!this.isB2B()) {
      return 0;
    }
    return Math.max(0, product.b2cPrice - product.b2bPrice);
  }

  savingsPercent(product: ProductDetail): number {
    const savings = this.savingsAmount(product);
    if (savings <= 0 || product.b2cPrice <= 0) {
      return 0;
    }
    return Math.round((savings / product.b2cPrice) * 100);
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.cartService.addProduct(this.product, this.quantity).subscribe();
  }

  ratingStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < Math.floor(rating));
  }

  reviewStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, index) => index);
  }

  private loadRelatedProducts(categoryId: string, currentProductId: string): void {
    this.catalogService.listProducts(categoryId).subscribe({
      next: (products) => {
        this.relatedProducts = products.filter((product) => product.id !== currentProductId).slice(0, 4);
      },
      error: () => {
        this.relatedProducts = [];
      }
    });
  }
}
