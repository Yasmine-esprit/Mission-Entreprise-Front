import { TestBed } from '@angular/core/testing';

import { NoteTgrpService } from './note-tgrp.service';

describe('NoteTgrpService', () => {
  let service: NoteTgrpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteTgrpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
