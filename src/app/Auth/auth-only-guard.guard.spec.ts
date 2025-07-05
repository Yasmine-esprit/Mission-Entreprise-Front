import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authOnlyGuardGuard } from './auth-only-guard.guard';

describe('authOnlyGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authOnlyGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
