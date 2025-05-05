import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousTacheComponent } from './sous-tache.component';

describe('SousTacheComponent', () => {
  let component: SousTacheComponent;
  let fixture: ComponentFixture<SousTacheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SousTacheComponent]
    });
    fixture = TestBed.createComponent(SousTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
