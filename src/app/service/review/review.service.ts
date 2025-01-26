import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, throwError, from, of } from 'rxjs';
import { catchError, map, tap, retry, finalize } from 'rxjs/operators';

// Enhanced interfaces
export interface Review {
  id: string;
  userName: string;
  profilePhoto?: string;
  rating: number;
  content: string;
  date: string;
  packageName: string;
  images?: string[];
  language: string;
  isVerified: boolean;
  reviewUrl: string;
  displayDate?: string;
  truncatedContent?: string;
  isExpanded?: boolean;
  originalReview?: any; // Store original Google review data
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  countryCount: number;
  verificationRate: number;
  popularMentions?: { tag: string; count: number }[];
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  summary?: RatingSummary;
}

export interface BusinessDetails {
  name: string;
  address: string;
  rating: number;
  totalReviews: number;
  placeId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private GOOGLE_API_KEY = 'AIzaSyAaMsjWs9tmDhTKdzDEOz08GD3kaMTv4Cs';
  private PLACE_ID = 'ChIJITIKh_EDDTkRvsW0b95MdI0';

  private googleMaps: any;
  private businessDetails$ = new BehaviorSubject<BusinessDetails | null>(null);
  private reviews$ = new BehaviorSubject<Review[]>([]);
  private ratingSummary$ = new BehaviorSubject<RatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    countryCount: 0,
    verificationRate: 0,
    popularMentions: [],
  });
  private isLoading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private ngZone: NgZone) {
    this.initializeService();
  }

  // Public API Methods
  getBusinessDetails(): Observable<BusinessDetails | null> {
    return this.businessDetails$.asObservable();
  }

  getReviews(
    page: number = 1,
    pageSize: number = 10,
    sortBy?: string
  ): Observable<ReviewsResponse> {
    return this.reviews$.pipe(
      map((reviews) => {
        const sortedReviews = this.sortReviews(reviews, sortBy);
        const start = (page - 1) * pageSize;
        const paginatedReviews = sortedReviews.slice(start, start + pageSize);

        return {
          reviews: paginatedReviews,
          total: reviews.length,
          page,
          pageSize,
          summary: this.ratingSummary$.value,
        };
      }),
      catchError((error) => this.handleError('Error fetching reviews', error))
    );
  }

  getRatingSummary(): Observable<RatingSummary> {
    return this.ratingSummary$.asObservable();
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  async refreshReviews(): Promise<void> {
    try {
      this.isLoading$.next(true);
      this.error$.next(null);
      await this.fetchGoogleReviews();
    } catch (error) {
      this.handleError('Failed to refresh reviews', error);
    } finally {
      this.isLoading$.next(false);
    }
  }

  // Private Methods
  private async initializeService(): Promise<void> {
    try {
      this.isLoading$.next(true);
      await this.loadGoogleMapsScript();
      await this.fetchGoogleReviews();
    } catch (error) {
      this.handleError('Failed to initialize review service', error);
    } finally {
      this.isLoading$.next(false);
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const win = window as any;
      if (win.google && win.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      const callbackName = `initGoogleMaps_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      win[callbackName] = () => {
        delete win[callbackName];
        this.googleMaps = win.google.maps;
        resolve();
      };

      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.GOOGLE_API_KEY}&libraries=places&callback=${callbackName}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = () =>
        reject(new Error('Failed to load Google Maps script'));

      document.head.appendChild(script);
    });
  }

  private async fetchGoogleReviews(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ngZone.run(() => {
        const mapDiv = document.createElement('div');
        const service = new google.maps.places.PlacesService(mapDiv);

        const request = {
          placeId: this.PLACE_ID,
          fields: [
            'name',
            'formatted_address',
            'rating',
            'reviews',
            'user_ratings_total'
          ],
        };

        service.getDetails(request, (result: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            this.processPlaceDetails(result);
            resolve();
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        });
      });
    });
  }

  private processPlaceDetails(placeData: any): void {
    // Update business details
    this.businessDetails$.next({
      name: placeData.name,
      address: placeData.formatted_address,
      rating: placeData.rating,
      totalReviews: placeData.user_ratings_total,
      placeId: this.PLACE_ID,
    });

    // Process reviews
    const reviews = this.processGoogleReviews(placeData.reviews || []);
    this.reviews$.next(reviews);

    // Update rating summary
    this.updateRatingSummary(placeData);

    // Extract and analyze popular mentions
    this.analyzePopularMentions(placeData.reviews || []);
  }

  private processGoogleReviews(googleReviews: any[]): Review[] {
    return googleReviews.map((review) => ({
      id: `google_${review.time}`,
      userName: review.author_name,
      profilePhoto: review.profile_photo_url,
      rating: review.rating,
      content: review.text,
      date: new Date(review.time * 1000).toISOString(),
      packageName: 'Journey Bees Tour',
      language: review.language || 'en',
      isVerified: true,
      reviewUrl: review.author_url,
      displayDate: this.formatRelativeTime(review.time * 1000),
      truncatedContent: this.truncateContent(review.text),
      isExpanded: false,
      originalReview: review,
    }));
  }

  private updateRatingSummary(placeData: any): void {
    const summary: RatingSummary = {
      averageRating: placeData.rating,
      totalReviews: placeData.user_ratings_total,
      ratingDistribution: this.calculateRatingDistribution(
        placeData.reviews || []
      ),
      countryCount: this.calculateUniqueCountries(placeData.reviews || []),
      verificationRate: 100,
      popularMentions: this.extractPopularMentions(placeData.reviews || []),
    };

    this.ratingSummary$.next(summary);
  }

  private calculateRatingDistribution(reviews: any[]): {
    [key: number]: number;
  } {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review: { rating: 1 | 2 | 3 | 4 | 5 }) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  }

  private calculateUniqueCountries(reviews: any[]): number {
    const uniqueLanguages = new Set(
      reviews.map((review) => review.language || 'en')
    );
    return uniqueLanguages.size;
  }

  private extractPopularMentions(
    reviews: any[]
  ): { tag: string; count: number }[] {
    const commonWords = new Set([
      'the',
      'and',
      'a',
      'an',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
    ]);
    const wordCount: { [key: string]: number } = {};

    reviews.forEach((review) => {
      const words = review.text.toLowerCase().split(/\W+/);
      words.forEach((word: any) => {
        if (word.length > 3 && !commonWords.has(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private analyzePopularMentions(reviews: any[]): void {
    const popularMentions = this.extractPopularMentions(reviews);
    const currentSummary = this.ratingSummary$.value;
    this.ratingSummary$.next({
      ...currentSummary,
      popularMentions,
    });
  }

  private sortReviews(reviews: Review[], sortBy?: string): Review[] {
    if (!sortBy) return reviews;

    const sortedReviews = [...reviews];
    switch (sortBy) {
      case 'newest':
        return sortedReviews.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case 'highest':
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      default:
        return sortedReviews;
    }
  }

  private formatRelativeTime(timestamp: number): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = timestamp - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

    if (Math.abs(days) < 30) return rtf.format(days, 'day');
    if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), 'month');
    return rtf.format(Math.round(days / 365), 'year');
  }

  private truncateContent(content: string, maxLength: number = 300): string {
    if (!content || content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  }

  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    const errorMessage =
      error instanceof HttpErrorResponse
        ? `${message}: ${error.message}`
        : message;

    this.error$.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
