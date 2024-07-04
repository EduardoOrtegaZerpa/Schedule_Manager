import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
  return authService.loginStatus$().pipe(
    switchMap((isLoggedIn: boolean): Observable<boolean | UrlTree> => {
      if (isLoggedIn) {
        console.log('User is logged in');
        return of(true);
      } else {
        console.log('User is not logged in');
        return of(router.createUrlTree(['/notAvailable']));
      }
    })
  ) as Observable<boolean | UrlTree>;
};
