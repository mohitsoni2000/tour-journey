import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
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
import { Observable, catchError, map, of } from 'rxjs';
import {
  Banner,
  TourService,
  TransformedTour,
} from '../../service/tour/tour.service';
import {
  CommonService,
  UserDetails,
} from '../../service/common/common.service';
import { EnquiryModalComponent } from '../../shared/enquiry-modal/enquiry-modal.component';

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
export class TourComponent {
  @ViewChild('enquiryModal') enquiryModal!: EnquiryModalComponent;

  private tourService = inject(TourService);
  private route = inject(ActivatedRoute);
  toursWithBanner$!: Observable<Array<{ type: 'tour' | 'banner'; data: any }>>;
  userDeatils: UserDetails;

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    private commonService: CommonService
  ) {
    this.userDeatils = this.commonService.getUserDetails();
  }

  ngOnInit() {
    this.updateTitle();
    const tourName = this.route.snapshot.params['name'] || '';
    
    this.toursWithBanner$ = this.tourService.getTourByName(tourName).pipe(
      map(response => {
        const transformedTours = response.data.map(tour => 
          this.tourService.transformTourData(tour)
        );
        return this.insertBanners(transformedTours);
      }),
      catchError(error => {
        this.handleError(error);
        return of([]);
      })
    );
  }

  private insertBanners(tours: TransformedTour[]): Array<{ type: 'tour' | 'banner'; data: TransformedTour | Banner }> {
    const result: Array<{ type: 'tour' | 'banner'; data: TransformedTour | Banner }> = [];
    
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
            backgroundImage: 'assets/images/package/package-4.webp'
          }
        });
      }
    });
    
    return result;
  }
  
  updateTitle() {
    this.title.setTitle(
      'Tour Packages in Bangkok - Best Hotel Deals | Your Site Name'
    );
    this.meta.addTags([
      {
        name: 'description',
        content:
          'Discover the best tour packages in Bangkok, Thailand. Find deals on hotels like Dusitd2 Samyan Bangkok with prices starting from $95.',
      },
      {
        name: 'keywords',
        content:
          'Bangkok tours, Thailand hotels, Dusitd2 Samyan Bangkok, hotel deals',
      },
      {
        property: 'og:title',
        content: 'Tour Packages in Bangkok - Best Hotel Deals',
      },
      {
        property: 'og:description',
        content: 'Find the best tour packages in Bangkok starting from $95',
      },
      { property: 'og:image', content: 'URL-to-your-featured-image' },
    ]);
  }

  private addSchemaMarkup(tour: any) {
    // Implement schema markup logic here
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: tour.name,
      // Add other schema properties
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  private handleError(error: any) {
    const errorMessage =
      error.status === 404 ? 'Tour not found' : 'Error loading tour';
    this.router.navigate(['/error'], {
      queryParams: {
        message: errorMessage,
        status: error.status,
      },
    });
  }

  private combineToursAndBanners(
    tours$: Observable<TransformedTour[]>,
    banners$: Observable<Banner[]>
  ): Observable<
    Array<{ type: 'tour' | 'banner'; data: TransformedTour | Banner }>
  > {
    return tours$.pipe(
      map((tours) => {
        const result: Array<{
          type: 'tour' | 'banner';
          data: TransformedTour | Banner;
        }> = [];

        tours.forEach((tour, index) => {
          result.push({ type: 'tour', data: tour });

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
      })
    );
  }

  openEnquiryModal() {
    this.enquiryModal.openEnquiryModal();
  }

  handleCallRequest() {
    this.openEnquiryModal();
  }
}
