import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },

  {
    path: 'booking',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/booking/slot-list/slot-list.component').then(m => m.SlotListComponent)
      },
      {
        path: 'book/:slotId',
        loadComponent: () => import('./features/booking/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
      },
      {
        path: 'confirmation/:appointmentId',
        loadComponent: () => import('./features/booking/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
      }
    ]
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'manage-slots',
        loadComponent: () => import('./features/admin/manage-slots/manage-slots.component').then(m => m.ManageSlotsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];
