import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Address } from '../../core/models/address.model';
import { AddressRequest, AddressService } from '../../core/services/address.service';
import { AuthStateService } from '../../core/services/auth-state.service';

type CustomerType = 'B2C' | 'B2B';

@Component({
  selector: 'app-complete-profile-page',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './complete-profile-page.component.html',
  styleUrl: './complete-profile-page.component.css'
})
export class CompleteProfilePageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly addressService = inject(AddressService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly user = this.authState.user;

  loading = true;
  saving = false;
  message = '';
  errorMessage = '';

  existingAddress: Address | null = null;
  selectedCustomerType: CustomerType = 'B2C';
  companyName = '';
  taxId = '';

  form: AddressRequest = {
    label: 'Default',
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    defaultShipping: true,
    defaultBilling: true
  };

  constructor() {
    this.authState.refreshProfile();

    const user = this.user();
    if (user?.customerType === 'B2B') {
      this.selectedCustomerType = 'B2B';
    }

    this.addressService.listMyAddresses().subscribe({
      next: (addresses) => {
        const defaultAddress = addresses.find((address) => address.defaultShipping) ?? addresses[0] ?? null;
        if (defaultAddress) {
          this.existingAddress = defaultAddress;
          this.form = {
            label: defaultAddress.label ?? 'Default',
            recipientName: defaultAddress.recipientName,
            phone: defaultAddress.phone ?? '',
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress.addressLine2 ?? '',
            city: defaultAddress.city,
            state: defaultAddress.state ?? '',
            zipCode: defaultAddress.zipCode ?? '',
            country: defaultAddress.country,
            defaultShipping: defaultAddress.defaultShipping,
            defaultBilling: defaultAddress.defaultBilling
          };
        } else if (user?.fullName) {
          this.form.recipientName = user.fullName;
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setCustomerType(type: CustomerType): void {
    this.selectedCustomerType = type;
  }

  save(): void {
    this.saving = true;
    this.message = '';
    this.errorMessage = '';

    const payload: AddressRequest = {
      ...this.form,
      label:
        this.selectedCustomerType === 'B2B'
          ? this.companyName.trim() || this.form.label || 'Company HQ'
          : this.form.label || 'Default'
    };

    const save$ = this.existingAddress
      ? this.addressService.updateAddress(this.existingAddress.id, payload)
      : this.addressService.createAddress(payload);

    save$.subscribe({
      next: () => {
        this.message = this.i18n.t('profile.complete.saved');
        this.saving = false;
      },
      error: () => {
        this.errorMessage = this.i18n.t('profile.complete.error');
        this.saving = false;
      }
    });
  }

  continueToDashboard(): void {
    this.router.navigateByUrl(this.authState.accountRoute());
  }
}
