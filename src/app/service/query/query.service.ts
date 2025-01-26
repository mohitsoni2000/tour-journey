import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIResponse } from '../tour-package/tour-package.service';

export interface Query {
  name: string;
  email: string;
  phone: string;
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
}
