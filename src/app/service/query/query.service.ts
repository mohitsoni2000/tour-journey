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

  sendMail(queryData: any) {
    // Create form data for PHP redirect
    const formData = new FormData();
    Object.keys(queryData).forEach((key) => {
      formData.append(key, queryData[key]);
    });

    // Create a hidden form and submit it
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://journeybees.in/sendmail.php';

    // Add form fields
    Object.keys(queryData).forEach((key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = queryData[key];
      form.appendChild(input);
    });

    // Submit the form
    document.body.appendChild(form);
    form.submit();
  }
}
