import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, forkJoin, of } from 'rxjs';
import { Category, ProductSummary } from '../../core/models/catalog.model';
import { HomePagePromo } from '../../core/models/home-page-promo.model';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { StorefrontSettingsService } from '../../core/services/storefront-settings.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly authState = inject(AuthStateService);
  private readonly cartService = inject(CartService);
  private readonly storefrontSettings = inject(StorefrontSettingsService);

  categories: Category[] = [];
  products: ProductSummary[] = [];
  homePromo?: HomePagePromo;
  loading = true;
  readonly isB2B = this.authState.isB2B;
  readonly heroStats = [
    { value: '2k+', label: 'products ready to ship' },
    { value: '24h', label: 'fast delivery in key cities' },
    { value: '98%', label: 'repeat customer satisfaction' }
  ];
  readonly serviceHighlights = [
    {
      icon: 'truck',
      title: 'Fast Delivery',
      description: 'Reliable drop-off for homes, stores, and wholesale customers.'
    },
    {
      icon: 'shield',
      title: 'Secure Payment',
      description: 'Trusted checkout flow with clear totals and order confirmation.'
    },
    {
      icon: 'rotate-ccw',
      title: 'Easy Follow-up',
      description: 'Track every order and stay updated from your customer space.'
    },
    {
      icon: 'headphones',
      title: 'Real Support',
      description: 'Talk to the team when you need help with shipping or products.'
    }
  ];

  constructor() {
    forkJoin({
      categories: this.catalogService.listCategories(),
      products: this.catalogService.listProducts(),
      homePromo: this.storefrontSettings.getHomePagePromo()
    }).subscribe({
      next: ({ categories, products, homePromo }) => {
        this.categories = categories;
        this.products = products;
        this.homePromo = homePromo;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get featuredProducts(): ProductSummary[] {
    const selected = this.products.filter((product) => product.featured);
    if (selected.length > 0) {
      return [...selected].slice(0, 10);
    }

    return [...this.products]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 10);
  }

  get newArrivals(): ProductSummary[] {
    const selected = this.products.filter((product) => product.isNew);
    if (selected.length > 0) {
      return [...selected].slice(0, 10);
    }

    return [...this.products].slice(0, 10);
  }

  get spotlightCategories(): Category[] {
    return [...this.categories].slice(0, 8);
  }

  addToCart(product: ProductSummary): void {
    this.cartService
      .addProduct(product, 1)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  displayPrice(product: ProductSummary): number {
    return this.isB2B() ? product.b2bPrice : product.b2cPrice;
  }

  hasSavings(product: ProductSummary): boolean {
    return product.b2cPrice > product.b2bPrice;
  }

  savingsPercent(product: ProductSummary): number {
    if (!this.hasSavings(product)) {
      return 0;
    }

    return Math.round(((product.b2cPrice - product.b2bPrice) / product.b2cPrice) * 100);
  }

  ratingStars(product: ProductSummary): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < Math.round(product.rating));
  }

  categoryCount(category: Category): string {
    const count = category.productCount ?? 0;
    return `${count}+ items`;
  }

  isInternalLink(link: string): boolean {
    return link.startsWith('/');
  }
}
