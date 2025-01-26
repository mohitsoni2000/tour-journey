import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCardSkeletonComponent } from './tour-card-skeleton.component';

describe('TourCardSkeletonComponent', () => {
  let component: TourCardSkeletonComponent;
  let fixture: ComponentFixture<TourCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCardSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
