import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css'
})
export class ForgotPasswordPageComponent {
  private readonly authState = inject(AuthStateService);
  private readonly i18n = inject(I18nService);

  email = '';
  loading = false;
  message = '';
  errorMessage = '';

  submit(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.authState.forgotPassword({ email: this.email.trim() }).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18n.t('auth.forgotPassword.error');
        this.loading = false;
      }
    });
  }
}
