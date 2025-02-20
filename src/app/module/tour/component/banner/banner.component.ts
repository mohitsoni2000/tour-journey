import {
  animate,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QueryService } from '../../../../service/query/query.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="promotion-banner"
      [style.background-image]="'url(' + backgroundImage + ')'"
      [@bannerState]="animationState"
    >
      <div class="glass-overlay" [@overlayReveal]="animationState">
        <div class="query-form-wrapper" [@formEntry]="formFields.length">
          <div class="glass-form">
            <form
              [formGroup]="queryForm"
              (ngSubmit)="onSubmit()"
              [@formAnimation]="queryForm.status"
            >
              <div class="form-fields">
                <div
                  class="form-field"
                  *ngFor="let field of formFields; let i = index"
                  [@fieldEntry]="{ value: i, params: { delay: i * 100 } }"
                  [class.has-error]="isFieldInvalid(field.name)"
                >
                  <div class="input-wrapper">
                    <i [class]="field.icon"></i>
                    <input
                      [type]="field.type"
                      [formControlName]="field.name"
                      [placeholder]="field.placeholder"
                      (focus)="onInputFocus()"
                      (blur)="onInputBlur()"
                    />
                  </div>
                  <div
                    *ngIf="isFieldInvalid(field.name)"
                    class="error-message"
                    [@errorAnimation]
                  >
                    {{ getErrorMessage(field.name) }}
                  </div>
                </div>
              </div>

              <!-- Consent Checkbox -->
              <div class="consent-wrapper" [@consentAnimation]>
                <label class="custom-checkbox">
                  <input
                    type="checkbox"
                    formControlName="consent"
                    (change)="onConsentChange($event)"
                  />
                  <span class="checkmark"></span>
                  <span class="consent-text"
                    >I agree to be contacted by Journey Bees.</span
                  >
                </label>
                <div
                  *ngIf="isFieldInvalid('consent')"
                  class="error-message"
                  [@errorAnimation]
                >
                  Please accept the terms to continue
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                class="action-buttons"
                [@actionButtonsAnimation]="animationState"
              >
                <a
                  [href]="'tel:' + contactPhone"
                  class="call-btn"
                  aria-label="Call"
                  [@buttonHover]="buttonState"
                  (mouseenter)="buttonState = 'hover'"
                  (mouseleave)="buttonState = 'default'"
                >
                  <i class="ri-phone-line"></i>
                </a>
                <button
                  type="submit"
                  [disabled]="queryForm.invalid || isLoading"
                  [@buttonAnimation]="queryForm.status"
                  class="submit-button"
                >
                  <ng-container *ngIf="!isLoading; else loadingTemplate">
                    {{ ctaText }}
                  </ng-container>
                  <ng-template #loadingTemplate>
                    <div class="loader"></div>
                  </ng-template>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./banner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Banner Entry Animation
    trigger('bannerState', [
      state('default', style({ opacity: 1, transform: 'scale(1)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate(
          '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),

    // Overlay Reveal Animation
    trigger('overlayReveal', [
      transition(':enter', [
        style({
          opacity: 0,
          backgroundColor: 'rgba(0,0,0,0)',
        }),
        animate(
          '800ms ease-out',
          style({
            opacity: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
          })
        ),
      ]),
    ]),

    // Glass Form Effect Animation
    trigger('glassEffect', [
      transition(':enter', [
        style({
          opacity: 0,
          filter: 'blur(20px)',
          transform: 'translateY(20px)',
        }),
        animate(
          '700ms ease-out',
          style({
            opacity: 1,
            filter: 'blur(0)',
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),

    // Header Animation
    trigger('headerAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
        }),
        animate(
          '500ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),

    // Icon Pulse Animation
    trigger('iconPulse', [
      transition(':enter', [
        animate(
          '1000ms',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.1)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
    ]),

    // Form Field Entry Animation
    trigger('fieldEntry', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-20px)',
        }),
        animate(
          '500ms {{ delay }}ms ease-out',
          style({
            opacity: 1,
            transform: 'translateX(0)',
          })
        ),
      ]),
    ]),

    // Error Message Animation
    trigger('errorAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-10px)',
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),

    // Form Animation based on Validity
    trigger('formAnimation', [
      state('VALID', style({ opacity: 1 })),
      state('INVALID', style({ opacity: 0.7 })),
      transition('* <=> *', animate('300ms ease-in-out')),
    ]),

    // Action Buttons Animation
    trigger('actionButtonsAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)',
        }),
        animate(
          '600ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),

    // Button Hover and Animation
    trigger('buttonAnimation', [
      state('VALID', style({ transform: 'scale(1)' })),
      state('INVALID', style({ transform: 'scale(0.95)' })),
      transition('* <=> *', animate('200ms ease-in-out')),
    ]),

    // Button Hover Effect
    trigger('buttonHover', [
      state('default', style({ transform: 'scale(1)' })),
      transition('* => hover', [
        animate('200ms', style({ transform: 'scale(1.1)' })),
      ]),
      transition('hover => default', [
        animate('200ms', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('formEntry', [
      transition(':increment', [
        query(
          ':enter',
          [
            style({ opacity: 0, height: 0 }),
            stagger(100, [
              animate('300ms ease-out', style({ opacity: 1, height: '*' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('consentAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class BannerComponent implements OnDestroy {
  @Input() backgroundImage: string = 'assets/images/package/package-4.webp';
  @Input() title: string = 'Get a Callback';
  @Input() subtitle: string =
    'Talk to our experts to get the best advice and options for your holiday';
  @Input() contactPhone: string = '123-456-7890';
  @Input() ctaText: string = 'Get a Callback';
  animationState = 'default';
  buttonState = 'default';
  isLoading = false;
  onInputFocus() {
    this.animationState = 'focus';
  }

  onInputBlur() {
    this.animationState = 'default';
  }
  queryForm: FormGroup;

  // Configurable form fields
  formFields: any[] = [
    {
      name: 'name',
      type: 'text',
      placeholder: 'Your Name',
      icon: 'ri-user-line',
      validation: [Validators.required, Validators.minLength(2)],
    },
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email Address',
      icon: 'ri-mail-line',
      validation: [Validators.required, Validators.email],
    },
    {
      name: 'phone',
      type: 'tel',
      placeholder: 'Contact Number',
      icon: 'ri-phone-line',
      validation: [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
    },
  ];

  private route = inject(ActivatedRoute);
  private routeSub: Subscription | undefined;
  private defaultMessages = 'Enquiry from website';

  constructor(private fb: FormBuilder, private queryService: QueryService) {
    this.queryForm = this.createForm();

    this.routeSub = this.route.params.subscribe((params) => {
      const tourName = params['name'];
      if (tourName) this.defaultMessages = `Enquiry for ${tourName}`;
    });
  }

  @HostListener('window:resize')
  onResize() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.animationState = 'mobile';
    } else {
      this.animationState = 'default';
    }
  }

  // Dynamic form creation method
  private createForm(): FormGroup {
    const formControls: { [key: string]: any } = {};

    this.formFields.forEach((field) => {
      formControls[field.name] = ['', field.validation || []];
    });

    // Add consent control
    formControls['consent'] = [true, Validators.requiredTrue];

    return this.fb.group(formControls);
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const control = this.queryForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.queryForm.get(fieldName);

    if (control && control.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control?.hasError('pattern')) {
      return fieldName === 'phone'
        ? 'Please enter a valid 10-digit phone number'
        : 'Invalid format';
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
  onSubmit() {
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

  onConsentChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.queryForm.get('consent')?.markAsTouched();
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
