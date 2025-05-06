import { TestBed } from '@angular/core/testing';

import { CritereService } from './critere.service';

describe('CritereService', () => {
  let service: CritereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CritereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
