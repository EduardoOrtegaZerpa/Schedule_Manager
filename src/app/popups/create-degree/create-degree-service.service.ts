import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Degree } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CreateDegreeService {

  created: EventEmitter<Degree> = new EventEmitter<Degree>();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  openCreateDegreePopup(): void {
    this.isOpenSubject.next(true);
  }

  closeCreateDegreePopup(): void {
    this.isOpenSubject.next(false);
  }

  isOpen(): boolean {
    return this.isOpenSubject.getValue();
  }
}
