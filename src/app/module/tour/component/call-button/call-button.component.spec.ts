import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallButtonComponent } from './call-button.component';

describe('CallButtonComponent', () => {
  let component: CallButtonComponent;
  let fixture: ComponentFixture<CallButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
