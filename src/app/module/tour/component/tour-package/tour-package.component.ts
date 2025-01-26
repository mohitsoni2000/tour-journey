import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { APIResponse, TourPackageService } from '../../../../service/tour-package/tour-package.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tour-package',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-package.component.html',
  styleUrl: './tour-package.component.scss',
})
export class TourPackageComponent {
  showModal = false;
  isLoading = true;
  location: any | null = null;
  error: string | null = null;

  constructor(
    private tourPackageService: TourPackageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const tourName = params['name'];
      if (tourName) {
        this.loadTourPackage(tourName);
      }
    });
  }

  private loadTourPackage(tourName: string): void {
    this.isLoading = true;
    this.tourPackageService.getTourPackages(tourName).subscribe({
      next: (response: APIResponse) => {
        if (response.success && response.data.length > 0) {
          this.location = response.data[0];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load tour package details';
        this.isLoading = false;
      },
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  getFirstLine(htmlContent: string): string {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const text = div.textContent || '';
    const firstLine = text.split('.')[0] + '...';
    return firstLine;
  }
}
