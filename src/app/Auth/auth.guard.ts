import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/home']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
