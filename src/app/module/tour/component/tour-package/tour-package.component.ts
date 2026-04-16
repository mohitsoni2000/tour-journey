import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { APIResponse, TourPackageService } from '../../../../service/tour-package/tour-package.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tour-package',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-package.component.html',
  styleUrl: './tour-package.component.scss',
})
export class TourPackageComponent implements OnInit, OnDestroy {
  showModal = false;
  isLoading = true;
  location: any | null = null;
  error: string | null = null;

  private routeSub: Subscription | undefined;

  constructor(
    private tourPackageService: TourPackageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // H7: store subscription for cleanup
    this.routeSub = this.route.params.subscribe((params) => {
      const tourName = params['name'];
      if (tourName) {
        this.loadTourPackage(tourName);
      }
    });
  }

  private loadTourPackage(tourName: string): void {
    this.isLoading = true;
    this.error = '';
    this.tourPackageService.getTourPackages(tourName).subscribe({
      next: (response: APIResponse) => {
        if (response.success && response.data.length > 0) {
          this.location = response.data[0];
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load tour package details';
        this.isLoading = false;
      },
    });
  }

  openModal(): void {
    this.showModal = true;
    document.body.style.overflow = 'hidden'; // H12: lock background scroll
  }

  closeModal(): void {
    this.showModal = false;
    document.body.style.overflow = ''; // H12: restore scroll
  }

  // H12: close modal on Escape key
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showModal) this.closeModal();
  }

  getFirstLine(htmlContent: string): string {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const text = div.textContent || '';
    const firstLine = text.split('.')[0] + '...';
    return firstLine;
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.showModal) document.body.style.overflow = ''; // cleanup if destroyed while open
  }
}
