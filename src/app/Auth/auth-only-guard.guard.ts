import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { inject } from '@angular/core';

export const authOnlyGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // allow route access
  } else {
    router.navigate(['/login']);
    return false;
  }
};
