import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Degree, Subject } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CreateSubjectService{

  created: EventEmitter<Subject> = new EventEmitter<Subject>();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private degreeSubject = new BehaviorSubject<Degree | undefined>(undefined);
  degree$ = this.degreeSubject.asObservable();

  openCreateSubjectPopup(degree: Degree): void {
    this.degreeSubject.next(degree);
    this.isOpenSubject.next(true);
  }

  isOpen(): boolean {
    return this.isOpenSubject.getValue();
  }

  closeCreateSubjectPopup(): void {
    this.isOpenSubject.next(false);
    this.degreeSubject.next(undefined);
  }

  getDegree(): Degree | undefined {
    return this.degreeSubject.getValue();
  }
}
