import { TestBed } from '@angular/core/testing';

import { GrilleEvaluationService } from './grille-evaluation.service';

describe('GrilleEvaluationService', () => {
  let service: GrilleEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrilleEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
