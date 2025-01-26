// header.component.ts
import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import {
  CommonService,
  UserDetails,
} from '../../service/common/common.service';
import { RouterModule } from '@angular/router';

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
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isSticky = false;
  isSearchFormOpen = false;
  showAnnouncement = true;
  searchDestination = 'Dubai';

  cities: string[] = [
    'Dubai',
    'Paris',
    'London',
    'New York',
    'Tokyo',
    'Singapore',
    'Bangkok',
  ];
  currentCityIndex = 0;
  currentCity = this.cities[0];
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

  userDeatils: UserDetails;

  constructor(private commonService: CommonService) {
    this.userDeatils = this.commonService.getUserDetails();
  }

  ngOnInit(): void {
    this.startCityAnimation();
  }

  ngAfterViewInit(): void {}

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
    this.isSearchFormOpen = !this.isSearchFormOpen;
    if (this.isSearchFormOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      }, 300);
    } else {
      document.body.style.overflow = 'auto';
    }
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
    // Start exit animation
    this.isAnimatingOut = true;
    this.isAnimatingIn = false;

    setTimeout(() => {
      // Update text
      this.currentIndex = (this.currentIndex + 1) % this.cities.length;
      this.currentCity = this.cities[this.currentIndex];

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
