import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationsDetailsComponent } from './evaluations-details.component';

describe('EvaluationsDetailsComponent', () => {
  let component: EvaluationsDetailsComponent;
  let fixture: ComponentFixture<EvaluationsDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvaluationsDetailsComponent]
    });
    fixture = TestBed.createComponent(EvaluationsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
