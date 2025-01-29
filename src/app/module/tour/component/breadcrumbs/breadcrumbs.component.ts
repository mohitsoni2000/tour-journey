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
  private swiperInstance: any;

  cities: string[] = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ];

  @Input() packages: SliderTour[] = [];

  userDeatils: UserDetails;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private queryService: QueryService
  ) {
    this.userDeatils = this.commonService.getUserDetails();

    this.queryForm = this.initForm();
  }

  ngOnInit(): void {
    this.initializeFormValidation();
  }

  private initForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  private initializeFormValidation(): void {
    // Add dynamic validation for departure date
    const departureDateControl = this.queryForm.get('departureDate');
    if (departureDateControl) {
      departureDateControl.valueChanges.subscribe(() => {
        departureDateControl.updateValueAndValidity();
      });
    }
  }

  ngAfterViewInit(): void {
    this.initializeSwiper();
  }

  private initializeSwiper(): void {
    if (!this.swiperContainer) return;

    const swiperEl = this.swiperContainer.nativeElement;
    const swiperParams = {
      slidesPerView: 1,
      speed: 1000,
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
          this.handleSlideAnimations('init');
        },
        slideChangeTransitionStart: () => {
          this.handleSlideAnimations('change');
        },
      },
    };

    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();
    this.swiperInstance = swiperEl;
  }

  private handleSlideAnimations(event: 'init' | 'change'): void {
    const activeSlide = document.querySelector('.swiper-slide-active');
    if (!activeSlide) return;

    const elements = activeSlide.querySelectorAll('.slide-content > *');
    elements.forEach((el, index) => {
      const element = el as HTMLElement;

      if (event === 'change') {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
      }

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 * (index + 1));
    });
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      const formData = this.queryForm.value;
      this.queryService.sendQuery(formData).subscribe({
        next: (response) => {
          if (response.success) {
            window.location.href = 'https://journeybees.in/thank-you.html';
          }
        },
        error: (error) => {
          console.error('Error submitting enquiry:', error);
          // Handle error (e.g., show error message to user)
        },
      });
      this.queryForm.reset();

      // Show success message or handle response
      alert('Thank you! Our team will contact you shortly.');
    } else {
      this.markFormGroupTouched(this.queryForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy();
    }
  }
}
