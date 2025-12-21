import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Landing } from './landing/landing';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Landing },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register')
            .then(c => c.Register)
      }
    ]
  }
];
