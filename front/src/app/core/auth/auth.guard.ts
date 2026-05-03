import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CategoriasService } from '../api/categorias.service';
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

  return router.createUrlTree(['/app/visao-geral']);
};

/**
 * Bloqueia rotas de /app/* quando o usuario ainda nao concluiu o onboarding
 * (sem categorias cadastradas). Sem categorias, a IA Liriun nao consegue
 * sugerir e tarefas salvam sem categoria — UX prometida quebra.
 *
 * Falha do endpoint: deixa passar (nao bloqueia por bug de infra).
 */
export const onboardingGuard: CanActivateFn = () => {
  const storage = inject(TokenStorage);
  const router = inject(Router);
  const categoriasApi = inject(CategoriasService);

  if (!storage.estaAutenticado()) return router.createUrlTree(['/login']);

  return categoriasApi.listar().pipe(
    map((categorias) =>
      categorias.length > 0 ? true : router.createUrlTree(['/onboarding']),
    ),
    catchError(() => of(true)),
  );
};
