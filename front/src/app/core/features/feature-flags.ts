import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const FEATURE_FLAGS = {
  financas: false,
  rankingAmigos: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function featureAtiva(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}

export function featureFlagGuard(flag: FeatureFlag): CanActivateFn {
  return () => {
    const router = inject(Router);
    if (FEATURE_FLAGS[flag]) return true;
    return router.createUrlTree(['/app/captura']);
  };
}
