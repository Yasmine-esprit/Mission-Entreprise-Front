import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePDFComponent } from './change-pdf.component';

describe('ChangePDFComponent', () => {
  let component: ChangePDFComponent;
  let fixture: ComponentFixture<ChangePDFComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangePDFComponent]
    });
    fixture = TestBed.createComponent(ChangePDFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
