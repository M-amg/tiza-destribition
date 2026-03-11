import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Cart, CartItem } from '../../core/models/cart.model';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly cartService = inject(CartService);
  private readonly i18n = inject(I18nService);

  readonly isAuthenticated = this.authState.isAuthenticated;
  cart: Cart | null = null;
  loading = true;
  couponCode = '';
  errorMessage = '';

  constructor() {
    this.loadCart();
  }

  get isEmpty(): boolean {
    return !this.cart || this.cart.items.length === 0;
  }

  get freeShippingRemaining(): number {
    if (!this.cart) {
      return 0;
    }
    return Math.max(0, 100 - this.cart.subtotal);
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item.id);
      return;
    }

    this.cartService.updateItem(item.id, { quantity }).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = this.i18n.t('cart.errorUpdate');
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = this.i18n.t('cart.errorRemove');
      }
    });
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) {
      return;
    }

    this.cartService.applyCoupon({ code }).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.couponCode = '';
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = this.i18n.t('cart.errorCoupon');
      }
    });
  }

  removeCoupon(): void {
    this.cartService.removeCoupon().subscribe({
      next: (cart) => {
        this.cart = cart;
      }
    });
  }
}
