import {HttpErrorResponse} from '@angular/common/http';
import {catchError, finalize, throwError} from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';
import { inject } from '@angular/core';


export const LoaderInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);
    
    loadingService.show();
    
    return next(req).pipe(
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        loadingService.hide();
      })
    );
  };
    
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    
    const authReq = req.clone({
        withCredentials: true
      });
    
    return next(authReq);
};

export const ResponseInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const statusCode = error.status;
            const responseBody = error.error;
            if (statusCode === 401) {
                return next(req);
            }
            return throwError(() => error);
        })
    );
};

