import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ContactService } from '../../core/services/contact.service';
import { StorefrontSettingsService } from '../../core/services/storefront-settings.service';

@Component({
  selector: 'app-contact-page',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css'
})
export class ContactPageComponent {
  private readonly contactService = inject(ContactService);
  private readonly storefrontSettings = inject(StorefrontSettingsService);
  private readonly i18n = inject(I18nService);

  loading = false;
  successMessage = '';
  errorMessage = '';
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

  form = {
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  submit(): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.contactService.sendMessage(this.form).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loading = false;
        this.form = {
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        };
      },
      error: () => {
        this.errorMessage = this.i18n.t('contact.error');
        this.loading = false;
      }
    });
  }
}
