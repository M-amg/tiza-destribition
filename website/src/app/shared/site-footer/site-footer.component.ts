import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { AuthStateService } from '../../core/services/auth-state.service';
import { StorefrontSettingsService } from '../../core/services/storefront-settings.service';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css'
})
export class SiteFooterComponent {
  private readonly authState = inject(AuthStateService);
  private readonly storefrontSettings = inject(StorefrontSettingsService);

  readonly year = new Date().getFullYear();
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
      businessHours: ['Monday - Friday: 8:00 AM - 6:00 PM'],
      facebookUrl: null,
      instagramUrl: null,
      linkedinUrl: null,
      twitterUrl: null
    }
  });

  accountOrdersRoute(): string {
    return this.authState.accountRoute('orders');
  }
}
