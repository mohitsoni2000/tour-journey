import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourPromoComponent } from './tour-promo.component';

describe('TourPromoComponent', () => {
  let component: TourPromoComponent;
  let fixture: ComponentFixture<TourPromoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourPromoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
