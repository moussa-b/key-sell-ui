import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { alreadyConnectedGuard } from './core/guards/already-connected.guard';
import { userAccessGuard } from './core/guards/user-access.guard';
import { realEstateResolver } from './real-estates/real-estate.resolver';
import { leavePageGuard } from './core/guards/leave-page.guard';

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
    children: [
      {
        path: 'users',
        data: {userAccessFieldName: 'canShowUsers'},
        loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent),
        canActivate: [userAccessGuard]
      },
      {
        path: 'buyers',
        data: {userAccessFieldName: 'canShowBuyers'},
        loadComponent: () => import('./buyers/buyer-list/buyer-list.component').then(m => m.BuyerListComponent),
        canActivate: [userAccessGuard]
      },
      {
        path: 'sellers',
        data: {userAccessFieldName: 'canShowSellers'},
        loadComponent: () => import('./sellers/seller-list/seller-list.component').then(m => m.SellerListComponent),
        canActivate: [userAccessGuard]
      },
      {
        path: 'calendar',
        data: {userAccessFieldName: 'canShowCalendarEvents'},
        loadComponent: () => import('./calendar/calendar/calendar.component').then(m => m.CalendarComponent),
        canActivate: [userAccessGuard]
      },
      {
        path: 'planning',
        data: {userAccessFieldName: 'canShowPlanning'},
        loadComponent: () => import('./planning/planning/planning.component').then(m => m.PlanningComponent),
        canActivate: [userAccessGuard]
      },
      {
        path: 'real-estates',
        data: {userAccessFieldName: 'canShowRealEstates'},
        children: [
          {
            path: 'new',
            loadComponent: () => import('./real-estates/real-estate-form/real-estate-form.component').then(m => m.RealEstateFormComponent),
            canDeactivate: [leavePageGuard]
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./real-estates/real-estate-form/real-estate-form.component').then(m => m.RealEstateFormComponent),
            resolve: {realEstate: realEstateResolver},
            canDeactivate: [leavePageGuard]
          },
          {
            path: '',
            loadComponent: () => import('./real-estates/real-estate-list/real-estate-list.component').then(m => m.RealEstateListComponent),
          }
        ],
        canActivate: [userAccessGuard]
      },
      {path: '**', redirectTo: 'buyers'}
    ]
  }
];
