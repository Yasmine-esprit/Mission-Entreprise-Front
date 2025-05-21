import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LevelComponent } from './level.component';
import { LevelService } from '../services/level.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe ('LevelComponent', () => {
  let component: LevelComponent;
  let fixture: ComponentFixture<LevelComponent>;
  let mockLevelService: any;

  beforeEach(async () => {
    mockLevelService = {
      getLevels: jasmine.createSpy('getLevels').and.returnValue(of([
        { id: 1, name: 'L1' },
        { id: 2, name: 'L2' }
      ])),
      addLevel: jasmine.createSpy('addLevel').and.returnValue(of({ id: 3, name: 'L3' }))
    };

    await TestBed.configureTestingModule({
      declarations: [LevelComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: LevelService, useValue: mockLevelService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ignore unknown elements
    }).compileComponents();

    fixture = TestBed.createComponent(LevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy
  )}