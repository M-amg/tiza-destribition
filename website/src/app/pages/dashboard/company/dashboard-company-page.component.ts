import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Address } from '../../../core/models/address.model';
import { AddressRequest, AddressService } from '../../../core/services/address.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-dashboard-company-page',
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './dashboard-company-page.component.html',
  styleUrl: './dashboard-company-page.component.css'
})
export class DashboardCompanyPageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly addressService = inject(AddressService);
  private readonly i18n = inject(I18nService);

  readonly user = this.authState.user;
  readonly isB2B = this.authState.isB2B;

  loading = true;
  saving = false;
  message = '';
  errorMessage = '';

  addresses: Address[] = [];
  selectedAddressId = '';

  companyName = '';
  taxId = '';

  form: AddressRequest = {
    label: 'Company HQ',
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
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.addressService.listMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        const defaultAddress = addresses.find((address) => address.defaultShipping) ?? addresses[0] ?? null;
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
          this.fillForm(defaultAddress);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onAddressChange(addressId: string): void {
    this.selectedAddressId = addressId;
    const address = this.addresses.find((item) => item.id === addressId);
    if (address) {
      this.fillForm(address);
    }
  }

  saveAddress(): void {
    this.saving = true;
    this.message = '';
    this.errorMessage = '';

    const selected = this.addresses.find((item) => item.id === this.selectedAddressId);
    const request = {
      ...this.form,
      label: this.companyName.trim() || this.form.label || 'Company HQ'
    };

    const save$ = selected
      ? this.addressService.updateAddress(selected.id, request)
      : this.addressService.createAddress(request);

    save$.subscribe({
      next: () => {
        this.message = this.i18n.t('dashboard.company.saved');
        this.saving = false;
        this.loadAddresses();
      },
      error: () => {
        this.errorMessage = this.i18n.t('dashboard.company.error');
        this.saving = false;
      }
    });
  }

  cancelChanges(): void {
    if (!this.selectedAddressId) {
      return;
    }
    const current = this.addresses.find((address) => address.id === this.selectedAddressId);
    if (current) {
      this.fillForm(current);
    }
    this.message = '';
    this.errorMessage = '';
  }

  private fillForm(address: Address): void {
    this.companyName = address.label ?? '';
    this.form = {
      label: address.label ?? 'Company HQ',
      recipientName: address.recipientName,
      phone: address.phone ?? '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      state: address.state ?? '',
      zipCode: address.zipCode ?? '',
      country: address.country,
      defaultShipping: address.defaultShipping,
      defaultBilling: address.defaultBilling
    };
  }
}
