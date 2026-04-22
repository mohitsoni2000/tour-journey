import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QueryService } from '../../service/query/query.service';
import { APIResponse } from '../../service/tour-package/tour-package.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { trigger, transition, style, animate } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-enquiry-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enquiry-modal.component.html',
  styleUrl: './enquiry-modal.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class EnquiryModalComponent {
  private modalService = inject(NgbModal);
  private queryService = inject(QueryService);
  private fb = inject(FormBuilder);
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
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = false;

  @ViewChild('content') content: any;

  openEnquiryModal() {
    this.modalService.open(this.content, {
      centered: true,
      backdrop: 'static',
      windowClass: 'animated-modal',
    });
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
        return 'Enter a valid 10-digit mobile number';
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
    };
    return labels[field] || field;
  }

  onSubmit() {
    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const queryData = {
      name: this.enquiryForm.value.name ?? '',
      phone: this.enquiryForm.value.phone ?? '',
      email: this.enquiryForm.value.email ?? '',
      consent: true as const,
    };

    this.queryService
      .sendQuery(queryData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: APIResponse) => {
          if (response.success) {
            this.queryService.sendMail(queryData);
            this.modalService.dismissAll();
            window.location.href = 'https://journeybees.in/page/thank-you';
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
