import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteTindivComponent } from './note-tindiv.component';

describe('NoteTindivComponent', () => {
  let component: NoteTindivComponent;
  let fixture: ComponentFixture<NoteTindivComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoteTindivComponent]
    });
    fixture = TestBed.createComponent(NoteTindivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
