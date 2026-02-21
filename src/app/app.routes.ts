import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { PanelLayout } from './layout/panel-layout/panel-layout';
import { Landing } from './landing/landing';
import { LoginService } from './services/auth/login.service';
import { UserRole } from './services/auth/models/auth.models';

const panelAuthGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/login');
};

const panelRoleGuard: CanActivateFn = (route) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as UserRole[] | undefined) ?? [];

  if (allowedRoles.length === 0) {
    return true;
  }

  const currentRole = loginService.getCurrentRole();

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.parseUrl(loginService.getDefaultPanelRoute());
};

const verifiedEmailGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isEmailVerified()) {
    return true;
  }

  return router.parseUrl('/panel/dashboard');
};

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Landing },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login')
            .then(c => c.Login)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register')
            .then(c => c.Register)
      }
    ]
  },
  {
    path: 'panel',
    component: PanelLayout,
    canActivate: [panelAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard')
            .then(c => c.Dashboard)
      },
      {
        path: 'users',
        canActivate: [panelRoleGuard, verifiedEmailGuard],
        data: {
          roles: ['admin'] satisfies UserRole[]
        },
        loadComponent: () =>
          import('./admin/users/users')
            .then(c => c.Users)
      }
    ]
  }
];
