import {HttpErrorResponse} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';


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
            return throwError({statusCode, responseBody});
        })
    );
};

