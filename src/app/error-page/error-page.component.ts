import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent {
  errorMessage: string = 'An error occurred';
  errorStatus: number = 500;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['message'] || this.errorMessage;
      this.errorStatus = params['status'] || this.errorStatus;
    });
  }

  goBack() {
    window.history.back();
  }
}
