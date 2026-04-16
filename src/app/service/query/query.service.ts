import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIResponse } from '../tour-package/tour-package.service';

export interface Query {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  note?: string; // Optional field
  url?: string; // New field for current URL
}

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private apiUrl = 'https://journeybees.in/api/saveenquiry';

  constructor(private http: HttpClient) {}

  sendQuery(data: Query): Observable<APIResponse> {
    return this.http.post<APIResponse>(this.apiUrl, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // Email is now sent server-side in EnquiryController after DB save.
  // This method is kept as a no-op to avoid touching all call sites.
  sendMail(_queryData: any): void {}
}
