import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { TransformedTour } from '../../../../service/tour/tour.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-card.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './tour-card.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'scale(1)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'translateY(10px)' })
        ),
      ]),
    ]),
  ],
})
export class TourCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tour!: TransformedTour;
  @Input() phoneNumber: string = '';
  @Output() enquiryModalVisibleChange = new EventEmitter<boolean>();

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @ViewChild('citiesContent') citiesContent!: ElementRef;
  @ViewChild('citiesScroll') citiesScroll!: ElementRef;
  @ViewChild('tooltipBtn') tooltipBtn!: ElementRef;

  isScrollable = false;
  discountedPrice: number = 0;
  savingsAmount: number = 0;
  private tooltipInstance: any;

  ngOnInit() {
    this.discountedPrice = this.tour.salePrice;
    this.savingsAmount = this.tour.price - this.tour.salePrice;
  }

  ngAfterViewInit() {
    // Initialize Swiper
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

    // Initialize Bootstrap tooltip
    this.initTooltip();

    // Check if cities content needs scrolling
    setTimeout(() => {
      this.checkScrollable();
    });

    // Add resize listener
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    this.checkScrollable();
  };

  private initTooltip() {
    const tooltipTrigger = this.tooltipBtn.nativeElement;
    const tooltipContent = this.tour.highlights.map(highlight => 
      `<div style="display:flex;align-items:center;margin-bottom:4px">
        <i class="ri-check-line" style="color:#4caf50;margin-right:8px"></i>
        <span style="font-size:12px">${highlight} testtt</span>
      </div>`
    ).join('');

    this.tooltipInstance = new bootstrap.Tooltip(tooltipTrigger, {
      html: true,
      title: tooltipContent,
      template: `
        <div class="tooltip" role="tooltip">
          <div class="tooltip-arrow"></div>
          <div class="tooltip-inner" style="background:white;color:#4a5568;max-width:300px;text-align:left"></div>
        </div>`
    });
  }

  checkScrollable() {
    const content = this.citiesContent.nativeElement;
    const scroll = this.citiesScroll.nativeElement;
    this.isScrollable = content.scrollWidth > scroll.clientWidth;
  }


  openEnquiryModal() {
    this.enquiryModalVisibleChange.emit(true);
  }

  ngOnDestroy() {
    if (this.tooltipInstance) {
      this.tooltipInstance.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  }
}
