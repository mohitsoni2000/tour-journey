import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryService } from '../../service/query/query.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tour-promo',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
export class TourPromoComponent implements OnInit {
  enquiryForm = {
    name: '',
    email: '',
    phone: '',
    destination: '',
    note: 'Enquiry from website',
    consent: true,
  };

  @ViewChild('promoModal') promoModal: any;
  private modalDisplayInterval: any;
  isLoading = false;
  submitted = false;
  private isModalOpen = false;

  constructor(
    private modalService: NgbModal,
    private queryService: QueryService
  ) {}

  ngOnInit() {
    this.startModalInterval();
  }

  ngOnDestroy() {
    this.stopModalInterval();
  }

  private startModalInterval() {
    // Show first modal after 1 minute
    setTimeout(() => {
      this.openPromoModal();

      // Then show every 5 minutes
      this.modalDisplayInterval = setInterval(() => {
        if (!this.isModalOpen) {
          this.openPromoModal();
        }
      }, 1 * 60 * 1000); // 1 minutes
    }, 30 * 1000); // 1 minute
  }

  private stopModalInterval() {
    if (this.modalDisplayInterval) {
      clearInterval(this.modalDisplayInterval);
    }
  }

  openPromoModal(message?: string) {
    if (!this.isModalOpen) {
      this.isModalOpen = true;
      this.enquiryForm.note = message || 'Enquiry from website';
      const modalRef = this.modalService.open(this.promoModal, {
        centered: true,
        backdrop: 'static',
        windowClass: 'animated-modal',
      });

      modalRef.result.finally(() => {
        this.isModalOpen = false;
        this.enquiryForm.note = 'Enquiry from website';
      });
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.isFormValid()) {
      this.isLoading = true;

      this.queryService.sendQuery(this.enquiryForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.modalService.dismissAll();
            window.location.href = 'https://journeybees.in/page/thank-you';
          }
        },
        error: (error) => {
          console.error('Error submitting enquiry:', error);
          this.isLoading = false;
        },
      });
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.enquiryForm.name &&
      this.enquiryForm.email &&
      this.enquiryForm.phone &&
      this.enquiryForm.consent
    );
  }
}
