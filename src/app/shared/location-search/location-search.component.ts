import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  startWith,
} from 'rxjs';

interface Location {
  id: number;
  name: string;
  content: string;
  slug: string;
  image_id?: number;
}

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'location-search.component.html',
  styleUrl: './location-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate(
          '400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),
    trigger('headerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('resultsAnimation', [
      transition(':enter', [
        query(
          '.location-card',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(50, [
              animate(
                '400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
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
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LocationSearchComponent implements OnInit {
  @Input() set locations(value: any[]) {
    this.locationsSubject.next(value);
  }
  @ViewChild('searchInput') searchInput: any;

  private locationsSubject = new BehaviorSubject<any[]>([]);
  searchControl = new FormControl('');
  selectedIndex = -1;

  filteredLocations$: Observable<any[]> = combineLatest([
    this.locationsSubject,
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ),
  ]).pipe(
    map(([locations, searchTerm]) => {
      if (!searchTerm) return locations.slice(0, 6);

      const term = searchTerm.toLowerCase().trim();
      return locations
        .filter((location) => location.name.toLowerCase().includes(term))
        .slice(0, 6);
    })
  );

  constructor(public activeModal: NgbActiveModal, private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 100);
  }

  onArrowDown() {
    this.filteredLocations$
      .pipe(map((locations) => locations.length))
      .subscribe((length) => {
        if (length > 0) {
          this.selectedIndex = (this.selectedIndex + 1) % length;
        }
      });
  }

  onArrowUp() {
    this.filteredLocations$
      .pipe(map((locations) => locations.length))
      .subscribe((length) => {
        if (length > 0) {
          this.selectedIndex =
            this.selectedIndex <= 0 ? length - 1 : this.selectedIndex - 1;
        }
      });
  }

  onEnter() {
    this.filteredLocations$.subscribe((locations) => {
      if (locations.length > 0 && this.selectedIndex >= 0) {
        this.selectLocation(locations[this.selectedIndex]);
      }
    });
  }

  selectLocation(location: any) {
    this.activeModal.close(location);
    
    // Navigate to new route
    this.router.navigate(['/tour', location.slug], {
      skipLocationChange: false,
      replaceUrl: false
    }).then(() => {
      // Force route refresh by subscribing to NavigationEnd
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.scrollTo(0, 0); // Scroll to top after navigation
      });
    });
  }
}
