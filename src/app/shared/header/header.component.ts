// header.component.ts
import {
  Component,
  DestroyRef,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import {
  CommonService,
  UserDetails,
} from '../../service/common/common.service';
import { RouterModule } from '@angular/router';
import { HeaderService } from '../../service/header/header.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocationSearchComponent } from '../location-search/location-search.component';

interface SearchModel {
  searchTerm: string;
  productType: string;
  tripDuration: string;
  priceRange: {
    min: number;
    max: number;
  };
  includeFlights: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
    trigger('expandSearch', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate(
          '300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  isSticky = false;
  isSearchFormOpen = false;
  showAnnouncement = true;
  searchDestination = 'Dubai';
  cities: string[] = [];
  currentCityIndex = 0;
  currentCity = ''; // M6: initialize as empty string instead of undefined
  private cityInterval: any;

  isAnimatingIn: boolean = false;
  isAnimatingOut: boolean = false;
  private currentIndex: number = 0;

  searchModel: SearchModel = {
    searchTerm: '',
    productType: '',
    tripDuration: '',
    priceRange: {
      min: 0,
      max: 50000,
    },
    includeFlights: false,
  };

  @ViewChild('searchInput') searchInput!: ElementRef;
  announcementText: string = '';
  userDetails: UserDetails;
  locations: any[] = [];
  constructor(
    private commonService: CommonService,
    private headerService: HeaderService,
    private modalService: NgbModal
  ) {
    this.userDetails = this.commonService.getUserDetails();
  }

  ngOnInit(): void {
    this.startCityAnimation();
    this.fetchHeaderSettings();
    // H5: use takeUntilDestroyed to clean up subscription when component is destroyed
    this.headerService.fetchLocations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.cities = response.data.map((item: any) => item.name);
            this.currentCity = this.cities[0] || ''; // M6: safe fallback
            this.locations = response.data;
          }
        },
      });
  }

  private fetchHeaderSettings(): void {
    // H5: use takeUntilDestroyed to clean up subscription when component is destroyed
    this.headerService.fetchHeaderSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const headerData = response.data.find(
              (item) => item.name === 'site_header'
            );
            const emailData = response.data.find(
              (item) => item.name === 'admin_email'
            );

            if (headerData) {
              this.announcementText = headerData.val;
            }
            if (emailData) {
              this.userDetails.email = emailData.val;
            }
          }
        },
        error: (error) => {
          console.error('Error fetching announcement:', error);
          this.announcementText =
            "Journey bees won India's Best International Holiday Brand!";
        },
      });
  }

  ngOnDestroy(): void {
    if (this.cityInterval) {
      clearInterval(this.cityInterval);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const currentScroll = window.pageYOffset;
    this.isSticky = currentScroll > 60;
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isSearchFormOpen) {
      this.closeSearchForm();
    }
  }

  toggleSearchForm(): void {
    const modalRef = this.modalService.open(LocationSearchComponent, {
      windowClass: 'search-modal-window',
      centered: true,
      size: 'xl',
      backdrop: true,
      animation: true,
      keyboard: true,
      modalDialogClass: 'glass-modal-dialog',
    });

    modalRef.componentInstance.locations = this.locations;
  }

  closeSearchForm(): void {
    this.isSearchFormOpen = false;
    document.body.style.overflow = 'auto';
  }

  onSearchSubmit(): void {
    this.closeSearchForm();
  }

  private startCityAnimation() {
    this.cityInterval = setInterval(() => {
      this.animateCity();
    }, 3000);
  }

  private animateCity() {
    if (!this.cities.length) return; // M6: guard against empty cities array
    this.isAnimatingOut = true;
    this.isAnimatingIn = false;

    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.cities.length;
      this.currentCity = this.cities[this.currentIndex] || '';

      // Start entrance animation
      this.isAnimatingOut = false;
      this.isAnimatingIn = true;

      // Reset animation flags after completion
      setTimeout(() => {
        this.isAnimatingIn = false;
      }, 500);
    }, 500);
  }
}
