import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousCritereComponent } from './sous-critere.component';

describe('SousCritereComponent', () => {
  let component: SousCritereComponent;
  let fixture: ComponentFixture<SousCritereComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SousCritereComponent]
    });
    fixture = TestBed.createComponent(SousCritereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
