import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LevelService } from './level.service';
import { Level } from '../models/level.model'; // adapte ce chemin si besoin

describe('LevelService', () => {
  let service: LevelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LevelService]
    });

    service = TestBed.inject(LevelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all levels', () => {
    const mockLevels: Level[] = [
      { id: 1, name: 'L1' },
      { id: 2, name: 'L2' }
    ];

    service.getLevels().subscribe(levels => {
      expect(levels.length).toBe(2);
      expect(levels).toEqual(mockLevels);
    });

    const req = httpMock.expectOne('/api/levels'); // adapte l’URL à ton backend
    expect(req.request.method).toBe('GET');
    req.flush(mockLevels);
  });

  it('should add a new level', () => {
    const newLevel: Level = { id: 3, name: 'L3' };

    service.addLevel(newLevel).subscribe(level => {
      expect(level).toEqual(newLevel);
    });

    const req = httpMock.expectOne('/api/levels'); // adapte l’URL
    expect(req.request.method).toBe('POST');
    req.flush(newLevel);
  });
});
