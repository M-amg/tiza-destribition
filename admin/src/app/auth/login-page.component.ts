import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LogIn, LucideAngularModule } from 'lucide-angular/src/icons';

import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  readonly iconLogin = LogIn;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  submitting = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    if (this.auth.hasValidAccessToken() && this.auth.hasAdminAccess()) {
      void this.router.navigateByUrl('/');
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';
    if (this.form.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        if (!this.auth.hasAdminAccess()) {
          this.submitting = false;
          this.auth.clearSession();
          this.errorMessage = 'This account does not have admin access.';
          return;
        }

        this.submitting = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.submitting = false;
        const apiMessage = error.error?.message?.trim();
        this.errorMessage = apiMessage || error.message || 'Unable to login. Please try again.';
      }
    });
  }
}
