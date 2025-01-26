import {
  trigger,
  transition,
  style,
  animate,
  state,
  query,
  stagger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FAQ,
  FAQResponse,
  FaqService,
} from '../../../../service/faq/faq.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '800ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),

    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(50px)' }),
            stagger(100, [
              animate(
                '600ms ease',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),

    trigger('expansionAnimation', [
      state('collapsed', style({ backgroundColor: 'white' })),
      state('expanded', style({ backgroundColor: 'rgba(248, 249, 250, 0.9)' })),
      transition(
        'collapsed <=> expanded',
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ),
    ]),

    trigger('rotateAnimation', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(45deg)' })),
      transition(
        'default <=> rotated',
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')
      ),
    ]),

    trigger('slideContent', [
      state('collapsed', style({ height: '0', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),

    trigger('pulseAnimation', [
      transition('* => active', [
        style({ transform: 'scale(1)' }),
        animate('300ms ease-in-out', style({ transform: 'scale(1.02)' })),
        animate('150ms ease-in-out', style({ transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class FaqComponent implements OnInit {
  faqs: FAQ[] = [];
  isLoading = true;

  constructor(private faqService: FaqService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadFAQs();
  }

  private loadFAQs() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      const tourName = params['name'];
      if (tourName) {
        this.faqService.getFAQ(tourName).subscribe({
          next: (response: FAQResponse) => {
            if (response?.success && response?.data) {
              this.faqs = response.data.map((faq) => ({
                question: faq.faq_question,
                answer: faq.faq_answer,
                isOpen: false,
              }));
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading faq:', error);
            this.isLoading = false;
          },
        });
      }
    });
  }

  toggleFAQ(selectedFaq: FAQ) {
    // Close other FAQs when opening a new one
    this.faqs.forEach((faq) => {
      if (faq !== selectedFaq) {
        faq.isOpen = false;
      }
    });
    selectedFaq.isOpen = !selectedFaq.isOpen;
  }
}
