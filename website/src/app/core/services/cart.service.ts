import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ProductDetail, ProductSummary } from '../models/catalog.model';
import { Cart, CheckoutResponse } from '../models/cart.model';
import { AuthStateService } from './auth-state.service';
import { API_BASE_URL } from './api.config';
import { CatalogService } from './catalog.service';
import { GuestCartProduct, GuestCartStorageService } from './guest-cart-storage.service';

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyCouponRequest {
  code: string;
}

export interface CheckoutRequest {
  recipientName?: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentMethod: 'CARD' | 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly catalogService = inject(CatalogService);
  private readonly guestCartStorage = inject(GuestCartStorageService);
  private readonly cartBase = `${API_BASE_URL}/cart`;
  private readonly addEventVersion = signal(0);
  private readonly cartState = signal<Cart | null>(
    this.authState.hasAccessToken() ? null : this.guestCartStorage.sync()
  );

  readonly cart = this.cartState.asReadonly();
  readonly addEvents = this.addEventVersion.asReadonly();
  readonly itemCount = computed(() =>
    (this.cartState()?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
  );

  getMyCart(): Observable<Cart> {
    if (this.authState.hasAccessToken()) {
      return this.http.get<Cart>(this.cartBase).pipe(tap((cart) => this.cartState.set(cart)));
    }

    const cart = this.guestCartStorage.sync();
    this.cartState.set(cart);
    return of(cart);
  }

  addProduct(product: ProductSummary | ProductDetail, quantity: number): Observable<Cart> {
    if (this.authState.hasAccessToken()) {
      return this.addItem({ productId: product.id, quantity });
    }

    const cart = this.guestCartStorage.addItem(this.toGuestProduct(product), quantity);
    this.cartState.set(cart);
    this.notifyProductAdded();
    return of(cart);
  }

  addItem(request: AddCartItemRequest): Observable<Cart> {
    if (this.authState.hasAccessToken()) {
      return this.http
        .post<Cart>(`${this.cartBase}/items`, request)
        .pipe(
          tap((cart) => {
            this.cartState.set(cart);
            this.notifyProductAdded();
          })
        );
    }

    return this.catalogService.getProductById(request.productId).pipe(
      map((product) => {
        const cart = this.guestCartStorage.addItem(this.toGuestProduct(product), request.quantity);
        this.cartState.set(cart);
        this.notifyProductAdded();
        return cart;
      })
    );
  }

  updateItem(itemId: string, request: UpdateCartItemRequest): Observable<Cart> {
    if (this.authState.hasAccessToken()) {
      return this.http
        .put<Cart>(`${this.cartBase}/items/${itemId}`, request)
        .pipe(tap((cart) => this.cartState.set(cart)));
    }

    const cart = this.guestCartStorage.updateItem(itemId, request.quantity);
    this.cartState.set(cart);
    return of(cart);
  }

  removeItem(itemId: string): Observable<Cart> {
    if (this.authState.hasAccessToken()) {
      return this.http
        .delete<Cart>(`${this.cartBase}/items/${itemId}`)
        .pipe(tap((cart) => this.cartState.set(cart)));
    }

    const cart = this.guestCartStorage.removeItem(itemId);
    this.cartState.set(cart);
    return of(cart);
  }

  applyCoupon(request: ApplyCouponRequest): Observable<Cart> {
    if (!this.authState.hasAccessToken()) {
      return throwError(() => new Error('Coupons require an account.'));
    }

    return this.http.post<Cart>(`${this.cartBase}/coupon`, request).pipe(tap((cart) => this.cartState.set(cart)));
  }

  removeCoupon(): Observable<Cart> {
    if (!this.authState.hasAccessToken()) {
      const cart = this.guestCartStorage.sync();
      this.cartState.set(cart);
      return of(cart);
    }

    return this.http.delete<Cart>(`${this.cartBase}/coupon`).pipe(tap((cart) => this.cartState.set(cart)));
  }

  clearCart(): Observable<Cart> {
    if (this.authState.hasAccessToken()) {
      return this.http.delete<Cart>(this.cartBase).pipe(tap((cart) => this.cartState.set(cart)));
    }

    const cart = this.guestCartStorage.clear();
    this.cartState.set(cart);
    return of(cart);
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    if (this.authState.hasAccessToken()) {
      return this.http.post<CheckoutResponse>(`${this.cartBase}/checkout`, request).pipe(
        tap(() => {
          this.cartState.set(null);
        })
      );
    }

    const items = this.guestCartStorage.checkoutItems();
    if (items.length === 0) {
      return throwError(() => new Error('Cart is empty.'));
    }

    return this.http
      .post<CheckoutResponse>(`${this.cartBase}/guest-checkout`, {
        ...request,
        items
      })
      .pipe(
        tap(() => {
          const emptyCart = this.guestCartStorage.clear();
          this.cartState.set(emptyCart);
        })
      );
  }

  refreshCart(): void {
    this.getMyCart()
      .pipe(
        catchError(() => {
          this.cartState.set(this.authState.hasAccessToken() ? null : this.guestCartStorage.sync());
          return of(null);
        })
      )
      .subscribe();
  }

  private toGuestProduct(product: ProductSummary | ProductDetail): GuestCartProduct {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: 'imageUrl' in product ? product.imageUrl : product.images[0] ?? null,
      unitPrice: product.b2cPrice,
      stockQuantity: product.stockQuantity
    };
  }

  private notifyProductAdded(): void {
    this.addEventVersion.update((value) => value + 1);
  }
}
