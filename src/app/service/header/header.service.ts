import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, shareReplay, tap } from 'rxjs';

export interface ApiResponse {
  success: boolean;
  data: Array<{
    name: string;
    val: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour cache expiry
  private inFlightRequest: Observable<ApiResponse> | null = null;
  private cachedResponse: Observable<ApiResponse> | null = null;
  private lastCacheTime: number = 0;

  constructor(private http: HttpClient) {}

  fetchHeaderSettings(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>('https://journeybees.in/api/setting');
  }

  fetchLocations(): Observable<ApiResponse> {
    // If we have a valid cache, return it
    if (this.cachedResponse && !this.isCacheExpired()) {
      return this.cachedResponse;
    }

    // If there's already a request in flight, return that instead of making a new one
    if (this.inFlightRequest) {
      return this.inFlightRequest;
    }

    // Make a new request and share it
    this.inFlightRequest = this.http
      .get<ApiResponse>('https://journeybees.in/api/alllocation')
      .pipe(
        tap(() => {
          this.lastCacheTime = Date.now();
        }),
        shareReplay(1),
        finalize(() => {
          // Store the completed request in the cache
          this.cachedResponse = this.inFlightRequest;
          // Clear the in-flight request
          this.inFlightRequest = null;
        })
      );

    return this.inFlightRequest;
  }

  private isCacheExpired(): boolean {
    return Date.now() - this.lastCacheTime > this.CACHE_EXPIRY_MS;
  }

  clearCache(): void {
    this.cachedResponse = null;
    this.inFlightRequest = null;
    this.lastCacheTime = 0;
  }
}
