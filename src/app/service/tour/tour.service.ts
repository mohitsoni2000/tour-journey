import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';

export interface TourResponse {
  success: boolean;
  data: Tour[];
}

export interface Tour {
  id: number;
  title: string;
  slug: string;
  content: string;
  short_desc: string;
  price: string;
  sale_price: string;
  duration: number;
  address: string;
  category_name: string;
  image_file_path: string;
  banner_image_path: string;
  is_featured: number;
  gallery: string | null;
  location_id: number;
  include: string;
  exclude: string;
}

export interface TransformedTour {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  salePrice: number;
  images: string[];
  isFeatured: boolean;
  cities: string[];
  highlights: string[];
  description: string;
  content: string;
}

export interface Banner {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImage: string;
}

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private apiUrl = 'https://journeybees.in/';

  constructor(private http: HttpClient) {}

  getTourByName(name: string): Observable<TourResponse> {
    return this.http.get<TourResponse>(`${this.apiUrl}/api/tours/${name}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error('Failed to fetch tours');
        }
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching tours:', error);
        throw error;
      })
    );
  }

  getBanners(): Observable<Banner[]> {
    return of([
      {
        title: 'Special Offer!',
        subtitle: 'Get up to 50% off on group bookings',
        ctaText: 'Book Now',
        backgroundImage: 'assets/images/package/package-4.webp',
      },
    ]);
  }

  transformTourData(tour: Tour): TransformedTour {
    const galleryArray = tour.gallery
      ? tour.gallery.split(',').filter(Boolean)
      : [];

    const imageUrls = [`${this.apiUrl}/uploads/${tour.image_file_path}`];

    let includes = {};
    let excludes = {};

    try {
      includes = JSON.parse(tour.include || '{}');
      excludes = JSON.parse(tour.exclude || '{}');
    } catch (error) {
      console.error('Error parsing includes/excludes:', error);
    }

    return {
      id: tour.id,
      title: tour.title,
      location: tour.category_name,
      duration: `${tour.duration} Hours`,
      price: parseFloat(tour.price),
      salePrice: parseFloat(tour.sale_price),
      images: imageUrls,
      isFeatured: tour.is_featured === 1,
      cities: [tour.address].filter(Boolean),
      highlights: Object.values(includes).map((item: any) => item.title),
      description: tour.short_desc,
      content: tour.content,
    };
  }
}
