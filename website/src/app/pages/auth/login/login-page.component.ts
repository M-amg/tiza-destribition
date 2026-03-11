import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);

  email = '';
  password = '';
  rememberMe = false;
  loading = false;
  errorMessage = '';

  submit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authState
      .login({ email: this.email.trim(), password: this.password })
      .subscribe({
        next: () => {
          this.loading = false;
          const redirect =
            this.route.snapshot.queryParamMap.get('redirect') || this.authState.accountRoute();
          this.router.navigateByUrl(redirect);
        },
        error: () => {
          this.errorMessage = this.i18n.t('auth.login.invalidCredentials');
          this.loading = false;
        }
      });
  }

  socialLogin(provider: 'Google' | 'Facebook'): void {
    this.errorMessage = this.i18n.t('auth.login.providerDisabled', { provider });
  }
}
