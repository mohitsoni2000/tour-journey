import { trigger, transition, style, animate } from '@angular/animations';
import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryService } from '../../service/query/query.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIResponse } from '../../service/tour-package/tour-package.service';

@Component({
  selector: 'app-tour-promo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-promo.component.html',
  styleUrl: './tour-promo.component.scss',
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
export class TourPromoComponent implements OnInit, OnDestroy {
  private modalService = inject(NgbModal);
  private queryService = inject(QueryService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  enquiryForm = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]+$/),
      ],
    ],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    destination: [''],
  });

  @ViewChild('promoModal') promoModal: any;
  private modalDisplayInterval: any;
  private modalInitTimeout: any; // H4: store timeout ID so it can be cleared
  isLoading = false;
  isSubmitted = false;
  private isModalOpen = false;
  private routeSub: Subscription | undefined;
  private defaultMessages = 'Enquiry from website';

  ngOnInit() {
    this.startModalInterval();
    if (this.routeSub) this.routeSub.unsubscribe();
    this.routeSub = this.route.params.subscribe((params) => {
      const tourName = params['name'];
      if (tourName) this.defaultMessages = `Enquiry for ${tourName}`;
    });
  }

  ngOnDestroy() {
    this.stopModalInterval();
    this.routeSub?.unsubscribe(); // H3: unsubscribe route subscription
  }

  private startModalInterval() {
    // H4: store the timeout ID so it can be cleared on destroy
    this.modalInitTimeout = setTimeout(() => {
      this.openPromoModal();
      this.modalDisplayInterval = setInterval(() => {
        if (!this.isModalOpen) {
          this.openPromoModal();
        }
      }, 1 * 60 * 1000);
    }, 1 * 60 * 1000); // 1 minute
  }

  private stopModalInterval() {
    // H4: clear both the initial timeout and the recurring interval
    if (this.modalInitTimeout) {
      clearTimeout(this.modalInitTimeout);
      this.modalInitTimeout = null;
    }
    if (this.modalDisplayInterval) {
      clearInterval(this.modalDisplayInterval);
      this.modalDisplayInterval = null;
    }
  }

  openPromoModal(message?: string) {
    if (!this.isModalOpen) {
      this.isModalOpen = true;
      this.enquiryForm.patchValue({ destination: message || '' });
      const modalRef = this.modalService.open(this.promoModal, {
        centered: true,
        backdrop: 'static',
        windowClass: 'animated-modal',
        size: 'xl',
      });

      modalRef.result.finally(() => {
        this.isModalOpen = false;
        this.isSubmitted = false;
        this.enquiryForm.reset();
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.enquiryForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.enquiryForm.get(field);
    if (!control) return '';
    if (control.hasError('required'))
      return `${this.getLabel(field)} is required`;
    if (control.hasError('minlength')) {
      const min = control.errors?.['minlength']?.requiredLength;
      return `${this.getLabel(field)} must be at least ${min} characters`;
    }
    if (control.hasError('pattern')) {
      if (field === 'phone')
        return 'Phone number must contain only digits (min 8)';
      if (field === 'name') return 'Name can only contain letters and spaces';
    }
    if (control.hasError('email')) return 'Please enter a valid email address';
    return 'Invalid input';
  }

  private getLabel(field: string): string {
    const labels: Record<string, string> = {
      name: 'Name',
      phone: 'Phone number',
      email: 'Email',
      destination: 'Destination',
    };
    return labels[field] || field;
  }

  onSubmit() {
    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    // M10: capture URL at submit time, not at component init
    const queryData = {
      name: this.enquiryForm.value.name ?? '',
      phone: this.enquiryForm.value.phone ?? '',
      email: this.enquiryForm.value.email ?? '',
      note: this.defaultMessages,
      url: window.location.origin + window.location.pathname,
      consent: true as const,
    };

    this.queryService
      .sendQuery(queryData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: APIResponse) => {
          if (response.success) {
            this.isLoading = false;
            this.isSubmitted = true;
            this.queryService.sendMail(queryData);
            setTimeout(() => {
              this.isSubmitted = false;
              this.modalService.dismissAll();
            }, 3000);
          } else {
            this.isLoading = false;
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
