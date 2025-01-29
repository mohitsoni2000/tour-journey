import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingResponse {
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

  fetchHeaderSettings(): Observable<SettingResponse> {
    return this.http.get<SettingResponse>(
      'https://journeybees.in/api/setting'
    );
  }
}
