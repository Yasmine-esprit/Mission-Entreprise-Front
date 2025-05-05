import { TestBed } from '@angular/core/testing';

// @ts-ignore
import { GroupeMsgService } from './GroupeMsg.service';

describe('GroupeMsgService', () => {
  let service: GroupeMsgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupeMsgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
