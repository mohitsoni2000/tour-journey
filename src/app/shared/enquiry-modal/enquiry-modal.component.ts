import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { QueryService } from '../../service/query/query.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-enquiry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  enquiryForm = {
    name: '',
    email: '',
    phone: '',
  };

  @ViewChild('content') content: any;

  constructor(
    private modalService: NgbModal,
    private queryService: QueryService
  ) {}


  openEnquiryModal() {
    this.modalService.open(this.content, {
      centered: true,
      backdrop: 'static',
      windowClass: 'animated-modal',
    });
  }

  onSubmit() {
    this.queryService.sendQuery(this.enquiryForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.modalService.dismissAll();
          this.queryService.sendMail(this.enquiryForm);
        }
      },
      error: (error) => {
        console.error('Error submitting enquiry:', error);
      },
    });
  }
}
