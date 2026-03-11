import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const accountChildren: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/dashboard/home/dashboard-home-page.component').then(
        (m) => m.DashboardHomePageComponent
      )
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/dashboard/orders/dashboard-orders-page.component').then(
        (m) => m.DashboardOrdersPageComponent
      )
  },
  {
    path: 'company',
    loadComponent: () =>
      import('./pages/dashboard/company/dashboard-company-page.component').then(
        (m) => m.DashboardCompanyPageComponent
      )
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/dashboard/invoices/dashboard-invoices-page.component').then(
        (m) => m.DashboardInvoicesPageComponent
      )
  }
];

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/home/home-page.component').then((m) => m.HomePageComponent)
      },
      {
        path: 'shop',
        loadComponent: () =>
          import('./pages/shop/shop-page.component').then((m) => m.ShopPageComponent)
      },
      {
        path: 'product/:slug',
        loadComponent: () =>
          import('./pages/product-details/product-details-page.component').then(
            (m) => m.ProductDetailsPageComponent
          )
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart-page.component').then((m) => m.CartPageComponent)
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./pages/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent)
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/login/login-page.component').then((m) => m.LoginPageComponent)
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/register/register-page.component').then((m) => m.RegisterPageComponent)
      },
      {
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/forgot-password/forgot-password-page.component').then(
            (m) => m.ForgotPasswordPageComponent
          )
      },
      {
        path: 'complete-profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/complete-profile/complete-profile-page.component').then(
            (m) => m.CompleteProfilePageComponent
          )
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about-page.component').then((m) => m.AboutPageComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact/contact-page.component').then((m) => m.ContactPageComponent)
      },
      {
        path: 'track-order',
        loadComponent: () =>
          import('./pages/track-order/track-order-page.component').then(
            (m) => m.TrackOrderPageComponent
          )
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        children: accountChildren
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
