import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryModalComponent } from './enquiry-modal.component';

describe('EnquiryModalComponent', () => {
  let component: EnquiryModalComponent;
  let fixture: ComponentFixture<EnquiryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnquiryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
