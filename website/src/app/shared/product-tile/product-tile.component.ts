import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CartItem } from '../../core/models/cart.model';
import { ProductSummary } from '../../core/models/catalog.model';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-tile',
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './product-tile.component.html',
  styleUrl: './product-tile.component.css'
})
export class ProductTileComponent {
  private readonly authState = inject(AuthStateService);
  private readonly cartService = inject(CartService);

  readonly product = input.required<ProductSummary>();
  readonly isB2B = this.authState.isB2B;

  incrementQuantity(event: Event): void {
    this.stopNavigation(event);

    this.cartService
      .addProduct(this.product(), 1)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  decrementQuantity(event: Event): void {
    this.stopNavigation(event);

    const cartItem = this.cartItem();
    if (!cartItem) {
      return;
    }

    const nextQuantity = cartItem.quantity - 1;
    const request$ =
      nextQuantity <= 0
        ? this.cartService.removeItem(cartItem.id)
        : this.cartService.updateItem(cartItem.id, { quantity: nextQuantity });

    request$.pipe(catchError(() => of(null))).subscribe();
  }

  setQuantity(event: Event): void {
    this.stopNavigation(event);

    const input = event.target as HTMLInputElement;
    const quantity = this.normalizeQuantity(Number.parseInt(input.value, 10));
    const cartItem = this.cartItem();

    if (!cartItem && quantity > 0) {
      this.cartService
        .addProduct(this.product(), quantity)
        .pipe(catchError(() => of(null)))
        .subscribe();
      return;
    }

    if (!cartItem || quantity === cartItem.quantity) {
      return;
    }

    const request$ =
      quantity <= 0
        ? this.cartService.removeItem(cartItem.id)
        : this.cartService.updateItem(cartItem.id, { quantity });

    request$.pipe(catchError(() => of(null))).subscribe();
  }

  stopNavigation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  quantityInCart(): number {
    return this.cartItem()?.quantity ?? 0;
  }

  displayPrice(product: ProductSummary): number {
    return this.isB2B() ? product.b2bPrice : product.b2cPrice;
  }

  savingsAmount(product: ProductSummary): number {
    if (!this.isB2B()) {
      return 0;
    }
    return Math.max(0, product.b2cPrice - product.b2bPrice);
  }

  savingsPercent(product: ProductSummary): number {
    const savings = this.savingsAmount(product);
    if (savings <= 0 || product.b2cPrice <= 0) {
      return 0;
    }
    return Math.round((savings / product.b2cPrice) * 100);
  }

  ratingStars(product: ProductSummary): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < Math.floor(product.rating));
  }

  private cartItem(): CartItem | null {
    return this.cartService.cart()?.items.find((item) => item.productId === this.product().id) ?? null;
  }

  private normalizeQuantity(value: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }

    return Math.min(this.product().stockQuantity, Math.floor(value));
  }
}
