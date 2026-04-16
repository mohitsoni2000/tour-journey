import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { of } from 'rxjs';
import { TourService } from '../../service/tour/tour.service';

@Injectable({
  providedIn: 'root',
})
export class TourResolver implements Resolve<any> {
  constructor(private tourService: TourService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const tourName = route.paramMap.get('name');
    if (!tourName) {
      this.router.navigate(['/error']);
      return of(null);
    }

    return this.tourService.getTourByName(tourName).pipe(
      catchError((error) => {
        // M3: TourService throws a plain Error (no .status) when response.success is false;
        // HttpErrorResponse has .status — use ?. to handle both cases safely
        if (error?.status === 404) {
          this.router.navigate(['/error'], {
            queryParams: { message: 'Tour not found', status: 404 },
          });
        } else {
          this.router.navigate(['/error'], {
            queryParams: {
              message: error?.message || 'An error occurred while loading the tour',
              status: error?.status || 500,
            },
          });
        }
        return of(null);
      })
    );
  }
}
