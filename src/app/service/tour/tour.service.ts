import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  of,
  map,
  catchError,
  BehaviorSubject,
  shareReplay,
} from 'rxjs';

export interface TourResponse {
  success: boolean;
  data: Tour[];
}

export interface Tour {
  id: number;
  title: string;
  slug: string;
  content: string;
  card_tag: string;
  short_desc: string;
  highlights: string;
  price: string;
  sale_price: string;
  duration: number;
  address: string;
  category_name: string;
  image_file_path: string;
  banner_image_path: string;
  is_featured: number;
  min_people: number;
  max_people: number;
  gallery: string | null;
  location_id: number;
  include: string;
  slider_tag: string;
  exclude: string;
}

export interface SliderTour {
  id: number;
  title: string;
  imageUrl: string;
  location: string;
  duration: string;
  highlights: string[];
  price: number;
  salePrice: number;
}

export interface TransformedTour {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  salePrice: number;
  images: string[];
  featured: string;
  cities: string[];
  highlights: string[];
  description: string;
  minPersons: number;
  maxPersons: number;
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
  private apiUrl = 'https://journeybees.in';
  private toursSubject = new BehaviorSubject<TransformedTour[]>([]);
  private sliderToursSubject = new BehaviorSubject<SliderTour[]>([]);
  private currentTourName: string | null = null;
  private cachedTourData: Observable<any> | null = null;

  constructor(private http: HttpClient) {}

  getTourByName(
    tourName: string
  ): Observable<{ tours: TransformedTour[]; sliderTours: SliderTour[] }> {
    // Return cached data if available for the same tour
    if (this.cachedTourData && this.currentTourName === tourName) {
      return this.cachedTourData;
    }

    // Reset cache if tour name changes
    if (this.currentTourName !== tourName) {
      this.cachedTourData = null;
    }

    this.currentTourName = tourName;

    this.cachedTourData = this.http
      .get<TourResponse>(`${this.apiUrl}/api/tours/${tourName}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error('Failed to fetch tours');
          }

          const transformedTours = response.data.map((tour) =>
            this.transformTourData(tour)
          );
          const sliderTours = response.data.map((tour) =>
            this.extractSliderData(tour)
          );

          // Update subjects
          this.toursSubject.next(transformedTours);
          this.sliderToursSubject.next(sliderTours);

          return {
            tours: transformedTours,
            sliderTours: sliderTours,
          };
        }),
        shareReplay(1) // Cache the result
      );

    return this.cachedTourData;
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
      duration: this.convertDuration(tour.duration),
      price: parseFloat(tour.price),
      salePrice: parseFloat(tour.sale_price),
      images: imageUrls,
      featured: tour.card_tag.trim(),
      minPersons: tour.min_people,
      maxPersons: tour.max_people,
      cities: tour?.slider_tag?.split('#').map((item) => item.trim()) ?? [],
      highlights: tour?.highlights?.split('#').map((item) => item.trim()) ?? [],
      description: tour.short_desc,
      content: tour.content,
    };
  }

  extractSliderData(tour: Tour): SliderTour {
    let highlights: string[] = [];
    // Extract highlights from slider_tag if available, otherwise use includes
    if (tour.slider_tag) {
      try {
        highlights = tour.slider_tag.split('#').map((item) => item.trim());
      } catch {
        highlights = [tour.slider_tag];
      }
    }
    // else {
    //   try {
    //     const includes = JSON.parse(tour?.include || '[]');
    //     highlights = includes.map((item: any) => item.title);
    //   } catch (error) {
    //     console.error('Error parsing includes:', error);
    //   }
    // }

    // Construct full image URL
    const imageUrl = tour.banner_image_path
      ? `${this.apiUrl}/uploads/${tour.banner_image_path}`
      : tour.image_file_path
      ? `${this.apiUrl}/uploads/${tour.image_file_path}`
      : '';

    return {
      id: tour.id,
      title: tour.title,
      imageUrl: imageUrl,
      location: tour.category_name,
      duration: this.convertDuration(tour.duration),
      highlights: highlights.slice(0, 4),
      price: parseFloat(tour.price || '0'),
      salePrice: parseFloat(tour.sale_price || '0'),
    };
  }

  convertDuration(duration: number): string {
    const days = Math.floor(duration / 24);
    const nights = duration % 24 >= 12 ? days : days - 1;
    return `${days} Days, ${nights} Nights`;
  }
}
