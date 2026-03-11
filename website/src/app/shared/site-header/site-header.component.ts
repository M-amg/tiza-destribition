import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { AppLanguage } from '../../core/i18n/i18n.model';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CartItem } from '../../core/models/cart.model';
import { Category } from '../../core/models/catalog.model';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { StorefrontSettingsService } from '../../core/services/storefront-settings.service';

interface HeaderLanguageOption {
  code: AppLanguage;
  label: string;
  name: string;
  flagSrc: string;
}

@Component({
  selector: 'app-site-header',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.css'
})
export class SiteHeaderComponent {
  private static readonly DESKTOP_MIN_WIDTH = 1200;
  private static readonly MOBILE_MAX_WIDTH = 767;
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly storefrontSettings = inject(StorefrontSettingsService);

  readonly i18n = inject(I18nService);
  readonly user = this.authState.user;
  readonly isLoggedIn = this.authState.isAuthenticated;
  readonly cart = this.cartService.cart;
  readonly cartCount = this.cartService.itemCount;
  readonly cartAddEvents = this.cartService.addEvents;
  readonly cartItems = computed(() => this.cart()?.items ?? []);
  readonly categories = toSignal(this.catalogService.listCategories().pipe(catchError(() => of([]))), {
    initialValue: [] as Category[]
  });
  readonly topCategories = computed(() => this.categories().slice(0, 6));

  readonly mobileOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly languageMenuOpen = signal(false);
  readonly mobileLanguageMenuOpen = signal(false);
  readonly cartDrawerOpen = signal(false);
  readonly cartDrawerLoading = signal(false);
  readonly couponOpen = signal(false);

  readonly languageOptions: HeaderLanguageOption[] = this.i18n.languages.map((language) => ({
    code: language.code,
    label: language.label,
    name: this.languageName(language.code),
    flagSrc: this.flagSrc(language.code)
  }));

  readonly currentLanguage = computed(
    () => this.languageOptions.find((language) => language.code === this.i18n.language()) ?? this.languageOptions[0]
  );

  readonly storeInfo = toSignal(this.storefrontSettings.getStorefrontInfo(), {
    initialValue: {
      name: 'Tiza Distribution',
      tagline: 'Your Trusted Partner',
      announcement: 'Free shipping on orders over 1000 DH',
      logoUrl: null,
      phone: '+1 (555) 123-4567',
      salesPhone: null,
      supportPhone: null,
      email: 'info@tizadistribution.com',
      salesEmail: null,
      supportEmail: null,
      address: '123 Distribution Ave, Suite 100',
      addressLines: ['123 Distribution Ave, Suite 100'],
      businessHours: [],
      facebookUrl: null,
      instagramUrl: null,
      linkedinUrl: null,
      twitterUrl: null
    }
  });

  searchTerm = '';
  couponCode = '';
  cartErrorMessage = '';

  constructor() {
    effect(() => {
      this.isLoggedIn();
      this.refreshCartCount();
    });

    effect(() => {
      if (this.cartAddEvents() === 0) {
        return;
      }

      if (this.isMobileViewport()) {
        return;
      }

      this.openCartDrawer();
    });

    effect((onCleanup) => {
      if (!this.cartDrawerOpen()) {
        this.document.body.classList.remove('mini-cart-desktop-open');
        return;
      }

      const body = this.document.body;
      const syncViewportState = () => {
        if (this.isDesktopDockedViewport()) {
          body.classList.add('mini-cart-desktop-open');
          body.style.overflow = '';
          return;
        }

        body.classList.remove('mini-cart-desktop-open');
        body.style.overflow = 'hidden';
      };

      const previousOverflow = body.style.overflow;
      syncViewportState();

      const viewport = this.document.defaultView;
      viewport?.addEventListener('resize', syncViewportState);

      onCleanup(() => {
        viewport?.removeEventListener('resize', syncViewportState);
        body.classList.remove('mini-cart-desktop-open');
        body.style.overflow = previousOverflow;
      });
    });

    effect((onCleanup) => {
      const body = this.document.body;
      const syncMobileCartBar = () => {
        const shouldShowMobileBar = this.isMobileViewport() && this.cartCount() > 0 && !this.cartDrawerOpen();
        body.classList.toggle('mobile-cart-bar-visible', shouldShowMobileBar);
      };

      syncMobileCartBar();

      const viewport = this.document.defaultView;
      viewport?.addEventListener('resize', syncMobileCartBar);

      onCleanup(() => {
        viewport?.removeEventListener('resize', syncMobileCartBar);
        body.classList.remove('mobile-cart-bar-visible');
      });
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim();
    void this.router.navigate(['/shop'], {
      queryParams: term ? { q: term } : {}
    });
    this.mobileOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileOpen.update((open) => !open);
    this.userMenuOpen.set(false);
    this.languageMenuOpen.set(false);
    this.cartDrawerOpen.set(false);
  }

  closeMobileMenu(): void {
    this.mobileOpen.set(false);
    this.mobileLanguageMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
    this.languageMenuOpen.set(false);
    this.mobileOpen.set(false);
  }

  onUserButtonClick(): void {
    if (this.authState.hasAccessToken()) {
      this.closeUserMenu();
      this.closeMobileMenu();
      this.authState.refreshProfile();
      void this.router.navigateByUrl(this.authState.accountRoute());
      return;
    }

    this.toggleUserMenu();
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  setLanguage(language: AppLanguage): void {
    this.i18n.setLanguage(language);
    this.languageMenuOpen.set(false);
    this.mobileLanguageMenuOpen.set(false);
  }

  toggleLanguageMenu(): void {
    this.languageMenuOpen.update((open) => !open);
    this.userMenuOpen.set(false);
  }

  toggleMobileLanguageMenu(): void {
    this.mobileLanguageMenuOpen.update((open) => !open);
  }

  openCartDrawer(): void {
    this.cartDrawerOpen.set(true);
    this.mobileOpen.set(false);
    this.userMenuOpen.set(false);
    this.languageMenuOpen.set(false);
    this.mobileLanguageMenuOpen.set(false);
    this.loadCartForDrawer();
  }

  closeCartDrawer(): void {
    this.cartDrawerOpen.set(false);
    this.couponOpen.set(false);
    this.cartErrorMessage = '';
  }

  toggleCoupon(): void {
    this.couponOpen.update((open) => !open);
    this.cartErrorMessage = '';
  }

  updateCartQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeCartItem(item.id);
      return;
    }

    this.cartService.updateItem(item.id, { quantity }).subscribe({
      next: () => {
        this.cartErrorMessage = '';
      },
      error: () => {
        this.cartErrorMessage = this.i18n.t('cart.errorUpdate');
      }
    });
  }

  removeCartItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        this.cartErrorMessage = '';
      },
      error: () => {
        this.cartErrorMessage = this.i18n.t('cart.errorRemove');
      }
    });
  }

  applyCouponFromDrawer(): void {
    const code = this.couponCode.trim();
    if (!code) {
      return;
    }

    if (!this.isLoggedIn()) {
      this.cartErrorMessage = this.i18n.t('cart.signInCoupon');
      return;
    }

    this.cartService.applyCoupon({ code }).subscribe({
      next: () => {
        this.couponCode = '';
        this.cartErrorMessage = '';
      },
      error: () => {
        this.cartErrorMessage = this.i18n.t('cart.errorCoupon');
      }
    });
  }

  removeCouponFromDrawer(): void {
    this.cartService.removeCoupon().subscribe({
      next: () => {
        this.cartErrorMessage = '';
      },
      error: () => {
        this.cartErrorMessage = this.i18n.t('cart.errorCoupon');
      }
    });
  }

  viewCart(): void {
    this.closeCartDrawer();
    void this.router.navigate(['/cart']);
  }

  viewProduct(item: CartItem): void {
    this.closeCartDrawer();
    void this.router.navigate(['/product', item.productSlug]);
  }

  logout(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.closeCartDrawer();
    this.authState.logout();
  }

  accountRoute(): string {
    return this.authState.accountRoute();
  }

  brandInitial(): string {
    return this.storeInfo().name.trim().charAt(0).toUpperCase() || 'T';
  }

  brandLabel(): string {
    const firstWord = this.storeInfo().name.trim().split(/\s+/)[0];
    return (firstWord || 'Tiza').toUpperCase();
  }

  private loadCartForDrawer(): void {
    this.cartDrawerLoading.set(true);
    this.cartService
      .getMyCart()
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.cartDrawerLoading.set(false);
      });
  }

  private refreshCartCount(): void {
    this.cartService
      .getMyCart()
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private languageName(language: AppLanguage): string {
    switch (language) {
      case 'fr':
        return 'Francais';
      case 'en':
        return 'English';
      case 'ar':
        return 'Arabic';
    }
  }

  private flagSrc(language: AppLanguage): string {
    switch (language) {
      case 'fr':
        return 'assets/flags/fr.svg';
      case 'en':
        return 'assets/flags/us.svg';
      case 'ar':
        return 'assets/flags/ma.svg';
    }
  }

  private isDesktopDockedViewport(): boolean {
    return (this.document.defaultView?.innerWidth ?? 0) >= SiteHeaderComponent.DESKTOP_MIN_WIDTH;
  }

  private isMobileViewport(): boolean {
    return (this.document.defaultView?.innerWidth ?? 0) <= SiteHeaderComponent.MOBILE_MAX_WIDTH;
  }
}
