import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorage } from './token.storage';

export const authGuard: CanActivateFn = () => {
  const storage = inject(TokenStorage);
  const router = inject(Router);

  if (storage.estaAutenticado()) return true;

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const storage = inject(TokenStorage);
  const router = inject(Router);

  if (!storage.estaAutenticado()) return true;

  return router.createUrlTree(['/captura']);
};
