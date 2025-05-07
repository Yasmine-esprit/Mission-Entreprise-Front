import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrilleEvaluationComponent } from './grille-evaluation.component';

describe('GrilleEvaluationComponent', () => {
  let component: GrilleEvaluationComponent;
  let fixture: ComponentFixture<GrilleEvaluationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GrilleEvaluationComponent]
    });
    fixture = TestBed.createComponent(GrilleEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
