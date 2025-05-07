import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CritereComponent } from './critere.component';

describe('CritereComponent', () => {
  let component: CritereComponent;
  let fixture: ComponentFixture<CritereComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CritereComponent]
    });
    fixture = TestBed.createComponent(CritereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
