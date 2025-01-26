import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface FAQResponse {
  success: boolean;
  data: FAQData[];
}

export interface FAQData {
  faq_id: number;
  category_id: number;
  faq_question: string;
  faq_answer: string;
  faq_pos: number;
}

export interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private faqUrl = 'https://journeybees.in/api/faq/';

  constructor(private http: HttpClient) {}

  getFAQ(name: string): Observable<FAQResponse> {
    return this.http.get<FAQResponse>(this.faqUrl + name);
  }
}
