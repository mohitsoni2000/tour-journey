import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BannerComponent } from './component/banner/banner.component';
import { BreadcrumbsComponent } from './component/breadcrumbs/breadcrumbs.component';
import { CallButtonComponent } from './component/call-button/call-button.component';
import { FaqComponent } from './component/faq/faq.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ReviewComponent } from './component/review/review.component';
import { TourCardSkeletonComponent } from './component/tour-card-skeleton/tour-card-skeleton.component';
import { TourCardComponent } from './component/tour-card/tour-card.component';
import { TourPackageComponent } from './component/tour-package/tour-package.component';
import { WhatsappButtonComponent } from './component/whatsapp-button/whatsapp-button.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import {
  Banner,
  SliderTour,
  TourService,
  TransformedTour,
} from '../../service/tour/tour.service';
import {
  CommonService,
  UserDetails,
} from '../../service/common/common.service';
import { EnquiryModalComponent } from '../../shared/enquiry-modal/enquiry-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../service/seo/seo.service';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TourCardComponent,
    TourCardSkeletonComponent,
    BreadcrumbsComponent,
    BannerComponent,
    ReviewComponent,
    FaqComponent,
    WhatsappButtonComponent,
    CallButtonComponent,
    TourPackageComponent,
    EnquiryModalComponent,
  ],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '600ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('bannerAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('800ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class TourComponent implements OnDestroy {
  @ViewChild('enquiryModal') enquiryModal!: EnquiryModalComponent;
  private destroyRef = inject(DestroyRef);

  private tourService = inject(TourService);
  private route = inject(ActivatedRoute);
  toursWithBanner$!: Observable<Array<{ type: 'tour' | 'banner'; data: any }>>;
  userDetails: UserDetails;
  sliderTours$: Observable<SliderTour[]> | undefined;

  constructor(
    private meta: Meta,
    private title: Title,
    private commonService: CommonService,
    private seoService: SeoService
  ) {
    this.userDetails = this.commonService.getUserDetails();
    this.initializeData();
  }

  private initializeData() {
    // Use resolver data instead of making a new API call
    const resolvedData$ = this.route.data.pipe(
      map((data) => data['tour']),
      filter((data) => !!data),
      takeUntilDestroyed(this.destroyRef)
    );

    // Initialize slider tours stream
    this.sliderTours$ = resolvedData$.pipe(map((data) => data.sliderTours));

    // Initialize tours with banners stream
    this.toursWithBanner$ = resolvedData$.pipe(
      map((data) => this.insertBanners(data.tours)),
      tap((tours) => {
        if (tours.length > 0) {
          const firstTour = tours.find((item) => item.type === 'tour')
            ?.data as TransformedTour;
          if (firstTour) {
            this.seoService.updateTourSeo(firstTour);
          }
        }
      })
    );
  }

  private insertBanners(
    tours: TransformedTour[]
  ): Array<{ type: 'tour' | 'banner'; data: TransformedTour | Banner }> {
    const result: Array<{
      type: 'tour' | 'banner';
      data: TransformedTour | Banner;
    }> = [];

    tours.forEach((tour, index) => {
      // Add tour
      result.push({ type: 'tour', data: tour });

      // Add banner after every 6 tours
      if ((index + 1) % 6 === 0) {
        result.push({
          type: 'banner',
          data: {
            title: 'Special Offer!',
            subtitle: 'Get up to 50% off on group bookings',
            ctaText: 'Book Now',
            backgroundImage: 'assets/images/package/package-4.webp',
          },
        });
      }
    });

    return result;
  }

  openEnquiryModal() {
    this.enquiryModal.openEnquiryModal();
  }

  handleCallRequest() {
    this.openEnquiryModal();
  }

  ngOnDestroy(): void {
    this.seoService.removeAllMeta();
  }
}
