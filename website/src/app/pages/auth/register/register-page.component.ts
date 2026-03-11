import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { RegisterRequest } from '../../../core/services/auth-api.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

type CustomerType = 'B2C' | 'B2B';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  step = 1;
  loading = false;
  errorMessage = '';
  helperMessage = '';
  customerType: CustomerType | null = null;

  form: RegisterRequest = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    customerType: 'B2C',
    phone: '',
    companyName: '',
    taxId: '',
    address: '',
    city: ''
  };

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const source = params.get('source');
    if (source === 'checkout') {
      this.customerType = 'B2C';
      this.step = 2;
      this.helperMessage = this.i18n.t('auth.register.helperCheckout');
      this.form = {
        ...this.form,
        fullName: params.get('fullName') ?? '',
        email: params.get('email') ?? '',
        phone: params.get('phone') ?? '',
        address: params.get('address') ?? '',
        city: params.get('city') ?? '',
        customerType: 'B2C'
      };
    }
  }

  setCustomerType(type: CustomerType): void {
    this.customerType = type;
    this.form.customerType = type;
  }

  nextFromStepOne(): void {
    if (!this.customerType) {
      return;
    }
    this.step = 2;
  }

  backToStepOne(): void {
    this.step = 1;
  }

  backToStepTwo(): void {
    this.step = 2;
  }

  nextFromStepTwo(): void {
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = this.i18n.t('auth.register.passwordsDoNotMatch');
      return;
    }

    this.errorMessage = '';

    if (this.customerType === 'B2B') {
      this.step = 3;
      return;
    }

    this.submit();
  }

  socialRegister(provider: 'Google' | 'Facebook'): void {
    this.errorMessage = this.i18n.t('auth.register.providerDisabled', { provider });
    this.router.navigate(['/complete-profile']);
  }

  submit(): void {
    if (!this.customerType) {
      this.errorMessage = this.i18n.t('auth.register.selectAccountType');
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = this.i18n.t('auth.register.passwordsDoNotMatch');
      return;
    }

    if (
      this.customerType === 'B2B' &&
      (!this.form.companyName || !this.form.taxId || !this.form.address || !this.form.city)
    ) {
      this.errorMessage = this.i18n.t('auth.register.b2bRequired');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload: RegisterRequest = {
      ...this.form,
      customerType: this.customerType
    };

    this.authState.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.authState.accountRoute());
      },
      error: () => {
        this.errorMessage = this.i18n.t('auth.register.failed');
        this.loading = false;
      }
    });
  }
}
