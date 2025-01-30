// tour-package-slider.component.ts
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
import {
  CommonService,
  UserDetails,
} from '../../../../service/common/common.service';
import { QueryService } from '../../../../service/query/query.service';
import { SliderTour } from '../../../../service/tour/tour.service';

// Register Swiper custom elements
register();

export interface TourPackage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  duration: string;
  highlights: string[];
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.css',
})
export class BreadcrumbsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  queryForm: FormGroup;
  private swiperEl: any;
  userDeatils: UserDetails;

  @Input() packages: SliderTour[] = [];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private queryService: QueryService
  ) {
    this.userDeatils = this.commonService.getUserDetails();
    this.queryForm = this.initForm();
  }

  ngOnInit(): void {
    if (!this.packages.length) {
      console.warn('No packages loaded');
    }
  }

  ngAfterViewInit(): void {
    this.initializeSwiper();
  }

  private initializeSwiper(): void {
    if (!this.swiperContainer?.nativeElement) return;

    this.swiperEl = this.swiperContainer.nativeElement;

    const swiperParams = {
      injectStyles: [
        `
          .swiper-slide {
            height: 100vh;
            width: 100%;
          }
        `,
      ],
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      on: {
        init: () => {
          this.handleSlideAnimations();
        },
        slideChange: () => {
          this.handleSlideAnimations();
        },
      },
    };

    Object.assign(this.swiperEl, swiperParams);

    // Initialize Swiper
    setTimeout(() => {
      this.swiperEl.initialize();
    }, 100);
  }

  private handleSlideAnimations(): void {
    const activeSlide = this.swiperEl?.querySelector('.swiper-slide-active');
    if (!activeSlide) return;

    const elements = activeSlide.querySelectorAll('.slide-content > *');
    elements.forEach((el: Element, index: number) => {
      const element = el as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 * (index + 1));
    });
  }

  calculateDiscount(tourPackage: SliderTour): number {
    if (!tourPackage.price || !tourPackage.salePrice) return 0;
    const discount =
      ((tourPackage.price - tourPackage.salePrice) / tourPackage.price) * 100;
    return Math.round(discount);
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      this.queryService.sendQuery(this.queryForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            window.location.href = 'https://journeybees.in/thank-you.html';
          }
        },
        error: (error) => {
          console.error('Error submitting query:', error);
        },
      });
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  ngOnDestroy(): void {
    if (this.swiperEl) {
      this.swiperEl.destroy?.();
    }
  }
}
