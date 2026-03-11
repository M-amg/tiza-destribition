import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, TranslatePipe],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly isB2B = this.authState.isB2B;
  readonly user = this.authState.user;
  readonly customerType = this.authState.customerType;

  mobileOpen = false;

  readonly navItems = computed(() => {
    const baseRoute = this.authState.accountBaseRoute();
    const base = [
      {
        label: this.isB2B() ? this.i18n.t('common.dashboard') : 'Profile',
        path: baseRoute,
        icon: this.isB2B() ? 'layout-dashboard' : 'user',
        key: 'D'
      },
      {
        label: this.i18n.t('common.dashboardOrders'),
        path: `${baseRoute}/orders`,
        icon: 'shopping-bag',
        key: 'O'
      }
    ];

    if (this.isB2B()) {
      base.push({
        label: this.i18n.t('common.companyProfile'),
        path: `${baseRoute}/company`,
        icon: 'building-2',
        key: 'C'
      });
      base.push({
        label: this.i18n.t('common.invoices'),
        path: `${baseRoute}/invoices`,
        icon: 'file-text',
        key: 'I'
      });
    }

    return base;
  });

  logout(): void {
    this.authState.logout(false);
    this.router.navigate(['/login']);
  }
}
