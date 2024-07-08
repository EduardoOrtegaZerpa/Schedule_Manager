import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.validateToken().pipe(
    switchMap(() => authService.loginStatus$()),
    switchMap((isLoggedIn: boolean): Observable<boolean | UrlTree> => {
      if (isLoggedIn) {
        return of(true);
      } else {
        return of(router.createUrlTree(['/notAvailable']));
      }
    }),
    catchError(() => {
      return of(router.createUrlTree(['/notAvailable']));
    })
  ) as Observable<boolean | UrlTree>;
};
