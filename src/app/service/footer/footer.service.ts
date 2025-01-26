import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private destinationUrl = 'https://journeybees.in/api/destination/';

  constructor(private http: HttpClient) {}

  getDestination(name: string) {
    return this.http.get(this.destinationUrl + name);
  }
}
