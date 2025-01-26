import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
export interface Location {
  id: number;
  name: string;
  content: string;
  slug: string;
  image_id: number;
  map_lat: string;
  map_lng: string;
  map_zoom: number;
  status: string;
  // Add other fields as needed
}

export interface APIResponse {
  success: boolean;
  data: Location[];
}
@Injectable({
  providedIn: 'root',
})
export class TourPackageService {
  private apiUrl = 'https://journeybees.in/api/location/';

  constructor(private http: HttpClient) {}

  getTourPackages(name: string): Observable<APIResponse> {
    return this.http.get<APIResponse>(this.apiUrl + name);
  }
}
