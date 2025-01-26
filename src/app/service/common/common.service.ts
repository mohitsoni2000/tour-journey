import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  facebook: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
}
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  getUserDetails(): UserDetails {
    return {
      name: 'Journey Bees',
      email: environment.userEmail,
      phone: environment.userPhone,
      whatsapp: environment.whatsapp,
      facebook: environment.facebook,
      twitter: environment.twitter,
      instagram: environment.instagram,
    };
  }
}
