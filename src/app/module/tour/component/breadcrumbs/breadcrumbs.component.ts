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
  inject,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
import {
  CommonService,
  UserDetails,
} from '../../../../service/common/common.service';
import { QueryService } from '../../../../service/query/query.service';
import { SliderTour } from '../../../../service/tour/tour.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

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
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class BreadcrumbsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  queryForm: FormGroup;
  private swiperEl: any;
  userDeatils: UserDetails;

  @Input() packages: SliderTour[] = [];
  isLoading = false;

  formFields = [
    {
      name: 'name',
      type: 'text',
      placeholder: 'Your Name',
      icon: 'ri-user-line',
      validation: [Validators.required, Validators.minLength(3)],
    },
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      icon: 'ri-mail-line',
      validation: [Validators.required, Validators.email],
    },
    {
      name: 'phone',
      type: 'tel',
      placeholder: 'Contact Number',
      icon: 'ri-phone-line',
      validation: [Validators.required, Validators.pattern('^[0-9]{10}$')],
    },
  ];

  private route = inject(ActivatedRoute);
  private routeSub: Subscription | undefined;
  private defaultMessages = 'Enquiry from website';

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private queryService: QueryService
  ) {
    this.userDeatils = this.commonService.getUserDetails();
    this.queryForm = this.initForm();

    this.routeSub = this.route.params.subscribe((params) => {
      const tourName = params['name'];
      if (tourName) this.defaultMessages = `Enquiry for ${tourName}`;
    });
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
      this.isLoading = true;

      const queryData = {
        ...this.queryForm.value,
        note: this.defaultMessages,
        url: window.location.href,
      };

      this.queryService.sendQuery(queryData).subscribe({
        next: (response) => {
          if (response.success) {
            this.queryService.sendMail(queryData);
          }
        },
        error: (error) => {
          console.error('Error submitting query:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      Object.keys(this.queryForm.controls).forEach((key) => {
        const control = this.queryForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.queryForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.queryForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number';
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} is too short`;
    }

    return 'Invalid input';
  }

  private getFieldLabel(fieldName: string): string {
    const field = this.formFields.find((f) => f.name === fieldName);
    return field ? field.placeholder : fieldName;
  }

  private initForm(): FormGroup {
    const formControls: { [key: string]: any } = {};

    this.formFields.forEach((field) => {
      formControls[field.name] = ['', field.validation || []];
    });

    // Add consent control
    formControls['consent'] = [true, Validators.requiredTrue];

    return this.fb.group(formControls);
  }

  onConsentChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.queryForm.get('consent')?.markAsTouched();
    }
  }

  ngOnDestroy(): void {
    if (this.swiperEl) {
      this.swiperEl.destroy?.();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
