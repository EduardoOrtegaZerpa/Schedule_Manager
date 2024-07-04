import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private APIURL = 'http://localhost:3001/api';
  private loginStatusSubject = new BehaviorSubject<boolean>(false);

  login(username: string, password: string): Observable<Boolean> {
    return this.http.post(`${this.APIURL}/login`, { username, password }).pipe(
      map((res: any) => {
        if (res.result) {
          this.loginStatusSubject.next(true);
          return true
        }
        return false;
      }),
      catchError((error) => {
        return of(false);
      })
    );
  }
  
  logout() {
    this.loginStatusSubject.next(false);
  }

  loginStatus$(): Observable<boolean> {
    return this.loginStatusSubject.asObservable();
  }

}
