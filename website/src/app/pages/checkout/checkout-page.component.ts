import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Address } from '../../core/models/address.model';
import { Cart } from '../../core/models/cart.model';
import { AddressService } from '../../core/services/address.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService, CheckoutRequest } from '../../core/services/cart.service';
import { StorefrontSettingsService } from '../../core/services/storefront-settings.service';

type PaymentMethod = 'CARD' | 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
}

interface CheckoutForm {
  recipientName: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent {
  private readonly cartService = inject(CartService);
  private readonly addressService = inject(AddressService);
  private readonly authState = inject(AuthStateService);
  private readonly storefrontSettings = inject(StorefrontSettingsService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly steps = computed(() => [
    { number: 1, title: this.i18n.t('checkout.customerStep') },
    { number: 2, title: this.i18n.t('checkout.deliveryStep') },
    { number: 3, title: this.i18n.t('checkout.paymentStep') },
    { number: 4, title: this.i18n.t('checkout.reviewStep') }
  ]);
  readonly paymentMethods = computed<PaymentMethodOption[]>(() =>
    this.paymentMethodValues.map((value) => ({
      value,
      label: this.i18n.t(`checkout.payment.${this.paymentKey(value)}.label`),
      description: this.i18n.t(`checkout.payment.${this.paymentKey(value)}.description`)
    }))
  );

  cart: Cart | null = null;
  addresses: Address[] = [];
  selectedAddressId = '';
  loading = true;
  submitting = false;
  creatingAccount = false;
  accountCreationRequested = false;
  checkoutResult:
    | {
        orderNumber: string;
        invoiceNumber: string;
        canCreateAccount: boolean;
        registrationEmail: string | null;
        registrationFullName: string | null;
        registrationPhone: string | null;
      }
    | null = null;
  errorMessage = '';
  accountErrorMessage = '';
  currentStep = 1;
  paymentMethodValues: PaymentMethod[] = [];
  createAccountAfterOrder = false;
  accountPassword = '';
  accountConfirmPassword = '';
  accountCreated = false;

  form: CheckoutForm = {
    recipientName: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: '',
    paymentMethod: 'CASH',
    notes: ''
  };

  constructor() {
    forkJoin({
      cart: this.cartService.getMyCart(),
      addresses: this.authState.hasAccessToken()
        ? this.addressService.listMyAddresses()
        : of([] as Address[]),
      settings: this.storefrontSettings.getPublicSettings()
    }).subscribe({
      next: ({ cart, addresses, settings }) => {
        this.cart = cart;
        this.addresses = addresses;
        this.paymentMethodValues = this.resolvePaymentMethods(settings);
        if (!this.paymentMethodValues.some((method) => method === this.form.paymentMethod)) {
          this.form.paymentMethod = this.paymentMethodValues[0] ?? 'CASH';
        }
        const defaultAddress = addresses.find((address) => address.defaultShipping) ?? addresses[0];
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
          this.applyAddress(defaultAddress);
        }
        this.loading = false;
      },
      error: () => {
        this.paymentMethodValues = ['CASH'];
        this.loading = false;
      }
    });
  }

  get hasCartItems(): boolean {
    return Boolean(this.cart && this.cart.items.length > 0);
  }

  onAddressChange(addressId: string): void {
    this.selectedAddressId = addressId;
    const address = this.addresses.find((item) => item.id === addressId);
    if (address) {
      this.applyAddress(address);
    }
  }

  nextStep(): void {
    this.currentStep = Math.min(4, this.currentStep + 1);
  }

  prevStep(): void {
    this.currentStep = Math.max(1, this.currentStep - 1);
  }

  submitOrNext(): void {
    if (this.currentStep < 4) {
      if (this.currentStep === 1 && !this.validateAccountOption()) {
        return;
      }
      this.nextStep();
      return;
    }

    this.placeOrder();
  }

  placeOrder(): void {
    if (!this.cart || this.cart.items.length === 0) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.accountCreated = false;
    this.accountCreationRequested = false;
    this.creatingAccount = false;
    this.accountErrorMessage = '';

    const request: CheckoutRequest = {
      recipientName: this.form.recipientName,
      phone: this.form.phone,
      email: this.form.email,
      addressLine1: this.form.addressLine1,
      city: this.form.city,
      paymentMethod: this.form.paymentMethod,
      notes: this.form.notes
    };

    this.cartService.checkout(request).subscribe({
      next: (response) => {
        this.checkoutResult = {
          orderNumber: response.orderNumber,
          invoiceNumber: response.invoiceNumber,
          canCreateAccount: response.canCreateAccount,
          registrationEmail: response.registrationEmail,
          registrationFullName: response.registrationFullName,
          registrationPhone: response.registrationPhone
        };
        this.submitting = false;

        if (this.createAccountAfterOrder) {
          this.accountCreationRequested = true;

          if (response.canCreateAccount) {
            this.createAccountAfterCheckout(true);
          } else {
            this.accountErrorMessage = this.i18n.t('checkout.accountAlreadyExists');
          }
        }
      },
      error: () => {
        this.errorMessage = this.i18n.t('checkout.unablePlaceOrder');
        this.submitting = false;
      }
    });
  }

  goToDashboardOrders(): void {
    this.router.navigate([this.authState.hasAccessToken() ? this.authState.accountRoute('orders') : '/shop']);
  }

  paymentMethodLabel(value: PaymentMethod): string {
    return this.paymentMethods().find((method) => method.value === value)?.label ?? value;
  }

  createAccountAfterCheckout(autoCreate = false): void {
    if (
      !this.checkoutResult?.canCreateAccount ||
      !this.checkoutResult.registrationEmail ||
      !this.validateAccountOption()
    ) {
      return;
    }

    this.creatingAccount = true;
    this.accountErrorMessage = '';

    this.authState
      .register({
        fullName: this.checkoutResult.registrationFullName ?? this.form.recipientName,
        email: this.checkoutResult.registrationEmail,
        password: this.accountPassword,
        confirmPassword: this.accountConfirmPassword,
        customerType: 'B2C',
        phone: this.checkoutResult.registrationPhone ?? this.form.phone,
        address: this.form.addressLine1,
        city: this.form.city
      })
      .subscribe({
        next: () => {
          this.finishAccountCreation();
        },
        error: () => {
          this.recoverCreatedAccountSession(autoCreate);
        }
      });
  }

  showAccountCreationPanel(): boolean {
    return this.accountCreationRequested && Boolean(this.checkoutResult);
  }

  showAccountCreatedMessage(): boolean {
    return this.accountCreationRequested && this.accountCreated && this.isAuthenticated();
  }

  existingAccountWarning(): boolean {
    return (
      this.showAccountCreationPanel() &&
      Boolean(this.checkoutResult) &&
      !this.checkoutResult!.canCreateAccount
    );
  }

  canRetryAccountCreation(): boolean {
    return (
      this.showAccountCreationPanel() &&
      !this.accountCreated &&
      !this.creatingAccount &&
      Boolean(this.accountErrorMessage) &&
      Boolean(this.checkoutResult?.canCreateAccount)
    );
  }

  clearAccountOption(): void {
    if (this.createAccountAfterOrder) {
      return;
    }

    this.accountPassword = '';
    this.accountConfirmPassword = '';
    this.accountErrorMessage = '';
    this.accountCreated = false;
    this.accountCreationRequested = false;
  }

  onCreateAccountToggle(): void {
    this.clearAccountOption();
  }

  signInInstead(): void {
    if (!this.checkoutResult?.registrationEmail) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/login'], {
      queryParams: {
        email: this.checkoutResult.registrationEmail
      }
    });
  }

  private validateAccountOption(): boolean {
    if (this.isAuthenticated() || !this.createAccountAfterOrder) {
      this.accountErrorMessage = '';
      return true;
    }

    if (this.accountPassword.trim().length < 8) {
      this.accountErrorMessage = this.i18n.t('checkout.passwordTooShort');
      return false;
    }

    if (this.accountPassword !== this.accountConfirmPassword) {
      this.accountErrorMessage = this.i18n.t('checkout.passwordsDoNotMatch');
      return false;
    }

    this.accountErrorMessage = '';
    return true;
  }

  private applyAddress(address: Address): void {
    this.form = {
      ...this.form,
      recipientName: address.recipientName,
      phone: address.phone ?? '',
      addressLine1: address.addressLine1,
      city: address.city
    };
  }

  private resolvePaymentMethods(settings: Record<string, string>): PaymentMethod[] {
    const allValues: PaymentMethod[] = ['CASH', 'CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'];
    const raw = settings['checkout.enabled_payment_methods'];
    if (raw == null) {
      return ['CASH'];
    }

    const enabled = raw
      .replace(/\[|\]|"/g, '')
      .split(',')
      .map((value) => value.trim())
      .filter((value): value is PaymentMethod => Boolean(value));

    const visible = allValues.filter((method) => enabled.includes(method));
    return visible;
  }

  private finishAccountCreation(): void {
    this.creatingAccount = false;
    this.accountCreated = true;
    this.accountErrorMessage = '';
    this.authState.refreshProfile();
    this.router.navigateByUrl(this.authState.accountRoute('orders'));
  }

  private recoverCreatedAccountSession(autoCreate: boolean): void {
    const email = this.checkoutResult?.registrationEmail;
    if (!email) {
      this.creatingAccount = false;
      this.accountErrorMessage = autoCreate
        ? this.i18n.t('checkout.autoCreateFailed')
        : this.i18n.t('checkout.createAccountFailed');
      return;
    }

    this.authState
      .login({
        email,
        password: this.accountPassword
      })
      .subscribe({
        next: () => {
          this.finishAccountCreation();
        },
        error: () => {
          this.creatingAccount = false;
          this.accountErrorMessage = autoCreate
            ? this.i18n.t('checkout.autoCreateFailed')
            : this.i18n.t('checkout.createAccountFailed');
        }
      });
  }

  private paymentKey(value: PaymentMethod): string {
    switch (value) {
      case 'BANK_TRANSFER':
        return 'bank';
      case 'DIGITAL_WALLET':
        return 'wallet';
      case 'CARD':
        return 'card';
      default:
        return 'cash';
    }
  }
}
