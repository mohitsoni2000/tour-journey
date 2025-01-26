import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { QueryService } from '../../service/query/query.service';
@Component({
  selector: 'app-enquiry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enquiry-modal.component.html',
  styleUrl: './enquiry-modal.component.css',
})
export class EnquiryModalComponent {
  enquiryForm = {
    name: '',
    email: '',
    phone: '',
  };

  @ViewChild('enquiryModal') enquiryModal: any;

  constructor(private queryService: QueryService) {}

  openEnquiryModal() {
    const modal = new Modal(this.enquiryModal.nativeElement);
    modal.show();
  }

  onSubmit() {
    this.queryService.sendQuery(this.enquiryForm).subscribe({
      next: (response) => {
        if (response.success) {
          window.location.href = 'https://journeybees.in/thank-you.html';
        }
      },
      error: (error) => {
        console.error('Error submitting enquiry:', error);
        // Handle error (e.g., show error message to user)
      }
    });
  }
}
