import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  state,
} from '@angular/animations';
import { register } from 'swiper/element/bundle';
import {
  Review,
  RatingSummary,
  ReviewService,
  BusinessDetails,
} from '../../../../service/review/review.service';
import { Subject, takeUntil } from 'rxjs';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('slideInDown', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate(
          '0.5s cubic-bezier(0.35, 0, 0.25, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('fadeInStagger', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
              animate(
                '0.5s cubic-bezier(0.35, 0, 0.25, 1)',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '0.6s cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: 'auto', overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    ]),
    // Added missing scaleInX animation
    trigger('scaleInX', [
      transition(':enter', [
        style({ transform: 'scaleX(0)', opacity: 0 }),
        animate(
          '0.5s cubic-bezier(0.35, 0, 0.25, 1)',
          style({ transform: 'scaleX(1)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class ReviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  businessDetails: BusinessDetails | null = null;
  ratingSummary: RatingSummary | null = null;
  reviews: Review[] = [];
  isLoading = false;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  currentSort = 'most_relevant';

  sortOptions = [
    { label: 'Most Relevant', value: 'most_relevant' },
    { label: 'Newest', value: 'newest' },
    { label: 'Highest Rated', value: 'highest' },
    { label: 'Lowest Rated', value: 'lowest' },
  ];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.initializeData();
  }

  private initializeData(): void {
    // Subscribe to loading state
    this.reviewService
      .getLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => (this.isLoading = isLoading));

    // Subscribe to error state
    this.reviewService
      .getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => (this.error = error));

    // Subscribe to business details
    this.reviewService
      .getBusinessDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe((details) => (this.businessDetails = details));

    // Subscribe to rating summary
    this.reviewService
      .getRatingSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary) => (this.ratingSummary = summary));

    // Load initial reviews
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService
      .getReviews(this.currentPage, this.pageSize, this.currentSort)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reviews = response.reviews;
        },
        error: (error) => {
          console.error('Error loading reviews:', error);
        },
      });
  }

  updateSort(sortType: string): void {
    this.currentSort = sortType;
    this.currentPage = 1;
    this.loadReviews();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  toggleReview(review: Review): void {
    review.isExpanded = !review.isExpanded;
  }

  getStarClass(position: number, rating: number): string {
    return position <= rating ? 'ri-star-fill' : 'ri-star-line';
  }

  getRatingPercentage(rating: number): number {
    if (!this.ratingSummary?.totalReviews) return 0;
    return (
      (this.ratingSummary.ratingDistribution[rating] /
        this.ratingSummary.totalReviews) *
        100 || 0
    );
  }

  getPageNumbers(): number[] {
    if (!this.ratingSummary?.totalReviews) return [1];
    const totalPages = Math.ceil(
      this.ratingSummary.totalReviews / this.pageSize
    );
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
