import { TestBed } from '@angular/core/testing';

import { SousCritereService } from './sous-critere.service';

describe('SousCritereService', () => {
  let service: SousCritereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousCritereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
