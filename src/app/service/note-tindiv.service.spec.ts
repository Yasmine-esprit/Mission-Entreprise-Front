import { TestBed } from '@angular/core/testing';

import { NoteTindivService } from './note-tindiv.service';

describe('NoteTindivService', () => {
  let service: NoteTindivService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteTindivService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
