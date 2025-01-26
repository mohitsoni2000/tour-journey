import { Routes } from '@angular/router';
import { TourResolver } from './core/resolver/tour.resolver';

export const routes: Routes = [
  {
    path: 'tour/:name',
    loadComponent: () =>
      import('./module/tour/tour.component').then((m) => m.TourComponent),
    resolve: {
      tour: TourResolver,
    },
    data: {
      title: 'Tour Details',
    },
  },
  {
    path: '',
    redirectTo: 'error',
    pathMatch: 'full',
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./error-page/error-page.component').then(
        (m) => m.ErrorPageComponent
      ),
    data: {
      title: 'Error',
    },
  },
];
