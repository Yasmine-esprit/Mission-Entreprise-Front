import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteTgrpComponent } from './note-tgrp.component';

describe('NoteTgrpComponent', () => {
  let component: NoteTgrpComponent;
  let fixture: ComponentFixture<NoteTgrpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoteTgrpComponent]
    });
    fixture = TestBed.createComponent(NoteTgrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
