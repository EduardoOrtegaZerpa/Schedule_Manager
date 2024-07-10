import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationSubject = new BehaviorSubject<boolean>(false);
  private notificationMessageSubject = new BehaviorSubject<string>('');

  constructor() { }

  show(message: string) {
    this.notificationMessageSubject.next(message);
    this.notificationSubject.next(true);
  }

  hide() {
    this.notificationSubject.next(false);
  }

  isNotificationShown() {
    return this.notificationSubject.asObservable();
  }

  getNotificationMessage() {
    return this.notificationMessageSubject.asObservable();
  }

}
