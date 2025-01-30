import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  constructor(private http: HttpClient) {}

  fetchHeaderSettings(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      'https://journeybees.in/api/setting'
    );
  }

  fetchLocations(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      'https://journeybees.in/api/alllocation'
    );
  }
}
