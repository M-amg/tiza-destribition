import { Routes } from '@angular/router';

import { LoginPageComponent } from './auth/login-page.component';
import { AdminShellComponent } from './admin/admin-shell.component';
import { DashboardPageComponent } from './admin/dashboard-page.component';
import { CategoriesPageComponent } from './admin/pages/categories-page.component';
import { CategoryFormPageComponent } from './admin/pages/category-form-page.component';
import { CouponDetailsPageComponent } from './admin/pages/coupon-details-page.component';
import { CouponFormPageComponent } from './admin/pages/coupon-form-page.component';
import { CouponsPageComponent } from './admin/pages/coupons-page.component';
import { CustomerDetailsPageComponent } from './admin/pages/customer-details-page.component';
import { CustomersPageComponent } from './admin/pages/customers-page.component';
import { InventoryPageComponent } from './admin/pages/inventory-page.component';
import { OrderDetailsPageComponent } from './admin/pages/order-details-page.component';
import { OrdersPageComponent } from './admin/pages/orders-page.component';
import { PricingPageComponent } from './admin/pages/pricing-page.component';
import { ProductFormPageComponent } from './admin/pages/product-form-page.component';
import { ProductsPageComponent } from './admin/pages/products-page.component';
import { ReportsPageComponent } from './admin/pages/reports-page.component';
import { SettingsPageComponent } from './admin/pages/settings-page.component';
import { UserFormPageComponent } from './admin/pages/user-form-page.component';
import { UsersPageComponent } from './admin/pages/users-page.component';
import { adminAuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    canActivate: [adminAuthGuard],
    component: AdminShellComponent,
    children: [
      { path: '', component: DashboardPageComponent },
      { path: 'products', component: ProductsPageComponent },
      { path: 'products/new', component: ProductFormPageComponent },
      { path: 'products/:id/edit', component: ProductFormPageComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: 'orders/:id', component: OrderDetailsPageComponent },
      { path: 'customers', component: CustomersPageComponent },
      { path: 'customers/:id', component: CustomerDetailsPageComponent },
      { path: 'coupons', component: CouponsPageComponent },
      { path: 'coupons/new', component: CouponFormPageComponent },
      { path: 'coupons/:id', component: CouponDetailsPageComponent },
      { path: 'coupons/:id/edit', component: CouponFormPageComponent },
      { path: 'inventory', component: InventoryPageComponent },
      { path: 'categories', component: CategoriesPageComponent },
      { path: 'categories/new', component: CategoryFormPageComponent },
      { path: 'categories/:id/edit', component: CategoryFormPageComponent },
      { path: 'pricing', component: PricingPageComponent },
      { path: 'reports', component: ReportsPageComponent },
      { path: 'users', component: UsersPageComponent },
      { path: 'users/new', component: UserFormPageComponent },
      { path: 'users/:id/edit', component: UserFormPageComponent },
      { path: 'settings', component: SettingsPageComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
