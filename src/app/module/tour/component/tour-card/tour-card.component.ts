import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { trigger, transition, style, animate } from '@angular/animations';
import { TransformedTour } from '../../../../service/tour/tour.service';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTooltipModule],
  templateUrl: './tour-card.component.html',
  styleUrls: ['./tour-card.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  ],
})
export class TourCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tour!: TransformedTour;
  @Input() phoneNumber: string = '';
  @Output() enquiryModalVisibleChange = new EventEmitter<boolean>();

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @ViewChild('tourTitle') tourTitle!: ElementRef;
  @ViewChild('citiesContainer') citiesContainer!: ElementRef;
  @ViewChild('t') tooltip!: NgbTooltip;
  @ViewChild('citiesListTooltip') citiesListTooltip!: NgbTooltip;

  isTitleTruncated = false;
  isCitiesTruncated = false;
  showAllCities = false;
  visibleCities: string[] = [];
  discountedPrice: number = 0;
  savingsAmount: number = 0;

  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;

  constructor(private elementRef: ElementRef) {
    // Initialize resize observer for handling responsive truncation
    this.resizeObserver = new ResizeObserver(() => {
      this.checkTruncation();
    });

    // Initialize intersection observer for lazy initialization
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.initializeSwiper();
          this.intersectionObserver.disconnect();
        }
      },
      { threshold: 0.1 }
    );
  }

  ngOnInit() {
    this.calculatePrices();
  }

  ngAfterViewInit() {
    // Observe the component for viewport visibility
    this.intersectionObserver.observe(this.swiperContainer.nativeElement);

    // Start observing size changes for truncation
    this.setupResizeObservers();

    // Initial truncation check
    this.checkTruncation();
  }

  private calculatePrices() {
    this.discountedPrice = this.tour.salePrice;
    this.savingsAmount = this.tour.price - this.tour.salePrice;
  }

  private setupResizeObservers() {
    if (this.tourTitle?.nativeElement) {
      this.resizeObserver.observe(this.tourTitle.nativeElement);
    }
    if (this.citiesContainer?.nativeElement) {
      this.resizeObserver.observe(this.citiesContainer.nativeElement);
    }
  }

  private initializeSwiper() {
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

  private checkTruncation() {
    // Use requestAnimationFrame to ensure DOM measurements are accurate
    requestAnimationFrame(() => {
      this.checkTitleTruncation();
      this.checkCitiesTruncation();
    });
  }

  private checkTitleTruncation() {
    if (!this.tourTitle?.nativeElement) return;

    const element = this.tourTitle.nativeElement;
    this.isTitleTruncated = element.scrollWidth > element.clientWidth;
  }

  private checkCitiesTruncation() {
    if (!this.citiesContainer?.nativeElement || !this.tour.cities.length) return;

    const container = this.citiesContainer.nativeElement;
    const citiesContainer = container.querySelector('.cities-visible');

    if (!citiesContainer) return;

    const containerWidth = container.clientWidth;
    const citiesWidth = this.calculateTotalCitiesWidth(citiesContainer);

    this.isCitiesTruncated = citiesWidth > containerWidth;
    
    // Close tooltip if cities are not truncated
    if (!this.isCitiesTruncated && this.citiesListTooltip) {
        this.citiesListTooltip.close();
    }
}

  private calculateTotalCitiesWidth(container: HTMLElement): number {
    let totalWidth = 0;
    const cityElements = container.querySelectorAll('.city-tag');

    cityElements.forEach((cityEl: Element) => {
      const styles = window.getComputedStyle(cityEl);
      const width = (cityEl as HTMLElement).offsetWidth;
      const marginRight = parseFloat(styles.marginRight);
      totalWidth += width + (isNaN(marginRight) ? 0 : marginRight);
    });

    return totalWidth;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkTruncation();
  }

  toggleCitiesView(event: MouseEvent) {
    if (this.isCitiesTruncated) {
      this.showAllCities = !this.showAllCities;
      event.stopPropagation();
    }
  }

  openEnquiryModal() {
    this.enquiryModalVisibleChange.emit(true);
  }

  // Update the HostListener for document clicks
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.tooltip?.close();
      this.citiesListTooltip?.close();
    }
    this.showAllCities = false;
  }

  // Add this to ngOnDestroy
  ngOnDestroy() {
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.citiesListTooltip?.close();
  }
}
