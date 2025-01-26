import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { Tour, TransformedTour } from '../../../../service/tour/tour.service';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-card.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './tour-card.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ],
})
export class TourCardComponent {
  @Input() tour!: TransformedTour;
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @Input() phoneNumber: string = '';
  @Output() enquiryModalVisibleChange = new EventEmitter<boolean>();
  
  tooltipVisible = false;
  discountedPrice: number = 0;
  savingsAmount: number = 0;

  ngOnInit() {
    this.discountedPrice = this.tour.salePrice;
    this.savingsAmount = this.tour.price - this.tour.salePrice;
  }

  ngAfterViewInit() {
    const swiperEl = this.swiperContainer.nativeElement;
    const swiperParams = {
      slidesPerView: 1,
      speed: 500,
      loop: true,
      effect: 'fade',
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
    };

    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();
  }

  showTooltip() {
    this.tooltipVisible = true;
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }

  openEnquiryModal() {
    this.enquiryModalVisibleChange.emit(true);
  }
}
