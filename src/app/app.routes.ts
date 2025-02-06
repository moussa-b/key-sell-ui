import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { alreadyConnectedGuard } from './core/guards/already-connected.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [alreadyConnectedGuard]
  },
  {
    path: 'password-lost',
    loadComponent: () => import('./auth/lost-password/lost-password.component').then(m => m.LostPasswordComponent),
    canActivate: [alreadyConnectedGuard]
  },
  {
    path: 'activate',
    loadComponent: () => import('./auth/activate/activate.component').then(m => m.ActivateComponent),
    canActivate: [alreadyConnectedGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [alreadyConnectedGuard]
  },
  {
    path: '',
    loadComponent: () => import('./core/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children : [
      { path: 'users', loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent) },
      { path: 'buyers', loadComponent: () => import('./buyers/buyer-list/buyer-list.component').then(m => m.BuyerListComponent) },
      { path: 'sellers', loadComponent: () => import('./sellers/seller-list/seller-list.component').then(m => m.SellerListComponent) },
      { path: 'calendar', loadComponent: () => import('./calendar/calendar/calendar.component').then(m => m.CalendarComponent) },
      { path: '**', loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent) },
    ]
  }
];
