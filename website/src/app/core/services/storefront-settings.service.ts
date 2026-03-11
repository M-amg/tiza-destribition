import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { StorefrontInfo } from '../models/storefront-info.model';
import { HomePagePromo } from '../models/home-page-promo.model';

@Injectable({ providedIn: 'root' })
export class StorefrontSettingsService {
  private readonly http = inject(HttpClient);
  private readonly publicSettings$ = this.http
    .get<Record<string, string>>(`${API_BASE_URL}/settings/public`)
    .pipe(catchError(() => of({} as Record<string, string>)))
    .pipe(shareReplay(1));

  getPublicSettings(): Observable<Record<string, string>> {
    return this.publicSettings$;
  }

  getStorefrontInfo(): Observable<StorefrontInfo> {
    return this.getPublicSettings().pipe(map((settings) => this.toStorefrontInfo(settings)));
  }

  getHomePagePromo(): Observable<HomePagePromo> {
    return this.getPublicSettings().pipe(map((settings) => this.toHomePagePromo(settings)));
  }

  private toStorefrontInfo(settings: Record<string, string>): StorefrontInfo {
    const address = this.setting(settings, ['company.address', 'store.address', 'contact.address'], '123 Distribution Ave, Suite 100');
    const addressLines = this.multilineSetting(address);
    const businessHours = this.multilineSetting(
      this.setting(
        settings,
        ['company.business_hours', 'store.business_hours', 'contact.business_hours'],
        'Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed'
      )
    );

    return {
      name: this.setting(settings, ['company.name', 'store.name', 'brand.name'], 'Tiza Distribution'),
      tagline: this.setting(settings, ['company.tagline', 'store.tagline', 'brand.tagline'], 'Your Trusted Partner'),
      announcement: this.normalizeCurrencyText(
        this.setting(settings, ['store.announcement', 'header.announcement'], 'Free shipping on orders over 1000 DH')
      ),
      logoUrl: this.optionalSetting(settings, ['company.logo_url', 'store.logo_url', 'brand.logo_url', 'store.logo']),
      phone: this.setting(settings, ['company.phone', 'store.phone', 'contact.phone'], '+1 (555) 123-4567'),
      salesPhone: this.optionalSetting(settings, ['company.sales_phone', 'store.sales_phone', 'contact.sales_phone']),
      supportPhone: this.optionalSetting(settings, ['company.support_phone', 'store.support_phone', 'contact.support_phone']),
      email: this.setting(settings, ['company.email', 'store.email', 'contact.email'], 'info@tizadistribution.com'),
      salesEmail: this.optionalSetting(settings, ['company.sales_email', 'store.sales_email', 'contact.sales_email']),
      supportEmail: this.optionalSetting(settings, ['company.support_email', 'store.support_email', 'contact.support_email']),
      address,
      addressLines,
      businessHours,
      facebookUrl: this.optionalSetting(settings, ['company.facebook_url', 'store.facebook_url', 'social.facebook_url']),
      instagramUrl: this.optionalSetting(settings, ['company.instagram_url', 'store.instagram_url', 'social.instagram_url']),
      linkedinUrl: this.optionalSetting(settings, ['company.linkedin_url', 'store.linkedin_url', 'social.linkedin_url']),
      twitterUrl: this.optionalSetting(settings, ['company.twitter_url', 'store.twitter_url', 'social.twitter_url'])
    };
  }

  private toHomePagePromo(settings: Record<string, string>): HomePagePromo {
    return {
      enabled: this.booleanSetting(settings, ['homepage.promo.enabled'], true),
      badge: this.setting(settings, ['homepage.promo.badge'], 'Limited Time Offer'),
      title: this.setting(settings, ['homepage.promo.title'], 'Refresh your catalog with stronger weekly offers'),
      description: this.setting(
        settings,
        ['homepage.promo.description'],
        'Use the new homepage design to surface promotions, featured products, and customer trust signals more clearly.'
      ),
      buttonLabel: this.setting(settings, ['homepage.promo.button_label'], 'Browse Promotions'),
      buttonLink: this.setting(settings, ['homepage.promo.button_link'], '/shop'),
      imageUrl: this.setting(
        settings,
        ['homepage.promo.image_url'],
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
      ),
      imageAlt: this.setting(settings, ['homepage.promo.image_alt'], 'Fresh vegetables')
    };
  }

  private setting(settings: Record<string, string>, keys: string[], fallback: string): string {
    return this.optionalSetting(settings, keys) ?? fallback;
  }

  private optionalSetting(settings: Record<string, string>, keys: string[]): string | null {
    for (const key of keys) {
      const value = settings[key]?.trim();
      if (value) {
        return value;
      }
    }

    return null;
  }

  private multilineSetting(value: string): string[] {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private booleanSetting(settings: Record<string, string>, keys: string[], fallback: boolean): boolean {
    const value = this.optionalSetting(settings, keys);
    if (!value) {
      return fallback;
    }

    return value.trim().toLowerCase() === 'true';
  }

  private normalizeCurrencyText(value: string): string {
    return value
      .replace(/\$\s*([0-9]+(?:[.,][0-9]+)?)/g, '$1 DH')
      .replace(/\bUSD\b/g, 'DH')
      .replace(/\$\s*/g, 'DH ');
  }
}
