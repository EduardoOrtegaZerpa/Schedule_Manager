import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private requestCount = 0;

  isLoading$() {
    return this.loadingSubject.asObservable();
  }

  show() {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.loadingSubject.next(false);
      this.requestCount = 0;
    }
  }
}
