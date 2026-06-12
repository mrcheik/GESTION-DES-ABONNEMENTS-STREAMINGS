import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'accueil' },
      {
        path: 'accueil',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'providers',
        loadComponent: () =>
          import('./features/providers/providers.component').then((m) => m.ProvidersComponent),
      },
      {
        path: 'plans',
        loadComponent: () =>
          import('./features/plans/plans.component').then((m) => m.PlansComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders.component').then((m) => m.OrdersComponent),
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./features/orders/order-form/order-form.component').then(
            (m) => m.OrderFormComponent
          ),
      },
      {
        path: 'orders/:id/edit',
        loadComponent: () =>
          import('./features/orders/order-form/order-form.component').then(
            (m) => m.OrderFormComponent
          ),
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./features/subscriptions/subscriptions.component').then(
            (m) => m.SubscriptionsComponent
          ),
      },
      {
        path: 'subscriptions/new',
        loadComponent: () =>
          import('./features/subscriptions/subscription-form/subscription-form.component').then(
            (m) => m.SubscriptionFormComponent
          ),
      },
      {
        path: 'subscriptions/:id/edit',
        loadComponent: () =>
          import('./features/subscriptions/subscription-form/subscription-form.component').then(
            (m) => m.SubscriptionFormComponent
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payments.component').then((m) => m.PaymentsComponent),
      },
      {
        path: 'payments/new',
        loadComponent: () =>
          import('./features/payments/payment-form/payment-form.component').then(
            (m) => m.PaymentFormComponent
          ),
      },
      {
        path: 'payments/:id/edit',
        loadComponent: () =>
          import('./features/payments/payment-form/payment-form.component').then(
            (m) => m.PaymentFormComponent
          ),
      },
      {
        path: 'credentials',
        loadComponent: () =>
          import('./features/account/credentials/credentials.component').then(
            (m) => m.CredentialsComponent
          ),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./features/account/support/support.component').then((m) => m.SupportComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'accueil' },
];
