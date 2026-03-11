import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Cart, CartItem } from '../models/cart.model';

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_AMOUNT = 10;
const TAX_RATE = 0.08;

export interface GuestCartProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
  stockQuantity: number;
}

interface GuestCartStoredItem {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  unitPrice: number;
  stockQuantity: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class GuestCartStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'guest_cart';
  private readonly cartState = signal<Cart>(this.readCart());

  readonly cart = this.cartState.asReadonly();
  readonly itemCount = computed(() =>
    this.cartState().items.reduce((sum, item) => sum + item.quantity, 0)
  );

  sync(): Cart {
    const cart = this.readCart();
    this.cartState.set(cart);
    return cart;
  }

  addItem(product: GuestCartProduct, quantity: number): Cart {
    const items = this.readItems();
    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stockQuantity);
      existing.unitPrice = this.round(product.unitPrice);
      existing.imageUrl = product.imageUrl;
      existing.productName = product.name;
      existing.productSlug = product.slug;
    } else {
      items.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.imageUrl,
        unitPrice: this.round(product.unitPrice),
        stockQuantity: product.stockQuantity,
        quantity: Math.min(quantity, product.stockQuantity)
      });
    }

    return this.saveItems(items.filter((item) => item.quantity > 0));
  }

  updateItem(itemId: string, quantity: number): Cart {
    const items = this.readItems()
      .map((item) =>
        item.productId === itemId
          ? { ...item, quantity: Math.min(Math.max(quantity, 0), item.stockQuantity) }
          : item
      )
      .filter((item) => item.quantity > 0);

    return this.saveItems(items);
  }

  removeItem(itemId: string): Cart {
    return this.saveItems(this.readItems().filter((item) => item.productId !== itemId));
  }

  clear(): Cart {
    return this.saveItems([]);
  }

  checkoutItems(): Array<{ productId: string; quantity: number }> {
    return this.readItems().map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }));
  }

  private saveItems(items: GuestCartStoredItem[]): Cart {
    if (isPlatformBrowser(this.platformId)) {
      if (items.length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    }

    const cart = this.buildCart(items);
    this.cartState.set(cart);
    return cart;
  }

  private readCart(): Cart {
    return this.buildCart(this.readItems());
  }

  private readItems(): GuestCartStoredItem[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => item && typeof item.productId === 'string' && typeof item.quantity === 'number')
        .map((item) => ({
          productId: item.productId,
          productName: item.productName ?? '',
          productSlug: item.productSlug ?? '',
          imageUrl: item.imageUrl ?? null,
          unitPrice: this.round(Number(item.unitPrice) || 0),
          stockQuantity: Math.max(1, Number(item.stockQuantity) || 1),
          quantity: Math.max(1, Number(item.quantity) || 1)
        }));
    } catch {
      return [];
    }
  }

  private buildCart(items: GuestCartStoredItem[]): Cart {
    const cartItems: CartItem[] = items.map((item) => ({
      id: item.productId,
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: this.round(item.unitPrice * item.quantity)
    }));

    const subtotal = this.round(cartItems.reduce((sum, item) => sum + item.lineTotal, 0));
    const discountAmount = 0;
    const shippingAmount =
      subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_AMOUNT;
    const taxAmount = this.round((subtotal - discountAmount) * TAX_RATE);
    const totalAmount = this.round(subtotal - discountAmount + shippingAmount + taxAmount);

    return {
      id: 'guest-cart',
      status: 'ACTIVE',
      items: cartItems,
      couponCode: null,
      subtotal,
      discountAmount,
      shippingAmount,
      taxAmount,
      totalAmount,
      updatedAt: new Date().toISOString()
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
